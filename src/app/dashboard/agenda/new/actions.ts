"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendBookingConfirmedToClient } from "@/lib/email/send";

const newApptSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Heure invalide"),
  durationMin: z.coerce.number().min(15).max(600),
  projectDescription: z.string().optional(),
  depositPaid: z.enum(["yes", "no"]).optional(),
});

export type NewApptState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof newApptSchema>, string>>;
};

export async function createManualAppointment(
  _prev: NewApptState,
  formData: FormData
): Promise<NewApptState> {
  const parsed = newApptSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    date: formData.get("date"),
    time: formData.get("time"),
    durationMin: formData.get("durationMin"),
    projectDescription: formData.get("projectDescription"),
    depositPaid: formData.get("depositPaid"),
  });

  if (!parsed.success) {
    const fieldErrors: NewApptState["fieldErrors"] = {};
    parsed.error.issues.forEach((issue) => {
      const key = issue.path[0] as keyof z.infer<typeof newApptSchema>;
      fieldErrors[key] = issue.message;
    });
    return { fieldErrors };
  }

  const data = parsed.data;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { data: studio } = await supabase
    .from("studios")
    .select("id, deposit_amount")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!studio) return { error: "Studio introuvable." };

  // Upsert client par (studio_id, email)
  const { data: client, error: clientErr } = await supabase
    .from("clients")
    .upsert(
      {
        studio_id: studio.id,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone ?? null,
      },
      { onConflict: "studio_id,email" }
    )
    .select("id")
    .single();

  if (clientErr || !client) return { error: "Impossible de créer le client." };

  const startsAt = new Date(`${data.date}T${data.time}:00`);
  const endsAt = new Date(startsAt.getTime() + data.durationMin * 60 * 1000);

  const { data: appt, error: apptErr } = await supabase
    .from("appointments")
    .insert({
      studio_id: studio.id,
      client_id: client.id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      project_description: data.projectDescription || null,
      deposit_amount: studio.deposit_amount,
      deposit_paid: data.depositPaid === "yes",
      status: "confirmed", // créé manuellement par l'artiste = confirmé direct
    })
    .select("id")
    .single();

  if (apptErr || !appt) return { error: apptErr?.message ?? "Erreur" };

  // Email de confirmation au client (best-effort, non bloquant)
  await sendBookingConfirmedToClient(appt.id);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agenda");
  redirect(`/dashboard/appointments/${appt.id}`);
}
