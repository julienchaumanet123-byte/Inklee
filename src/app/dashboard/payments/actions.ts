"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Lance/relance l'onboarding Stripe Connect Express pour le studio courant.
 * - Si le studio n'a pas encore de compte Stripe, on en crée un.
 * - On génère un Account Link à usage unique → redirect vers Stripe.
 * Au retour, Stripe renvoie sur /dashboard/payments/return qui refresh
 * le statut depuis l'API.
 */
export async function startStripeConnect() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: studio } = await supabase
    .from("studios")
    .select("id, stripe_account_id, name")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!studio) return;

  // 1. Crée le Connected Account si pas déjà fait
  let accountId = studio.stripe_account_id;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "FR",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: studio.name,
        product_description: "Prestations de tatouage / piercing",
        mcc: "7299", // Misc Personal Services
      },
      settings: {
        payouts: { schedule: { interval: "daily" } },
      },
    });
    accountId = account.id;

    await supabase
      .from("studios")
      .update({ stripe_account_id: accountId })
      .eq("id", studio.id);
  }

  // 2. Génère un Account Link à usage unique
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${APP_URL}/dashboard/payments`,
    return_url: `${APP_URL}/dashboard/payments/return`,
    type: "account_onboarding",
  });

  redirect(link.url);
}

/**
 * Lien vers le dashboard Stripe Express du studio (gestion compte,
 * coordonnées bancaires, etc.)
 */
export async function openStripeExpressDashboard() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: studio } = await supabase
    .from("studios")
    .select("stripe_account_id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!studio?.stripe_account_id) return;

  const loginLink = await stripe.accounts.createLoginLink(studio.stripe_account_id);
  redirect(loginLink.url);
}

/**
 * Récupère le statut courant depuis Stripe et sync en DB.
 * Appelé au retour d'onboarding.
 */
export async function syncStripeAccountStatus() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: studio } = await supabase
    .from("studios")
    .select("id, stripe_account_id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!studio?.stripe_account_id) return;

  try {
    const account = await stripe.accounts.retrieve(studio.stripe_account_id);
    await supabase
      .from("studios")
      .update({
        stripe_charges_enabled: account.charges_enabled,
        stripe_details_submitted: account.details_submitted,
      })
      .eq("id", studio.id);
  } catch (err) {
    console.error("[stripe] syncStripeAccountStatus failed", err);
  }

  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard");
}
