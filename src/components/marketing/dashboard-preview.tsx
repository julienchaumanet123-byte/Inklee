import {
  LayoutDashboard,
  Calendar,
  Users,
  ImageIcon,
  Banknote,
  Settings,
  Plus,
  Euro,
  TrendingUp,
} from "lucide-react";

/**
 * Mockup haute-fidélité du dashboard pour la landing.
 * 100% HTML/CSS, pas d'image — reste net à toute résolution.
 */
export function DashboardPreview() {
  return (
    <div className="relative rounded-2xl border border-ink-800 bg-ink-900/60 p-1.5 sm:p-2 shadow-2xl gold-glow">
      <div className="rounded-xl border border-ink-800 bg-ink-950 overflow-hidden">
        {/* Browser top bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-ink-800">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-ink-700" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-ink-700" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-ink-700" />
          <div className="flex-1 ml-2 sm:ml-4 text-[10px] sm:text-xs text-ink-400 font-mono truncate">
            inklee.fr/dashboard
          </div>
        </div>

        <div className="flex">
          {/* Sidebar (caché en mobile, visible dès sm) */}
          <aside className="hidden sm:flex w-44 lg:w-52 shrink-0 flex-col border-r border-ink-800 bg-ink-950 py-5">
            <div className="px-5 mb-4 font-display text-base font-bold text-foreground">
              Inklee
            </div>
            <div className="px-3 text-[10px] uppercase tracking-wider text-ink-500 mb-2">
              Atelier Noir
            </div>
            <div className="px-3 space-y-0.5">
              <NavItem icon={LayoutDashboard} label="Accueil" active />
              <NavItem icon={Calendar} label="Agenda" />
              <NavItem icon={Users} label="Clients" badge="42" />
              <NavItem icon={ImageIcon} label="Portfolio" />
              <NavItem icon={Banknote} label="Paiements" />
              <NavItem icon={Settings} label="Settings" />
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0 p-3 sm:p-5 lg:p-6">
            {/* Header */}
            <div className="flex items-end justify-between mb-4 sm:mb-5">
              <div>
                <div className="font-display text-lg sm:text-2xl font-bold mb-0.5">
                  Bonjour Léa 👋
                </div>
                <div className="text-[10px] sm:text-xs text-ink-300 hidden sm:block">
                  Voici l'état de ton studio aujourd'hui.
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-md bg-white text-ink-950 px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium">
                <Plus className="w-3 h-3" />
                <span className="hidden sm:inline">Nouveau RDV</span>
                <span className="sm:hidden">RDV</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
              <StatCard label="RDV ce mois" value="38" trend="+12" />
              <StatCard label="Acomptes" value="1 240€" icon={Euro} />
              <StatCard label="No-shows" value="0" trend="−4" positive />
            </div>

            {/* Agenda mini */}
            <div className="rounded-lg border border-ink-800 bg-ink-900/40 p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs sm:text-sm font-medium text-foreground">
                  Prochains rendez-vous
                </div>
                <div className="text-[10px] sm:text-xs text-ink-400 hidden sm:block">
                  Cette semaine
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Appt time="14:00" name="Camille D." project="Manchette japonaise — séance 2" status="confirmed" />
                <Appt time="16:30" name="Thomas R." project="Lettrage avant-bras" status="confirmed" />
                <Appt time="18:00" name="Sarah M." project="Piercing hélix" status="pending" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
  badge,
}: {
  icon: typeof LayoutDashboard;
  label: string;
  active?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs ${
        active
          ? "bg-ink-800 text-foreground"
          : "text-ink-300"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-[9px] bg-ink-800 text-ink-300 px-1.5 py-0.5 rounded">
          {badge}
        </span>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  trend,
  positive,
  icon: Icon,
}: {
  label: string;
  value: string;
  trend?: string;
  positive?: boolean;
  icon?: typeof Euro;
}) {
  return (
    <div className="rounded-lg border border-ink-800 bg-ink-900/40 p-2.5 sm:p-3.5">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-ink-400">
          {label}
        </div>
        {Icon && <Icon className="w-3 h-3 text-ink-500" />}
      </div>
      <div className="flex items-baseline gap-1.5">
        <div className="text-sm sm:text-xl font-bold text-foreground">{value}</div>
        {trend && (
          <div
            className={`text-[9px] sm:text-[10px] font-medium ${
              positive || trend.startsWith("+")
                ? "text-emerald-400"
                : "text-emerald-400"
            }`}
          >
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

function Appt({
  time,
  name,
  project,
  status,
}: {
  time: string;
  name: string;
  project: string;
  status: "confirmed" | "pending";
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-md bg-ink-800/40 border border-ink-800">
      <div className="text-[10px] sm:text-xs font-mono text-ink-300 shrink-0 w-9 sm:w-11">
        {time}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] sm:text-sm font-medium text-foreground truncate">
          {name}
        </div>
        <div className="text-[9px] sm:text-[11px] text-ink-400 truncate">
          {project}
        </div>
      </div>
      <div
        className={`shrink-0 text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full border ${
          status === "confirmed"
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            : "border-amber-500/40 bg-amber-500/10 text-amber-300"
        }`}
      >
        {status === "confirmed" ? "Confirmé" : "En attente"}
      </div>
    </div>
  );
}
