import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ChatThread } from "./chat-thread";
import { markStudioMessagesRead } from "./actions";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: {
  params: { clientId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const admin = createAdminClient();
  const { data: client } = await admin
    .from("clients")
    .select(`
      id, first_name, last_name, studio_id,
      studios (id, name, slug, city)
    `)
    .eq("id", params.clientId)
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!client) notFound();
  const studio = Array.isArray(client.studios) ? client.studios[0] : client.studios;
  if (!studio) notFound();

  // Marque les messages studio comme lus en arrivant sur la conversation
  await markStudioMessagesRead(client.id);

  const { data: messages } = await admin
    .from("messages")
    .select("id, sender, body, created_at")
    .eq("client_id", client.id)
    .order("created_at", { ascending: true });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem-4rem)]">
      {/* Header */}
      <div className="border-b border-ink-800/60 px-4 py-3 flex items-center gap-3">
        <Link
          href="/portal/messages"
          className="p-2 -ml-2 rounded-md hover:bg-ink-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-ink-300" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-foreground truncate">{studio.name}</div>
          {studio.city && (
            <div className="flex items-center gap-1 text-xs text-ink-400">
              <MapPin className="w-3 h-3" /> {studio.city}
            </div>
          )}
        </div>
      </div>

      <ChatThread
        clientId={client.id}
        initialMessages={messages ?? []}
        studioName={studio.name}
      />
    </div>
  );
}
