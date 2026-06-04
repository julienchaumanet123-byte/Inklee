import { redirect } from "next/navigation";
import { Check, X, Sparkles, ExternalLink, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PLANS, FEATURE_LABELS, type PlanFeature } from "@/lib/plans";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { subscribeAction, openBillingPortal } from "./actions";
import type { PlanTier } from "@/types/database";

export const dynamic = "force-dynamic";

const PLAN_ORDER: PlanTier[] = ["starter", "pro", "studio"];

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { subscribed?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: studio } = await supabase
    .from("studios")
    .select("plan_tier, stripe_customer_id, stripe_subscription_id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!studio) redirect("/onboarding");

  const currentPlan = studio.plan_tier;
  const hasSubscription = Boolean(studio.stripe_subscription_id);

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="font-display text-4xl font-bold mb-1">Abonnement</h1>
          <p className="text-ink-300">
            Tu es actuellement sur le plan{" "}
            <span className="text-foreground font-medium">
              {PLANS[currentPlan].label}
            </span>
            .
          </p>
        </div>
        {hasSubscription && (
          <form action={openBillingPortal}>
            <Button type="submit" variant="outline">
              <ExternalLink className="w-4 h-4" />
              Gérer mon abonnement
            </Button>
          </form>
        )}
      </div>

      {searchParams.subscribed && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 mb-8 flex items-center gap-2 text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          Bienvenue dans ton nouveau plan ! Ton abonnement est actif.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLAN_ORDER.map((tier) => {
          const plan = PLANS[tier];
          const isCurrent = currentPlan === tier;
          return (
            <Card
              key={tier}
              className={cn(
                "relative transition-all",
                plan.highlight && "border-white/40 bg-gradient-to-b from-white/[0.04] to-transparent gold-glow",
                isCurrent && "ring-2 ring-foreground"
              )}
            >
              {plan.highlight && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="rounded-full bg-white text-ink-950 px-3 py-1 text-xs font-semibold">
                    Le plus populaire
                  </div>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="success" className="rounded-full px-3 py-1">
                    Plan actuel
                  </Badge>
                </div>
              )}

              <CardContent className="pt-8 pb-6">
                <h2 className="font-display text-2xl font-bold mb-1">
                  {plan.label}
                </h2>
                <p className="text-sm text-ink-300 mb-6">{plan.tagline}</p>

                <div className="mb-6">
                  {plan.price !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price}€</span>
                      <span className="text-sm text-ink-300">/mois</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-ink-200">
                      Sur devis
                    </div>
                  )}
                </div>

                <ul className="space-y-2 mb-6 text-sm">
                  {(Object.keys(FEATURE_LABELS) as PlanFeature[]).map((f) => {
                    const included = plan.features[f];
                    return (
                      <li
                        key={f}
                        className={cn(
                          "flex items-start gap-2",
                          included ? "text-ink-100" : "text-ink-500"
                        )}
                      >
                        {included ? (
                          <Check className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-ink-600 mt-0.5 shrink-0" />
                        )}
                        {FEATURE_LABELS[f]}
                      </li>
                    );
                  })}
                  <li className="flex items-start gap-2 text-ink-300 pt-2 border-t border-ink-800/60 mt-2">
                    <Sparkles className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
                    Jusqu'à {plan.limits.maxPortfolioImages} images portfolio
                  </li>
                </ul>

                {isCurrent ? (
                  <Button variant="outline" disabled className="w-full">
                    Ton plan actuel
                  </Button>
                ) : tier === "studio" ? (
                  <Button asChild variant="outline" className="w-full">
                    <a href="mailto:hello@inklee.fr">Nous contacter</a>
                  </Button>
                ) : hasSubscription ? (
                  // Si déjà abonné, on passe par le Portal Stripe pour changer
                  <form action={openBillingPortal}>
                    <Button
                      type="submit"
                      variant={plan.highlight ? "default" : "outline"}
                      className="w-full"
                    >
                      Passer à {plan.label}
                    </Button>
                  </form>
                ) : (
                  <form action={subscribeAction}>
                    <input type="hidden" name="plan" value={tier} />
                    <Button
                      type="submit"
                      variant={plan.highlight ? "default" : "outline"}
                      className="w-full"
                    >
                      Choisir {plan.label}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
