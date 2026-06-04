import { redirect } from "next/navigation";
import { Mail, Phone, Hash } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getClientsForAuthUser } from "@/lib/portal-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function PortalProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const clients = await getClientsForAuthUser(user.id);
  const first = clients[0];

  return (
    <div className="container max-w-2xl py-8 px-4">
      <h1 className="font-display text-3xl font-bold mb-6">Mon profil</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Identité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {first ? (
            <div>
              <div className="text-ink-400 text-xs mb-1">Nom complet</div>
              <div className="text-foreground font-medium">
                {first.first_name} {first.last_name}
              </div>
            </div>
          ) : null}
          <div>
            <div className="text-ink-400 text-xs mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3" /> Email
            </div>
            <div className="text-foreground">{user.email}</div>
          </div>
          {first?.phone && (
            <div>
              <div className="text-ink-400 text-xs mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3" /> Téléphone
              </div>
              <div className="text-foreground">{first.phone}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {clients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mes studios</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {clients.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between py-2 border-b border-ink-800/50 last:border-0"
                >
                  <div>
                    <div className="text-foreground">{c.studio.name}</div>
                    {c.studio.city && (
                      <div className="text-xs text-ink-400">{c.studio.city}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-ink-500 font-mono">
                    <Hash className="w-3 h-3" />
                    {c.id.slice(0, 8)}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <p className="text-center text-xs text-ink-500 mt-8">
        Pour modifier ton nom ou ton téléphone, contacte directement ton studio
        via les messages.
      </p>
    </div>
  );
}
