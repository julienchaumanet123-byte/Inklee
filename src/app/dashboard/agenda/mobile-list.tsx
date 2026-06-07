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
  clients:
    | { first_name: string; last_name: string }
    | { first_name: string; last_name: string }[]
    | null;
};

const WEEKDAY = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

const DOT: Record<string, string> = {
  warning: "bg-amber-400",
  success: "bg-emerald-400",
  muted: "bg-ink-500",
  danger: "bg-red-400",
};

function clientName(c: Appt["clients"]) {
  const client = Array.isArray(c) ? c[0] : c;
  return client ? `${client.first_name} ${client.last_name}` : "—";
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AgendaMobileList({
  days,
  appointments,
}: {
  days: string[];
  appointments: Appt[];
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-5 md:hidden">
      {days.map((dIso, i) => {
        const dayDate = new Date(dIso);
        const dayStart = dayDate.getTime();
        const dayEnd = dayStart + 86_400_000;
        const dayAppts = appointments
          .filter((a) => {
            const t = new Date(a.starts_at).getTime();
            return t >= dayStart && t < dayEnd;
          })
          .sort(
            (a, b) =>
              new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
          );
        const isToday = dayDate.getTime() === today.getTime();

        return (
          <div key={i}>
            <div className="mb-2 flex items-baseline gap-2">
              <span
                className={cn(
                  "text-sm font-semibold",
                  isToday ? "text-foreground" : "text-ink-200"
                )}
              >
                {WEEKDAY[i]} {dayDate.getDate()}
              </span>
              {isToday && (
                <span className="text-[10px] uppercase tracking-wide text-gold">
                  Aujourd&apos;hui
                </span>
              )}
            </div>

            {dayAppts.length === 0 ? (
              <p className="pb-1 text-xs text-ink-500">Aucun rendez-vous</p>
            ) : (
              <div className="space-y-2">
                {dayAppts.map((a) => (
                  <Link
                    key={a.id}
                    href={`/dashboard/appointments/${a.id}`}
                    className="flex items-center gap-3 rounded-lg border border-ink-800 bg-ink-900/40 p-3 active:bg-ink-900"
                  >
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        DOT[STATUS_VARIANT[a.status]]
                      )}
                    />
                    <span className="w-14 shrink-0 text-sm font-medium text-foreground">
                      {timeLabel(a.starts_at)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-foreground">
                        {clientName(a.clients)}
                      </span>
                      {a.project_description && (
                        <span className="block truncate text-xs text-ink-400">
                          {a.project_description}
                        </span>
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
