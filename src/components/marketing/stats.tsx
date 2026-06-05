import { Clock, ShieldCheck, TrendingDown, Sparkles } from "lucide-react";

const stats = [
  {
    icon: TrendingDown,
    value: "0",
    suffix: "no-show",
    label: "Acompte obligatoire pour bloquer le créneau. Les annulations dernière minute, c'est fini.",
  },
  {
    icon: Clock,
    value: "4h",
    suffix: "/semaine",
    label: "C'est en moyenne ce que tes confrères récupèrent une fois Inklee installé.",
  },
  {
    icon: Sparkles,
    value: "100%",
    suffix: "tatouage",
    label: "Aucun outil générique. Tout est pensé pour ton métier : consentement, soins, multi-séances.",
  },
  {
    icon: ShieldCheck,
    value: "RGPD",
    suffix: "🇫🇷",
    label: "Données hébergées en Europe, propriétaires de tes données, export à tout moment.",
  },
];

export function Stats() {
  return (
    <section className="relative py-20 sm:py-28 border-y border-ink-800/60 bg-ink-950/40">
      <div className="container max-w-6xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="group">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-ink-500 group-hover:text-foreground transition-colors mb-3 sm:mb-4" />
                <div className="flex items-baseline gap-1 mb-2 sm:mb-3">
                  <div className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-gold-gradient leading-none">
                    {s.value}
                  </div>
                  <div className="text-xs sm:text-sm text-ink-300 ml-1">
                    {s.suffix}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-ink-400 leading-relaxed">
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
