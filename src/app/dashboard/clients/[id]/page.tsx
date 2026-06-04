import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Mail, Phone, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/appointment-status";
import { NotesForm } from "./notes-form";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
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

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", params.id)
    .eq("studio_id", studio.id)
    .maybeSingle();
  if (!client) notFound();

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, starts_at, status, project_description, deposit_paid, deposit_amount")
    .eq("client_id", client.id)
    .order("starts_at", { ascending: false });

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux clients
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-3">
          {client.first_name} {client.last_name}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-ink-300">
          <a
            href={`mailto:${client.email}`}
            className="flex items-center gap-2 hover:text-foreground"
          >
            <Mail className="w-4 h-4" /> {client.email}
          </a>
          {client.phone && (
            <a
              href={`tel:${client.phone}`}
              className="flex items-center gap-2 hover:text-foreground"
            >
              <Phone className="w-4 h-4" /> {client.phone}
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historique */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Historique ({appointments?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!appointments || appointments.length === 0 ? (
                <p className="text-sm text-ink-400 py-6 text-center">
                  Aucun rendez-vous pour ce client.
                </p>
              ) : (
                <ul className="divide-y divide-ink-800/50 -mx-6">
                  {appointments.map((a) => (
                    <li key={a.id}>
                      <Link
                        href={`/dashboard/appointments/${a.id}`}
                        className="flex items-center justify-between px-6 py-4 hover:bg-ink-900/40 transition-colors"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <Calendar className="w-4 h-4 text-ink-400 mt-1 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm text-foreground">
                              {formatDateTime(a.starts_at)}
                            </div>
                            {a.project_description && (
                              <div className="text-xs text-ink-400 truncate max-w-md mt-0.5">
                                {a.project_description}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant={STATUS_VARIANT[a.status]}>
                          {STATUS_LABEL[a.status]}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes privées</CardTitle>
            </CardHeader>
            <CardContent>
              <NotesForm clientId={client.id} initialNotes={client.notes} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
