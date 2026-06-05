import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Calendar,
  Euro,
  Users,
  TrendingUp,
  ArrowRight,
  MessageCircle,
  Sparkles,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDateTime, cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/appointment-status";

export const dynamic = "force-dynamic";

function timeGreeting(date: Date): string {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "Bonjour";
  if (h >= 12 && h < 18) return "Bel après-midi";
  if (h >= 18 && h < 24) return "Bonsoir";
  return "Bonne nuit";
}

function ownerFirstName(name?: string | null): string {
  if (!name) return "";
  return name.trim().split(/\s+/)[0];
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const { data: studio } = await supabase
    .from("studios")
    .select("id, name, slug")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!studio) redirect("/onboarding");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const [
    { count: monthCount },
    { data: monthAppts },
    { count: clientsCount },
    { count: noShowsCount },
    { data: todayAppts },
    { data: upcoming },
    { count: unreadCount },
    { data: recentMessages },
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("studio_id", studio.id)
      .gte("starts_at", startOfMonth)
      .lt("starts_at", endOfMonth),
    supabase
      .from("appointments")
      .select("deposit_amount, status")
      .eq("studio_id", studio.id)
      .gte("starts_at", startOfMonth)
      .lt("starts_at", endOfMonth)
      .in("status", ["confirmed", "completed"]),
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("studio_id", studio.id),
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("studio_id", studio.id)
      .eq("status", "no_show"),
    supabase
      .from("appointments")
      .select(
        "id, starts_at, ends_at, status, project_description, clients(first_name, last_name)"
      )
      .eq("studio_id", studio.id)
      .gte("starts_at", startOfToday.toISOString())
      .lt("starts_at", endOfToday.toISOString())
      .in("status", ["pending", "confirmed", "completed"])
      .order("starts_at", { ascending: true }),
    supabase
      .from("appointments")
      .select(
        "id, starts_at, status, project_description, clients(first_name, last_name)"
      )
      .eq("studio_id", studio.id)
      .gt("starts_at", endOfToday.toISOString())
      .in("status", ["pending", "confirmed"])
      .order("starts_at", { ascending: true })
      .limit(4),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("studio_id", studio.id)
      .eq("sender", "client")
      .is("read_at", null),
    supabase
      .from("messages")
      .select("id, body, created_at, client_id, clients(first_name, last_name)")
      .eq("studio_id", studio.id)
      .eq("sender", "client")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const monthRevenue = (monthAppts ?? []).reduce(
    (sum, a) => sum + Number(a.deposit_amount ?? 0),
    0
  );

  const firstName = ownerFirstName(profile?.full_name);
  const greeting = timeGreeting(now);

  return (
    <div className="p-6 md:p-8 max-w-6xl space-y-6">
      {/* Hero greeting */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-1 leading-tight">
          {greeting}{firstName ? `, ${firstName}` : ""}.
        </h1>
        <p className="text-sm text-ink-300">
          <HeroSubtext
            todayCount={todayAppts?.length ?? 0}
            unreadCount={unreadCount ?? 0}
            now={now}
            todayAppts={todayAppts as Array<{ starts_at: string }> | null}
          />
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="RDV ce mois" value={monthCount ?? 0} icon={Calendar} />
        <StatCard
          label="Acomptes"
          value={formatPrice(monthRevenue)}
          icon={Euro}
        />
        <StatCard label="Clients" value={clientsCount ?? 0} icon={Users} />
        <StatCard
          label="No-shows"
          value={noShowsCount ?? 0}
          icon={TrendingUp}
          subtle={(noShowsCount ?? 0) === 0 ? "Bravo, zéro 🎯" : undefined}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's timeline (col 2) */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-foreground" />
                <h2 className="font-display text-lg font-bold">Aujourd'hui</h2>
              </div>
              <Link
                href="/dashboard/agenda"
                className="text-xs text-ink-400 hover:text-foreground"
              >
                Voir l'agenda →
              </Link>
            </div>
            <TodayTimeline
              now={now}
              appointments={(todayAppts ?? []) as TimelineAppt[]}
            />
          </CardContent>
        </Card>

        {/* Activity feed (col 1) */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-foreground" />
                <h2 className="font-display text-lg font-bold">Messages</h2>
              </div>
              {(unreadCount ?? 0) > 0 && (
                <Badge variant="default" className="bg-white text-ink-950">
                  {unreadCount} non lu{(unreadCount ?? 0) > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            {recentMessages && recentMessages.length > 0 ? (
              <ul className="space-y-3">
                {recentMessages.map((m) => {
                  const client = Array.isArray(m.clients)
                    ? m.clients[0]
                    : m.clients;
                  return (
                    <li key={m.id}>
                      <Link
                        href={`/dashboard/clients/${m.client_id}`}
                        className="block group"
                      >
                        <div className="text-xs font-medium text-foreground mb-0.5 group-hover:text-white">
                          {client?.first_name} {client?.last_name}
                        </div>
                        <div className="text-xs text-ink-300 line-clamp-2 leading-snug">
                          {m.body}
                        </div>
                        <div className="text-[10px] text-ink-500 mt-1">
                          {timeAgo(new Date(m.created_at), now)}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-ink-400 py-4 text-center">
                Aucun message client récent.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming RDV */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-foreground" />
              <h2 className="font-display text-lg font-bold">
                Prochains rendez-vous
              </h2>
            </div>
            <Link
              href="/dashboard/agenda"
              className="text-xs text-ink-400 hover:text-foreground"
            >
              Voir tout →
            </Link>
          </div>
          {!upcoming || upcoming.length === 0 ? (
            <EmptyUpcoming slug={studio.slug} />
          ) : (
            <ul className="divide-y divide-ink-800/50 -mx-6">
              {upcoming.map((appt) => {
                const client = Array.isArray(appt.clients)
                  ? appt.clients[0]
                  : appt.clients;
                return (
                  <li key={appt.id}>
                    <Link
                      href={`/dashboard/appointments/${appt.id}`}
                      className="flex items-center justify-between px-6 py-3.5 hover:bg-ink-900/30 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground">
                          {client?.first_name} {client?.last_name}
                        </div>
                        {appt.project_description && (
                          <div className="text-xs text-ink-400 truncate max-w-md mt-0.5">
                            {appt.project_description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-sm text-foreground">
                            {formatDateTime(appt.starts_at)}
                          </div>
                        </div>
                        <Badge variant={STATUS_VARIANT[appt.status]}>
                          {STATUS_LABEL[appt.status]}
                        </Badge>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============ Sous-composants ============

function StatCard({
  label,
  value,
  icon: Icon,
  subtle,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  subtle?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-ink-400">
            {label}
          </div>
          <Icon className="w-3.5 h-3.5 text-ink-500" />
        </div>
        <div className="text-xl sm:text-2xl font-bold text-foreground leading-none">
          {value}
        </div>
        {subtle && (
          <div className="text-[10px] text-emerald-400 mt-1.5">{subtle}</div>
        )}
      </CardContent>
    </Card>
  );
}

function HeroSubtext({
  todayCount,
  unreadCount,
  now,
  todayAppts,
}: {
  todayCount: number;
  unreadCount: number;
  now: Date;
  todayAppts: Array<{ starts_at: string }> | null;
}) {
  const upcomingToday = (todayAppts ?? []).filter(
    (a) => new Date(a.starts_at).getTime() > now.getTime()
  );

  if (todayCount === 0) {
    return <>Pas de RDV aujourd'hui — profite ou prospecte 🎯</>;
  }
  if (upcomingToday.length > 0) {
    const next = upcomingToday[0];
    const time = new Date(next.starts_at).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
      <>
        Tu as {upcomingToday.length} RDV restant aujourd'hui, le prochain à{" "}
        <span className="text-foreground font-medium">{time}</span>
        {unreadCount > 0 && (
          <> · {unreadCount} message{unreadCount > 1 ? "s" : ""} non lu{unreadCount > 1 ? "s" : ""}</>
        )}
        .
      </>
    );
  }
  return <>Tous tes RDV de la journée sont passés 👌</>;
}

type TimelineAppt = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  project_description: string | null;
  clients:
    | { first_name: string; last_name: string }
    | { first_name: string; last_name: string }[]
    | null;
};

function TodayTimeline({
  now,
  appointments,
}: {
  now: Date;
  appointments: TimelineAppt[];
}) {
  const startHour = 8;
  const endHour = 22;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour);
  const totalMinutes = (endHour - startHour) * 60;

  const nowMinutes = (now.getHours() - startHour) * 60 + now.getMinutes();
  const showCurrentLine = nowMinutes >= 0 && nowMinutes <= totalMinutes;
  const nowPercent = (nowMinutes / totalMinutes) * 100;

  if (appointments.length === 0) {
    return (
      <div className="py-10 text-center">
        <Calendar className="w-10 h-10 mx-auto mb-3 text-ink-700" />
        <p className="text-sm text-ink-400">Aucun rendez-vous aujourd'hui.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Hours labels */}
      <div className="relative h-3 mb-1">
        {hours.filter((_, i) => i % 2 === 0).map((h) => {
          const pct = ((h - startHour) * 60 / totalMinutes) * 100;
          return (
            <div
              key={h}
              className="absolute -translate-x-1/2 text-[10px] text-ink-500 font-mono"
              style={{ left: `${pct}%` }}
            >
              {h}h
            </div>
          );
        })}
      </div>

      {/* Timeline bar */}
      <div className="relative h-16 rounded-lg bg-ink-900/60 border border-ink-800 overflow-hidden">
        {/* Hour grid */}
        {hours.map((h, i) => {
          if (i === 0) return null;
          const pct = ((h - startHour) * 60 / totalMinutes) * 100;
          return (
            <div
              key={h}
              className="absolute top-0 bottom-0 w-px bg-ink-800/60"
              style={{ left: `${pct}%` }}
            />
          );
        })}

        {/* Current time line */}
        {showCurrentLine && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
            style={{ left: `${nowPercent}%` }}
          >
            <div className="absolute -top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-white" />
          </div>
        )}

        {/* Appointments blocks */}
        {appointments.map((a) => {
          const starts = new Date(a.starts_at);
          const ends = new Date(a.ends_at);
          const startMin = (starts.getHours() - startHour) * 60 + starts.getMinutes();
          const durationMin = Math.max(15, (ends.getTime() - starts.getTime()) / 60000);
          const leftPct = Math.max(0, (startMin / totalMinutes) * 100);
          const widthPct = Math.min(100 - leftPct, (durationMin / totalMinutes) * 100);
          const client = Array.isArray(a.clients) ? a.clients[0] : a.clients;
          const variant = STATUS_VARIANT[a.status];

          return (
            <Link
              key={a.id}
              href={`/dashboard/appointments/${a.id}`}
              className={cn(
                "absolute top-1.5 bottom-1.5 rounded-md border px-2 py-1 overflow-hidden transition-transform hover:scale-[1.02] hover:z-20",
                variant === "success" && "border-emerald-500/40 bg-emerald-500/15 text-emerald-100",
                variant === "warning" && "border-amber-500/40 bg-amber-500/15 text-amber-100",
                variant === "muted" && "border-ink-700 bg-ink-800/80 text-ink-200",
                variant === "danger" && "border-red-500/40 bg-red-500/15 text-red-100"
              )}
              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
            >
              <div className="text-[10px] font-medium truncate">
                {client?.first_name} {client?.last_name?.charAt(0)}.
              </div>
              <div className="text-[9px] opacity-80 truncate">
                {starts.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Liste textuelle */}
      <ul className="mt-4 space-y-1.5">
        {appointments.map((a) => {
          const client = Array.isArray(a.clients) ? a.clients[0] : a.clients;
          return (
            <li
              key={a.id}
              className="flex items-center gap-3 text-xs text-ink-300"
            >
              <span className="font-mono text-foreground w-12 shrink-0">
                {new Date(a.starts_at).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="truncate flex-1">
                {client?.first_name} {client?.last_name}
                {a.project_description && (
                  <span className="text-ink-500"> — {a.project_description}</span>
                )}
              </span>
              <Badge variant={STATUS_VARIANT[a.status]}>
                {STATUS_LABEL[a.status]}
              </Badge>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EmptyUpcoming({ slug }: { slug: string }) {
  return (
    <div className="py-10 text-center">
      <Calendar className="w-10 h-10 mx-auto mb-3 text-ink-700" />
      <p className="text-sm text-ink-300 mb-1">Aucun RDV à venir.</p>
      <p className="text-xs text-ink-400 mb-4">
        Partage ta page publique pour qu'on te réserve.
      </p>
      <Button asChild variant="outline" size="sm">
        <Link href={`/${slug}`} target="_blank">
          <ArrowRight className="w-3 h-3" />
          inklee.fr/{slug}
        </Link>
      </Button>
    </div>
  );
}

function timeAgo(date: Date, now: Date): string {
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 60) return "à l'instant";
  if (diffSec < 3600) return `il y a ${Math.floor(diffSec / 60)} min`;
  if (diffSec < 86400) return `il y a ${Math.floor(diffSec / 3600)} h`;
  return `il y a ${Math.floor(diffSec / 86400)} j`;
}
