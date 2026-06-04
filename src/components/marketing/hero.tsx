import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-40 pb-28">
      <div className="absolute inset-0 bg-radial-fade pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-gold/5 blur-3xl pointer-events-none" />

      <div className="container relative z-10 max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-medium text-gold mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pensé par et pour les tatoueurs français</span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance mb-8 animate-fade-up">
          Le logiciel <span className="text-gold-gradient">qui gère</span><br />
          ton studio à ta place.
        </h1>

        <p className="text-lg md:text-xl text-ink-300 max-w-2xl mx-auto mb-10 text-balance animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Agenda, acomptes, fiches clients, consentement médical, rappels soins.
          Inklee fait disparaître la paperasse pour que tu te concentres sur ton art.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <Button asChild size="xl" className="gold-glow">
            <Link href="/signup">
              Essayer gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="xl">
            <Link href="#features">Voir les features</Link>
          </Button>
        </div>

        <p className="mt-6 text-sm text-ink-400 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          14 jours gratuits · Sans carte bancaire · Sans engagement
        </p>
      </div>

      {/* Mock dashboard preview */}
      <div className="container relative z-10 mt-20 max-w-6xl">
        <div className="relative rounded-2xl border border-ink-800 bg-ink-900/60 p-2 shadow-2xl gold-glow animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <div className="rounded-xl border border-ink-800 bg-ink-950 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-ink-800">
              <div className="w-3 h-3 rounded-full bg-ink-700" />
              <div className="w-3 h-3 rounded-full bg-ink-700" />
              <div className="w-3 h-3 rounded-full bg-ink-700" />
              <div className="flex-1 ml-4 text-xs text-ink-400 font-mono">app.inklee.fr/dashboard</div>
            </div>
            <div className="grid grid-cols-12 gap-4 p-6">
              <div className="col-span-3 space-y-3">
                <div className="h-8 rounded bg-ink-800/60" />
                <div className="h-32 rounded bg-ink-800/40" />
                <div className="h-32 rounded bg-ink-800/40" />
              </div>
              <div className="col-span-9 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-20 rounded bg-gradient-to-br from-gold/20 to-transparent border border-gold/20" />
                  <div className="h-20 rounded bg-ink-800/40" />
                  <div className="h-20 rounded bg-ink-800/40" />
                </div>
                <div className="h-64 rounded bg-ink-800/30 grid grid-cols-7 gap-1 p-3">
                  {Array.from({ length: 21 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded ${
                        [3, 7, 12, 15, 19].includes(i) ? "bg-gold/30" : "bg-ink-800/60"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
