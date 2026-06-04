import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, Mail, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: studio } = await supabase
    .from("studios")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!studio) redirect("/onboarding");

  const { data: clients } = await supabase
    .from("clients")
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      created_at,
      appointments(id, starts_at, status)
    `)
    .eq("studio_id", studio.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 md:p-10 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-1">Clients</h1>
        <p className="text-ink-300">
          {clients?.length ?? 0} client{(clients?.length ?? 0) > 1 ? "s" : ""} dans
          ta base.
        </p>
      </div>

      {!clients || clients.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-ink-700" />
            <p className="text-ink-300 mb-2">Aucun client pour le moment.</p>
            <p className="text-sm text-ink-400">
              Les clients sont créés automatiquement à chaque nouvelle réservation.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-ink-800/50">
            {clients.map((c) => {
              const appts = c.appointments ?? [];
              const lastAppt = appts
                .map((a) => new Date(a.starts_at))
                .sort((a, b) => b.getTime() - a.getTime())[0];
              return (
                <Link
                  key={c.id}
                  href={`/dashboard/clients/${c.id}`}
                  className="block hover:bg-ink-900/40 transition-colors"
                >
                  <div className="px-6 py-4 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 sm:col-span-4">
                      <div className="font-medium text-foreground">
                        {c.first_name} {c.last_name}
                      </div>
                      <div className="text-xs text-ink-400 sm:hidden mt-1">
                        {c.email}
                      </div>
                    </div>
                    <div className="hidden sm:flex sm:col-span-4 items-center gap-2 text-sm text-ink-300">
                      <Mail className="w-3 h-3" /> {c.email}
                    </div>
                    <div className="hidden sm:flex sm:col-span-2 items-center gap-2 text-sm text-ink-400">
                      {c.phone && (
                        <>
                          <Phone className="w-3 h-3" /> {c.phone}
                        </>
                      )}
                    </div>
                    <div className="col-span-12 sm:col-span-2 sm:text-right text-xs text-ink-400">
                      {appts.length} RDV
                      {lastAppt && (
                        <div className="text-ink-500">
                          Dernier : {formatDate(lastAppt)}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
