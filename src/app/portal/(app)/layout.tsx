import Link from "next/link";
import { redirect } from "next/navigation";
import { Home, MessageCircle, Calendar, User, Compass } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUnreadCountForAuthUser } from "@/lib/portal-data";
import { Button } from "@/components/ui/button";
import { PortalNavLink } from "./nav-link";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const unreadCount = await getUnreadCountForAuthUser(user.id);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-ink-800/60 bg-ink-950/80 backdrop-blur-xl">
        <div className="container h-16 flex items-center justify-between">
          <Link href="/portal" className="font-display text-2xl font-bold text-gold-gradient">
            Inklee
          </Link>
          <form action="/auth/signout" method="post">
            <Button variant="ghost" size="sm" type="submit">
              Déconnexion
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 pb-24">{children}</main>

      {/* Mobile-first bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 border-t border-ink-800/60 bg-ink-950/95 backdrop-blur-xl z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="container flex items-center justify-around h-16">
          <PortalNavLink href="/portal" exact label="Accueil">
            <Home className="w-5 h-5" />
          </PortalNavLink>
          <PortalNavLink href="/portal/discover" label="Tatoueurs">
            <Compass className="w-5 h-5" />
          </PortalNavLink>
          <PortalNavLink href="/portal/messages" label="Messages" badge={unreadCount}>
            <MessageCircle className="w-5 h-5" />
          </PortalNavLink>
          <PortalNavLink href="/portal/appointments" label="RDV">
            <Calendar className="w-5 h-5" />
          </PortalNavLink>
          <PortalNavLink href="/portal/profile" label="Profil">
            <User className="w-5 h-5" />
          </PortalNavLink>
        </div>
      </nav>
    </div>
  );
}
