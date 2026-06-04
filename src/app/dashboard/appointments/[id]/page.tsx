import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  User,
  Mail,
  Phone,
  Euro,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/appointment-status";
import { updateAppointmentStatus, deleteAppointment } from "./actions";

export const dynamic = "force-dynamic";

export default async function AppointmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: appt } = await supabase
    .from("appointments")
    .select(`
      *,
      clients (id, first_name, last_name, email, phone),
      studios!inner (owner_id)
    `)
    .eq("id", params.id)
    .maybeSingle();

  if (!appt) notFound();
  const studio = Array.isArray(appt.studios) ? appt.studios[0] : appt.studios;
  if (studio?.owner_id !== user.id) notFound();

  const client = Array.isArray(appt.clients) ? appt.clients[0] : appt.clients;

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <Link
        href="/dashboard/agenda"
        className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à l'agenda
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              {client?.first_name} {client?.last_name}
            </h1>
            <Badge variant={STATUS_VARIANT[appt.status]}>
              {STATUS_LABEL[appt.status]}
            </Badge>
          </div>
          <div className="text-ink-300 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {formatDateTime(appt.starts_at)}
          </div>
        </div>
      </div>

      {/* Actions statut */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Statut</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {appt.status !== "confirmed" && (
              <form action={updateAppointmentStatus}>
                <input type="hidden" name="id" value={appt.id} />
                <input type="hidden" name="status" value="confirmed" />
                <Button type="submit" variant="outline" size="sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmer
                </Button>
              </form>
            )}
            {appt.status !== "completed" && (
              <form action={updateAppointmentStatus}>
                <input type="hidden" name="id" value={appt.id} />
                <input type="hidden" name="status" value="completed" />
                <Button type="submit" variant="outline" size="sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Marquer terminé
                </Button>
              </form>
            )}
            {appt.status !== "cancelled" && (
              <form action={updateAppointmentStatus}>
                <input type="hidden" name="id" value={appt.id} />
                <input type="hidden" name="status" value="cancelled" />
                <Button type="submit" variant="outline" size="sm">
                  <XCircle className="w-4 h-4" />
                  Annuler
                </Button>
              </form>
            )}
            {appt.status !== "no_show" && (
              <form action={updateAppointmentStatus}>
                <input type="hidden" name="id" value={appt.id} />
                <input type="hidden" name="status" value="no_show" />
                <Button type="submit" variant="outline" size="sm">
                  <AlertCircle className="w-4 h-4" />
                  No-show
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Client */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Client</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-ink-400" />
            <Link
              href={`/dashboard/clients/${client?.id}`}
              className="hover:underline"
            >
              {client?.first_name} {client?.last_name}
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-ink-400" />
            <a href={`mailto:${client?.email}`} className="hover:underline">
              {client?.email}
            </a>
          </div>
          {client?.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-ink-400" />
              <a href={`tel:${client.phone}`} className="hover:underline">
                {client.phone}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projet */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Projet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {appt.project_description ? (
            <p className="text-sm text-ink-100 whitespace-pre-wrap">
              {appt.project_description}
            </p>
          ) : (
            <p className="text-sm text-ink-400">Aucune description.</p>
          )}
          {appt.reference_image_url && (
            <div className="mt-3">
              <div className="text-xs text-ink-400 mb-2">Référence client</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={appt.reference_image_url}
                alt="Référence"
                className="max-w-xs rounded-md border border-ink-800"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acompte */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Acompte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Euro className="w-5 h-5 text-ink-400" />
              <span className="text-lg font-medium">
                {formatPrice(Number(appt.deposit_amount))}
              </span>
            </div>
            <Badge variant={appt.deposit_paid ? "success" : "warning"}>
              {appt.deposit_paid ? "Reçu" : "En attente"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <form action={deleteAppointment}>
        <input type="hidden" name="id" value={appt.id} />
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer définitivement
        </Button>
      </form>
    </div>
  );
}
