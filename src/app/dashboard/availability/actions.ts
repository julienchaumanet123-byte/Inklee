"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const timeRangeSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
}).refine((r) => r.start < r.end, { message: "Heure de fin > heure de début" });

const weeklySchema = z.object({
  appointmentDurationMin: z.coerce.number().min(15).max(480),
  bookingHorizonDays: z.coerce.number().min(1).max(180),
  bookingMinLeadHours: z.coerce.number().min(0).max(720),
  days: z
    .array(
      z.object({
        day_of_week: z.coerce.number().int().min(0).max(6),
        is_open: z.coerce.boolean(),
        ranges: z.array(timeRangeSchema),
      })
    )
    .length(7),
});

export type AvailabilityState = {
  error?: string;
  success?: boolean;
};

export async function updateAvailability(
  _prev: AvailabilityState,
  formData: FormData
): Promise<AvailabilityState> {
  // Reconstruit le payload depuis FormData
  const raw = {
    appointmentDurationMin: formData.get("appointmentDurationMin"),
    bookingHorizonDays: formData.get("bookingHorizonDays"),
    bookingMinLeadHours: formData.get("bookingMinLeadHours"),
    days: Array.from({ length: 7 }, (_, dow) => ({
      day_of_week: dow,
      is_open: formData.get(`day_${dow}_open`) === "on",
      ranges: parseRanges(formData, dow),
    })),
  };

  const parsed = weeklySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { data: studio } = await supabase
    .from("studios")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!studio) return { error: "Studio introuvable." };

  // Update studio settings
  await supabase
    .from("studios")
    .update({
      appointment_duration_min: parsed.data.appointmentDurationMin,
      booking_horizon_days: parsed.data.bookingHorizonDays,
      booking_min_lead_hours: parsed.data.bookingMinLeadHours,
    })
    .eq("id", studio.id);

  // Upsert each day rule
  for (const day of parsed.data.days) {
    await supabase
      .from("availability_rules")
      .upsert(
        {
          studio_id: studio.id,
          day_of_week: day.day_of_week,
          is_open: day.is_open,
          ranges: day.ranges,
        },
        { onConflict: "studio_id,day_of_week" }
      );
  }

  revalidatePath("/dashboard/availability");
  return { success: true };
}

function parseRanges(formData: FormData, dow: number): Array<{ start: string; end: string }> {
  const ranges: Array<{ start: string; end: string }> = [];
  // On supporte 2 ranges max par jour (matin/après-midi)
  for (let i = 0; i < 2; i++) {
    const start = formData.get(`day_${dow}_start_${i}`);
    const end = formData.get(`day_${dow}_end_${i}`);
    if (typeof start === "string" && typeof end === "string" && start && end) {
      ranges.push({ start, end });
    }
  }
  return ranges;
}

// ============ Exceptions ============

const exceptionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(100).optional(),
});

export async function addClosedException(formData: FormData) {
  const parsed = exceptionSchema.safeParse({
    date: formData.get("date"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: studio } = await supabase
    .from("studios")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!studio) return;

  await supabase.from("availability_exceptions").upsert(
    {
      studio_id: studio.id,
      date: parsed.data.date,
      is_closed: true,
      ranges: null,
      reason: parsed.data.reason || null,
    },
    { onConflict: "studio_id,date" }
  );

  revalidatePath("/dashboard/availability");
}

export async function removeException(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string") return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("availability_exceptions").delete().eq("id", id);
  revalidatePath("/dashboard/availability");
}
