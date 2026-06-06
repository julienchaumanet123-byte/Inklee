import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Calendar,
  Users,
  Settings,
  LayoutDashboard,
  ImageIcon,
  CreditCard,
  Banknote,
  Clock,
  Plus,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStudioAccess } from "@/lib/access";
import { Button } from "@/components/ui/button";
import { SidebarLink } from "./sidebar-link";

const NAV = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  { href: "/dashboard/availability", label: "Disponibilités", icon: Clock },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: ImageIcon },
  { href: "/dashboard/payments", label: "Paiements", icon: Banknote },
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
    .select("name, slug, plan_tier, trial_ends_at, stripe_subscription_id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!studio) redirect("/onboarding");

  const access = getStudioAccess(studio);
  const planLabel = { starter: "Starter", pro: "Pro", studio: "Studio" }[
    studio.plan_tier
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-ink-800/60 bg-ink-950/80">
        <div className="h-16 flex items-center px-6 border-b border-ink-800/60">
          <Link
            href="/"
            className="font-display text-2xl font-bold text-gold-gradient"
          >
            Inklee
          </Link>
        </div>

        {/* Studio card */}
        <div className="px-3 pt-3 pb-2">
          <div className="rounded-lg border border-ink-800/80 bg-ink-900/50 p-3">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-md bg-ink-800 flex items-center justify-center shrink-0">
                <span className="font-display text-sm font-bold text-foreground">
                  {studio.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {studio.name}
                </div>
                <div className="text-[10px] text-ink-400 uppercase tracking-wider">
                  Plan {planLabel}
                </div>
              </div>
            </div>
            <Link
              href={`/${studio.slug}`}
              target="_blank"
              className="flex items-center gap-1 text-[11px] text-ink-300 hover:text-foreground truncate"
            >
              <ExternalLink className="w-3 h-3 shrink-0" />
              inklee.fr/{studio.slug}
            </Link>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-1">
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
          <form action="/auth/signout" method="post">
            <Button
              variant="ghost"
              size="sm"
              type="submit"
              className="w-full justify-start text-ink-400 hover:text-foreground"
            >
              <LogOut className="w-3.5 h-3.5" />
              Déconnexion
            </Button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="h-16 border-b border-ink-800/60 bg-ink-950/60 backdrop-blur-xl sticky top-0 z-30">
          <div className="h-full px-4 md:px-8 flex items-center justify-between gap-3">
            {/* Logo mobile */}
            <Link
              href="/"
              className="md:hidden font-display text-xl font-bold text-gold-gradient"
            >
              Inklee
            </Link>
            {/* Studio name + plan badge desktop */}
            <div className="hidden md:flex items-center gap-2 text-sm text-ink-300">
              <span className="text-foreground font-medium">{studio.name}</span>
              <span className="w-px h-4 bg-ink-700" />
              <Link
                href="/dashboard/billing"
                className="text-xs text-ink-400 hover:text-foreground transition-colors"
              >
                Plan {planLabel}
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link href={`/${studio.slug}`} target="_blank">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Page publique
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/dashboard/agenda/new">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nouveau RDV</span>
                  <span className="sm:hidden">RDV</span>
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0">
          {!access.subscribed && (
            <div
              className={`flex items-center justify-between gap-3 border-b px-4 md:px-8 py-3 text-sm ${
                access.locked
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "border-gold/20 bg-gold/5 text-ink-200"
              }`}
            >
              <span>
                {access.locked
                  ? "Ton essai gratuit est terminé. Abonne-toi pour réactiver ton studio."
                  : `Essai gratuit — ${access.trialDaysLeft} jour${
                      access.trialDaysLeft > 1 ? "s" : ""
                    } restant${access.trialDaysLeft > 1 ? "s" : ""}.`}
              </span>
              <Link
                href="/dashboard/billing"
                className="shrink-0 font-medium underline hover:no-underline"
              >
                {access.locked ? "Choisir un plan" : "Gérer mon abonnement"}
              </Link>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
