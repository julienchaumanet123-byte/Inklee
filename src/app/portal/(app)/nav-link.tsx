"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function PortalNavLink({
  href,
  label,
  exact = false,
  badge,
  children,
}: {
  href: string;
  label: string;
  exact?: boolean;
  badge?: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "relative flex flex-col items-center justify-center gap-0.5 px-4 py-2 text-xs transition-colors",
        isActive ? "text-foreground" : "text-ink-400 hover:text-foreground"
      )}
    >
      <div className="relative">
        {children}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1.5 -right-2 min-w-4 h-4 rounded-full bg-white text-ink-950 text-[10px] font-bold flex items-center justify-center px-1">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <span>{label}</span>
    </Link>
  );
}
