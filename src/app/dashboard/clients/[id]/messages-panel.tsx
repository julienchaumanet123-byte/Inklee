"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { sendStudioMessage } from "./messages-actions";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender: "client" | "studio";
  body: string;
  created_at: string;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessagesPanel({
  clientId,
  initialMessages,
  clientName,
  clientHasAuth,
}: {
  clientId: string;
  initialMessages: Message[];
  clientName: string;
  clientHasAuth: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const supabase = createClient();
    const interval = setInterval(async () => {
      const lastCreated =
        messages[messages.length - 1]?.created_at ?? "1970-01-01";

      const { data } = await supabase
        .from("messages")
        .select("id, sender, body, created_at")
        .eq("client_id", clientId)
        .gt("created_at", lastCreated)
        .order("created_at", { ascending: true });

      if (data && data.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const fresh = data.filter((m) => !existingIds.has(m.id));
          if (fresh.length === 0) return prev;
          return [...prev, ...fresh];
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [clientId, messages]);

  function send() {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        sender: "studio",
        body,
        created_at: new Date().toISOString(),
      },
    ]);
    const formData = new FormData();
    formData.set("clientId", clientId);
    formData.set("body", body);
    startTransition(async () => {
      await sendStudioMessage(formData);
    });
  }

  return (
    <div className="flex flex-col h-[500px]">
      {!clientHasAuth && (
        <div className="text-xs px-3 py-2 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-200 mb-3">
          ⏳ {clientName} ne s'est pas encore connecté à son espace Inklee.
          Tes messages seront visibles dès qu'il se connecte avec son email.
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 pr-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-ink-400 py-12">
            <MessageCircle className="w-10 h-10 mb-2 text-ink-700" />
            <p className="text-sm">Pas encore de message avec {clientName}.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender === "studio";
            return (
              <div
                key={m.id}
                className={cn("flex", isMe ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3.5 py-2",
                    isMe
                      ? "bg-white text-ink-950 rounded-br-md"
                      : "bg-ink-800 text-foreground rounded-bl-md"
                  )}
                >
                  <div className="whitespace-pre-wrap text-sm">{m.body}</div>
                  <div
                    className={cn(
                      "text-[10px] mt-1 text-right",
                      isMe ? "text-ink-600" : "text-ink-400"
                    )}
                  >
                    {formatTime(m.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-ink-800/60 pt-3 mt-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Écris un message…"
            rows={1}
            className="resize-none min-h-[40px] py-2"
          />
          <Button
            size="icon"
            onClick={send}
            disabled={isPending || !draft.trim()}
            className="shrink-0 h-10 w-10"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
