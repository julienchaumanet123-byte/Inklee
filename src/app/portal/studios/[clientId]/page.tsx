import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  AtSign,
  Globe,
  Phone,
  MessageCircle,
  Calendar,
  Sparkles,
  ImageIcon,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const SPECIALTY_LABEL: Record<string, string> = {
  tattoo: "Tatouage",
  piercing: "Piercing",
  both: "Tatouage & Piercing",
};

export default async function PortalStudioPage({
  params,
}: {
  params: { clientId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const admin = createAdminClient();
  const { data: client } = await admin
    .from("clients")
    .select(`id, studio_id, studios(*)`)
    .eq("id", params.clientId)
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!client) notFound();
  const studio = Array.isArray(client.studios) ? client.studios[0] : client.studios;
  if (!studio) notFound();

  return (
    <div>
      {/* Cover (gradient placeholder pour l'instant) */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 grain">
        <Link
          href={`/portal/messages/${client.id}`}
          className="absolute top-4 left-4 p-2 rounded-md bg-ink-950/60 backdrop-blur-sm hover:bg-ink-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
      </div>

      {/* Header studio overlap */}
      <div className="container max-w-2xl px-4 -mt-12 relative z-10">
        <div className="flex items-end gap-4 mb-6">
          <div className="w-24 h-24 rounded-2xl border-4 border-background bg-ink-800 flex items-center justify-center shrink-0">
            <span className="font-display text-3xl text-ink-300 font-bold">
              {studio.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 mb-1">
            <h1 className="font-display text-3xl font-bold mb-1">{studio.name}</h1>
            <div className="flex items-center gap-1.5 text-sm text-ink-300">
              <Sparkles className="w-3 h-3" />
              {SPECIALTY_LABEL[studio.specialty] ?? "Studio"}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button asChild variant="outline">
            <Link href={`/portal/messages/${client.id}`}>
              <MessageCircle className="w-4 h-4" />
              Message
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/portal/appointments">
              <Calendar className="w-4 h-4" />
              Mes RDV
            </Link>
          </Button>
        </div>

        {/* Bio */}
        {studio.bio && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <p className="text-sm text-ink-200 whitespace-pre-wrap leading-relaxed">
                {studio.bio}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Infos pratiques */}
        <Card className="mb-4">
          <CardContent className="pt-6 space-y-3 text-sm">
            <div className="text-xs uppercase tracking-wider text-ink-400 mb-3">
              Infos pratiques
            </div>
            {studio.city && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-ink-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-foreground">{studio.city}</div>
                  {studio.address && (
                    <div className="text-ink-400 text-xs mt-0.5">
                      {studio.address}
                    </div>
                  )}
                </div>
              </div>
            )}
            {studio.phone && (
              <a
                href={`tel:${studio.phone}`}
                className="flex items-center gap-3 hover:text-foreground"
              >
                <Phone className="w-4 h-4 text-ink-400 shrink-0" />
                <span className="text-foreground">{studio.phone}</span>
              </a>
            )}
            {studio.instagram_handle && (
              <a
                href={`https://instagram.com/${studio.instagram_handle.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-3 hover:text-foreground"
              >
                <AtSign className="w-4 h-4 text-ink-400 shrink-0" />
                <span className="text-foreground">
                  @{studio.instagram_handle.replace(/^@/, "")}
                </span>
              </a>
            )}
            {studio.website_url && (
              <a
                href={studio.website_url}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-3 hover:text-foreground"
              >
                <Globe className="w-4 h-4 text-ink-400 shrink-0" />
                <span className="text-foreground truncate">
                  {studio.website_url.replace(/^https?:\/\//, "")}
                </span>
              </a>
            )}
            {!studio.city &&
              !studio.phone &&
              !studio.instagram_handle &&
              !studio.website_url && (
                <p className="text-ink-400 text-sm">
                  Pas encore d'infos renseignées.
                </p>
              )}
          </CardContent>
        </Card>

        {/* Portfolio (placeholder) */}
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="text-xs uppercase tracking-wider text-ink-400 mb-3">
              Portfolio
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-md bg-gradient-to-br from-ink-800 to-ink-900 flex items-center justify-center grain"
                >
                  <ImageIcon className="w-5 h-5 text-ink-600" />
                </div>
              ))}
            </div>
            <p className="text-xs text-ink-500 mt-3 italic">
              Bientôt : {studio.name} pourra publier son portfolio ici.
            </p>
          </CardContent>
        </Card>

        {/* Avis (placeholder) */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-xs uppercase tracking-wider text-ink-400 mb-3">
              Avis clients
            </div>
            <div className="flex items-center gap-2 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 text-ink-700 fill-ink-700"
                />
              ))}
            </div>
            <p className="text-sm text-ink-400">
              Aucun avis pour l'instant.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
