import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Calendar,
  Users,
  Settings,
  LayoutDashboard,
  ImageIcon,
  CreditCard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { SidebarLink } from "./sidebar-link";

const NAV = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: ImageIcon },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/billing", label: "Abonnement", icon: CreditCard },
] as const;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: studio } = await supabase
    .from("studios")
    .select("name, slug")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!studio) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-ink-800/60 bg-ink-950/80">
        <div className="h-16 flex items-center px-6 border-b border-ink-800/60">
          <Link href="/" className="font-display text-2xl font-bold text-gold-gradient">
            Inklee
          </Link>
        </div>

        <div className="px-3 py-2 mt-2 mb-1 text-xs uppercase tracking-wider text-ink-500">
          {studio.name}
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarLink key={item.href} href={item.href} label={item.label}>
                <Icon className="w-4 h-4" />
              </SidebarLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-ink-800/60">
          <Link
            href={`/${studio.slug}`}
            target="_blank"
            className="block text-xs text-ink-400 hover:text-foreground transition-colors mb-2 truncate"
          >
            ↗ inklee.fr/{studio.slug}
          </Link>
          <form action="/auth/signout" method="post">
            <Button
              variant="ghost"
              size="sm"
              type="submit"
              className="w-full justify-start text-ink-300"
            >
              Déconnexion
            </Button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
