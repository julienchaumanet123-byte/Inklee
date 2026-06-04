"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { ensureClientAuthUser } from "@/lib/email/portal-link";

const bookingSchema = z.object({
  slug: z.string().min(1),
  slotIso: z.string().datetime(),
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(6, "Téléphone requis"),
  projectDescription: z.string().min(10, "Décris ton projet (10 caractères min)"),
});

export type BookingState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof bookingSchema>, string>>;
};

export async function createBooking(
  _prev: BookingState,
  formData: FormData
): Promise<BookingState> {
  const parsed = bookingSchema.safeParse({
    slug: formData.get("slug"),
    slotIso: formData.get("slotIso"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    projectDescription: formData.get("projectDescription"),
  });

  if (!parsed.success) {
    const fieldErrors: BookingState["fieldErrors"] = {};
    parsed.error.issues.forEach((issue) => {
      const key = issue.path[0] as keyof z.infer<typeof bookingSchema>;
      fieldErrors[key] = issue.message;
    });
    return { fieldErrors };
  }

  const data = parsed.data;
  const supabase = createAdminClient();

  // 1. Studio
  const { data: studio, error: studioErr } = await supabase
    .from("studios")
    .select("id, name, deposit_amount, slug")
    .eq("slug", data.slug)
    .maybeSingle();

  if (studioErr || !studio) {
    return { error: "Studio introuvable." };
  }

  // 2. Upload référence image (si fournie)
  let referenceUrl: string | null = null;
  const referenceFile = formData.get("reference") as File | null;
  if (referenceFile && referenceFile.size > 0 && referenceFile.size < 8 * 1024 * 1024) {
    const ext = referenceFile.name.split(".").pop() ?? "jpg";
    const path = `${studio.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("booking-references")
      .upload(path, referenceFile, {
        contentType: referenceFile.type,
        upsert: false,
      });
    if (!uploadErr) {
      const { data: pub } = supabase.storage
        .from("booking-references")
        .getPublicUrl(path);
      referenceUrl = pub.publicUrl;
    }
  }

  // 3a. Crée/récupère silencieusement le compte auth du client
  // (le trigger SQL liera automatiquement les fiches clients à cet auth user)
  await ensureClientAuthUser(data.email, `${data.firstName} ${data.lastName}`);

  // 3b. Find or create client (upsert sur unique (studio_id, email))
  const { data: client, error: clientErr } = await supabase
    .from("clients")
    .upsert(
      {
        studio_id: studio.id,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
      },
      { onConflict: "studio_id,email" }
    )
    .select("id")
    .single();

  if (clientErr || !client) {
    return { error: "Impossible de créer la fiche client." };
  }

  // 4. Create appointment (pending)
  const startsAt = new Date(data.slotIso);
  const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);

  const { data: appointment, error: apptErr } = await supabase
    .from("appointments")
    .insert({
      studio_id: studio.id,
      client_id: client.id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      project_description: data.projectDescription,
      reference_image_url: referenceUrl,
      deposit_amount: studio.deposit_amount,
      status: "pending",
    })
    .select("id")
    .single();

  if (apptErr || !appointment) {
    return { error: "Impossible de créer le rendez-vous." };
  }

  // 5. Stripe Checkout session
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: data.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(Number(studio.deposit_amount) * 100),
          product_data: {
            name: `Acompte — ${studio.name}`,
            description: `Rendez-vous le ${startsAt.toLocaleString("fr-FR")}`,
          },
        },
      },
    ],
    metadata: {
      appointment_id: appointment.id,
      studio_id: studio.id,
      client_id: client.id,
    },
    success_url: `${appUrl}/${studio.slug}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/${studio.slug}/booking/cancelled?appointment_id=${appointment.id}`,
  });

  if (!session.url) {
    return { error: "Impossible d'initialiser le paiement." };
  }

  // 6. Sauvegarde l'intent ID pour réconciliation
  await supabase
    .from("appointments")
    .update({ stripe_payment_intent_id: session.id })
    .eq("id", appointment.id);

  redirect(session.url);
}
