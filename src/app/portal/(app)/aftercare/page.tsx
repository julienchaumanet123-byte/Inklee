import {
  Droplet,
  Sun,
  ShowerHead,
  Sparkles,
  Hand,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Conseils soins — Inklee",
};

const PHASES = [
  {
    title: "Le jour J & le lendemain (J+0 / J+1)",
    color: "border-white/30 bg-white/[0.04]",
    icon: ShowerHead,
    items: [
      "Garde ton pansement (Saniderm/film) 2h à 24h selon les consignes de ton tatoueur.",
      "Lave-toi les mains à l'eau chaude et au savon avant de toucher le tatouage.",
      "Rince à l'eau tiède + savon doux sans parfum (ex: Marseille, Sebamed, Aderma).",
      "Sèche en tamponnant avec une serviette propre — jamais en frottant.",
      "Applique une fine couche de crème cicatrisante (Bepanthen, Cicaplast, A-Derma Epitheliale).",
    ],
  },
  {
    title: "Les 3 à 7 premiers jours",
    color: "border-ink-700 bg-ink-900/40",
    icon: Droplet,
    items: [
      "Lave 2 à 3 fois par jour. Crème en couche fine 3-4 fois par jour.",
      "Ta peau va peluger : c'est normal, c'est l'encre superficielle qui part.",
      "Ne gratte JAMAIS, ne tire pas les peaux mortes : ça enlève l'encre.",
      "Évite les vêtements serrés ou rêches sur la zone.",
      "Aucun bain, piscine, mer, sauna, hammam, sport intensif pendant 2 semaines.",
    ],
  },
  {
    title: "Après une semaine (J+7 à J+14)",
    color: "border-ink-700 bg-ink-900/40",
    icon: Sparkles,
    items: [
      "Continue les soins matin et soir avec une crème hydratante simple.",
      "Si ça démange : tapote doucement, ne gratte pas.",
      "Le tatouage paraît plus clair / mat : c'est la peau qui régénère.",
      "Reprise du sport légère possible si plus de croûtes.",
    ],
  },
  {
    title: "Long terme — toute la vie",
    color: "border-ink-700 bg-ink-900/40",
    icon: Sun,
    items: [
      "Protège-le du soleil : SPF 50 dès l'exposition pendant le 1er mois, SPF 30 ensuite.",
      "Le soleil c'est le pire ennemi : il décolore et déforme le tatouage.",
      "Hydrate ta peau régulièrement.",
      "Une retouche est souvent prévue 1-3 mois après — c'est normal.",
    ],
  },
];

const RED_FLAGS = [
  "Rougeur qui s'étend au-delà du tatouage après 5 jours",
  "Gonflement important, chaleur ou douleur intense",
  "Pus jaunâtre ou verdâtre",
  "Fièvre",
  "Ligne rouge qui remonte le long d'un bras / d'une jambe",
];

export default function AftercarePage() {
  return (
    <div className="container max-w-2xl py-6 px-4">
      <div className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2 leading-tight">
          Soins post-tatouage
        </h1>
        <p className="text-sm sm:text-base text-ink-300">
          La cicatrisation détermine le rendu final de ton tatouage. Suis ces
          étapes pour que ton encre reste belle des années.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {PHASES.map((phase) => {
          const Icon = phase.icon;
          return (
            <Card key={phase.title} className={phase.color}>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-foreground" />
                  </div>
                  <h2 className="font-display text-lg font-semibold leading-tight">
                    {phase.title}
                  </h2>
                </div>
                <ul className="space-y-2 pl-12">
                  {phase.items.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm text-ink-100 leading-relaxed list-disc list-outside"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Red flags */}
      <Card className="border-red-500/40 bg-red-500/[0.04] mb-6">
        <CardContent className="pt-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
            <h2 className="font-display text-lg font-semibold text-red-200 leading-tight">
              Signes qui doivent t'alerter
            </h2>
          </div>
          <p className="text-sm text-red-100/80 mb-3 pl-12">
            Si tu remarques un de ces signes, contacte ton tatoueur et/ou ton
            médecin sans attendre :
          </p>
          <ul className="space-y-1.5 pl-12">
            {RED_FLAGS.map((f) => (
              <li key={f} className="text-sm text-red-100 list-disc list-outside">
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* CTA contact */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-ink-800 border border-ink-700 flex items-center justify-center shrink-0">
              <Hand className="w-4 h-4 text-foreground" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-foreground mb-1">
                Un doute ?
              </div>
              <p className="text-sm text-ink-300 mb-4">
                Contacte directement ton studio via la messagerie. Ils
                connaissent ton projet et leur encre.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/portal/messages">
                  Voir mes messages
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-[11px] text-ink-500 text-center mt-6">
        Ces conseils sont d'ordre général. Les consignes de ton tatoueur
        priment toujours — chaque encre et chaque peau réagit différemment.
      </p>
    </div>
  );
}
