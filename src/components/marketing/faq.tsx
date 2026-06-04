"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "Combien coûte Inklee ?",
    a: "Le plan Starter est à 29€/mois et le Pro à 59€/mois. Le plan Studio est sur devis. Tous les plans incluent 14 jours d'essai gratuit, sans carte bancaire.",
  },
  {
    q: "Inklee fonctionne aussi pour le piercing ?",
    a: "Oui. À l'inscription, tu choisis ta spécialité : tatouage, piercing, ou les deux. L'interface s'adapte automatiquement (consentements, types de prestations, durées).",
  },
  {
    q: "Comment fonctionnent les acomptes ?",
    a: "Tu configures le montant de ton acompte (par exemple 50€ ou 30% de la prestation). Le client paie en ligne via Stripe au moment de réserver. L'argent arrive sur ton compte directement.",
  },
  {
    q: "Que se passe-t-il si un client annule ?",
    a: "Tu fixes tes propres conditions d'annulation. Inklee te permet de rembourser ou de garder l'acompte en quelques clics, selon ta politique.",
  },
  {
    q: "Le consentement médical est-il valable juridiquement ?",
    a: "Le PDF est signé électroniquement et horodaté. Il est conforme au règlement eIDAS pour une signature simple, ce qui couvre largement l'usage d'un studio de tatouage.",
  },
  {
    q: "Puis-je importer mes clients depuis InkFlow / Planity ?",
    a: "Oui. On t'aide à migrer tes fiches clients depuis Excel, Notion, InkFlow ou Planity gratuitement lors de l'onboarding. Aucune perte de données.",
  },
  {
    q: "Inklee est-il hébergé en France ?",
    a: "Toutes les données sont stockées sur des serveurs européens (Frankfurt), conformes RGPD. Tu restes propriétaire de tes données et peux les exporter à tout moment.",
  },
  {
    q: "Je peux annuler quand je veux ?",
    a: "Oui, à tout moment, sans frais. Tes données restent accessibles 30 jours pour export après annulation.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-32 relative">
      <div className="container max-w-3xl">
        <div className="text-center mb-16">
          <div className="text-xs uppercase tracking-[0.2em] text-gold mb-4">FAQ</div>
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6">
            Les questions qu'on nous pose.
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-ink-800 bg-ink-900/40 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-ink-900/60 transition-colors"
              >
                <span className="font-medium text-foreground">{faq.q}</span>
                {open === i ? (
                  <Minus className="w-5 h-5 text-gold shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-ink-400 shrink-0" />
                )}
              </button>
              {open === i && (
                <div className="px-6 pb-6 text-ink-300 leading-relaxed">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
