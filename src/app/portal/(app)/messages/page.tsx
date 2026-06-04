import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageCircle, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientsForAuthUser } from "@/lib/portal-data";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function PortalMessagesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const clients = await getClientsForAuthUser(user.id);

  // Si un seul studio, redirige direct vers le chat
  if (clients.length === 1) {
    redirect(`/portal/messages/${clients[0].id}`);
  }

  // Pour chaque studio, charge le dernier message + nb non lus
  const admin = createAdminClient();
  const previews = await Promise.all(
    clients.map(async (c) => {
      const [{ data: lastMsg }, { count: unread }] = await Promise.all([
        admin
          .from("messages")
          .select("body, created_at, sender")
          .eq("client_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        admin
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("client_id", c.id)
          .eq("sender", "studio")
          .is("read_at", null),
      ]);
      return { client: c, lastMsg, unread: unread ?? 0 };
    })
  );

  return (
    <div className="container max-w-2xl py-8 px-4">
      <h1 className="font-display text-3xl font-bold mb-6">Messages</h1>

      {previews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-ink-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-ink-700" />
            <p>Aucune conversation pour l'instant.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {previews.map(({ client, lastMsg, unread }) => (
            <Link
              key={client.id}
              href={`/portal/messages/${client.id}`}
              className="block rounded-xl border border-ink-800 bg-ink-900/40 p-4 hover:border-ink-700 hover:bg-ink-900/60 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-foreground truncate">
                      {client.studio.name}
                    </div>
                    {unread > 0 && (
                      <span className="min-w-5 h-5 rounded-full bg-white text-ink-950 text-xs font-bold flex items-center justify-center px-1.5">
                        {unread}
                      </span>
                    )}
                  </div>
                  {lastMsg && (
                    <div className="text-sm text-ink-400 truncate mt-0.5">
                      {lastMsg.sender === "client" ? "Toi : " : ""}
                      {lastMsg.body}
                    </div>
                  )}
                  {!lastMsg && (
                    <div className="text-sm text-ink-500 italic mt-0.5">
                      Aucun message — écris le premier
                    </div>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-ink-500 shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
