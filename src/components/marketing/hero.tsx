import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPreview } from "./dashboard-preview";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 sm:pt-28 lg:pt-32 pb-10 sm:pb-14">
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse at top center, black 0%, transparent 70%)",
        }}
      />
      <div className="absolute inset-0 bg-radial-fade pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] sm:w-[1100px] sm:h-[1100px] rounded-full bg-white/[0.03] blur-3xl pointer-events-none" />

      <div className="container relative z-10 max-w-4xl text-center px-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-medium text-foreground mb-6 sm:mb-8 animate-fade-in backdrop-blur-sm">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>Pensé par et pour les tatoueurs français</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance mb-4 sm:mb-6 animate-fade-up leading-[0.95]">
          Le logiciel <span className="text-gold-gradient">qui gère</span> ton
          studio à ta place.
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-ink-300 max-w-2xl mx-auto mb-6 sm:mb-8 text-balance animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Agenda, acomptes, fiches clients, consentement médical, rappels soins.
          Inklee fait disparaître la paperasse pour que tu te concentres sur ton art.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center animate-fade-up max-w-sm sm:max-w-none mx-auto" style={{ animationDelay: "0.2s" }}>
          <Button asChild size="xl" className="gold-glow w-full sm:w-auto">
            <Link href="/signup">
              Essayer gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="xl" className="w-full sm:w-auto">
            <Link href="#features">Voir les features</Link>
          </Button>
        </div>

        <p className="mt-4 sm:mt-5 text-xs sm:text-sm text-ink-400 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          14 jours gratuits · Sans carte bancaire · Sans engagement
        </p>
      </div>

      {/* Preview dashboard with floating effect */}
      <div className="container relative z-10 mt-10 sm:mt-14 max-w-6xl px-2 sm:px-6">
        <div
          className="animate-fade-up relative"
          style={{ animationDelay: "0.4s" }}
        >
          {/* Glow behind */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/[0.04] blur-3xl pointer-events-none -z-10" />
          <div className="float-slow">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
