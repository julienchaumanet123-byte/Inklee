import Link from "next/link";
import { MapPin, Search, ArrowRight, Sparkles } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const SPECIALTY_LABEL: Record<string, string> = {
  tattoo: "Tatouage",
  piercing: "Piercing",
  both: "Tatouage & Piercing",
};

export default async function DiscoverPage() {
  const supabase = createAdminClient();

  const { data: studios } = await supabase
    .from("studios")
    .select("id, name, slug, specialty, city, bio")
    .order("created_at", { ascending: false });

  const list = studios ?? [];

  return (
    <div className="container max-w-3xl py-8 px-4">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1">
          Découvrir des tatoueurs.
        </h1>
        <p className="text-ink-300">
          Tous les studios présents sur Inklee. Clique pour voir leur page
          et réserver.
        </p>
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-ink-400">
            <Search className="w-12 h-12 mx-auto mb-4 text-ink-700" />
            <p>Aucun studio inscrit pour l'instant.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {list.map((s) => (
            <Link
              key={s.id}
              href={`/${s.slug}`}
              className="group rounded-2xl border border-ink-800 bg-ink-900/40 overflow-hidden hover:border-ink-600 hover:bg-ink-900/60 transition-all"
            >
              {/* Cover gradient placeholder */}
              <div className="relative h-28 bg-gradient-to-br from-ink-700 via-ink-800 to-ink-950 grain">
                <div className="absolute -bottom-6 left-4 w-12 h-12 rounded-xl border-2 border-ink-900 bg-ink-800 flex items-center justify-center">
                  <span className="font-display text-lg font-bold text-ink-300">
                    {s.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="p-4 pt-8">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="font-medium text-foreground truncate">
                    {s.name}
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-500 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>

                <div className="flex items-center gap-3 text-xs text-ink-400 mb-3">
                  {s.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {s.city}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {SPECIALTY_LABEL[s.specialty] ?? "Studio"}
                  </span>
                </div>

                {s.bio && (
                  <p className="text-sm text-ink-300 line-clamp-2 leading-snug">
                    {s.bio}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
