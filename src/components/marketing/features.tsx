import {
  CalendarCheck,
  CreditCard,
  FileSignature,
  Bell,
  Users,
  Sparkles,
  Smartphone,
  Heart,
} from "lucide-react";
import { Reveal } from "./reveal";

const features = [
  {
    icon: CalendarCheck,
    title: "Agenda intelligent",
    description:
      "Vue jour, semaine, mois. Tes créneaux disponibles publiés en un clic sur ta page de résa.",
  },
  {
    icon: CreditCard,
    title: "Acomptes automatiques",
    description:
      "Le client paie son acompte au moment de réserver. Fini les no-shows non protégés.",
  },
  {
    icon: FileSignature,
    title: "Consentement médical signé",
    description:
      "PDF de consentement généré et signé en ligne avant le rendez-vous. Conforme et archivé.",
  },
  {
    icon: Heart,
    title: "Suivi multi-séances",
    description:
      "Un grand projet ? Lie plusieurs RDV au même projet et suis l'avancement de la pièce.",
  },
  {
    icon: Bell,
    title: "Rappels soins post-tatouage",
    description:
      "Tes clients reçoivent automatiquement J+1, J+3 et J+7 les bons gestes par SMS et email.",
  },
  {
    icon: Users,
    title: "CRM client intégré",
    description:
      "Fiche complète : historique des RDV, notes, photos référence, allergies. Tout au même endroit.",
  },
  {
    icon: Smartphone,
    title: "SMS de rappel J-1",
    description:
      "Réduis tes no-shows jusqu'à 80% avec des SMS de rappel automatiques la veille.",
  },
  {
    icon: Sparkles,
    title: "Page de résa personnalisée",
    description:
      "inklee.fr/ton-studio — design premium, mobile-first, conversion maximale.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 lg:py-32 relative">
      <div className="container max-w-6xl px-4">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 lg:mb-20">
          <div className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-foreground mb-3 sm:mb-4">
            Features
          </div>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance mb-4 sm:mb-6 leading-[1.05]">
            Tout ce dont ton studio a besoin.
            <br />
            <span className="text-gold-gradient">Rien de plus.</span>
          </h2>
          <p className="text-base sm:text-lg text-ink-300 text-balance">
            On a coupé la complexité des outils génériques. Inklee est pensé pour
            le quotidien d'un atelier de tatouage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Reveal
                key={feature.title}
                delay={(i % 4) * 80}
                className="group relative rounded-xl border border-ink-800 bg-ink-900/40 p-5 sm:p-6 card-hover hover:border-white/20 hover:bg-ink-900/60 glow-ring"
              >
                <div className="mb-4 sm:mb-5 inline-flex w-10 h-10 sm:w-11 sm:h-11 items-center justify-center rounded-lg bg-white/5 text-foreground border border-white/20 group-hover:bg-white/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-semibold text-base sm:text-lg mb-1.5 sm:mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-ink-300 leading-relaxed">
                  {feature.description}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
