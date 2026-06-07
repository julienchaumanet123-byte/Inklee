import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock, ArrowRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PortfolioGrid } from "./portfolio-grid";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: studio } = await supabase
    .from("studios")
    .select("id, plan_tier")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!studio) redirect("/onboarding");

  const plan = PLANS[studio.plan_tier];
  const canPortfolio = plan.features.portfolio;

  const { data: images } = canPortfolio
    ? await supabase
        .from("portfolio_images")
        .select("*")
        .eq("studio_id", studio.id)
        .order("position", { ascending: true })
    : { data: [] };

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-1">Portfolio</h1>
          <p className="text-ink-300">
            Galerie publique de tes œuvres, visible sur ta page de réservation
            et l'espace de tes clients.
          </p>
        </div>
        {canPortfolio && (
          <div className="text-xs text-ink-400 sm:text-right">
            {images?.length ?? 0} / {plan.limits.maxPortfolioImages} images
          </div>
        )}
      </div>

      {!canPortfolio ? (
        <Card className="border-white/20 bg-gradient-to-br from-white/[0.05] to-transparent gold-glow grain">
          <CardContent className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 border border-white/20 mb-5">
              <Lock className="w-7 h-7 text-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">
              Le portfolio est une feature <span className="text-gold-gradient">Pro</span>.
            </h2>
            <p className="text-ink-300 mb-6 max-w-md mx-auto">
              Passe au plan Pro (59€/mois) pour publier ta galerie et donner
              envie à tes prochains clients.
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard/billing">
                Voir les plans
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <PortfolioGrid
          studioId={studio.id}
          images={images ?? []}
          remaining={
            plan.limits.maxPortfolioImages - (images?.length ?? 0)
          }
        />
      )}

      {/* Encart explicatif */}
      {canPortfolio && (
        <div className="mt-10 flex items-start gap-3 rounded-lg border border-ink-800 bg-ink-900/40 p-4 text-sm text-ink-300">
          <Sparkles className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
          <p>
            Tes images apparaissent en grille sur ta page publique{" "}
            <code className="text-foreground bg-ink-800 px-1.5 py-0.5 rounded text-xs">
              inklee.fr/[ton-slug]
            </code>{" "}
            et dans l'espace personnel de chaque client. Limite max 10 Mo par
            image, formats JPG/PNG/WebP.
          </p>
        </div>
      )}
    </div>
  );
}
