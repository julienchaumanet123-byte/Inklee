import { redirect } from "next/navigation";
import { syncStripeAccountStatus } from "../actions";

export const dynamic = "force-dynamic";

export default async function PaymentsReturnPage() {
  // Re-sync depuis Stripe puis redirige vers la page de statut
  await syncStripeAccountStatus();
  redirect("/dashboard/payments");
}
