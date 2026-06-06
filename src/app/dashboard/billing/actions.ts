"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const subscribeSchema = z.object({
  plan: z.enum(["starter", "pro"]),
});

const PRICE_MAP: Record<"starter" | "pro", string | undefined> = {
  starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
};

/**
 * Lance un Stripe Checkout en mode subscription pour le plan demandé.
 * - Crée un Stripe Customer pour le studio s'il n'en a pas
 * - Customer + Subscription vivent sur le compte PLATEFORME (Inklee), pas
 *   sur le compte Connect du tatoueur (qui sert pour les acomptes clients)
 */
export async function subscribeAction(formData: FormData) {
  const parsed = subscribeSchema.safeParse({ plan: formData.get("plan") });
  if (!parsed.success) return;

  const priceId = PRICE_MAP[parsed.data.plan];
  if (!priceId) {
    console.error("[billing] price ID manquant pour plan", parsed.data.plan);
    return;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return;

  const { data: studio } = await supabase
    .from("studios")
    .select("id, stripe_customer_id, name")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!studio) return;

  // Crée le Customer Stripe s'il n'existe pas encore
  let customerId = studio.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: studio.name,
      metadata: { studio_id: studio.id },
    });
    customerId = customer.id;
    await supabase
      .from("studios")
      .update({ stripe_customer_id: customerId })
      .eq("id", studio.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      studio_id: studio.id,
      plan_tier: parsed.data.plan,
    },
    subscription_data: {
      metadata: {
        studio_id: studio.id,
        plan_tier: parsed.data.plan,
      },
    },
    success_url: `${APP_URL}/dashboard/billing?subscribed=1`,
    cancel_url: `${APP_URL}/dashboard/billing`,
    allow_promotion_codes: true,
  });

  if (session.url) {
    redirect(session.url);
  }
}

/**
 * Ouvre le Stripe Customer Portal : le tatoueur gère son abonnement,
 * change de plan, met à jour sa carte, télécharge ses factures, etc.
 */
export async function openBillingPortal() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: studio } = await supabase
    .from("studios")
    .select("stripe_customer_id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!studio?.stripe_customer_id) return;

  const session = await stripe.billingPortal.sessions.create({
    customer: studio.stripe_customer_id,
    return_url: `${APP_URL}/dashboard/billing`,
  });

  redirect(session.url);
}
