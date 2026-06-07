"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDayShort } from "@/lib/availability";
import { cn } from "@/lib/utils";

type DayAvailability = {
  dateIso: string;
  slots: { iso: string; label: string }[];
};

export function SlotPicker({
  slug,
  availability,
}: {
  slug: string;
  availability: DayAvailability[];
}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(
    availability.find((d) => d.slots.length > 0)?.dateIso ?? null
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const currentDay = availability.find((d) => d.dateIso === selectedDate);

  function continueToBooking() {
    if (!selectedSlot) return;
    router.push(`/${slug}/booking?slot=${encodeURIComponent(selectedSlot)}`);
  }

  return (
    <div className="space-y-8">
      {/* Date selector */}
      <div>
        <h3 className="text-sm font-medium text-ink-200 mb-3">Choisis un jour</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {availability.map((day) => {
            const d = new Date(day.dateIso);
            const f = formatDayShort(d);
            const isSelected = day.dateIso === selectedDate;
            const isDisabled = day.slots.length === 0;
            return (
              <button
                key={day.dateIso}
                onClick={() => {
                  if (isDisabled) return;
                  setSelectedDate(day.dateIso);
                  setSelectedSlot(null);
                }}
                disabled={isDisabled}
                className={cn(
                  "flex flex-col items-center justify-center shrink-0 w-16 h-20 rounded-lg border text-center transition-all",
                  isSelected
                    ? "border-gold bg-gold/10 text-gold"
                    : isDisabled
                    ? "border-ink-800 bg-ink-900/30 text-ink-600 cursor-not-allowed"
                    : "border-ink-700 bg-ink-900/50 text-ink-100 hover:border-ink-600"
                )}
              >
                <span className="text-xs uppercase">{f.weekday}</span>
                <span className="text-2xl font-bold leading-tight">{f.day}</span>
                <span className="text-xs">{f.month}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slot selector */}
      <div>
        <h3 className="text-sm font-medium text-ink-200 mb-3">Choisis ton créneau</h3>
        {currentDay && currentDay.slots.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {currentDay.slots.map((slot) => {
              const isSelected = slot.iso === selectedSlot;
              return (
                <button
                  key={slot.iso}
                  onClick={() => setSelectedSlot(slot.iso)}
                  className={cn(
                    "h-12 rounded-md border text-sm font-medium transition-all",
                    isSelected
                      ? "border-gold bg-gold text-ink-950"
                      : "border-ink-700 bg-ink-900/50 hover:border-gold/50 hover:bg-ink-900"
                  )}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-ink-400 border border-ink-800 rounded-lg">
            Aucun créneau disponible ce jour-là.
          </div>
        )}
      </div>

      {/* CTA — sticky en bas pour rester accessible après le choix du créneau */}
      <div className="sticky bottom-4 z-20 pt-2">
        <Button
          size="xl"
          className="w-full shadow-lg shadow-black/40"
          disabled={!selectedSlot}
          onClick={continueToBooking}
        >
          Continuer
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
