import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-ink-800/50">
        <div className="container h-16 flex items-center justify-between px-4">
          <Link
            href="/"
            className="font-display text-2xl font-bold text-gold-gradient"
          >
            Inklee
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-ink-300">
            <Link href="/legal/mentions-legales" className="hover:text-foreground">
              Mentions légales
            </Link>
            <Link href="/legal/cgu" className="hover:text-foreground">
              CGU
            </Link>
            <Link href="/legal/privacy" className="hover:text-foreground">
              Confidentialité
            </Link>
          </nav>
        </div>
      </header>

      {/* Bandeau template */}
      <div className="border-b border-amber-500/30 bg-amber-500/10">
        <div className="container max-w-3xl py-3 px-4 flex items-start gap-3 text-xs sm:text-sm text-amber-200">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <strong>Template à compléter avant ouverture publique.</strong>{" "}
            Tous les <code className="text-amber-100 bg-amber-500/20 px-1 rounded">[CHAMPS]</code>{" "}
            doivent être remplis avec tes infos société (SIRET, adresse, RCS…).
            Aucun bandeau ne sera affiché aux clients une fois cleanup fait —
            supprime ce composant dans <code>legal/layout.tsx</code>.
          </p>
        </div>
      </div>

      <main className="container max-w-3xl py-10 sm:py-14 px-4">
        <article className="prose-legal">{children}</article>
      </main>

      <footer className="border-t border-ink-800 py-8 mt-10">
        <div className="container max-w-3xl px-4 text-xs sm:text-sm text-ink-400 text-center">
          ← <Link href="/" className="hover:text-foreground">Retour à Inklee</Link>
        </div>
      </footer>
    </div>
  );
}
