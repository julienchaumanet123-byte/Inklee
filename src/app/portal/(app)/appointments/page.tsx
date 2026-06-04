import { redirect } from "next/navigation";
import { Calendar, MapPin, Euro } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getClientsForAuthUser, getAppointmentsForAuthUser } from "@/lib/portal-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/appointment-status";

export const dynamic = "force-dynamic";

export default async function PortalAppointmentsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const [clients, appointments] = await Promise.all([
    getClientsForAuthUser(user.id),
    getAppointmentsForAuthUser(user.id),
  ]);

  const studioById = new Map(clients.map((c) => [c.studio.id, c.studio]));

  const now = new Date();
  const upcoming = appointments.filter((a) => new Date(a.starts_at) >= now);
  const past = appointments.filter((a) => new Date(a.starts_at) < now);

  return (
    <div className="container max-w-2xl py-8 px-4">
      <h1 className="font-display text-3xl font-bold mb-6">Mes rendez-vous</h1>

      {appointments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-ink-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-ink-700" />
            <p>Aucun rendez-vous pour l'instant.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xs uppercase tracking-wider text-ink-400 mb-3">
                À venir
              </h2>
              <div className="space-y-3">
                {upcoming.map((a) => (
                  <AppointmentCard
                    key={a.id}
                    appt={a}
                    studio={studioById.get(a.studio_id)}
                  />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="text-xs uppercase tracking-wider text-ink-400 mb-3">
                Historique
              </h2>
              <div className="space-y-3">
                {past.map((a) => (
                  <AppointmentCard
                    key={a.id}
                    appt={a}
                    studio={studioById.get(a.studio_id)}
                    muted
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function AppointmentCard({
  appt,
  studio,
  muted = false,
}: {
  appt: {
    id: string;
    starts_at: string;
    status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
    project_description: string | null;
    deposit_amount: number;
    deposit_paid: boolean;
  };
  studio?: { name: string; city: string | null };
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border ${
        muted
          ? "border-ink-800 bg-ink-900/30 opacity-80"
          : "border-ink-800 bg-ink-900/40"
      } p-5`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-medium text-foreground mb-1">
            {formatDateTime(appt.starts_at)}
          </div>
          {studio && (
            <div className="text-sm text-ink-300">{studio.name}</div>
          )}
          {studio?.city && (
            <div className="flex items-center gap-1 text-xs text-ink-400 mt-0.5">
              <MapPin className="w-3 h-3" /> {studio.city}
            </div>
          )}
        </div>
        <Badge variant={STATUS_VARIANT[appt.status]}>
          {STATUS_LABEL[appt.status]}
        </Badge>
      </div>

      {appt.project_description && (
        <p className="text-sm text-ink-200 mb-3 whitespace-pre-wrap">
          {appt.project_description}
        </p>
      )}

      <div className="flex items-center gap-2 text-xs text-ink-400">
        <Euro className="w-3 h-3" />
        Acompte {formatPrice(Number(appt.deposit_amount))}{" "}
        {appt.deposit_paid ? "✓ réglé" : "à régler"}
      </div>
    </div>
  );
}
