import * as React from "react";

/**
 * Petits composants typographiques unifiés pour les pages légales.
 * Pas de plugin @tailwindcss/typography — on garde le contrôle complet du style.
 */

export function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2 tracking-tight">
      {children}
    </h1>
  );
}

export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-ink-400 mb-10">{children}</p>;
}

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-xl sm:text-2xl font-bold mt-10 mb-4 text-foreground">
      {children}
    </h2>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-semibold text-base sm:text-lg mt-6 mb-3 text-foreground">
      {children}
    </h3>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm sm:text-[15px] text-ink-200 leading-relaxed mb-4">
      {children}
    </p>
  );
}

export function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 mb-4 text-sm sm:text-[15px] text-ink-200">
      {children}
    </ul>
  );
}

export function LI({ children }: { children: React.ReactNode }) {
  return <li className="leading-relaxed">{children}</li>;
}

export function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <code className="text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded text-[13px] font-mono">
      [{children}]
    </code>
  );
}
