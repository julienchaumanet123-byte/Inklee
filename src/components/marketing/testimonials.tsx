import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Avant Inklee, je passais 2h par jour sur les messages Instagram et les rappels. Maintenant je tatoue, point. Mes no-shows sont passés de 4 par semaine à 0.",
    author: "Léa Marchand",
    initials: "LM",
    role: "Tatoueuse, Atelier Noir — Lyon",
    accent: "from-rose-500/30 to-amber-500/30",
  },
  {
    quote:
      "Le consentement médical signé en ligne, c'est ce qui me manquait. En cas de pépin je suis couverte, et les clients trouvent ça super pro.",
    author: "Thomas Dubois",
    initials: "TD",
    role: "Tatoueur, Black Lotus — Bordeaux",
    accent: "from-sky-500/30 to-emerald-500/30",
  },
  {
    quote:
      "Mes clients reçoivent les rappels de soins automatiquement. Résultat : moins de cicatrisations ratées, plus de retouches gratuites évitées.",
    author: "Anaïs Petit",
    initials: "AP",
    role: "Tatoueuse, Ink Memory — Paris",
    accent: "from-violet-500/30 to-pink-500/30",
  },
];

export function Testimonials() {
  return (
    <section id="temoignages" className="py-12 sm:py-16 lg:py-20 relative">
      <div className="container max-w-6xl px-4">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 lg:mb-12">
          <div className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-foreground mb-3 sm:mb-4">
            Témoignages
          </div>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance mb-4 sm:mb-6 leading-[1.05]">
            Des artistes <span className="text-gold-gradient">qui respirent</span>.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((t) => (
            <figure
              key={t.author}
              className="relative rounded-xl border border-ink-800 bg-ink-900/40 p-6 sm:p-8 grain card-hover hover:border-white/20"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 text-foreground fill-foreground"
                  />
                ))}
              </div>
              <Quote className="w-6 h-6 sm:w-7 sm:h-7 text-foreground/20 mb-4 sm:mb-5" />
              <blockquote className="text-sm sm:text-base text-ink-100 leading-relaxed mb-5 sm:mb-6">
                « {t.quote} »
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.accent} border border-white/20 flex items-center justify-center shrink-0`}
                >
                  <span className="font-display text-sm font-bold text-foreground">
                    {t.initials}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">
                    {t.author}
                  </div>
                  <div className="text-xs text-ink-400">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
