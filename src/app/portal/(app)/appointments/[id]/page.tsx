import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarPlus,
  MapPin,
  MessageCircle,
  Image as ImageIcon,
  Euro,
  Phone,
  Sparkles,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/appointment-status";

export const dynamic = "force-dynamic";

export default async function PortalAppointmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const admin = createAdminClient();
  const { data: appt } = await admin
    .from("appointments")
    .select(
      `id, starts_at, ends_at, status, deposit_paid, deposit_amount,
       project_description, reference_image_url, client_id, studio_id,
       clients!inner(id, auth_user_id, first_name),
       studios(id, name, slug, city, address, phone)`
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!appt) notFound();

  const client = Array.isArray(appt.clients) ? appt.clients[0] : appt.clients;
  if (!client || client.auth_user_id !== user.id) notFound();

  const studio = Array.isArray(appt.studios) ? appt.studios[0] : appt.studios;
  if (!studio) notFound();

  const startsAt = new Date(appt.starts_at);
  const endsAt = new Date(appt.ends_at);
  const now = new Date();
  const isPast = startsAt.getTime() < now.getTime();
  const durationMin = Math.round((endsAt.getTime() - startsAt.getTime()) / 60000);

  const mapsUrl = studio.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${studio.address} ${studio.city ?? ""}`
      )}`
    : null;

  return (
    <div className="container max-w-2xl py-6 px-4">
      <Link
        href="/portal/appointments"
        className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-foreground mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Mes rendez-vous
      </Link>

      {/* Hero : date + statut */}
      <Card className="mb-4 border-white/20 bg-white/[0.03]">
        <CardContent className="pt-6">
          <div className="text-xs uppercase tracking-wider text-foreground/80 mb-1">
            Rendez-vous
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight">
            {formatDateTime(startsAt)}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={STATUS_VARIANT[appt.status]}>
              {STATUS_LABEL[appt.status]}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-ink-300">
              <Clock className="w-3 h-3" /> {durationMin} min
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      {!isPast && appt.status !== "cancelled" && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button asChild variant="outline" className="w-full">
            <a href={`/api/portal/appointments/${appt.id}/ics`} download>
              <CalendarPlus className="w-4 h-4" />
              Ajouter au calendrier
            </a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={`/portal/messages/${client.id}`}>
              <MessageCircle className="w-4 h-4" />
              Discuter
            </Link>
          </Button>
        </div>
      )}

      {/* Studio */}
      <Card className="mb-4">
        <CardContent className="pt-5">
          <div className="text-xs uppercase tracking-wider text-ink-400 mb-3">
            Studio
          </div>
          <Link
            href={`/portal/studios/${client.id}`}
            className="flex items-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-ink-800 flex items-center justify-center shrink-0">
              <span className="font-display text-xl font-bold text-ink-300">
                {studio.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground group-hover:text-white truncate">
                {studio.name}
              </div>
              {studio.city && (
                <div className="text-sm text-ink-400">{studio.city}</div>
              )}
            </div>
            <Sparkles className="w-4 h-4 text-ink-500 group-hover:text-foreground" />
          </Link>

          {(studio.address || studio.phone) && (
            <div className="mt-4 pt-4 border-t border-ink-800/60 space-y-2.5">
              {studio.address && mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener"
                  className="flex items-start gap-2.5 text-sm text-ink-200 hover:text-foreground"
                >
                  <MapPin className="w-4 h-4 text-ink-400 shrink-0 mt-0.5" />
                  <span>{studio.address}</span>
                </a>
              )}
              {studio.phone && (
                <a
                  href={`tel:${studio.phone}`}
                  className="flex items-center gap-2.5 text-sm text-ink-200 hover:text-foreground"
                >
                  <Phone className="w-4 h-4 text-ink-400 shrink-0" />
                  {studio.phone}
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projet */}
      {(appt.project_description || appt.reference_image_url) && (
        <Card className="mb-4">
          <CardContent className="pt-5">
            <div className="text-xs uppercase tracking-wider text-ink-400 mb-3">
              Ton projet
            </div>
            {appt.project_description && (
              <p className="text-sm text-ink-100 whitespace-pre-wrap leading-relaxed mb-4">
                {appt.project_description}
              </p>
            )}
            {appt.reference_image_url && (
              <div>
                <div className="text-xs text-ink-400 mb-2 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> Ta référence
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={appt.reference_image_url}
                  alt="Référence"
                  className="max-w-full sm:max-w-xs rounded-lg border border-ink-800"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Acompte */}
      <Card className="mb-4">
        <CardContent className="pt-5">
          <div className="text-xs uppercase tracking-wider text-ink-400 mb-3">
            Acompte
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Euro className="w-5 h-5 text-ink-400" />
              <div className="font-medium text-foreground">
                {formatPrice(Number(appt.deposit_amount))}
              </div>
            </div>
            <Badge variant={appt.deposit_paid ? "success" : "warning"}>
              {appt.deposit_paid ? "Réglé" : "En attente"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Aftercare card si terminé */}
      {appt.status === "completed" && (
        <Card className="mb-4 border-white/20 bg-gradient-to-br from-white/[0.05] to-transparent">
          <CardContent className="pt-5">
            <div className="text-xs uppercase tracking-wider text-foreground/80 mb-2">
              Soins post-tatouage
            </div>
            <p className="text-sm text-ink-200 mb-4">
              Pour que ton tatouage cicatrise au mieux, suis les conseils
              {client.first_name ? ` ${client.first_name}` : ""} :
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/portal/aftercare">Voir les conseils soins →</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Politique annulation */}
      {!isPast && appt.status !== "cancelled" && (
        <p className="text-[11px] text-ink-500 text-center mt-2">
          Pour annuler ou modifier, contacte directement le studio via la
          messagerie. Acompte remboursable si annulation 72h avant le RDV.
        </p>
      )}
    </div>
  );
}
