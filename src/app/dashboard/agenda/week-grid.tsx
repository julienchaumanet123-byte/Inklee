import Link from "next/link";
import { cn } from "@/lib/utils";
import { STATUS_VARIANT } from "@/lib/appointment-status";
import type { AppointmentStatus } from "@/types/database";

type Appt = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  project_description: string | null;
  clients: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
};

const HOURS = Array.from({ length: 11 }, (_, i) => i + 9); // 9h → 19h
const HOUR_HEIGHT_PX = 60;
const WEEKDAY_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const STATUS_BLOCK_CLS: Record<
  ReturnType<typeof statusVariantOf>,
  string
> = {
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-100",
  success: "border-emerald-500/40 bg-emerald-500/15 text-emerald-100",
  muted: "border-ink-700 bg-ink-800/60 text-ink-300",
  danger: "border-red-500/40 bg-red-500/10 text-red-100 line-through opacity-70",
};

function statusVariantOf(s: AppointmentStatus) {
  return STATUS_VARIANT[s];
}

function clientName(c: Appt["clients"]) {
  const client = Array.isArray(c) ? c[0] : c;
  if (!client) return "—";
  return `${client.first_name} ${client.last_name}`;
}

export function WeekGrid({
  days,
  appointments,
}: {
  days: string[]; // 7 ISO datetime strings = lundi→dimanche minuit
  appointments: Appt[];
}) {
  const dayDates = days.map((d) => new Date(d));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function apptsForDay(dayDate: Date) {
    const dayStart = dayDate.getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    return appointments.filter((a) => {
      const t = new Date(a.starts_at).getTime();
      return t >= dayStart && t < dayEnd;
    });
  }

  function blockStyle(a: Appt) {
    const starts = new Date(a.starts_at);
    const ends = new Date(a.ends_at);
    const startMinutes =
      (starts.getHours() - HOURS[0]) * 60 + starts.getMinutes();
    const durationMin = Math.max(15, (ends.getTime() - starts.getTime()) / 60000);
    return {
      top: `${(startMinutes / 60) * HOUR_HEIGHT_PX}px`,
      height: `${(durationMin / 60) * HOUR_HEIGHT_PX - 2}px`,
    };
  }

  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900/30 overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header jours */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-ink-800">
            <div />
            {dayDates.map((d, i) => {
              const isToday = d.getTime() === today.getTime();
              return (
                <div
                  key={i}
                  className={cn(
                    "px-3 py-3 text-center border-l border-ink-800",
                    isToday && "bg-white/5"
                  )}
                >
                  <div className="text-xs text-ink-400 uppercase">
                    {WEEKDAY_SHORT[i]}
                  </div>
                  <div
                    className={cn(
                      "text-lg font-semibold",
                      isToday ? "text-foreground" : "text-ink-200"
                    )}
                  >
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grille horaire */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] relative">
            {/* Col heures */}
            <div className="border-r border-ink-800">
              {HOURS.map((h) => (
                <div
                  key={h}
                  style={{ height: HOUR_HEIGHT_PX }}
                  className="text-xs text-ink-400 text-right pr-2 pt-1 border-b border-ink-800/50"
                >
                  {h}h
                </div>
              ))}
            </div>

            {/* Colonnes jours */}
            {dayDates.map((dayDate, i) => {
              const dayAppts = apptsForDay(dayDate);
              return (
                <div
                  key={i}
                  className="relative border-l border-ink-800"
                  style={{ height: HOURS.length * HOUR_HEIGHT_PX }}
                >
                  {/* Lignes horaires */}
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      style={{ height: HOUR_HEIGHT_PX }}
                      className="border-b border-ink-800/30"
                    />
                  ))}

                  {/* Blocs RDV */}
                  {dayAppts.map((a) => {
                    const v = statusVariantOf(a.status);
                    return (
                      <Link
                        key={a.id}
                        href={`/dashboard/appointments/${a.id}`}
                        style={blockStyle(a)}
                        className={cn(
                          "absolute left-1 right-1 rounded-md border p-1.5 text-xs transition-all hover:scale-[1.01]",
                          STATUS_BLOCK_CLS[v]
                        )}
                      >
                        <div className="font-medium truncate">{clientName(a.clients)}</div>
                        <div className="text-[10px] opacity-80 truncate">
                          {new Date(a.starts_at).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {a.project_description && ` · ${a.project_description}`}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
