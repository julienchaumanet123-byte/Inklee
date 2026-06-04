import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Crée silencieusement un compte auth.users pour un client si pas déjà
 * existant. Le trigger SQL lie automatiquement le compte aux fiches clients
 * partageant cet email.
 */
export async function ensureClientAuthUser(
  email: string,
  fullName: string
): Promise<string | null> {
  const supabase = createAdminClient();

  // Check si user existe déjà
  const { data: existingId } = await supabase.rpc("get_user_id_by_email", {
    p_email: email,
  });
  if (existingId && typeof existingId === "string") {
    return existingId;
  }

  // Crée sinon, avec mot de passe aléatoire (jamais utilisé — accès via magic link)
  const randomPassword = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
  const { data: created, error } = await supabase.auth.admin.createUser({
    email,
    password: randomPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: "client" },
  });

  if (error || !created.user) {
    console.error("[auth] ensureClientAuthUser failed", error);
    return null;
  }
  return created.user.id;
}

/**
 * Génère un magic link Supabase qui auto-connecte le user à son arrivée
 * sur l'URL. Utilisé pour auto-login après paiement booking.
 */
export async function generatePortalAccessLink(
  email: string,
  redirectTo: string
): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (error || !data.properties?.action_link) {
    console.error("[auth] generatePortalAccessLink failed", error);
    return null;
  }
  return data.properties.action_link;
}
