import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function BookingCancelledPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { appointment_id?: string };
}) {
  // Nettoyer le RDV en attente non payé
  if (searchParams.appointment_id) {
    const supabase = createAdminClient();
    await supabase
      .from("appointments")
      .delete()
      .eq("id", searchParams.appointment_id)
      .eq("status", "pending")
      .eq("deposit_paid", false);
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-ink-800 border border-ink-700 mb-6">
          <XCircle className="w-10 h-10 text-ink-300" />
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
          Paiement annulé
        </h1>

        <p className="text-ink-300 mb-8">
          Aucun acompte n'a été prélevé. Le créneau est de nouveau libre — tu
          peux réessayer quand tu veux.
        </p>

        <Button asChild size="lg">
          <Link href={`/${params.slug}`}>Choisir un autre créneau</Link>
        </Button>
      </div>
    </main>
  );
}
