"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const signupSchema = z.object({
  fullName: z.string().min(2, "Nom complet requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
});

export type SignupState = {
  error?: string;
  fieldErrors?: { fullName?: string; email?: string; password?: string };
};

export async function signup(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: SignupState["fieldErrors"] = {};
    parsed.error.issues.forEach((issue) => {
      const key = issue.path[0] as "fullName" | "email" | "password";
      fieldErrors[key] = issue.message;
    });
    return { fieldErrors };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");

  // Si la confirmation email est activée côté Supabase, signUp ne crée pas de
  // session : on envoie l'utilisateur sur une page "vérifie tes mails" au lieu
  // de le rediriger vers /onboarding (où le middleware le renverrait au login).
  if (!data.session) {
    redirect("/check-email");
  }

  redirect("/onboarding");
}
