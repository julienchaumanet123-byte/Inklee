/**
 * Logique de disponibilité — lit la config DB du studio.
 */

import { createAdminClient } from "@/lib/supabase/admin";

export type TimeRange = { start: string; end: string };
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Dim ... 6=Sam

export type Slot = {
  startsAt: Date;
  endsAt: Date;
  iso: string;
  label: string;
};

export type StudioAvailabilityConfig = {
  appointmentDurationMin: number;
  bookingHorizonDays: number;
  bookingMinLeadHours: number;
  weeklyRules: Record<DayOfWeek, TimeRange[]>;
  exceptions: Record<string, TimeRange[]>;
};

/**
 * Charge la config d'un studio depuis Supabase.
 * Pour usage côté serveur uniquement.
 */
export async function loadStudioAvailability(
  studioId: string
): Promise<StudioAvailabilityConfig | null> {
  const supabase = createAdminClient();

  const { data: studio } = await supabase
    .from("studios")
    .select(
      "appointment_duration_min, booking_horizon_days, booking_min_lead_hours"
    )
    .eq("id", studioId)
    .maybeSingle();
  if (!studio) return null;

  const horizonStart = new Date();
  horizonStart.setHours(0, 0, 0, 0);
  const horizonEnd = new Date();
  horizonEnd.setDate(horizonEnd.getDate() + studio.booking_horizon_days);

  const [{ data: rules }, { data: exceptions }] = await Promise.all([
    supabase
      .from("availability_rules")
      .select("day_of_week, is_open, ranges")
      .eq("studio_id", studioId),
    supabase
      .from("availability_exceptions")
      .select("date, is_closed, ranges")
      .eq("studio_id", studioId)
      .gte("date", horizonStart.toISOString().slice(0, 10))
      .lte("date", horizonEnd.toISOString().slice(0, 10)),
  ]);

  const weeklyRules: Record<DayOfWeek, TimeRange[]> = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
  };
  for (const rule of rules ?? []) {
    if (rule.is_open) {
      weeklyRules[rule.day_of_week as DayOfWeek] = (rule.ranges as TimeRange[]) ?? [];
    }
  }

  const exceptionsMap: Record<string, TimeRange[]> = {};
  for (const ex of exceptions ?? []) {
    exceptionsMap[ex.date] = ex.is_closed ? [] : ((ex.ranges as TimeRange[]) ?? []);
  }

  return {
    appointmentDurationMin: studio.appointment_duration_min,
    bookingHorizonDays: studio.booking_horizon_days,
    bookingMinLeadHours: studio.booking_min_lead_hours,
    weeklyRules,
    exceptions: exceptionsMap,
  };
}

export function getNextDays(count: number): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseHHMM(s: string): { h: number; m: number } {
  const [h, m] = s.split(":").map(Number);
  return { h, m: m ?? 0 };
}

export function getSlotsForDate(
  date: Date,
  config: StudioAvailabilityConfig
): Slot[] {
  const key = dateKey(date);

  const exceptionRanges = config.exceptions[key];
  const ranges: TimeRange[] =
    exceptionRanges !== undefined
      ? exceptionRanges
      : config.weeklyRules[date.getDay() as DayOfWeek] ?? [];

  if (ranges.length === 0) return [];

  const duration = config.appointmentDurationMin;
  const now = new Date();
  const minStart = new Date(now.getTime() + config.bookingMinLeadHours * 60 * 60 * 1000);

  const slots: Slot[] = [];
  for (const range of ranges) {
    const { h: sh, m: sm } = parseHHMM(range.start);
    const { h: eh, m: em } = parseHHMM(range.end);

    const rangeStart = new Date(date);
    rangeStart.setHours(sh, sm, 0, 0);
    const rangeEnd = new Date(date);
    rangeEnd.setHours(eh, em, 0, 0);

    let cursor = new Date(rangeStart);
    while (cursor.getTime() + duration * 60 * 1000 <= rangeEnd.getTime()) {
      if (cursor.getTime() >= minStart.getTime()) {
        const endsAt = new Date(cursor.getTime() + duration * 60 * 1000);
        slots.push({
          startsAt: new Date(cursor),
          endsAt,
          iso: cursor.toISOString(),
          label: `${String(cursor.getHours()).padStart(2, "0")}:${String(cursor.getMinutes()).padStart(2, "0")}`,
        });
      }
      cursor = new Date(cursor.getTime() + duration * 60 * 1000);
    }
  }
  return slots;
}

export function isSlotBooked(
  slot: Slot,
  bookedRanges: Array<{ starts_at: string; ends_at: string }>
): boolean {
  return bookedRanges.some((r) => {
    const rStart = new Date(r.starts_at).getTime();
    const rEnd = new Date(r.ends_at).getTime();
    const sStart = slot.startsAt.getTime();
    const sEnd = slot.endsAt.getTime();
    return sStart < rEnd && sEnd > rStart;
  });
}

const WEEKDAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTH_LABELS = [
  "janv.", "févr.", "mars", "avril", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

export function formatDayShort(date: Date) {
  return {
    weekday: WEEKDAY_LABELS[date.getDay()],
    day: date.getDate(),
    month: MONTH_LABELS[date.getMonth()],
  };
}

export const DAY_NAMES_FULL = [
  "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi",
] as const;
