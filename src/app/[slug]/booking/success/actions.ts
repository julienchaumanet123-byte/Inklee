"use server";

import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { generatePortalAccessLink } from "@/lib/email/portal-link";

/**
 * À partir du session_id Stripe, retrouve l'email du client et génère
 * un magic link Supabase qui auto-connecte au portail.
 */
export async function autoLoginToPortal(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const appointmentId = session.metadata?.appointment_id;
    if (!appointmentId) return;

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
    const link = await generatePortalAccessLink(
      client.email,
      `${appUrl}/portal`
    );

    if (link) {
      redirect(link);
    }
  } catch (err) {
    // Si le redirect plante, on laisse remonter (Next.js gère)
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    console.error("[portal] autoLoginToPortal failed", err);
  }
}
