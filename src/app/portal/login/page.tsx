"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendMagicLink, type PortalLoginState } from "./actions";

const initialState: PortalLoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      <Mail className="w-4 h-4" />
      {pending ? "Envoi…" : "Recevoir le lien magique"}
    </Button>
  );
}

export default function PortalLoginPage() {
  const [state, formAction] = useFormState(sendMagicLink, initialState);

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
        <div className="w-full max-w-md">
          {state.success ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/20 mb-6 gold-glow">
                <CheckCircle2 className="w-10 h-10 text-foreground" />
              </div>
              <h1 className="font-display text-4xl font-bold mb-3">
                Check ta boîte mail.
              </h1>
              <p className="text-ink-300 mb-2">
                On t'a envoyé un lien pour te connecter à ton espace.
              </p>
              <p className="text-sm text-ink-400">
                (Pense à regarder dans les spams si tu ne vois rien dans la minute.)
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h1 className="font-display text-4xl font-bold mb-2">
                  Ton espace client.
                </h1>
                <p className="text-ink-300">
                  Reçois un lien magique par email — pas besoin de mot de passe.
                </p>
              </div>

              <form action={formAction} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="toi@email.com"
                    autoComplete="email"
                    required
                  />
                  {state.fieldErrors?.email && (
                    <p className="text-xs text-destructive">
                      {state.fieldErrors.email}
                    </p>
                  )}
                </div>

                {state.error && (
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {state.error}
                  </div>
                )}

                <SubmitButton />
              </form>

              <p className="mt-8 text-center text-sm text-ink-400">
                Tu es tatoueur ?{" "}
                <Link href="/login" className="text-foreground hover:underline">
                  Espace pro
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
