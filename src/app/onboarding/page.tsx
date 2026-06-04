"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeOnboarding, type OnboardingState } from "./actions";

const initialState: OnboardingState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Création…" : "Lancer mon studio"}
    </Button>
  );
}

export default function OnboardingPage() {
  const [state, formAction] = useFormState(completeOnboarding, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-background">
      <div className="absolute inset-0 bg-radial-fade pointer-events-none" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.2em] text-gold mb-3">
            Étape 1/1
          </div>
          <h1 className="font-display text-4xl font-bold mb-2">
            Parle-nous de ton studio.
          </h1>
          <p className="text-ink-300">
            On crée ta page de réservation tout de suite après.
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="studioName">Nom du studio</Label>
            <Input
              id="studioName"
              name="studioName"
              placeholder="Atelier Noir"
              required
            />
            {state.fieldErrors?.studioName && (
              <p className="text-xs text-destructive">{state.fieldErrors.studioName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Spécialité</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["tattoo", "piercing", "both"] as const).map((value) => (
                <label
                  key={value}
                  className="cursor-pointer rounded-md border border-ink-700 bg-ink-900/50 p-3 text-center text-sm transition-all has-[:checked]:border-gold has-[:checked]:bg-gold/10 has-[:checked]:text-gold hover:border-ink-600"
                >
                  <input
                    type="radio"
                    name="specialty"
                    value={value}
                    className="sr-only"
                    defaultChecked={value === "tattoo"}
                    required
                  />
                  {value === "tattoo" && "Tatouage"}
                  {value === "piercing" && "Piercing"}
                  {value === "both" && "Les deux"}
                </label>
              ))}
            </div>
            {state.fieldErrors?.specialty && (
              <p className="text-xs text-destructive">{state.fieldErrors.specialty}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input id="city" name="city" placeholder="Paris" required />
            {state.fieldErrors?.city && (
              <p className="text-xs text-destructive">{state.fieldErrors.city}</p>
            )}
          </div>

          {state.error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
