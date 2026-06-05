import { redirect } from "next/navigation";
import { CalendarOff } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvailabilityForm } from "./availability-form";
import { ExceptionsManager } from "./exceptions-manager";
import type { TimeRange } from "@/lib/availability";

export const dynamic = "force-dynamic";

const DAY_NAMES_FULL = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

export default async function AvailabilityPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: studio } = await supabase
    .from("studios")
    .select(
      "id, appointment_duration_min, booking_horizon_days, booking_min_lead_hours"
    )
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!studio) redirect("/onboarding");

  const [{ data: rulesRaw }, { data: exceptionsRaw }] = await Promise.all([
    supabase
      .from("availability_rules")
      .select("day_of_week, is_open, ranges")
      .eq("studio_id", studio.id)
      .order("day_of_week"),
    supabase
      .from("availability_exceptions")
      .select("id, date, is_closed, reason")
      .eq("studio_id", studio.id)
      .gte("date", new Date().toISOString().slice(0, 10))
      .order("date"),
  ]);

  // Normalise les rules en tableau de 7 (au cas où il en manquerait)
  const rulesByDay = new Map<number, { is_open: boolean; ranges: TimeRange[] }>();
  for (const r of rulesRaw ?? []) {
    rulesByDay.set(r.day_of_week, {
      is_open: r.is_open,
      ranges: (r.ranges as TimeRange[]) ?? [],
    });
  }
  const rules = Array.from({ length: 7 }, (_, dow) => ({
    day_of_week: dow,
    label: DAY_NAMES_FULL[dow],
    is_open: rulesByDay.get(dow)?.is_open ?? false,
    ranges: rulesByDay.get(dow)?.ranges ?? [],
  }));

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-1">Disponibilités</h1>
        <p className="text-ink-300">
          Définis tes horaires de travail. Tes clients verront uniquement les
          créneaux libres correspondants.
        </p>
      </div>

      <AvailabilityForm
        rules={rules}
        durationMin={studio.appointment_duration_min}
        horizonDays={studio.booking_horizon_days}
        leadHours={studio.booking_min_lead_hours}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarOff className="w-4 h-4 text-foreground" />
            Jours fermés (vacances, congés)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ExceptionsManager exceptions={exceptionsRaw ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
