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
    <section id="features" className="py-32 relative">
      <div className="container max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Features</div>
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6">
            Tout ce dont ton studio a besoin.
            <br />
            <span className="text-gold-gradient">Rien de plus.</span>
          </h2>
          <p className="text-lg text-ink-300 text-balance">
            On a coupé la complexité des outils génériques. Inklee est pensé pour
            le quotidien d'un atelier de tatouage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative rounded-xl border border-ink-800 bg-ink-900/40 p-6 transition-all hover:border-gold/30 hover:bg-ink-900/60"
              >
                <div className="mb-5 inline-flex w-11 h-11 items-center justify-center rounded-lg bg-gold/10 text-gold border border-gold/20 group-hover:bg-gold/20 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-ink-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
