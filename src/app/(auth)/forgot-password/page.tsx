"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestReset, type ForgotState } from "./actions";

const initialState: ForgotState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Envoi…" : "Envoyer le lien"}
    </Button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(requestReset, initialState);

  if (state.sent) {
    return (
      <div className="w-full max-w-md text-center">
        <h1 className="font-display text-4xl font-bold mb-2">Vérifie tes mails.</h1>
        <p className="text-ink-300">
          Si un compte existe pour cette adresse, tu vas recevoir un lien pour
          réinitialiser ton mot de passe. Pense à vérifier tes spams.
        </p>
        <p className="mt-8 text-sm text-ink-400">
          <Link href="/login" className="text-gold hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold mb-2">
          Mot de passe oublié ?
        </h1>
        <p className="text-ink-300">On t&apos;envoie un lien pour le réinitialiser.</p>
      </div>

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
