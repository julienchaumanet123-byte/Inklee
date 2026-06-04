import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendBookingConfirmedToClient,
  sendBookingNotificationToStudio,
} from "@/lib/email/send";

export const runtime = "nodejs";

// Stripe webhook — handle TWO sources of events :
//
// 1. Connect webhook (connect=true) → events des comptes connectés :
//    - checkout.session.completed (acompte payé par un client)
//    - checkout.session.expired
//    - account.updated (state d'onboarding du tatoueur)
//    → signé avec STRIPE_WEBHOOK_SECRET
//
// 2. Platform webhook (connect=false) → events de la plateforme Inklee :
//    - checkout.session.completed (abonnement payé par un tatoueur)
//    - customer.subscription.created/updated/deleted
//    - invoice.payment_failed
//    → signé avec STRIPE_WEBHOOK_SECRET_PLATFORM
//
// Le handler essaie les 2 signatures et utilise celle qui marche.
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const connectSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const platformSecret = process.env.STRIPE_WEBHOOK_SECRET_PLATFORM;

  let event: Stripe.Event | null = null;
  for (const secret of [connectSecret, platformSecret]) {
    if (!secret) continue;
    try {
      event = stripe.webhooks.constructEvent(body, signature, secret);
      break;
    } catch {
      // Try next
    }
  }

  if (!event) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    // ============ BOOKING ACOMPTE (Connected accounts) ============
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Distinguer subscription (plateforme) vs booking (Connect)
      if (session.mode === "subscription") {
        // ABONNEMENT artiste
        const studioId = session.metadata?.studio_id;
        const rawPlan = session.metadata?.plan_tier;
        const planTier =
          rawPlan === "starter" || rawPlan === "pro" || rawPlan === "studio"
            ? rawPlan
            : null;
        if (!studioId || !planTier) break;

        await supabase
          .from("studios")
          .update({
            plan_tier: planTier,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq("id", studioId);
      } else {
        // BOOKING acompte
        const appointmentId = session.metadata?.appointment_id;
        if (!appointmentId) break;

        await supabase
          .from("appointments")
          .update({
            deposit_paid: true,
            status: "confirmed",
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id ?? session.id,
          })
          .eq("id", appointmentId);

        await Promise.allSettled([
          sendBookingConfirmedToClient(appointmentId),
          sendBookingNotificationToStudio(appointmentId),
        ]);
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription") break;
      const appointmentId = session.metadata?.appointment_id;
      if (!appointmentId) break;

      await supabase
        .from("appointments")
        .delete()
        .eq("id", appointmentId)
        .eq("status", "pending")
        .eq("deposit_paid", false);
      break;
    }

    case "account.updated": {
      // Sync l'état d'onboarding Stripe Connect du tatoueur
      const account = event.data.object as Stripe.Account;
      await supabase
        .from("studios")
        .update({
          stripe_charges_enabled: account.charges_enabled,
          stripe_details_submitted: account.details_submitted,
        })
        .eq("stripe_account_id", account.id);
      break;
    }

    // ============ SUBSCRIPTION lifecycle (Platform) ============
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const sub = event.data.object as Stripe.Subscription;
      // Détermine le plan_tier à partir du price_id
      const priceId = sub.items.data[0]?.price.id;
      let planTier: "starter" | "pro" | null = null;
      if (priceId === process.env.STRIPE_PRICE_STARTER) planTier = "starter";
      else if (priceId === process.env.STRIPE_PRICE_PRO) planTier = "pro";

      const update: {
        plan_tier?: "starter" | "pro" | "studio";
        stripe_subscription_id: string;
      } = {
        stripe_subscription_id: sub.id,
      };
      // Si abonnement actif, on respecte le plan ; sinon on downgrade
      if (planTier && (sub.status === "active" || sub.status === "trialing")) {
        update.plan_tier = planTier;
      } else if (sub.status === "canceled" || sub.status === "unpaid") {
        update.plan_tier = "starter";
      }

      await supabase
        .from("studios")
        .update(update)
        .eq("stripe_customer_id", sub.customer as string);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await supabase
        .from("studios")
        .update({
          plan_tier: "starter",
          stripe_subscription_id: null,
        })
        .eq("stripe_customer_id", sub.customer as string);
      break;
    }

    case "invoice.payment_failed": {
      // TODO : email au tatoueur pour mettre à jour son moyen de paiement
      break;
    }

    case "payment_intent.payment_failed":
      break;
  }

  return NextResponse.json({ received: true });
}
