import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink-800 py-10 sm:py-12 mt-16 sm:mt-20">
      <div className="container max-w-6xl px-4">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-between items-start md:items-center">
          <div>
            <div className="font-display text-xl sm:text-2xl font-bold text-gold-gradient mb-2">
              Inklee
            </div>
            <p className="text-xs sm:text-sm text-ink-400">
              Le logiciel des tatoueurs et perceurs français.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-5 gap-y-2 sm:gap-6 text-xs sm:text-sm text-ink-300">
            <Link href="#features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">
              Tarifs
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Connexion
            </Link>
            <Link href="/portal/login" className="hover:text-foreground transition-colors">
              Espace client
            </Link>
            <Link href="/legal/mentions-legales" className="hover:text-foreground transition-colors">
              Mentions légales
            </Link>
            <Link href="/legal/cgu" className="hover:text-foreground transition-colors">
              CGU
            </Link>
            <Link href="/legal/privacy" className="hover:text-foreground transition-colors">
              Confidentialité
            </Link>
          </nav>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-ink-800/50 text-[11px] sm:text-xs text-ink-500 text-center">
          © {new Date().getFullYear()} Inklee. Tous droits réservés. Fait avec ♥ en France.
        </div>
      </div>
    </footer>
  );
}
