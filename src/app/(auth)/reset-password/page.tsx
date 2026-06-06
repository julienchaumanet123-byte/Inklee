"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword, type ResetState } from "./actions";

const initialState: ResetState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Enregistrement…" : "Définir mon mot de passe"}
    </Button>
  );
}

export default function ResetPasswordPage() {
  const [state, formAction] = useFormState(updatePassword, initialState);

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold mb-2">
          Nouveau mot de passe.
        </h1>
        <p className="text-ink-300">
          Choisis un nouveau mot de passe pour ton studio.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
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
            <p className="text-xs text-destructive">
              {state.fieldErrors.password}
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
        <Link href="/login" className="text-gold hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
