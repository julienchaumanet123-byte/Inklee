"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const settingsSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  city: z.string().optional(),
  bio: z.string().max(500, "Max 500 caractères").optional(),
  specialty: z.enum(["tattoo", "piercing", "both"]),
  depositAmount: z.coerce.number().min(0, "Doit être positif").max(10000),
  depositRequired: z.preprocess((v) => v === "on", z.boolean()),
  address: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
  instagramHandle: z.string().max(50).optional(),
  websiteUrl: z.string().max(200).optional().refine(
    (v) => !v || /^https?:\/\//.test(v),
    "Doit commencer par https:// ou http://"
  ),
});

export type SettingsState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Partial<Record<keyof z.infer<typeof settingsSchema>, string>>;
};

export async function updateStudio(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const parsed = settingsSchema.safeParse({
    name: formData.get("name"),
    city: formData.get("city"),
    bio: formData.get("bio"),
    specialty: formData.get("specialty"),
    depositAmount: formData.get("depositAmount"),
    depositRequired: formData.get("depositRequired"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    instagramHandle: formData.get("instagramHandle"),
    websiteUrl: formData.get("websiteUrl"),
  });

  if (!parsed.success) {
    const fieldErrors: SettingsState["fieldErrors"] = {};
    parsed.error.issues.forEach((issue) => {
      const key = issue.path[0] as keyof z.infer<typeof settingsSchema>;
      fieldErrors[key] = issue.message;
    });
    return { fieldErrors };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("studios")
    .update({
      name: parsed.data.name,
      city: parsed.data.city || null,
      bio: parsed.data.bio || null,
      specialty: parsed.data.specialty,
      deposit_amount: parsed.data.depositAmount,
      deposit_required: parsed.data.depositRequired,
      address: parsed.data.address || null,
      phone: parsed.data.phone || null,
      instagram_handle:
        parsed.data.instagramHandle?.replace(/^@/, "") || null,
      website_url: parsed.data.websiteUrl || null,
    })
    .eq("owner_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
