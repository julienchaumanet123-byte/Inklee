"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  password: z.string().min(8, "8 caractères minimum"),
});

export type ResetState = {
  error?: string;
  fieldErrors?: { password?: string };
};

export async function updatePassword(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  const parsed = schema.safeParse({ password: formData.get("password") });
  if (!parsed.success) {
    return { fieldErrors: { password: parsed.error.issues[0]?.message } };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Le lien de réinitialisation établit une session "recovery" via le callback.
  // Sans elle, on ne peut pas changer le mot de passe.
  if (!user) {
    return {
      error:
        "Lien invalide ou expiré. Redemande un email de réinitialisation.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
