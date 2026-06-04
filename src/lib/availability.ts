// Logique de disponibilité simple pour le MVP.
// Plus tard : table availability_rules par studio (jours + heures + exceptions).
//
// Pour l'instant : Tue-Sat, créneaux d'1h de 10h-12h et 14h-18h.

const OPEN_DAYS = [2, 3, 4, 5, 6]; // 0=dim, 1=lun, ..., 6=sam
const SLOT_HOURS = [10, 11, 14, 15, 16, 17];
const SLOT_DURATION_MIN = 60;

export type Slot = {
  startsAt: Date;
  endsAt: Date;
  iso: string;
  label: string;
};

export function getNextDays(count = 14): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

export function getSlotsForDate(date: Date): Slot[] {
  const day = date.getDay();
  if (!OPEN_DAYS.includes(day)) return [];

  return SLOT_HOURS.map((hour) => {
    const startsAt = new Date(date);
    startsAt.setHours(hour, 0, 0, 0);
    const endsAt = new Date(startsAt);
    endsAt.setMinutes(endsAt.getMinutes() + SLOT_DURATION_MIN);

    return {
      startsAt,
      endsAt,
      iso: startsAt.toISOString(),
      label: `${hour.toString().padStart(2, "0")}:00`,
    };
  });
}

export function isSlotBooked(slot: Slot, bookedRanges: Array<{ starts_at: string; ends_at: string }>): boolean {
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
