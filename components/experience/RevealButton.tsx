"use client";

import { useState } from "react";
import { useConversationStore } from "@/stores/conversation.store";

export function RevealButton() {
  const canReveal = useConversationStore((state) => state.canReveal);
  const proposedLegacyName = useConversationStore((state) => state.proposedLegacyName);
  const requestReveal = useConversationStore((state) => state.requestReveal);
  const [isRequesting, setIsRequesting] = useState(false);

  if (!canReveal || proposedLegacyName) return null;

  const onClick = async () => {
    setIsRequesting(true);
    try {
      await requestReveal();
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isRequesting}
      className="self-center rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
    >
      {isRequesting ? "Sensing…" : "Reveal My Legacy Name"}
    </button>
  );
}
