import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Inklee — Le logiciel des tatoueurs et perceurs",
  description:
    "Inklee est la plateforme tout-en-un pour gérer ton studio de tatouage ou de piercing : agenda, acomptes, fiches clients, consentements et rappels soins.",
  metadataBase: new URL("https://inklee.fr"),
  openGraph: {
    title: "Inklee — Le logiciel des tatoueurs",
    description:
      "Agenda, acomptes, consentements, rappels soins. Tout ce dont ton studio a besoin.",
    type: "website",
    locale: "fr_FR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${sans.variable} ${display.variable} font-sans bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
