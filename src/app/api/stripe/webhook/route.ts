import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendBookingConfirmedToClient,
  sendBookingNotificationToStudio,
} from "@/lib/email/send";

export const runtime = "nodejs";

// Stripe webhook : reçoit les events de Stripe.
//
// IMPORTANT — Stripe Connect :
// Les events checkout.session.completed pour les bookings d'acompte sont
// déclenchés sur les COMPTES CONNECTÉS (les studios), pas sur le compte
// plateforme. Il faut que le webhook Stripe écoute aussi les "Events on
// Connected accounts" dans le dashboard Stripe.
//
// Configuration côté Stripe :
//   - URL : https://inklee.fr/api/stripe/webhook (en local : `stripe listen`)
//   - Events on your account :
//       account.updated (pour suivre l'état d'onboarding des studios)
//   - Events on Connected accounts :
//       checkout.session.completed (acomptes payés)
//       checkout.session.expired
//   - Copier le signing secret dans STRIPE_WEBHOOK_SECRET
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
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
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
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
      const account = event.data.object as Stripe.Account;
      // Sync l'état d'onboarding Stripe Connect en DB
      await supabase
        .from("studios")
        .update({
          stripe_charges_enabled: account.charges_enabled,
          stripe_details_submitted: account.details_submitted,
        })
        .eq("stripe_account_id", account.id);
      break;
    }

    case "payment_intent.payment_failed": {
      // Ici on pourrait notifier le studio que le client a essayé sans succès.
      break;
    }
  }

  return NextResponse.json({ received: true });
}
