"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS } from "@/lib/plans";

export type UploadResult = { error?: string; uploaded?: number };

export async function uploadPortfolioImages(formData: FormData): Promise<UploadResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { data: studio } = await supabase
    .from("studios")
    .select("id, plan_tier")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!studio) return { error: "Studio introuvable." };

  // Gate plan
  if (!PLANS[studio.plan_tier].features.portfolio) {
    return { error: "Le portfolio est une feature Pro. Mets à niveau ton abonnement." };
  }

  // Compte les images actuelles pour respecter la limite
  const { count: existingCount } = await supabase
    .from("portfolio_images")
    .select("*", { count: "exact", head: true })
    .eq("studio_id", studio.id);

  const maxImages = PLANS[studio.plan_tier].limits.maxPortfolioImages;
  const slotsAvailable = Math.max(0, maxImages - (existingCount ?? 0));

  const files = formData.getAll("images") as File[];
  const validFiles = files.filter(
    (f) => f && f.size > 0 && f.size < 10 * 1024 * 1024 && f.type.startsWith("image/")
  );

  if (validFiles.length === 0) return { error: "Aucune image valide." };
  if (slotsAvailable === 0) {
    return { error: `Tu as atteint la limite de ${maxImages} images pour ton plan.` };
  }

  const toUpload = validFiles.slice(0, slotsAvailable);
  const admin = createAdminClient();

  // Position de départ pour les nouvelles
  const { data: maxPosRow } = await admin
    .from("portfolio_images")
    .select("position")
    .eq("studio_id", studio.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  let position = (maxPosRow?.position ?? -1) + 1;

  let uploaded = 0;
  for (const file of toUpload) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const storagePath = `${studio.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadErr } = await admin.storage
      .from("portfolio-images")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });
    if (uploadErr) {
      console.error("[portfolio] upload failed", uploadErr);
      continue;
    }
    const { data: pub } = admin.storage
      .from("portfolio-images")
      .getPublicUrl(storagePath);

    const { error: insertErr } = await admin.from("portfolio_images").insert({
      studio_id: studio.id,
      image_url: pub.publicUrl,
      storage_path: storagePath,
      position,
    });
    if (!insertErr) {
      uploaded++;
      position++;
    }
  }

  revalidatePath("/dashboard/portfolio");
  return { uploaded };
}

export async function deletePortfolioImage(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string") return;

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

  const admin = createAdminClient();
  // Charge l'image pour ownership + storage_path
  const { data: image } = await admin
    .from("portfolio_images")
    .select("studio_id, storage_path")
    .eq("id", id)
    .maybeSingle();
  if (!image || image.studio_id !== studio.id) return;

  await admin.storage.from("portfolio-images").remove([image.storage_path]);
  await admin.from("portfolio_images").delete().eq("id", id);

  revalidatePath("/dashboard/portfolio");
}
