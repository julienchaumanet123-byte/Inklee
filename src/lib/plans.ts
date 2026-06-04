import type { PlanTier } from "@/types/database";

export type PlanFeature =
  | "portfolio"
  | "sms_reminders"
  | "multi_session"
  | "medical_consent"
  | "post_care_reminders"
  | "client_chat"
  | "manual_appointments";

type PlanDefinition = {
  label: string;
  tagline: string;
  price: number | null; // en €, null = sur devis
  features: Record<PlanFeature, boolean>;
  limits: {
    maxPortfolioImages: number;
    maxArtists: number;
  };
  highlight?: boolean;
};

export const PLANS: Record<PlanTier, PlanDefinition> = {
  starter: {
    label: "Starter",
    tagline: "Pour les artistes solo qui démarrent",
    price: 29,
    features: {
      client_chat: true,
      manual_appointments: true,
      portfolio: false,
      sms_reminders: false,
      multi_session: false,
      medical_consent: false,
      post_care_reminders: false,
    },
    limits: {
      maxPortfolioImages: 0,
      maxArtists: 1,
    },
  },
  pro: {
    label: "Pro",
    tagline: "Pour les pros qui veulent zéro friction",
    price: 59,
    features: {
      client_chat: true,
      manual_appointments: true,
      portfolio: true,
      sms_reminders: true,
      multi_session: true,
      medical_consent: true,
      post_care_reminders: true,
    },
    limits: {
      maxPortfolioImages: 50,
      maxArtists: 1,
    },
    highlight: true,
  },
  studio: {
    label: "Studio",
    tagline: "Pour les studios à plusieurs artistes",
    price: null,
    features: {
      client_chat: true,
      manual_appointments: true,
      portfolio: true,
      sms_reminders: true,
      multi_session: true,
      medical_consent: true,
      post_care_reminders: true,
    },
    limits: {
      maxPortfolioImages: 500,
      maxArtists: 99,
    },
  },
};

export const FEATURE_LABELS: Record<PlanFeature, string> = {
  client_chat: "Chat client/artiste",
  manual_appointments: "Création de RDV manuelle",
  portfolio: "Portfolio galerie",
  sms_reminders: "SMS rappels J-1",
  multi_session: "Suivi multi-séances",
  medical_consent: "Consentement médical signé",
  post_care_reminders: "Rappels soins post-tatouage",
};

export function canAccess(plan: PlanTier, feature: PlanFeature): boolean {
  return PLANS[plan].features[feature];
}

export function planLimit(
  plan: PlanTier,
  limit: keyof PlanDefinition["limits"]
): number {
  return PLANS[plan].limits[limit];
}
