"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const profileSchema = z.object({
  firstName: z.string().min(1, "Prénom requis").max(50),
  lastName: z.string().min(1, "Nom requis").max(50),
  phone: z.string().max(30).optional(),
});

export type ProfileState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Partial<Record<keyof z.infer<typeof profileSchema>, string>>;
};

export async function updateClientProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const parsed = profileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    const fieldErrors: ProfileState["fieldErrors"] = {};
    parsed.error.issues.forEach((issue) => {
      const key = issue.path[0] as keyof z.infer<typeof profileSchema>;
      fieldErrors[key] = issue.message;
    });
    return { fieldErrors };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  // Update toutes les fiches client liées à cet utilisateur (across studios)
  const admin = createAdminClient();
  const { error } = await admin
    .from("clients")
    .update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      phone: parsed.data.phone || null,
    })
    .eq("auth_user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/portal/profile");
  revalidatePath("/portal");
  return { success: true };
}
