import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Client Supabase avec service_role — bypass RLS.
 * À utiliser UNIQUEMENT côté serveur (server actions, route handlers)
 * pour les opérations qui doivent fonctionner sans utilisateur authentifié
 * (ex: création d'un appointment depuis la page publique de résa).
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
