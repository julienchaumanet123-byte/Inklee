import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { BookingForm } from "./booking-form";

export const dynamic = "force-dynamic";

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { slot?: string };
}) {
  if (!searchParams.slot) {
    redirect(`/${params.slug}`);
  }

  const slotDate = new Date(searchParams.slot);
  if (isNaN(slotDate.getTime())) {
    redirect(`/${params.slug}`);
  }

  const supabase = createAdminClient();
  const { data: studio } = await supabase
    .from("studios")
    .select("name, slug, city, deposit_amount, specialty")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!studio) notFound();

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-ink-800/50">
        <div className="container h-16 flex items-center justify-between">
          <Link
            href={`/${studio.slug}`}
            className="text-sm text-ink-400 hover:text-gold transition-colors"
          >
            ← Retour
          </Link>
          <span className="text-sm text-ink-400">
            Propulsé par <span className="text-gold-gradient font-display font-bold">Inklee</span>
          </span>
        </div>
      </header>

      <div className="container max-w-3xl py-12">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Finalise ta <span className="text-gold-gradient">réservation</span>
          </h1>
        </div>

        {/* Récap */}
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-5 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-gold mb-1">Studio</div>
              <div className="font-medium text-foreground">{studio.name}</div>
              {studio.city && (
                <div className="text-sm text-ink-300 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" /> {studio.city}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-gold mb-1">Rendez-vous</div>
              <div className="font-medium text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" /> {formatDateTime(slotDate)}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-gold mb-1">Acompte</div>
              <div className="font-medium text-foreground text-lg">
                {formatPrice(studio.deposit_amount)}
              </div>
            </div>
          </div>
        </div>

        <BookingForm slug={studio.slug} slotIso={slotDate.toISOString()} />
      </div>
    </main>
  );
}
