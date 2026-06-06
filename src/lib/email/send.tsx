import * as React from "react";
import { render } from "@react-email/render";
import { resend, FROM_EMAIL } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { BookingConfirmedClientEmail } from "@/emails/booking-confirmed-client";
import { BookingNotificationStudioEmail } from "@/emails/booking-notification-studio";
import { BookingCancelledEmail } from "@/emails/booking-cancelled";

/**
 * Récupère toutes les infos nécessaires pour les emails liés à un RDV.
 * Renvoie null si introuvable.
 */
async function fetchAppointmentBundle(appointmentId: string) {
  const supabase = createAdminClient();

  const { data: appt } = await supabase
    .from("appointments")
    .select(
      "id, starts_at, project_description, deposit_amount, studio_id, client_id"
    )
    .eq("id", appointmentId)
    .maybeSingle();
  if (!appt) return null;

  const [{ data: client }, { data: studio }] = await Promise.all([
    supabase
      .from("clients")
      .select("first_name, last_name, email, phone")
      .eq("id", appt.client_id)
      .maybeSingle(),
    supabase
      .from("studios")
      .select("name, city, slug, owner_id")
      .eq("id", appt.studio_id)
      .maybeSingle(),
  ]);

  if (!client || !studio) return null;

  const { data: owner } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", studio.owner_id)
    .maybeSingle();

  return { appt, client, studio, owner };
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendBookingConfirmedToClient(appointmentId: string) {
  try {
    const bundle = await fetchAppointmentBundle(appointmentId);
    if (!bundle) return;
    const { appt, client, studio } = bundle;

    const html = await render(
      <BookingConfirmedClientEmail
        clientFirstName={client.first_name}
        studioName={studio.name}
        studioCity={studio.city}
        appointmentDateLabel={formatDateTime(appt.starts_at)}
        depositAmountLabel={formatPrice(Number(appt.deposit_amount))}
        projectDescription={appt.project_description}
        portalUrl={`${APP_URL}/portal/login`}
      />
    );

    await resend.emails.send({
      from: FROM_EMAIL,
      to: client.email,
      subject: `Ton rendez-vous chez ${studio.name} est confirmé`,
      html,
    });
  } catch (err) {
    console.error("[email] sendBookingConfirmedToClient failed", err);
  }
}

export async function sendBookingNotificationToStudio(appointmentId: string) {
  try {
    const bundle = await fetchAppointmentBundle(appointmentId);
    if (!bundle) return;
    const { appt, client, studio, owner } = bundle;
    if (!owner?.email) return;

    const studioFirstName = (owner.full_name ?? "").split(" ")[0] || "salut";

    const html = await render(
      <BookingNotificationStudioEmail
        studioFirstName={studioFirstName}
        clientFullName={`${client.first_name} ${client.last_name}`}
        clientEmail={client.email}
        clientPhone={client.phone}
        appointmentDateLabel={formatDateTime(appt.starts_at)}
        depositAmountLabel={formatPrice(Number(appt.deposit_amount))}
        projectDescription={appt.project_description}
        dashboardUrl={`${APP_URL}/dashboard/appointments/${appt.id}`}
      />
    );

    await resend.emails.send({
      from: FROM_EMAIL,
      to: owner.email,
      subject: `Nouvelle réservation : ${client.first_name} ${client.last_name}`,
      html,
    });
  } catch (err) {
    console.error("[email] sendBookingNotificationToStudio failed", err);
  }
}

/**
 * Prévient le tatoueur que le prélèvement de son abonnement Inklee a échoué,
 * avec un lien vers son espace facturation pour mettre à jour sa carte.
 */
export async function sendSubscriptionPaymentFailed(stripeCustomerId: string) {
  try {
    const supabase = createAdminClient();
    const { data: studio } = await supabase
      .from("studios")
      .select("name, owner_id")
      .eq("stripe_customer_id", stripeCustomerId)
      .maybeSingle();
    if (!studio) return;

    const { data: owner } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", studio.owner_id)
      .maybeSingle();
    if (!owner?.email) return;

    const firstName = (owner.full_name ?? "").split(" ")[0] || "Bonjour";
    const billingUrl = `${APP_URL}/dashboard/billing`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: owner.email,
      subject: "Action requise : le paiement de ton abonnement Inklee a échoué",
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111">
          <h2>${firstName}, ton paiement n'a pas pu être prélevé</h2>
          <p>Le dernier prélèvement de ton abonnement Inklee${
            studio.name ? ` (${studio.name})` : ""
          } a échoué. Pour éviter toute interruption de ton compte, mets à jour ton moyen de paiement dès que possible.</p>
          <p style="margin:28px 0">
            <a href="${billingUrl}" style="background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Mettre à jour ma carte</a>
          </p>
          <p style="color:#666;font-size:13px">Stripe retentera automatiquement le prélèvement dans les prochains jours. Si tu mets ta carte à jour, rien d'autre n'est nécessaire.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[email] sendSubscriptionPaymentFailed failed", err);
  }
}

export async function sendBookingCancelledToClient(appointmentId: string) {
  try {
    const bundle = await fetchAppointmentBundle(appointmentId);
    if (!bundle) return;
    const { appt, client, studio } = bundle;

    const html = await render(
      <BookingCancelledEmail
        clientFirstName={client.first_name}
        studioName={studio.name}
        appointmentDateLabel={formatDateTime(appt.starts_at)}
      />
    );

    await resend.emails.send({
      from: FROM_EMAIL,
      to: client.email,
      subject: `Rendez-vous annulé — ${studio.name}`,
      html,
    });
  } catch (err) {
    console.error("[email] sendBookingCancelledToClient failed", err);
  }
}
