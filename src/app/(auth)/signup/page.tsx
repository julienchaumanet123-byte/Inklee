"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup, type SignupState } from "./actions";

const initialState: SignupState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Création…" : "Créer mon studio"}
    </Button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useFormState(signup, initialState);

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold mb-2">
          Lance ton <span className="text-gold-gradient">studio</span>.
        </h1>
        <p className="text-ink-300">14 jours gratuits, sans carte bancaire.</p>
      </div>

      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nom complet</Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Léa Marchand"
            autoComplete="name"
            required
          />
          {state.fieldErrors?.fullName && (
            <p className="text-xs text-destructive">{state.fieldErrors.fullName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email pro</Label>
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
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Minimum 8 caractères"
            autoComplete="new-password"
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

        <p className="text-xs text-center text-ink-400">
          En créant un compte, tu acceptes nos{" "}
          <Link href="/legal/cgu" className="underline hover:text-gold">
            CGU
          </Link>{" "}
          et notre{" "}
          <Link href="/legal/privacy" className="underline hover:text-gold">
            politique de confidentialité
          </Link>
          .
        </p>
      </form>

      <p className="mt-8 text-center text-sm text-ink-400">
        Tu as déjà un compte ?{" "}
        <Link href="/login" className="text-gold hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
