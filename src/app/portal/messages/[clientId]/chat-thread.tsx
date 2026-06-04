"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { sendClientMessage } from "./actions";
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

function shouldShowDate(prev: Message | undefined, current: Message) {
  if (!prev) return true;
  return (
    new Date(prev.created_at).toDateString() !==
    new Date(current.created_at).toDateString()
  );
}

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function ChatThread({
  clientId,
  initialMessages,
  studioName,
}: {
  clientId: string;
  initialMessages: Message[];
  studioName: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll en bas quand nouveau message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Polling toutes les 3s pour récupérer les nouveaux messages
  useEffect(() => {
    const supabase = createClient();
    const interval = setInterval(async () => {
      const lastId = messages[messages.length - 1]?.id;
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

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        sender: "client",
        body,
        created_at: new Date().toISOString(),
      },
    ]);

    const formData = new FormData();
    formData.set("clientId", clientId);
    formData.set("body", body);

    startTransition(async () => {
      await sendClientMessage(formData);
    });
  }

  return (
    <>
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
      >
        {messages.length === 0 ? (
          <div className="text-center text-ink-400 py-12">
            <p className="text-sm">
              Pas encore de message avec {studioName}.
            </p>
            <p className="text-xs mt-1">
              Envoie tes références, pose tes questions sur le projet…
            </p>
          </div>
        ) : (
          messages.map((m, i) => {
            const prev = messages[i - 1];
            const showDate = shouldShowDate(prev, m);
            const isMe = m.sender === "client";
            return (
              <div key={m.id}>
                {showDate && (
                  <div className="text-center my-4">
                    <span className="text-xs text-ink-500 bg-ink-900/60 px-3 py-1 rounded-full">
                      {formatDateLabel(m.created_at)}
                    </span>
                  </div>
                )}
                <div
                  className={cn(
                    "flex",
                    isMe ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2",
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
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="border-t border-ink-800/60 p-3 bg-ink-950/80 backdrop-blur-xl">
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
            className="resize-none min-h-[44px] py-2.5"
          />
          <Button
            size="icon"
            onClick={send}
            disabled={isPending || !draft.trim()}
            className="shrink-0 h-11 w-11"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
