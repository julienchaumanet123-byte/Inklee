import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Avant Inklee, je passais 2h par jour sur les messages Instagram et les rappels. Maintenant je tatoue, point. Mes no-shows sont passés de 4 par semaine à 0.",
    author: "Léa Marchand",
    role: "Tatoueuse, Atelier Noir — Lyon",
  },
  {
    quote:
      "Le consentement médical signé en ligne, c'est ce qui me manquait. En cas de pépin je suis couverte, et les clients trouvent ça super pro.",
    author: "Thomas Dubois",
    role: "Tatoueur, Black Lotus — Bordeaux",
  },
  {
    quote:
      "Mes clients reçoivent les rappels de soins automatiquement. Résultat : moins de cicatrisations ratées, plus de retouches gratuites évitées.",
    author: "Anaïs Petit",
    role: "Tatoueuse, Ink Memory — Paris",
  },
];

export function Testimonials() {
  return (
    <section id="temoignages" className="py-20 sm:py-28 lg:py-32 relative">
      <div className="container max-w-6xl px-4">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 lg:mb-20">
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
              className="relative rounded-xl border border-ink-800 bg-ink-900/40 p-6 sm:p-8 grain"
            >
              <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-foreground/30 mb-4 sm:mb-6" />
              <blockquote className="text-sm sm:text-base text-ink-100 leading-relaxed mb-4 sm:mb-6">
                « {t.quote} »
              </blockquote>
              <figcaption>
                <div className="font-semibold text-foreground text-sm sm:text-base">
                  {t.author}
                </div>
                <div className="text-xs sm:text-sm text-ink-400">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
