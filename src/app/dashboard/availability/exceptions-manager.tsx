"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addClosedException, removeException } from "./actions";
import { formatDate } from "@/lib/utils";

type Exception = {
  id: string;
  date: string;
  is_closed: boolean;
  reason: string | null;
};

export function ExceptionsManager({
  exceptions,
}: {
  exceptions: Exception[];
}) {
  const [pending, startTransition] = useTransition();

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      await addClosedException(formData);
      (document.getElementById("exception-form") as HTMLFormElement)?.reset();
    });
  }

  function handleRemove(id: string) {
    const formData = new FormData();
    formData.set("id", id);
    startTransition(async () => {
      await removeException(formData);
    });
  }

  return (
    <div className="space-y-5">
      <form id="exception-form" action={handleAdd} className="flex flex-col sm:flex-row gap-3">
        <div className="space-y-1.5 flex-1">
          <Label htmlFor="ex-date">Date</Label>
          <Input
            id="ex-date"
            name="date"
            type="date"
            required
            min={new Date().toISOString().slice(0, 10)}
          />
        </div>
        <div className="space-y-1.5 flex-1">
          <Label htmlFor="ex-reason">Raison (optionnel)</Label>
          <Input
            id="ex-reason"
            name="reason"
            placeholder="Vacances, congés…"
            maxLength={100}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={pending}>
            Marquer fermé
          </Button>
        </div>
      </form>

      {exceptions.length === 0 ? (
        <p className="text-sm text-ink-400 text-center py-4">
          Aucune fermeture programmée.
        </p>
      ) : (
        <ul className="divide-y divide-ink-800/50 border border-ink-800 rounded-lg">
          {exceptions.map((ex) => (
            <li
              key={ex.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <div className="text-sm font-medium text-foreground">
                  {formatDate(ex.date)}
                </div>
                {ex.reason && (
                  <div className="text-xs text-ink-400">{ex.reason}</div>
                )}
              </div>
              <button
                onClick={() => handleRemove(ex.id)}
                disabled={pending}
                className="p-1.5 rounded hover:bg-red-500/10 text-ink-400 hover:text-red-400 transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
