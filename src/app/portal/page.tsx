import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, MessageCircle, MapPin, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getClientsForAuthUser, getAppointmentsForAuthUser } from "@/lib/portal-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/appointment-status";

export const dynamic = "force-dynamic";

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
  const past = appointments.filter(
    (a) => new Date(a.starts_at) < now || a.status === "completed"
  );

  const studioById = new Map(clients.map((c) => [c.studio.id, c.studio]));
  const clientIdByStudioId = new Map(clients.map((c) => [c.studio.id, c.id]));
  const firstName = clients[0]?.first_name ?? "👋";

  return (
    <div className="container max-w-3xl py-8 px-4">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-1">
          Salut {firstName}.
        </h1>
        <p className="text-ink-300">Voici tes rendez-vous et tes échanges.</p>
      </div>

      {/* Prochain RDV */}
      {upcoming[0] && (
        <Card className="mb-6 border-white/20 bg-white/[0.03]">
          <CardHeader>
            <div className="text-xs uppercase tracking-wider text-foreground/80 mb-1">
              Prochain rendez-vous
            </div>
            <CardTitle className="text-2xl">
              {formatDateTime(upcoming[0].starts_at)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-ink-200 mb-1">
              {studioById.get(upcoming[0].studio_id)?.name}
            </div>
            {studioById.get(upcoming[0].studio_id)?.city && (
              <div className="flex items-center gap-1 text-sm text-ink-400 mb-3">
                <MapPin className="w-3 h-3" />
                {studioById.get(upcoming[0].studio_id)?.city}
              </div>
            )}
            <Badge variant={STATUS_VARIANT[upcoming[0].status]}>
              {STATUS_LABEL[upcoming[0].status]}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Studios (chats) */}
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold mb-4">
          Tes studios
        </h2>
        {clients.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-ink-400">
              <p>Tu n'as pas encore réservé chez un studio sur Inklee.</p>
              <p className="text-sm mt-2">
                Demande à ton tatoueur son lien Inklee.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {clients.map((c) => (
              <Link
                key={c.id}
                href={`/portal/messages/${c.id}`}
                className="block rounded-xl border border-ink-800 bg-ink-900/40 p-5 hover:border-ink-700 hover:bg-ink-900/60 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">
                      {c.studio.name}
                    </div>
                    {c.studio.city && (
                      <div className="text-sm text-ink-400">
                        {c.studio.city}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-ink-300">
                    <MessageCircle className="w-4 h-4" />
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Historique */}
      {past.length > 0 && (
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">
            Historique
          </h2>
          <Card>
            <ul className="divide-y divide-ink-800/50">
              {past.slice(0, 5).map((a) => (
                <li key={a.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-foreground">
                      {formatDateTime(a.starts_at)}
                    </div>
                    <div className="text-xs text-ink-400">
                      {studioById.get(a.studio_id)?.name}
                    </div>
                  </div>
                  <Badge variant={STATUS_VARIANT[a.status]}>
                    {STATUS_LABEL[a.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
