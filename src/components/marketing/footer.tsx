import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink-800 py-12 mt-20">
      <div className="container max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
          <div>
            <div className="font-display text-2xl font-bold text-gold-gradient mb-2">
              Inklee
            </div>
            <p className="text-sm text-ink-400">
              Le logiciel des tatoueurs et perceurs français.
            </p>
          </div>

          <nav className="flex flex-wrap gap-6 text-sm text-ink-300">
            <Link href="#features" className="hover:text-gold transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="hover:text-gold transition-colors">
              Tarifs
            </Link>
            <Link href="/login" className="hover:text-gold transition-colors">
              Connexion
            </Link>
            <Link href="/legal/cgu" className="hover:text-gold transition-colors">
              CGU
            </Link>
            <Link href="/legal/privacy" className="hover:text-gold transition-colors">
              Confidentialité
            </Link>
          </nav>
        </div>

        <div className="mt-8 pt-8 border-t border-ink-800/50 text-xs text-ink-500 text-center">
          © {new Date().getFullYear()} Inklee. Tous droits réservés. Fait avec ♥ en France.
        </div>
      </div>
    </footer>
  );
}
