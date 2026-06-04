import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  // Pas un throw — on veut que le build passe avec un placeholder.
  console.warn("[stripe] STRIPE_SECRET_KEY manquant — Stripe ne fonctionnera pas.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
  appInfo: { name: "Inklee", version: "0.1.0" },
});
