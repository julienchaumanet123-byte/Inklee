"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateAvailability, type AvailabilityState } from "./actions";
import type { TimeRange } from "@/lib/availability";

type DayRule = {
  day_of_week: number;
  label: string;
  is_open: boolean;
  ranges: TimeRange[];
};

type LocalDay = DayRule & { ranges: TimeRange[] };

const initialState: AvailabilityState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Enregistrement…" : "Enregistrer mes horaires"}
    </Button>
  );
}

export function AvailabilityForm({
  rules,
  durationMin,
  horizonDays,
  leadHours,
}: {
  rules: DayRule[];
  durationMin: number;
  horizonDays: number;
  leadHours: number;
}) {
  const [state, formAction] = useFormState(updateAvailability, initialState);
  const [days, setDays] = useState<LocalDay[]>(() =>
    rules.map((r) => ({ ...r, ranges: r.ranges.length > 0 ? r.ranges : defaultRanges() }))
  );

  function toggleDay(dow: number) {
    setDays((prev) =>
      prev.map((d) => (d.day_of_week === dow ? { ...d, is_open: !d.is_open } : d))
    );
  }

  function updateRange(dow: number, idx: number, field: "start" | "end", value: string) {
    setDays((prev) =>
      prev.map((d) => {
        if (d.day_of_week !== dow) return d;
        const ranges = [...d.ranges];
        ranges[idx] = { ...ranges[idx], [field]: value };
        return { ...d, ranges };
      })
    );
  }

  function addRange(dow: number) {
    setDays((prev) =>
      prev.map((d) => {
        if (d.day_of_week !== dow || d.ranges.length >= 2) return d;
        return { ...d, ranges: [...d.ranges, { start: "14:00", end: "18:00" }] };
      })
    );
  }

  function removeRange(dow: number, idx: number) {
    setDays((prev) =>
      prev.map((d) => {
        if (d.day_of_week !== dow) return d;
        return { ...d, ranges: d.ranges.filter((_, i) => i !== idx) };
      })
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Réglages généraux */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Réglages généraux</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="appointmentDurationMin">Durée d'un RDV</Label>
            <div className="flex items-center gap-2">
              <Input
                id="appointmentDurationMin"
                name="appointmentDurationMin"
                type="number"
                min="15"
                max="480"
                step="15"
                defaultValue={durationMin}
                required
              />
              <span className="text-sm text-ink-400">min</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bookingHorizonDays">Visibilité agenda</Label>
            <div className="flex items-center gap-2">
              <Input
                id="bookingHorizonDays"
                name="bookingHorizonDays"
                type="number"
                min="1"
                max="180"
                defaultValue={horizonDays}
                required
              />
              <span className="text-sm text-ink-400">jours</span>
            </div>
            <p className="text-[11px] text-ink-500">
              Combien de jours d'avance le client peut réserver
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bookingMinLeadHours">Délai minimum</Label>
            <div className="flex items-center gap-2">
              <Input
                id="bookingMinLeadHours"
                name="bookingMinLeadHours"
                type="number"
                min="0"
                max="720"
                defaultValue={leadHours}
                required
              />
              <span className="text-sm text-ink-400">h</span>
            </div>
            <p className="text-[11px] text-ink-500">
              Avant un RDV, délai mini pour réserver
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Semaine type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Semaine type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {days.map((d) => (
            <div
              key={d.day_of_week}
              className={`rounded-lg border p-4 transition-colors ${
                d.is_open ? "border-ink-700 bg-ink-900/40" : "border-ink-800 bg-ink-900/20"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name={`day_${d.day_of_week}_open`}
                    checked={d.is_open}
                    onChange={() => toggleDay(d.day_of_week)}
                    className="w-4 h-4 accent-white"
                  />
                  <span className="font-medium text-foreground">{d.label}</span>
                </label>
                {!d.is_open && (
                  <span className="text-xs text-ink-500">Fermé</span>
                )}
              </div>

              {d.is_open && (
                <div className="space-y-2">
                  {d.ranges.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        type="time"
                        name={`day_${d.day_of_week}_start_${i}`}
                        value={r.start}
                        onChange={(e) =>
                          updateRange(d.day_of_week, i, "start", e.target.value)
                        }
                        className="w-32"
                      />
                      <span className="text-ink-400 text-sm">→</span>
                      <Input
                        type="time"
                        name={`day_${d.day_of_week}_end_${i}`}
                        value={r.end}
                        onChange={(e) =>
                          updateRange(d.day_of_week, i, "end", e.target.value)
                        }
                        className="w-32"
                      />
                      {d.ranges.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRange(d.day_of_week, i)}
                          className="ml-1 p-1.5 rounded hover:bg-ink-800 text-ink-400 hover:text-red-400 transition-colors"
                          title="Supprimer ce créneau"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {d.ranges.length < 2 && (
                    <button
                      type="button"
                      onClick={() => addRange(d.day_of_week)}
                      className="text-xs text-ink-300 hover:text-foreground flex items-center gap-1 mt-2"
                    >
                      <Plus className="w-3 h-3" />
                      Ajouter une plage (ex: après-midi)
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {state.error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          Tes horaires sont sauvegardés ✓
        </div>
      )}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}

function defaultRanges(): TimeRange[] {
  return [{ start: "10:00", end: "18:00" }];
}
