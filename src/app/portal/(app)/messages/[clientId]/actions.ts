"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const sendSchema = z.object({
  clientId: z.string().uuid(),
  body: z.string().trim().max(2000),
});

export type Attachment = { url: string; type: string };

export async function sendClientMessage(formData: FormData) {
  const parsed = sendSchema.safeParse({
    clientId: formData.get("clientId"),
    body: (formData.get("body") as string | null) ?? "",
  });
  if (!parsed.success) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const admin = createAdminClient();
  const { data: client } = await admin
    .from("clients")
    .select("id, studio_id")
    .eq("id", parsed.data.clientId)
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!client) return;

  // Upload des éventuels fichiers joints
  const attachments: Attachment[] = [];
  const files = formData.getAll("attachments") as File[];
  for (const file of files) {
    if (!file || file.size === 0 || file.size > 10 * 1024 * 1024) continue;
    if (!file.type.startsWith("image/")) continue;

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${client.studio_id}/${client.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadErr } = await admin.storage
      .from("chat-attachments")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadErr) {
      console.error("[chat] upload failed", uploadErr);
      continue;
    }
    const { data: pub } = admin.storage
      .from("chat-attachments")
      .getPublicUrl(path);
    attachments.push({ url: pub.publicUrl, type: file.type });
  }

  // Si pas de body ET pas d'attachements, on n'envoie rien
  if (!parsed.data.body.trim() && attachments.length === 0) return;

  await admin.from("messages").insert({
    studio_id: client.studio_id,
    client_id: client.id,
    sender: "client",
    body: parsed.data.body || (attachments.length > 0 ? "📎" : ""),
    attachments,
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
