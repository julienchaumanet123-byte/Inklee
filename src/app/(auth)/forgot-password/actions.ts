"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email("Email invalide"),
});

export type ForgotState = {
  error?: string;
  sent?: boolean;
  fieldErrors?: { email?: string };
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function requestReset(
  _prev: ForgotState,
  formData: FormData
): Promise<ForgotState> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { fieldErrors: { email: parsed.error.issues[0]?.message } };
  }

  const supabase = createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${APP_URL}/auth/callback?next=/reset-password`,
  });

  // On répond toujours "envoyé", qu'un compte existe ou non, pour ne pas
  // révéler quels emails sont inscrits.
  return { sent: true };
}
