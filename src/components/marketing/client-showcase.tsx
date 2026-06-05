import {
  Home,
  MessageCircle,
  Calendar,
  User,
  Compass,
  MapPin,
  ArrowRight,
  Check,
} from "lucide-react";
import { Reveal } from "./reveal";

/**
 * Section showcase : montre l'espace client (mobile) à côté du dashboard pro.
 * Met en valeur le double aspect "outil pro + portail client premium".
 */
export function ClientShowcase() {
  return (
    <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
      <div className="container max-w-6xl px-4">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Copy */}
          <Reveal className="order-2 lg:order-1">
            <div className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-foreground mb-3 sm:mb-4">
              Espace client
            </div>
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance leading-[1.05] mb-5 sm:mb-6">
              Tes clients ont aussi leur <span className="text-gold-gradient">espace</span>.
            </h2>
            <p className="text-base sm:text-lg text-ink-300 mb-6 sm:mb-8 text-balance">
              Après leur réservation, ils retrouvent leur RDV, t'envoient des
              références, discutent avec toi du projet. Pas d'app à télécharger,
              pas de mot de passe. Juste un lien magique par email.
            </p>

            <ul className="space-y-3 sm:space-y-4">
              {[
                "Chat direct entre le client et toi",
                "Upload de références (Instagram, Pinterest…)",
                "Consultation du portfolio et des avis",
                "Suivi des soins post-tatouage automatique",
              ].map((feature, i) => (
                <Reveal
                  key={feature}
                  as="li"
                  delay={200 + i * 80}
                  className="flex items-start gap-3 text-sm sm:text-base text-ink-100"
                >
                  <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-foreground" />
                  </div>
                  {feature}
                </Reveal>
              ))}
            </ul>
          </Reveal>

          {/* iPhone mockup */}
          <Reveal delay={150} className="order-1 lg:order-2 relative flex justify-center">
            <div className="float-slow">
              <PhoneMockup />
            </div>
            <div className="absolute inset-0 -z-10 bg-white/[0.03] blur-3xl rounded-full" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function PhoneMockup() {
  return (
    <div className="relative w-[280px] sm:w-[320px] h-[580px] sm:h-[660px] rounded-[44px] sm:rounded-[52px] border-[10px] sm:border-[12px] border-ink-900 bg-ink-950 shadow-2xl gold-glow overflow-hidden">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[110px] h-7 bg-ink-950 rounded-b-2xl z-10" />

      {/* Screen */}
      <div className="relative w-full h-full bg-background overflow-hidden">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2 text-[10px] text-foreground font-medium">
          <span>9:41</span>
          <span>●●● 100%</span>
        </div>

        {/* Header */}
        <div className="border-b border-ink-800/60 px-4 py-3">
          <div className="font-display text-lg font-bold text-gold-gradient">
            Inklee
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <div className="font-display text-xl font-bold text-foreground mb-0.5">
              Salut Camille.
            </div>
            <div className="text-[11px] text-ink-300">
              Voici tes rendez-vous et échanges.
            </div>
          </div>

          {/* Next RDV card */}
          <div className="rounded-xl border border-white/20 bg-white/[0.04] p-3.5">
            <div className="text-[9px] uppercase tracking-wider text-foreground/80 mb-1">
              Prochain rendez-vous
            </div>
            <div className="font-display text-base font-bold text-foreground mb-1.5">
              Sam. 22 juin, 14:00
            </div>
            <div className="text-xs text-ink-200">Atelier Noir</div>
            <div className="flex items-center gap-1 text-[10px] text-ink-400 mt-0.5">
              <MapPin className="w-2.5 h-2.5" /> Lyon
            </div>
            <div className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
              Confirmé
            </div>
          </div>

          {/* Studios section */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-400 mb-2">
              Tes studios
            </div>
            <div className="space-y-2">
              <StudioCard letter="A" name="Atelier Noir" city="Lyon" />
              <StudioCard letter="B" name="Black Lotus" city="Bordeaux" />
            </div>
          </div>

          {/* Last message chip */}
          <div className="rounded-lg border border-ink-800 bg-ink-900/50 p-3 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-ink-800 flex items-center justify-center shrink-0 text-[10px] font-bold text-ink-300">
              L
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="text-[11px] font-medium text-foreground truncate">
                  Léa — Atelier Noir
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
              </div>
              <div className="text-[10px] text-ink-300 truncate">
                Top, j'ai bien reçu tes références ✨
              </div>
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="absolute bottom-0 inset-x-0 border-t border-ink-800/60 bg-ink-950/95 backdrop-blur-xl flex items-center justify-around h-14 pb-2">
          <NavIcon icon={Home} active label="Accueil" />
          <NavIcon icon={Compass} label="Tatoueurs" />
          <NavIcon icon={MessageCircle} label="Messages" />
          <NavIcon icon={Calendar} label="RDV" />
          <NavIcon icon={User} label="Profil" />
        </div>
      </div>
    </div>
  );
}

function StudioCard({
  letter,
  name,
  city,
}: {
  letter: string;
  name: string;
  city: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-ink-800 bg-ink-900/40 p-2.5">
      <div className="w-9 h-9 rounded-lg bg-ink-800 flex items-center justify-center shrink-0">
        <span className="font-display text-base font-bold text-ink-300">
          {letter}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-foreground truncate">
          {name}
        </div>
        <div className="text-[10px] text-ink-400">{city}</div>
      </div>
      <ArrowRight className="w-3 h-3 text-ink-500 shrink-0" />
    </div>
  );
}

function NavIcon({
  icon: Icon,
  active,
  label,
}: {
  icon: typeof Home;
  active?: boolean;
  label: string;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-0.5 ${
        active ? "text-foreground" : "text-ink-500"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-[8px]">{label}</span>
    </div>
  );
}
