import Link from "next/link";
import { redirect } from "next/navigation";
import {
  MapPin,
  ArrowRight,
  Clock,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getClientsForAuthUser, getAppointmentsForAuthUser } from "@/lib/portal-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/appointment-status";

export const dynamic = "force-dynamic";

const DAYS_LABELS = [
  "Aujourd'hui",
  "demain",
  "dans 2 jours",
  "dans 3 jours",
  "dans 4 jours",
  "dans 5 jours",
  "dans 6 jours",
];

function diffInDays(target: Date, from: Date = new Date()): number {
  const a = new Date(target);
  a.setHours(0, 0, 0, 0);
  const b = new Date(from);
  b.setHours(0, 0, 0, 0);
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

function countdownLabel(days: number, target: Date): string {
  if (days < 0) return "Passé";
  if (days <= 6) return DAYS_LABELS[days];
  if (days <= 13) return `dans ${days} jours`;
  if (days <= 30) return `dans ${Math.round(days / 7)} semaines`;
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(target);
}

export default async function PortalHomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const [clients, appointments] = await Promise.all([
    getClientsForAuthUser(user.id),
    getAppointmentsForAuthUser(user.id),
  ]);

  const now = new Date();
  const upcoming = appointments.filter(
    (a) => new Date(a.starts_at) >= now && a.status !== "cancelled"
  );
  const next = upcoming[0];
  const studioById = new Map(clients.map((c) => [c.studio.id, c.studio]));
  const clientByStudioId = new Map(clients.map((c) => [c.studio.id, c.id]));
  const past = appointments.filter(
    (a) => new Date(a.starts_at) < now || a.status === "completed"
  );
  const firstName = clients[0]?.first_name ?? "";

  return (
    <div className="container max-w-2xl py-6 px-4">
      {/* Hello */}
      <div className="mb-5">
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-1">
          {firstName ? `Salut ${firstName}.` : "Salut."}
        </h1>
        <p className="text-sm text-ink-300">
          {next
            ? "Voilà ton prochain rendez-vous."
            : "Aucun RDV à venir — découvre des tatoueurs ci-dessous."}
        </p>
      </div>

      {/* Prochain RDV — Hero card */}
      {next && (
        <Card className="mb-6 border-white/20 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent gold-glow overflow-hidden">
          <CardContent className="pt-6">
            {(() => {
              const startsAt = new Date(next.starts_at);
              const dayCount = diffInDays(startsAt, now);
              const studio = studioById.get(next.studio_id);
              const clientId = clientByStudioId.get(next.studio_id);
              return (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-foreground/80">
                      <Sparkles className="w-3 h-3" />
                      {countdownLabel(dayCount, startsAt)}
                    </div>
                    <Badge variant={STATUS_VARIANT[next.status]}>
                      {STATUS_LABEL[next.status]}
                    </Badge>
                  </div>
                  <div className="font-display text-2xl sm:text-3xl font-bold leading-tight mb-1">
                    {formatDateTime(startsAt)}
                  </div>
                  {studio && (
                    <div className="text-ink-200 mb-1">{studio.name}</div>
                  )}
                  {studio?.city && (
                    <div className="flex items-center gap-1 text-sm text-ink-400">
                      <MapPin className="w-3 h-3" /> {studio.city}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-5">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/portal/appointments/${next.id}`}>
                        Détails
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                    {clientId && (
                      <Button asChild size="sm">
                        <Link href={`/portal/messages/${clientId}`}>
                          <MessageCircle className="w-3.5 h-3.5" />
                          Écrire
                        </Link>
                      </Button>
                    )}
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Studios */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-bold">Tes studios</h2>
          {clients.length > 0 && (
            <Link
              href="/portal/discover"
              className="text-xs text-ink-400 hover:text-foreground"
            >
              Découvrir →
            </Link>
          )}
        </div>

        {clients.length === 0 ? (
          <Link
            href="/portal/discover"
            className="block rounded-2xl border border-white/20 bg-gradient-to-br from-white/[0.06] via-transparent to-white/[0.02] p-5 hover:border-white/30 transition-all gold-glow grain"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <ArrowRight className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-foreground mb-1">
                  Découvre les tatoueurs sur Inklee
                </div>
                <div className="text-sm text-ink-300">
                  Trouve un artiste qui te correspond et réserve ton premier RDV.
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <div className="space-y-2">
            {clients.map((c) => (
              <Link
                key={c.id}
                href={`/portal/studios/${c.id}`}
                className="block rounded-xl border border-ink-800 bg-ink-900/40 p-4 hover:border-ink-700 hover:bg-ink-900/60 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-ink-800 flex items-center justify-center shrink-0">
                    <span className="font-display text-lg font-bold text-ink-300">
                      {c.studio.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {c.studio.name}
                    </div>
                    {c.studio.city && (
                      <div className="text-xs text-ink-400">{c.studio.city}</div>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-500" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Historique */}
      {past.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-bold mb-3">Historique</h2>
          <Card>
            <ul className="divide-y divide-ink-800/50">
              {past.slice(0, 5).map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/portal/appointments/${a.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-ink-900/40 transition-colors"
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <Clock className="w-3.5 h-3.5 text-ink-500 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm text-foreground truncate">
                          {formatDateTime(a.starts_at)}
                        </div>
                        <div className="text-xs text-ink-400 truncate">
                          {studioById.get(a.studio_id)?.name ?? "—"}
                        </div>
                      </div>
                    </div>
                    <Badge variant={STATUS_VARIANT[a.status]}>
                      {STATUS_LABEL[a.status]}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
