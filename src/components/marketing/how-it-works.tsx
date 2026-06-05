import {
  UserPlus,
  Link2,
  Banknote,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    n: "01",
    icon: UserPlus,
    title: "Crée ton studio en 2 minutes",
    description:
      "Inscription, choix de la spécialité (tatouage / piercing / les deux), nom, ville. C'est tout.",
  },
  {
    n: "02",
    icon: Link2,
    title: "Partage ton lien Inklee",
    description:
      "inklee.fr/ton-studio — colle-le dans ta bio Instagram, par SMS, où tu veux. Tes clients réservent en 3 clics.",
  },
  {
    n: "03",
    icon: Banknote,
    title: "Encaisse, tatoue, kiffe",
    description:
      "L'acompte tombe direct sur ton compte. Le RDV se confirme tout seul. Tu te concentres sur l'aiguille.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-20 sm:py-28 lg:py-32">
      <div className="container max-w-5xl px-4">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 lg:mb-20">
          <div className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-foreground mb-3 sm:mb-4">
            Comment ça marche
          </div>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance leading-[1.05]">
            Du chaos à la <span className="text-gold-gradient">paix</span>.
            En 3 étapes.
          </h2>
        </div>

        <div className="relative">
          {/* Ligne de connexion (desktop only) */}
          <div className="hidden lg:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-ink-700 to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isLast = i === steps.length - 1;
              return (
                <div
                  key={step.n}
                  className="relative flex lg:flex-col items-start lg:items-center gap-4 sm:gap-5 lg:text-center"
                >
                  {/* Number + icon */}
                  <div className="flex lg:flex-col items-center gap-3 lg:gap-4 shrink-0">
                    <div className="relative">
                      <div className="absolute -top-2 -left-2 font-display text-4xl sm:text-5xl font-bold text-ink-800 select-none">
                        {step.n}
                      </div>
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-white/20 bg-ink-900 flex items-center justify-center">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                      </div>
                    </div>
                    {/* Connector arrow on mobile/tablet */}
                    {!isLast && (
                      <ArrowRight className="lg:hidden w-4 h-4 text-ink-600 mt-3" />
                    )}
                  </div>

                  <div className="flex-1 lg:max-w-xs">
                    <h3 className="font-display text-lg sm:text-xl lg:text-2xl font-semibold text-foreground mb-1.5 sm:mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-ink-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
