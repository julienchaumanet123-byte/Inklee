const STUDIOS = [
  "ATELIER NOIR",
  "BLACK LOTUS",
  "INK MEMORY",
  "MAISON LINE",
  "GRAVEUR",
  "L'ENCRE NOIRE",
  "STUDIO PAGE",
  "MIRROR INK",
  "FINELINE PARIS",
];

export function StudiosStrip() {
  // Duplique pour effet marquee infini
  const items = [...STUDIOS, ...STUDIOS];
  return (
    <section className="relative py-10 sm:py-14 border-y border-ink-800/60 overflow-hidden">
      <div className="text-center mb-6 sm:mb-8">
        <p className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-ink-400">
          Déjà adopté par des dizaines de studios français
        </p>
      </div>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex gap-10 sm:gap-16 animate-marquee whitespace-nowrap">
          {items.map((s, i) => (
            <span
              key={`${s}-${i}`}
              className="font-display text-xl sm:text-3xl font-bold text-ink-500 tracking-wider select-none"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
