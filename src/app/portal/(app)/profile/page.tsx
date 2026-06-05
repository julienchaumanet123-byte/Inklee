import { redirect } from "next/navigation";
import { Mail, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getClientsForAuthUser } from "@/lib/portal-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "./profile-form";

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
    <div className="container max-w-2xl py-6 px-4">
      <h1 className="font-display text-3xl font-bold mb-6">Mon profil</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">Mes infos</CardTitle>
        </CardHeader>
        <CardContent>
          {first ? (
            <ProfileForm
              firstName={first.first_name}
              lastName={first.last_name}
              phone={first.phone}
            />
          ) : (
            <p className="text-sm text-ink-400">
              Tu n'as pas encore de fiche client. Réserve un RDV pour démarrer.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Email (non éditable, lié à l'auth) */}
      <Card className="mb-4">
        <CardContent className="pt-5">
          <div className="text-xs uppercase tracking-wider text-ink-400 mb-1.5">
            Email de connexion
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Mail className="w-4 h-4 text-ink-400" />
            {user.email}
          </div>
          <p className="text-[11px] text-ink-500 mt-2">
            Pour changer ton email, contacte hello@inklee.fr.
          </p>
        </CardContent>
      </Card>

      {/* Studios */}
      {clients.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Mes studios</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-ink-800/50 -mx-6">
              {clients.map((c) => (
                <li key={c.id} className="px-6 py-3">
                  <div className="text-sm font-medium text-foreground">
                    {c.studio.name}
                  </div>
                  {c.studio.city && (
                    <div className="text-xs text-ink-400">{c.studio.city}</div>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Déconnexion */}
      <form action="/auth/signout" method="post">
        <Button type="submit" variant="outline" className="w-full">
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </Button>
      </form>
    </div>
  );
}
