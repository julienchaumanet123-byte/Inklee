import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { WeekGrid } from "./week-grid";
import { AgendaMobileList } from "./mobile-list";

export const dynamic = "force-dynamic";

// Lundi de la semaine contenant `date` (à minuit local)
function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=dim, 1=lun, ..., 6=sam
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatWeekRange(weekStart: Date) {
  const end = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === end.getMonth();
  const fmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });
  if (sameMonth) {
    return `${weekStart.getDate()} – ${end.getDate()} ${fmt.format(end).split(" ").slice(1).join(" ")}`;
  }
  return `${fmt.format(weekStart)} – ${fmt.format(end)}`;
}

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: { week?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: studio } = await supabase
    .from("studios")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!studio) redirect("/onboarding");

  // Détermine la semaine à afficher
  const baseDate = searchParams.week ? new Date(searchParams.week) : new Date();
  const weekStart = startOfWeek(isNaN(baseDate.getTime()) ? new Date() : baseDate);
  const weekEnd = addDays(weekStart, 7);

  // Charge les RDV de la semaine
  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, starts_at, ends_at, status, project_description, clients(first_name, last_name)")
    .eq("studio_id", studio.id)
    .gte("starts_at", weekStart.toISOString())
    .lt("starts_at", weekEnd.toISOString())
    .order("starts_at");

  const prevWeek = addDays(weekStart, -7);
  const nextWeek = addDays(weekStart, 7);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-1">Agenda</h1>
          <p className="text-ink-300">{formatWeekRange(weekStart)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon">
            <Link href={`/dashboard/agenda?week=${toIsoDate(prevWeek)}`}>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/agenda">Aujourd'hui</Link>
          </Button>
          <Button asChild variant="outline" size="icon">
            <Link href={`/dashboard/agenda?week=${toIsoDate(nextWeek)}`}>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild className="ml-2">
            <Link href="/dashboard/agenda/new">
              <Plus className="w-4 h-4" />
              Nouveau RDV
            </Link>
          </Button>
        </div>
      </div>

      {/* Desktop : grille hebdo. Mobile : liste par jour (lisible au doigt). */}
      <div className="hidden md:block">
        <WeekGrid
          days={days.map((d) => d.toISOString())}
          appointments={appointments ?? []}
        />
      </div>
      <AgendaMobileList
        days={days.map((d) => d.toISOString())}
        appointments={appointments ?? []}
      />
    </div>
  );
}
