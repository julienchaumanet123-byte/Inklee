"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const updateNotesSchema = z.object({
  id: z.string().uuid(),
  notes: z.string().max(2000).optional(),
});

export type NotesState = { success?: boolean; error?: string };

export async function updateClientNotes(
  _prev: NotesState,
  formData: FormData
): Promise<NotesState> {
  const parsed = updateNotesSchema.safeParse({
    id: formData.get("id"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: "Données invalides." };

  const supabase = createClient();
  const { error } = await supabase
    .from("clients")
    .update({ notes: parsed.data.notes || null })
    .eq("id", parsed.data.id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/clients/${parsed.data.id}`);
  return { success: true };
}
