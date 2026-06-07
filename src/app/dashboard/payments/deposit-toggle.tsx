"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateDepositRequired } from "./actions";

function SavingHint() {
  const { pending } = useFormStatus();
  return (
    <span className="text-xs text-ink-400">
      {pending ? "Enregistrement…" : "Enregistré automatiquement"}
    </span>
  );
}

export function DepositToggle({
  depositRequired,
}: {
  depositRequired: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Acompte à la réservation</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={updateDepositRequired}>
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <span>
              <span className="block text-sm font-medium">
                Demander un acompte pour réserver
              </span>
              <span className="block text-xs text-ink-400 mt-0.5">
                Activé : le client paie un acompte en ligne (nécessite Stripe
                configuré). Désactivé : réservation immédiate sans paiement.
              </span>
            </span>
            <span className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-ink-700 transition-colors has-[:checked]:bg-emerald-500/80">
              <input
                type="checkbox"
                name="depositRequired"
                defaultChecked={depositRequired}
                onChange={() => formRef.current?.requestSubmit()}
                className="peer sr-only"
              />
              <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
            </span>
          </label>
          <div className="mt-3">
            <SavingHint />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
