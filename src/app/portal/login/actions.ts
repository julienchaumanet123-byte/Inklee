"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
});

export type PortalLoginState = {
  error?: string;
  success?: boolean;
  fieldErrors?: { email?: string };
};

export async function sendMagicLink(
  _prev: PortalLoginState,
  formData: FormData
): Promise<PortalLoginState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { fieldErrors: { email: parsed.error.issues[0]?.message } };
  }

  const supabase = createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback?next=/portal`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
