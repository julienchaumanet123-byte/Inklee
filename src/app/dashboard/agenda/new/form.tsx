"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createManualAppointment, type NewApptState } from "./actions";

const initialState: NewApptState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Création…" : "Créer le rendez-vous"}
    </Button>
  );
}

function defaultDate() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function NewAppointmentForm() {
  const [state, formAction] = useFormState(createManualAppointment, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-wider text-ink-400 mb-3">Client</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input id="firstName" name="firstName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input id="lastName" name="lastName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
            {state.fieldErrors?.email && (
              <p className="text-xs text-destructive">{state.fieldErrors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" name="phone" type="tel" />
          </div>
        </div>
        <p className="text-xs text-ink-400 mt-2">
          Si le client existe déjà (même email), sa fiche sera mise à jour.
        </p>
      </div>

      <div className="border-t border-ink-800 pt-6">
        <div className="text-xs uppercase tracking-wider text-ink-400 mb-3">Créneau</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={defaultDate()}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Heure</Label>
            <Input
              id="time"
              name="time"
              type="time"
              defaultValue="14:00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="durationMin">Durée (min)</Label>
            <Input
              id="durationMin"
              name="durationMin"
              type="number"
              min="15"
              step="15"
              defaultValue={60}
              required
            />
          </div>
        </div>
      </div>

      <div className="border-t border-ink-800 pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="projectDescription">Description du projet</Label>
          <Textarea
            id="projectDescription"
            name="projectDescription"
            rows={3}
            placeholder="Style, taille, emplacement…"
          />
        </div>

        <div className="space-y-2">
          <Label>Acompte</Label>
          <div className="grid grid-cols-2 gap-2">
            <label className="cursor-pointer rounded-md border border-ink-700 bg-ink-900/50 p-3 text-center text-sm transition-all has-[:checked]:border-white has-[:checked]:bg-white/5 hover:border-ink-600">
              <input
                type="radio"
                name="depositPaid"
                value="yes"
                className="sr-only"
                defaultChecked
              />
              Reçu (en main propre)
            </label>
            <label className="cursor-pointer rounded-md border border-ink-700 bg-ink-900/50 p-3 text-center text-sm transition-all has-[:checked]:border-white has-[:checked]:bg-white/5 hover:border-ink-600">
              <input type="radio" name="depositPaid" value="no" className="sr-only" />
              Pas encore versé
            </label>
          </div>
        </div>
      </div>

      {state.error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
