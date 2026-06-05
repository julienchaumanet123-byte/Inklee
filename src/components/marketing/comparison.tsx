import { Check, X } from "lucide-react";
import { Reveal } from "./reveal";

type Row = {
  feature: string;
  inklee: string | boolean;
  competitor: string | boolean;
};

const rows: Row[] = [
  { feature: "Pensé spécifiquement pour le tatouage", inklee: true, competitor: false },
  { feature: "Acompte direct sur ton compte (Stripe Connect)", inklee: true, competitor: false },
  { feature: "Consentement médical signé en ligne", inklee: true, competitor: false },
  { feature: "Suivi multi-séances (gros projets)", inklee: true, competitor: false },
  { feature: "Espace client avec chat", inklee: true, competitor: false },
  { feature: "Portfolio public intégré", inklee: true, competitor: "Limité" },
  { feature: "Rappels soins post-tatouage automatiques", inklee: true, competitor: false },
  { feature: "Données hébergées en Europe (RGPD)", inklee: true, competitor: "Variable" },
  { feature: "Setup en moins de 5 minutes", inklee: true, competitor: false },
  { feature: "Prix de départ", inklee: "29€/mois", competitor: "39€+/mois" },
];

function Cell({ value, win }: { value: string | boolean; win?: boolean }) {
  if (value === true) {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <Check
          className={`w-4 h-4 ${win ? "text-foreground" : "text-emerald-400"}`}
        />
        <span className={win ? "text-foreground font-medium" : "text-ink-200"}>
          Inclus
        </span>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <X className="w-4 h-4 text-ink-600" />
        <span className="text-ink-500">Non</span>
      </div>
    );
  }
  return (
    <div
      className={`text-sm ${
        win ? "text-foreground font-medium" : "text-ink-300"
      }`}
    >
      {value}
    </div>
  );
}

export function Comparison() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 relative">
      <div className="container max-w-4xl px-4">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 lg:mb-12">
            <div className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-foreground mb-3 sm:mb-4">
              Comparaison
            </div>
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance mb-4 sm:mb-6 leading-[1.05]">
              Pourquoi <span className="text-gold-gradient">Inklee</span> et pas
              InkFlow ?
            </h2>
            <p className="text-base sm:text-lg text-ink-300">
              On a piqué les bonnes idées et corrigé tout le reste.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="rounded-2xl border border-ink-800 bg-ink-900/40 overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[1.4fr_1fr_1fr] sm:grid-cols-[1.6fr_1fr_1fr] divide-x divide-ink-800 border-b border-ink-800 bg-ink-950/60">
              <div className="px-4 sm:px-5 py-3 text-[11px] uppercase tracking-wider text-ink-400">
                Feature
              </div>
              <div className="px-4 sm:px-5 py-3 flex items-center gap-2">
                <span className="font-display text-base sm:text-lg font-bold text-gold-gradient">
                  Inklee
                </span>
              </div>
              <div className="px-4 sm:px-5 py-3 font-medium text-sm text-ink-400">
                InkFlow
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-ink-800/60">
              {rows.map((row) => (
                <div
                  key={row.feature}
                  className="grid grid-cols-[1.4fr_1fr_1fr] sm:grid-cols-[1.6fr_1fr_1fr] divide-x divide-ink-800/60 group hover:bg-ink-900/40 transition-colors"
                >
                  <div className="px-4 sm:px-5 py-3 sm:py-3.5 text-sm text-ink-100">
                    {row.feature}
                  </div>
                  <div className="px-4 sm:px-5 py-3 sm:py-3.5">
                    <Cell value={row.inklee} win />
                  </div>
                  <div className="px-4 sm:px-5 py-3 sm:py-3.5">
                    <Cell value={row.competitor} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <p className="text-center text-xs text-ink-500 mt-6">
            * Sources publiques (sites officiels InkFlow, ink-flow.me) à la
            date du <span suppressHydrationWarning>{new Date().toLocaleDateString("fr-FR")}</span>.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
