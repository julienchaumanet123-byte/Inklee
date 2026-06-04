import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTAStrip() {
  return (
    <section className="py-32">
      <div className="container max-w-4xl">
        <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/[0.08] via-transparent to-gold/[0.04] p-12 md:p-16 text-center gold-glow grain">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-balance mb-6">
            Prêt à passer plus de temps à <span className="text-gold-gradient">tatouer</span> ?
          </h2>
          <p className="text-lg text-ink-300 max-w-xl mx-auto mb-8 text-balance">
            Crée ton compte en 2 minutes. 14 jours gratuits pour tester. Sans carte.
          </p>
          <Button asChild size="xl">
            <Link href="/signup">
              Lancer mon essai
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
