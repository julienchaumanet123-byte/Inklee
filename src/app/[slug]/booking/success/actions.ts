"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { generatePortalAccessLink } from "@/lib/email/portal-link";

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
    const link = await generatePortalAccessLink(
      client.email,
      `${appUrl}/portal`
    );

    if (link) {
      redirect(link);
    }
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    console.error("[portal] autoLoginToPortal failed", err);
  }
}
