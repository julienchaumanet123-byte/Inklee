"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-ink-800/50 bg-ink-950/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-gold-gradient">
            Inklee
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8 text-sm text-ink-200">
          <Link href="#features" className="hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="hover:text-foreground transition-colors">
            Tarifs
          </Link>
          <Link href="#temoignages" className="hover:text-foreground transition-colors">
            Témoignages
          </Link>
          <Link href="#faq" className="hover:text-foreground transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          <Link
            href="/portal/login"
            className="text-sm text-ink-300 hover:text-foreground transition-colors px-2"
          >
            Espace client
          </Link>
          <div className="w-px h-5 bg-ink-700" />
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Connexion pro</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Essai gratuit</Link>
          </Button>
        </div>

        {/* Mobile : burger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-md hover:bg-ink-800/60 transition-colors"
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-ink-800/60 bg-ink-950/95 backdrop-blur-xl animate-fade-in">
          <div className="container px-4 py-4 flex flex-col">
            <Link
              href="#features"
              onClick={() => setOpen(false)}
              className="py-3 text-sm text-ink-200 border-b border-ink-800/40"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              onClick={() => setOpen(false)}
              className="py-3 text-sm text-ink-200 border-b border-ink-800/40"
            >
              Tarifs
            </Link>
            <Link
              href="#temoignages"
              onClick={() => setOpen(false)}
              className="py-3 text-sm text-ink-200 border-b border-ink-800/40"
            >
              Témoignages
            </Link>
            <Link
              href="#faq"
              onClick={() => setOpen(false)}
              className="py-3 text-sm text-ink-200 border-b border-ink-800/40 mb-4"
            >
              FAQ
            </Link>

            <Button asChild size="lg" className="mb-3" onClick={() => setOpen(false)}>
              <Link href="/signup">Essai gratuit</Link>
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="outline" size="sm" onClick={() => setOpen(false)}>
                <Link href="/login">Connexion pro</Link>
              </Button>
              <Button asChild variant="outline" size="sm" onClick={() => setOpen(false)}>
                <Link href="/portal/login">Espace client</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
