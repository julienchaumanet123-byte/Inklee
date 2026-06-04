import Link from "next/link";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: 29,
    description: "Pour les artistes solo qui démarrent.",
    features: [
      { label: "1 artiste", included: true },
      { label: "Agenda + créneaux", included: true },
      { label: "Acomptes Stripe", included: true },
      { label: "Page de résa publique", included: true },
      { label: "CRM client basique", included: true },
      { label: "Rappels SMS", included: false },
      { label: "Consentement médical PDF", included: false },
      { label: "Suivi multi-séances", included: false },
    ],
    cta: "Commencer",
    href: "/signup?plan=starter",
    highlighted: false,
  },
  {
    name: "Pro",
    price: 59,
    description: "Pour les pros qui veulent zéro friction.",
    features: [
      { label: "1 artiste", included: true },
      { label: "Tout le plan Starter", included: true },
      { label: "SMS rappels J-1 + soins", included: true },
      { label: "Consentement médical signé", included: true },
      { label: "Suivi multi-séances", included: true },
      { label: "Portfolio galerie publique", included: true },
      { label: "Rappels soins post-tatouage", included: true },
      { label: "Support prioritaire", included: true },
    ],
    cta: "Choisir Pro",
    href: "/signup?plan=pro",
    highlighted: true,
  },
  {
    name: "Studio",
    price: null,
    description: "Pour les studios à plusieurs artistes.",
    features: [
      { label: "Artistes illimités", included: true },
      { label: "Tout le plan Pro", included: true },
      { label: "Compta multi-artiste", included: true },
      { label: "Gestion permanenciers", included: true },
      { label: "Onboarding personnalisé", included: true },
      { label: "Account manager dédié", included: true },
      { label: "API & intégrations", included: true },
      { label: "Contrat annuel négociable", included: true },
    ],
    cta: "Nous contacter",
    href: "mailto:hello@inklee.fr",
    highlighted: false,
    disabled: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-32 relative">
      <div className="container max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Tarifs</div>
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6">
            Un prix par <span className="text-gold-gradient">simplicité</span>.
          </h2>
          <p className="text-lg text-ink-300 text-balance">
            14 jours d'essai gratuit sur tous les plans. Sans carte bancaire,
            sans engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 transition-all ${
                plan.highlighted
                  ? "border-gold/40 bg-gradient-to-b from-gold/[0.08] to-transparent gold-glow"
                  : "border-ink-800 bg-ink-900/40"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-ink-950">
                    Le plus populaire
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display text-2xl font-semibold mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-ink-300">{plan.description}</p>
              </div>

              <div className="mb-8">
                {plan.price !== null ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">{plan.price}€</span>
                    <span className="text-ink-300">/mois</span>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-ink-200">Sur devis</div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li
                    key={f.label}
                    className={`flex items-start gap-3 text-sm ${
                      f.included ? "text-ink-100" : "text-ink-500 line-through"
                    }`}
                  >
                    {f.included ? (
                      <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-ink-600 mt-0.5 shrink-0" />
                    )}
                    {f.label}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={plan.highlighted ? "default" : "outline"}
                size="lg"
                className="w-full"
                disabled={plan.disabled}
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
