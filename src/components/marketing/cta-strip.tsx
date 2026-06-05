import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTAStrip() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container max-w-4xl px-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.04] p-8 sm:p-12 md:p-16 text-center gold-glow grain">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance mb-4 sm:mb-6 leading-[1.1]">
            Prêt à passer plus de temps à <span className="text-gold-gradient">tatouer</span> ?
          </h2>
          <p className="text-base sm:text-lg text-ink-300 max-w-xl mx-auto mb-6 sm:mb-8 text-balance">
            Crée ton compte en 2 minutes. 14 jours gratuits pour tester. Sans carte.
          </p>
          <Button asChild size="xl" className="w-full sm:w-auto max-w-sm mx-auto">
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
