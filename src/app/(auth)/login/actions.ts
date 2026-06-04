"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
});

export type LoginState = {
  error?: string;
  fieldErrors?: { email?: string; password?: string };
};

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: LoginState["fieldErrors"] = {};
    parsed.error.issues.forEach((issue) => {
      const key = issue.path[0] as "email" | "password";
      fieldErrors[key] = issue.message;
    });
    return { fieldErrors };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Email ou mot de passe incorrect." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
