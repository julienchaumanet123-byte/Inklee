"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateClientNotes, type NotesState } from "./actions";

const initialState: NotesState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "…" : "Enregistrer"}
    </Button>
  );
}

export function NotesForm({
  clientId,
  initialNotes,
}: {
  clientId: string;
  initialNotes: string | null;
}) {
  const [state, formAction] = useFormState(updateClientNotes, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={clientId} />
      <Textarea
        name="notes"
        rows={8}
        defaultValue={initialNotes ?? ""}
        placeholder="Allergies, peau sensible, projets futurs, info utile…"
      />
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs">
          {state.success && <span className="text-emerald-400">Sauvegardé</span>}
          {state.error && <span className="text-destructive">{state.error}</span>}
        </div>
        <SubmitButton />
      </div>
    </form>
  );
}
