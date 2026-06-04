import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-ink-800/50">
        <div className="container h-16 flex items-center">
          <Link href="/" className="font-display text-2xl font-bold text-gold-gradient">
            Inklee
          </Link>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="absolute inset-0 bg-radial-fade pointer-events-none -z-10" />
        {children}
      </div>
    </div>
  );
}
