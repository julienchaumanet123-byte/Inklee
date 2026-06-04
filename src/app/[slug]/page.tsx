import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Sparkles, ShieldCheck } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { SlotPicker } from "./slot-picker";
import { getNextDays, getSlotsForDate, isSlotBooked } from "@/lib/availability";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SPECIALTY_LABEL: Record<string, string> = {
  tattoo: "Tatouage",
  piercing: "Piercing",
  both: "Tatouage & Piercing",
};

export default async function StudioPublicPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createAdminClient();

  const { data: studio } = await supabase
    .from("studios")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!studio) notFound();

  // Charge les RDV non-annulés des 14 prochains jours pour filtrer les créneaux pris
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 14);

  const { data: bookedRaw } = await supabase
    .from("appointments")
    .select("starts_at, ends_at, status")
    .eq("studio_id", studio.id)
    .gte("starts_at", new Date().toISOString())
    .lte("starts_at", horizon.toISOString())
    .in("status", ["pending", "confirmed"]);

  const booked = bookedRaw ?? [];

  const availability = getNextDays(14).map((date) => {
    const slots = getSlotsForDate(date)
      .filter((slot) => !isSlotBooked(slot, booked))
      .map((slot) => ({ iso: slot.iso, label: slot.label }));
    return { dateIso: date.toISOString(), slots };
  });

  return (
    <main className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-ink-800/50">
        <div className="container h-16 flex items-center justify-between">
          <Link href="/" className="text-sm text-ink-400 hover:text-gold transition-colors">
            ← Propulsé par <span className="text-gold-gradient font-display font-bold">Inklee</span>
          </Link>
        </div>
      </header>

      {/* Hero studio */}
      <section className="relative py-16">
        <div className="absolute inset-0 bg-radial-fade pointer-events-none" />
        <div className="container relative max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs text-gold mb-6">
            <Sparkles className="w-3 h-3" />
            {SPECIALTY_LABEL[studio.specialty] ?? "Studio"}
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance">
            {studio.name}
          </h1>

          {studio.city && (
            <div className="inline-flex items-center gap-2 text-ink-300 mb-4">
              <MapPin className="w-4 h-4" />
              {studio.city}
            </div>
          )}

          {studio.bio && (
            <p className="text-lg text-ink-300 max-w-2xl mx-auto text-balance">
              {studio.bio}
            </p>
          )}
        </div>
      </section>

      {/* Booking */}
      <section className="container max-w-4xl pb-32">
        <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6 md:p-10">
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold mb-2">
              Réserver un créneau
            </h2>
            <p className="text-ink-300">
              Choisis ta date et ton créneau. L'acompte de{" "}
              <span className="text-gold font-medium">
                {formatPrice(studio.deposit_amount)}
              </span>{" "}
              est payé en ligne pour bloquer le rendez-vous.
            </p>
          </div>

          <SlotPicker slug={studio.slug} availability={availability} />

          <div className="mt-10 pt-6 border-t border-ink-800/50 flex items-start gap-3 text-sm text-ink-400">
            <ShieldCheck className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <p>
              Paiement sécurisé via Stripe. Acompte remboursable en cas
              d'annulation 72h avant le rendez-vous.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
