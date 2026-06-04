"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendBookingCancelledToClient } from "@/lib/email/send";

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "no_show"]),
});

export async function updateAppointmentStatus(formData: FormData) {
  const parsed = updateStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  const supabase = createClient();
  await supabase
    .from("appointments")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);

  // Notification client uniquement quand on passe à "cancelled"
  if (parsed.data.status === "cancelled") {
    await sendBookingCancelledToClient(parsed.data.id);
  }

  revalidatePath(`/dashboard/appointments/${parsed.data.id}`);
  revalidatePath("/dashboard/agenda");
  revalidatePath("/dashboard");
}

export async function deleteAppointment(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string") return;

  const supabase = createClient();
  await supabase.from("appointments").delete().eq("id", id);

  revalidatePath("/dashboard/agenda");
  revalidatePath("/dashboard");
  redirect("/dashboard/agenda");
}
