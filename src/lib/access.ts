import type { PlanTier } from "@/types/database";

export type StudioAccess = {
  /** A une souscription Stripe active (n'importe quel plan payant). */
  subscribed: boolean;
  /** Encore dans la période d'essai gratuite. */
  inTrial: boolean;
  /** Jours restants d'essai (0 si terminé). */
  trialDaysLeft: number;
  /** Essai terminé ET pas d'abonnement → dashboard verrouillé. */
  locked: boolean;
};

/**
 * Détermine l'accès d'un studio : essai gratuit en cours, abonné, ou verrouillé.
 * Un studio garde l'accès tant qu'il est dans son essai OU qu'il a un abonnement.
 */
export function getStudioAccess(studio: {
  trial_ends_at: string;
  plan_tier: PlanTier;
  stripe_subscription_id: string | null;
}): StudioAccess {
  const subscribed = Boolean(studio.stripe_subscription_id);
  const trialEnd = new Date(studio.trial_ends_at).getTime();
  const now = Date.now();
  const inTrial = Number.isFinite(trialEnd) && now < trialEnd;
  const trialDaysLeft = inTrial
    ? Math.max(0, Math.ceil((trialEnd - now) / 86_400_000))
    : 0;

  return {
    subscribed,
    inTrial,
    trialDaysLeft,
    locked: !subscribed && !inTrial,
  };
}
