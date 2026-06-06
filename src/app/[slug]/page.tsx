import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Sparkles, ShieldCheck } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { SlotPicker } from "./slot-picker";
import {
  getNextDays,
  getSlotsForDate,
  isSlotBooked,
  loadStudioAvailability,
} from "@/lib/availability";
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

  // Charge la config availability du studio
  const config = await loadStudioAvailability(studio.id);
  const horizonDays = config?.bookingHorizonDays ?? 14;

  const horizon = new Date();
  horizon.setDate(horizon.getDate() + horizonDays);

  const [{ data: bookedRaw }, { data: portfolio }] = await Promise.all([
    supabase
      .from("appointments")
      .select("starts_at, ends_at, status")
      .eq("studio_id", studio.id)
      .gte("starts_at", new Date().toISOString())
      .lte("starts_at", horizon.toISOString())
      .in("status", ["pending", "confirmed"]),
    supabase
      .from("portfolio_images")
      .select("id, image_url, caption")
      .eq("studio_id", studio.id)
      .order("position", { ascending: true })
      .limit(12),
  ]);

  const booked = bookedRaw ?? [];

  const availability = config
    ? getNextDays(horizonDays).map((date) => {
        const slots = getSlotsForDate(date, config)
          .filter((slot) => !isSlotBooked(slot, booked))
          .map((slot) => ({ iso: slot.iso, label: slot.label }));
        return { dateIso: date.toISOString(), slots };
      })
    : [];

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

      {/* Portfolio */}
      {portfolio && portfolio.length > 0 && (
        <section className="container max-w-5xl pb-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">
            Portfolio
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {portfolio.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square rounded-lg overflow-hidden bg-ink-900 border border-ink-800"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url}
                  alt={img.caption ?? ""}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Booking */}
      <section className="container max-w-4xl pb-32">
        <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6 md:p-10">
          {!studio.stripe_charges_enabled ? (
            <div className="text-center py-10">
              <h2 className="font-display text-3xl font-bold mb-3">
                Réservation bientôt disponible
              </h2>
              <p className="text-ink-300 max-w-md mx-auto">
                {studio.name} finalise la configuration de son moyen de
                paiement. Reviens dans quelques jours pour réserver.
              </p>
            </div>
          ) : (
            <>
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
                  Paiement sécurisé via Stripe directement chez {studio.name}.
                  Pour toute annulation ou modification, contacte directement le
                  studio.
                </p>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
