import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Helpers de lecture pour le portail client. Utilise le service_role
 * car le client peut avoir des fiches dans plusieurs studios.
 */

export type PortalClient = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  studio: {
    id: string;
    name: string;
    slug: string;
    city: string | null;
  };
};

export async function getClientsForAuthUser(authUserId: string): Promise<PortalClient[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("clients")
    .select(`
      id, first_name, last_name, email, phone, studio_id,
      studios (id, name, slug, city)
    `)
    .eq("auth_user_id", authUserId);

  if (!data) return [];

  return data
    .map((c) => {
      const studio = Array.isArray(c.studios) ? c.studios[0] : c.studios;
      if (!studio) return null;
      return {
        id: c.id,
        first_name: c.first_name,
        last_name: c.last_name,
        email: c.email,
        phone: c.phone,
        studio: {
          id: studio.id,
          name: studio.name,
          slug: studio.slug,
          city: studio.city,
        },
      };
    })
    .filter((c): c is PortalClient => c !== null);
}

export async function getAppointmentsForAuthUser(authUserId: string) {
  const supabase = createAdminClient();
  const clients = await getClientsForAuthUser(authUserId);
  if (clients.length === 0) return [];

  const clientIds = clients.map((c) => c.id);
  const { data } = await supabase
    .from("appointments")
    .select("id, client_id, studio_id, starts_at, ends_at, status, project_description, deposit_paid, deposit_amount")
    .in("client_id", clientIds)
    .order("starts_at", { ascending: true });

  return data ?? [];
}

export async function getUnreadCountForAuthUser(authUserId: string) {
  const supabase = createAdminClient();
  const clients = await getClientsForAuthUser(authUserId);
  if (clients.length === 0) return 0;
  const clientIds = clients.map((c) => c.id);
  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .in("client_id", clientIds)
    .eq("sender", "studio")
    .is("read_at", null);
  return count ?? 0;
}
