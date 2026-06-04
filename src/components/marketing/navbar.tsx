import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-ink-800/50 bg-ink-950/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold tracking-tight text-gold-gradient">
            Inklee
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-ink-200">
          <Link href="#features" className="hover:text-gold transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="hover:text-gold transition-colors">
            Tarifs
          </Link>
          <Link href="#temoignages" className="hover:text-gold transition-colors">
            Témoignages
          </Link>
          <Link href="#faq" className="hover:text-gold transition-colors">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Connexion</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Essai gratuit</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
