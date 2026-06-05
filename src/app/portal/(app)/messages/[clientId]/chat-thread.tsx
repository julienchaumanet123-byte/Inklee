"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { sendClientMessage } from "./actions";
import { createClient } from "@/lib/supabase/client";

type Attachment = { url: string; type: string };

type Message = {
  id: string;
  sender: "client" | "studio";
  body: string;
  attachments?: Attachment[] | null;
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
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        .select("id, sender, body, attachments, created_at")
        .eq("client_id", clientId)
        .gt("created_at", lastCreated)
        .order("created_at", { ascending: true });

      if (data && data.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const fresh = data
            .filter((m) => !existingIds.has(m.id))
            .map((m) => ({
              ...m,
              attachments: m.attachments as Attachment[] | null,
            }));
          if (fresh.length === 0) return prev;
          return [...prev, ...fresh];
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [clientId, messages]);

  function send() {
    const body = draft.trim();
    if (!body && pendingFiles.length === 0) return;

    const formData = new FormData();
    formData.set("clientId", clientId);
    formData.set("body", body);
    for (const file of pendingFiles) {
      formData.append("attachments", file);
    }

    // Optimistic update (sans les attachments le temps de l'upload)
    const tempId = `temp-${Date.now()}`;
    if (body || pendingFiles.length > 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          sender: "client",
          body: body || (pendingFiles.length > 0 ? "📎 Envoi…" : ""),
          attachments: pendingFiles.length > 0 ? [] : null,
          created_at: new Date().toISOString(),
        },
      ]);
    }
    setDraft("");
    setPendingFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";

    startTransition(async () => {
      await sendClientMessage(formData);
    });
  }

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter((f) =>
      f.type.startsWith("image/")
    );
    setPendingFiles((prev) => [...prev, ...files].slice(0, 4));
  }

  function removePending(idx: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
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
            <p className="text-sm">Pas encore de message avec {studioName}.</p>
            <p className="text-xs mt-1">
              Envoie tes références, pose tes questions sur le projet…
            </p>
          </div>
        ) : (
          messages.map((m, i) => {
            const prev = messages[i - 1];
            const showDate = shouldShowDate(prev, m);
            const isMe = m.sender === "client";
            const hasImages = m.attachments && m.attachments.length > 0;
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
                  className={cn("flex", isMe ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl",
                      isMe
                        ? "bg-white text-ink-950 rounded-br-md"
                        : "bg-ink-800 text-foreground rounded-bl-md",
                      hasImages ? "p-1.5" : "px-4 py-2"
                    )}
                  >
                    {hasImages && (
                      <div className={cn(
                        "grid gap-1 mb-1.5",
                        m.attachments!.length > 1 ? "grid-cols-2" : "grid-cols-1"
                      )}>
                        {m.attachments!.map((att, idx) => (
                          <a
                            key={idx}
                            href={att.url}
                            target="_blank"
                            rel="noopener"
                            className="block aspect-square rounded-lg overflow-hidden bg-black/20"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={att.url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                    {m.body && m.body !== "📎" && (
                      <div className={cn(
                        "whitespace-pre-wrap text-sm",
                        hasImages && "px-2 pt-1"
                      )}>
                        {m.body}
                      </div>
                    )}
                    <div
                      className={cn(
                        "text-[10px] mt-1 text-right",
                        isMe ? "text-ink-600" : "text-ink-400",
                        hasImages && "pr-2 pb-1"
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
        {pendingFiles.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto">
            {pendingFiles.map((f, i) => (
              <div
                key={i}
                className="relative w-16 h-16 rounded-lg overflow-hidden border border-ink-700 shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(f)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removePending(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-ink-950/80 hover:bg-red-500/80 text-foreground flex items-center justify-center"
                  title="Retirer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={pendingFiles.length >= 4}
            className="shrink-0 h-11 w-11 rounded-md border border-ink-700 bg-ink-900/50 hover:bg-ink-800 text-ink-300 hover:text-foreground flex items-center justify-center transition-colors disabled:opacity-40"
            title="Joindre une image"
          >
            <ImagePlus className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onPickFiles}
            className="sr-only"
          />
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
            disabled={isPending || (!draft.trim() && pendingFiles.length === 0)}
            className="shrink-0 h-11 w-11"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
