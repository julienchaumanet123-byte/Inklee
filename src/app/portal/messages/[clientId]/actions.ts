"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const sendSchema = z.object({
  clientId: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
});

export async function sendClientMessage(formData: FormData) {
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

  // Vérifie que le client appartient bien à cet user, et récupère le studio_id
  const admin = createAdminClient();
  const { data: client } = await admin
    .from("clients")
    .select("id, studio_id")
    .eq("id", parsed.data.clientId)
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!client) return;

  await admin.from("messages").insert({
    studio_id: client.studio_id,
    client_id: client.id,
    sender: "client",
    body: parsed.data.body,
  });

  revalidatePath(`/portal/messages/${client.id}`);
  revalidatePath(`/portal/messages`);
  revalidatePath(`/portal`);
}

export async function markStudioMessagesRead(clientId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const admin = createAdminClient();
  // Vérifie le ownership
  const { data: client } = await admin
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!client) return;

  await admin
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("client_id", clientId)
    .eq("sender", "studio")
    .is("read_at", null);

  revalidatePath(`/portal/messages/${clientId}`);
  revalidatePath(`/portal/messages`);
  revalidatePath(`/portal`);
}
