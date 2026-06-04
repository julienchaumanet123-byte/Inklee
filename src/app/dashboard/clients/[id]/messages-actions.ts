"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const sendSchema = z.object({
  clientId: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
});

export async function sendStudioMessage(formData: FormData) {
  const parsed = sendSchema.safeParse({
    clientId: formData.get("clientId"),
    body: formData.get("body"),
  });
  if (!parsed.success) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Vérifie que ce client appartient à un studio du user courant
  const { data: client } = await supabase
    .from("clients")
    .select("id, studio_id")
    .eq("id", parsed.data.clientId)
    .maybeSingle();
  if (!client) return;

  const { data: studio } = await supabase
    .from("studios")
    .select("id")
    .eq("id", client.studio_id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!studio) return;

  await supabase.from("messages").insert({
    studio_id: client.studio_id,
    client_id: client.id,
    sender: "studio",
    body: parsed.data.body,
  });

  revalidatePath(`/dashboard/clients/${client.id}`);
  revalidatePath(`/dashboard`);
}

export async function markClientMessagesRead(clientId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: client } = await supabase
    .from("clients")
    .select("id, studio_id")
    .eq("id", clientId)
    .maybeSingle();
  if (!client) return;

  const { data: studio } = await supabase
    .from("studios")
    .select("id")
    .eq("id", client.studio_id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!studio) return;

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("client_id", clientId)
    .eq("sender", "client")
    .is("read_at", null);

  revalidatePath(`/dashboard/clients/${clientId}`);
  revalidatePath(`/dashboard`);
}
