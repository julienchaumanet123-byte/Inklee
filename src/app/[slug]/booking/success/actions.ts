"use server";

import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { generatePortalAccessLink } from "@/lib/email/portal-link";
import {
  sendBookingConfirmedToClient,
  sendBookingNotificationToStudio,
} from "@/lib/email/send";

/**
 * Filet de sécurité : si le webhook Stripe Connect n'a pas (encore) confirmé
 * le RDV, on revérifie le paiement directement et on finalise de façon
 * idempotente. L'update conditionnel (.eq deposit_paid false) garantit qu'un
 * seul des deux chemins — webhook OU cette page — envoie les emails.
 */
export async function finalizeBookingIfPaid(
  appointmentId: string,
  sessionId: string | null
): Promise<{ paid: boolean }> {
  try {
    if (!sessionId) return { paid: false };

    const supabase = createAdminClient();
    const { data: appt } = await supabase
      .from("appointments")
      .select("id, deposit_paid, studio_id")
      .eq("id", appointmentId)
      .maybeSingle();
    if (!appt) return { paid: false };
    if (appt.deposit_paid) return { paid: true };

    const { data: studio } = await supabase
      .from("studios")
      .select("stripe_account_id")
      .eq("id", appt.studio_id)
      .maybeSingle();
    if (!studio?.stripe_account_id) return { paid: false };

    // La session de paiement vit sur le compte connecté du studio.
    const session = await stripe.checkout.sessions.retrieve(
      sessionId,
      undefined,
      { stripeAccount: studio.stripe_account_id }
    );
    if (session.payment_status !== "paid") return { paid: false };

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? session.id;

    const { data: updated } = await supabase
      .from("appointments")
      .update({
        deposit_paid: true,
        status: "confirmed",
        stripe_payment_intent_id: paymentIntentId,
      })
      .eq("id", appointmentId)
      .eq("deposit_paid", false)
      .select("id");

    // N'envoie les emails que si c'est bien CE chemin qui a basculé le RDV.
    if (updated && updated.length > 0) {
      await Promise.allSettled([
        sendBookingConfirmedToClient(appointmentId),
        sendBookingNotificationToStudio(appointmentId),
      ]);
    }
    return { paid: true };
  } catch (err) {
    console.error("[booking] finalizeBookingIfPaid failed", err);
    return { paid: false };
  }
}

/**
 * À partir d'un appointment_id, retrouve l'email du client et génère
 * un magic link Supabase qui auto-connecte au portail.
 *
 * On utilise appointment_id (et pas session_id Stripe) car avec Stripe
 * Connect direct charges, la session vit sur le compte du studio et
 * n'est pas accessible depuis notre compte plateforme.
 */
export async function autoLoginToPortal(appointmentId: string) {
  try {
    const supabase = createAdminClient();
    const { data: appt } = await supabase
      .from("appointments")
      .select("client_id")
      .eq("id", appointmentId)
      .maybeSingle();
    if (!appt) return;

    const { data: client } = await supabase
      .from("clients")
      .select("email")
      .eq("id", appt.client_id)
      .maybeSingle();
    if (!client?.email) return;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    // IMPORTANT: redirect_to doit pointer vers /auth/callback pour que le
    // code OTP soit échangé en session. Sinon, l'utilisateur arrive sur
    // /portal avec ?code=XXX mais reste connecté avec son ancienne session.
    const link = await generatePortalAccessLink(
      client.email,
      `${appUrl}/auth/callback?next=/portal`
    );

    if (link) {
      redirect(link);
    }
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    console.error("[portal] autoLoginToPortal failed", err);
  }
}
