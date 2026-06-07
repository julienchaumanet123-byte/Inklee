import { redirect } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Banknote,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { startStripeConnect, openStripeExpressDashboard } from "./actions";
import { DepositToggle } from "./deposit-toggle";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: studio } = await supabase
    .from("studios")
    .select(
      "stripe_account_id, stripe_charges_enabled, stripe_details_submitted, deposit_required"
    )
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!studio) redirect("/onboarding");

  const isConnected = Boolean(studio.stripe_account_id);
  const isReady = studio.stripe_charges_enabled;
  const isPending = isConnected && !isReady;

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-1">Paiements</h1>
        <p className="text-ink-300">
          Tes acomptes clients sont versés directement sur ton compte bancaire
          via Stripe. Inklee ne touche pas à cet argent.
        </p>
      </div>

      {/* Statut */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          {!isConnected && (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 mb-5">
                <AlertCircle className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">
                Connecte ton compte bancaire
              </h2>
              <p className="text-ink-300 mb-6 max-w-md mx-auto">
                Nécessaire seulement si tu demandes un acompte : la réservation
                est alors désactivée tant que Stripe n'est pas configuré. Sinon,
                désactive l'acompte ci-dessous pour accepter des réservations
                sans paiement.
              </p>
              <form action={startStripeConnect}>
                <Button type="submit" size="lg">
                  <Banknote className="w-4 h-4" />
                  Connecter avec Stripe
                </Button>
              </form>
            </div>
          )}

          {isPending && (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 mb-5">
                <AlertCircle className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">
                Configuration en cours
              </h2>
              <p className="text-ink-300 mb-6 max-w-md mx-auto">
                Tu as commencé la configuration Stripe mais il manque encore
                des infos (IBAN, identité, etc.). Termine pour activer les
                réservations.
              </p>
              <form action={startStripeConnect}>
                <Button type="submit" size="lg">
                  Continuer la configuration
                </Button>
              </form>
            </div>
          )}

          {isReady && (
            <div className="py-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold mb-1">
                    Compte connecté
                  </h2>
                  <p className="text-ink-300">
                    Les acomptes clients sont versés sur ton compte bancaire.
                    Versements quotidiens automatiques.
                  </p>
                </div>
              </div>
              <form action={openStripeExpressDashboard}>
                <Button type="submit" variant="outline">
                  <ExternalLink className="w-4 h-4" />
                  Gérer mon compte Stripe
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      <DepositToggle depositRequired={studio.deposit_required} />

      {/* Encart trust */}
      <div className="flex items-start gap-3 text-sm text-ink-400">
        <ShieldCheck className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
        <div>
          Stripe est l'un des leaders mondiaux du paiement en ligne. Toutes
          les transactions sont sécurisées et conformes PCI DSS. Inklee n'a
          jamais accès à tes fonds — ils transitent directement entre ton
          client et toi.
        </div>
      </div>
    </div>
  );
}
