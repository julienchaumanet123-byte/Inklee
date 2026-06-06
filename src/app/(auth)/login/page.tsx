"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Connexion…" : "Se connecter"}
    </Button>
  );
}

function LoginForm() {
  const [state, formAction] = useFormState(login, initialState);
  const searchParams = useSearchParams();
  const callbackError =
    searchParams.get("error") === "auth_callback_failed"
      ? "Le lien d'authentification a expiré ou est invalide. Connecte-toi à nouveau."
      : null;

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold mb-2">Bon retour.</h1>
        <p className="text-ink-300">Connecte-toi à ton studio.</p>
      </div>

      {callbackError && (
        <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {callbackError}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="toi@studio.fr"
            autoComplete="email"
            required
          />
          {state.fieldErrors?.email && (
            <p className="text-xs text-destructive">{state.fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-ink-400 hover:text-gold"
            >
              Oublié ?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          {state.fieldErrors?.password && (
            <p className="text-xs text-destructive">{state.fieldErrors.password}</p>
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
        Pas encore de compte ?{" "}
        <Link href="/signup" className="text-gold hover:underline">
          Créer un studio
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
