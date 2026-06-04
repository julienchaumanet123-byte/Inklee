import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, Euro, Users, TrendingUp, ArrowRight, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/appointment-status";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: studio } = await supabase
    .from("studios")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!studio) redirect("/onboarding");

  // Bornes du mois courant
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  const [
    { count: monthCount },
    { data: monthAppts },
    { count: clientsCount },
    { count: noShowsCount },
    { data: upcoming },
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
      .select("id, starts_at, status, project_description, clients(first_name, last_name)")
      .eq("studio_id", studio.id)
      .gte("starts_at", now.toISOString())
      .in("status", ["pending", "confirmed"])
      .order("starts_at", { ascending: true })
      .limit(5),
  ]);

  const monthRevenue = (monthAppts ?? []).reduce(
    (sum, a) => sum + Number(a.deposit_amount ?? 0),
    0
  );

  const stats = [
    { label: "RDV ce mois", value: monthCount ?? 0, icon: Calendar },
    { label: "Acomptes encaissés", value: formatPrice(monthRevenue), icon: Euro },
    { label: "Clients", value: clientsCount ?? 0, icon: Users },
    { label: "No-shows", value: noShowsCount ?? 0, icon: TrendingUp },
  ];

  return (
    <div className="p-6 md:p-10 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
        <div>
          <h1 className="font-display text-4xl font-bold mb-1">Bonjour 👋</h1>
          <p className="text-ink-300">Voici l'état de ton studio aujourd'hui.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/agenda/new">
            <Plus className="w-4 h-4" />
            Nouveau RDV
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-ink-300">
                  {s.label}
                </CardTitle>
                <Icon className="w-4 h-4 text-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Prochains RDV */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Prochains rendez-vous</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/agenda">
              Voir l'agenda <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!upcoming || upcoming.length === 0 ? (
            <div className="py-12 text-center text-ink-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-ink-700" />
              <p className="mb-2">Aucun rendez-vous à venir.</p>
              <p className="text-sm">
                Partage ta page de réservation :{" "}
                <Link
                  href={`/${studio.slug}`}
                  target="_blank"
                  className="text-foreground hover:underline"
                >
                  inklee.fr/{studio.slug}
                </Link>
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-ink-800/50">
              {upcoming.map((appt) => {
                const client = Array.isArray(appt.clients)
                  ? appt.clients[0]
                  : appt.clients;
                return (
                  <li key={appt.id}>
                    <Link
                      href={`/dashboard/appointments/${appt.id}`}
                      className="flex items-center justify-between py-4 hover:bg-ink-900/30 -mx-6 px-6 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-foreground">
                          {client?.first_name} {client?.last_name}
                        </div>
                        <div className="text-sm text-ink-400 truncate max-w-md">
                          {appt.project_description ?? "—"}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
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
