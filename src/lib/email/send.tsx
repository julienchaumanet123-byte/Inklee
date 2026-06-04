import * as React from "react";
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

    await resend.emails.send({
      from: FROM_EMAIL,
      to: client.email,
      subject: `Ton rendez-vous chez ${studio.name} est confirmé`,
      react: (
        <BookingConfirmedClientEmail
          clientFirstName={client.first_name}
          studioName={studio.name}
          studioCity={studio.city}
          appointmentDateLabel={formatDateTime(appt.starts_at)}
          depositAmountLabel={formatPrice(Number(appt.deposit_amount))}
          projectDescription={appt.project_description}
        />
      ),
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

    await resend.emails.send({
      from: FROM_EMAIL,
      to: owner.email,
      subject: `Nouvelle réservation : ${client.first_name} ${client.last_name}`,
      react: (
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
      ),
    });
  } catch (err) {
    console.error("[email] sendBookingNotificationToStudio failed", err);
  }
}

export async function sendBookingCancelledToClient(appointmentId: string) {
  try {
    const bundle = await fetchAppointmentBundle(appointmentId);
    if (!bundle) return;
    const { appt, client, studio } = bundle;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: client.email,
      subject: `Rendez-vous annulé — ${studio.name}`,
      react: (
        <BookingCancelledEmail
          clientFirstName={client.first_name}
          studioName={studio.name}
          appointmentDateLabel={formatDateTime(appt.starts_at)}
        />
      ),
    });
  } catch (err) {
    console.error("[email] sendBookingCancelledToClient failed", err);
  }
}
