"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Banknote,
  Menu,
  X,
  Clock,
  ImageIcon,
  Settings,
  CreditCard,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRIMARY = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/agenda", label: "Agenda", icon: Calendar, exact: false },
  { href: "/dashboard/clients", label: "Clients", icon: Users, exact: false },
  {
    href: "/dashboard/payments",
    label: "Paiements",
    icon: Banknote,
    exact: false,
  },
] as const;

const MORE = [
  { href: "/dashboard/availability", label: "Disponibilités", icon: Clock },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: ImageIcon },
  { href: "/dashboard/settings", label: "Réglages", icon: Settings },
  { href: "/dashboard/billing", label: "Abonnement", icon: CreditCard },
] as const;

function active(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export function DashboardMobileNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal>
          <button
            type="button"
            aria-label="Fermer"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-ink-800 bg-ink-950 p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-ink-300">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="-mr-2 p-2 text-ink-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-1">
              {MORE.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm",
                      active(pathname, item.href)
                        ? "bg-ink-800 text-foreground"
                        : "text-ink-200 hover:bg-ink-900"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href={`/${slug}`}
                target="_blank"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-ink-200 hover:bg-ink-900"
              >
                <ExternalLink className="h-5 w-5" />
                Voir ma page publique
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-ink-400 hover:bg-ink-900"
                >
                  <LogOut className="h-5 w-5" />
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-800/60 bg-ink-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="flex h-16 items-stretch">
          {PRIMARY.map((item) => {
            const Icon = item.icon;
            const isActive = active(pathname, item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 text-[10px] transition-colors",
                  isActive ? "text-foreground" : "text-ink-400"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-[10px] transition-colors",
              open ? "text-foreground" : "text-ink-400"
            )}
          >
            <Menu className="h-5 w-5" />
            Plus
          </button>
        </div>
      </nav>
    </>
  );
}
