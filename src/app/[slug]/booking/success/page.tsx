import Link from "next/link";
import { CheckCircle2, Mail, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { formatDateTime, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BookingSuccessPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { session_id?: string };
}) {
  let appointmentDate: Date | null = null;
  let amount: number | null = null;

  if (searchParams.session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(searchParams.session_id);
      const appointmentId = session.metadata?.appointment_id;

      if (appointmentId) {
        const supabase = createAdminClient();
        const { data: appt } = await supabase
          .from("appointments")
          .select("starts_at, deposit_amount")
          .eq("id", appointmentId)
          .maybeSingle();
        if (appt) {
          appointmentDate = new Date(appt.starts_at);
          amount = appt.deposit_amount;
        }
      }
    } catch {
      // Session expirée ou inexistante — on affiche l'écran générique
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 bg-radial-fade pointer-events-none" />
      <div className="relative max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/10 border border-gold/30 mb-6 gold-glow">
          <CheckCircle2 className="w-10 h-10 text-gold" />
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
          Rendez-vous confirmé.
        </h1>

        {appointmentDate && (
          <p className="text-lg text-ink-200 mb-2">
            On se retrouve le{" "}
            <span className="text-gold">{formatDateTime(appointmentDate)}</span>.
          </p>
        )}

        {amount !== null && (
          <p className="text-ink-400 mb-8">
            Acompte de {formatPrice(amount)} reçu.
          </p>
        )}

        <div className="space-y-4 mb-10 text-left">
          <div className="flex items-start gap-3 rounded-lg border border-ink-800 bg-ink-900/40 p-4">
            <Mail className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-foreground text-sm">
                Email de confirmation envoyé
              </div>
              <div className="text-xs text-ink-400">
                Vérifie ta boîte (et les spams).
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-ink-800 bg-ink-900/40 p-4">
            <Bell className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-foreground text-sm">
                Rappel automatique J-1
              </div>
              <div className="text-xs text-ink-400">
                On t'enverra un SMS la veille du rendez-vous.
              </div>
            </div>
          </div>
        </div>

        <Button asChild variant="outline" size="lg">
          <Link href={`/${params.slug}`}>Retour au studio</Link>
        </Button>
      </div>
    </main>
  );
}
