"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ImageUploadResult = { error?: string; url?: string };

type ImageKind = "avatar" | "cover";

const BUCKET: Record<ImageKind, string> = {
  avatar: "avatars",
  cover: "studio-covers",
};

async function uploadStudioImage(
  kind: ImageKind,
  formData: FormData
): Promise<ImageUploadResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Aucun fichier." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Le fichier doit être une image." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: "Image trop lourde (max 5 Mo)." };
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

  const admin = createAdminClient();
  const path = `${studio.id}/${kind}`;

  const { error: uploadErr } = await admin.storage
    .from(BUCKET[kind])
    .upload(path, file, { contentType: file.type, upsert: true });
  if (uploadErr) {
    console.error("[settings] image upload failed", uploadErr);
    return { error: "Échec de l'upload. Réessaie." };
  }

  const { data: pub } = admin.storage.from(BUCKET[kind]).getPublicUrl(path);
  // Cache-buster pour forcer le rafraîchissement après remplacement.
  const url = `${pub.publicUrl}?t=${Date.now()}`;

  // La photo/logo du studio est stockée dans logo_url, la bannière dans cover_url.
  const update: { logo_url?: string; cover_url?: string } = {};
  if (kind === "avatar") update.logo_url = url;
  else update.cover_url = url;

  const { error: dbErr } = await admin
    .from("studios")
    .update(update)
    .eq("id", studio.id);
  if (dbErr) return { error: dbErr.message };

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { url };
}

export async function uploadStudioAvatar(
  _prev: ImageUploadResult,
  formData: FormData
): Promise<ImageUploadResult> {
  return uploadStudioImage("avatar", formData);
}

export async function uploadStudioCover(
  _prev: ImageUploadResult,
  formData: FormData
): Promise<ImageUploadResult> {
  return uploadStudioImage("cover", formData);
}
