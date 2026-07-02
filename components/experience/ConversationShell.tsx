"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session.store";
import { useConversationStore } from "@/stores/conversation.store";
import { MessageBubble } from "@/components/experience/MessageBubble";
import { RevealButton } from "@/components/experience/RevealButton";
import { LegacyNameReveal } from "@/components/experience/LegacyNameReveal";

export function ConversationShell() {
  const router = useRouter();
  const birthName = useSessionStore((state) => state.birthName);
  const { messages, isStreaming, error, proposedLegacyName, sendMessage } =
    useConversationStore();
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!birthName) router.replace("/birth");
  }, [birthName, router]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (!birthName) return null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput("");
    sendMessage(trimmed);
  };

  return (
    <div className="flex w-full max-w-2xl flex-1 flex-col gap-4 p-6">
      <header className="text-center text-sm tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
        {birthName}
      </header>

      <div ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto py-4">
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            message={message}
            isStreaming={isStreaming && index === messages.length - 1}
          />
        ))}

        {proposedLegacyName ? (
          <LegacyNameReveal />
        ) : (
          !isStreaming && messages.length > 0 && <RevealButton />
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {!proposedLegacyName && (
        <form onSubmit={onSubmit} className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
              }
            }}
            rows={1}
            placeholder="Say something…"
            className="flex-1 resize-none rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:focus:border-zinc-400"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}
