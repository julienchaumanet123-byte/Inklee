import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("[email] RESEND_API_KEY manquant — aucun email ne sera envoyé.");
}

export const resend = new Resend(
  process.env.RESEND_API_KEY ?? "re_placeholder"
);

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "Inklee <onboarding@resend.dev>";
