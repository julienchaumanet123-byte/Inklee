"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Lock, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBooking, type BookingState } from "./actions";

const initialState: BookingState = {};

function SubmitButton({ depositRequired }: { depositRequired: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="xl" className="w-full" disabled={pending}>
      {depositRequired && <Lock className="w-4 h-4" />}
      {depositRequired
        ? pending
          ? "Redirection vers Stripe…"
          : "Payer l'acompte et confirmer"
        : pending
          ? "Confirmation…"
          : "Confirmer ma réservation"}
    </Button>
  );
}

export function BookingForm({
  slug,
  slotIso,
  depositRequired,
}: {
  slug: string;
  slotIso: string;
  depositRequired: boolean;
}) {
  const [state, formAction] = useFormState(createBooking, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="slotIso" value={slotIso} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom</Label>
          <Input id="firstName" name="firstName" required autoComplete="given-name" />
          {state.fieldErrors?.firstName && (
            <p className="text-xs text-destructive">{state.fieldErrors.firstName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nom</Label>
          <Input id="lastName" name="lastName" required autoComplete="family-name" />
          {state.fieldErrors?.lastName && (
            <p className="text-xs text-destructive">{state.fieldErrors.lastName}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="toi@email.com"
          />
          {state.fieldErrors?.email && (
            <p className="text-xs text-destructive">{state.fieldErrors.email}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder="06 12 34 56 78"
          />
          {state.fieldErrors?.phone && (
            <p className="text-xs text-destructive">{state.fieldErrors.phone}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="projectDescription">Décris ton projet</Label>
        <textarea
          id="projectDescription"
          name="projectDescription"
          required
          rows={5}
          placeholder="Style, taille, emplacement, idée générale…"
          className="flex w-full rounded-md border border-ink-700 bg-ink-900/50 px-4 py-3 text-sm placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold/50 resize-none transition-all"
        />
        {state.fieldErrors?.projectDescription && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.projectDescription}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference">Image de référence (optionnel)</Label>
        <label
          htmlFor="reference"
          className="flex flex-col items-center justify-center w-full h-32 rounded-md border border-dashed border-ink-700 bg-ink-900/30 hover:bg-ink-900/50 hover:border-gold/40 cursor-pointer transition-all"
        >
          <Upload className="w-6 h-6 text-ink-400 mb-2" />
          <span className="text-sm text-ink-300">Clique pour uploader</span>
          <span className="text-xs text-ink-500 mt-1">PNG, JPG — max 8 Mo</span>
          <input
            id="reference"
            name="reference"
            type="file"
            accept="image/*"
            className="sr-only"
          />
        </label>
      </div>

      {state.error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <SubmitButton depositRequired={depositRequired} />

      <p className="text-xs text-center text-ink-400">
        {depositRequired
          ? "Paiement sécurisé par Stripe. Tes infos ne sont jamais stockées par Inklee."
          : "Ta réservation est confirmée immédiatement. Tes infos ne sont jamais stockées par Inklee."}
      </p>
    </form>
  );
}
