import { create } from "zustand";
import type { ChatMessage } from "@/types/conversation.types";
import type { Dimension, Signal } from "@/types/archetype.types";
import { useSessionStore } from "@/stores/session.store";

function base64ToUtf8(base64: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

type ProposedArchetype = {
  id: string;
  label: string;
  romajiName: string;
  order: "GIANT" | "HUNTER";
};

type ConversationStore = {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  signals: Signal[];
  lastProbeDimension: Dimension | null;
  turnCount: number;
  canReveal: boolean;
  proposedLegacyName: string | null;
  proposedArchetype: ProposedArchetype | null;
  proposedScores: Record<string, number> | null;
  legacyNameAccepted: boolean;

  sendMessage: (content: string) => Promise<void>;
  requestReveal: () => Promise<void>;
  acceptName: () => void;
  rejectName: (choice: "keep-talking" | "begin-again") => void;
};

export const useConversationStore = create<ConversationStore>((set, get) => ({
  messages: [],
  isStreaming: false,
  error: null,
  signals: [],
  lastProbeDimension: null,
  turnCount: 0,
  canReveal: false,
  proposedLegacyName: null,
  proposedArchetype: null,
  proposedScores: null,
  legacyNameAccepted: false,

  sendMessage: async (content) => {
    const { firstName, birthName } = useSessionStore.getState();
    if (!birthName) throw new Error("No active session.");

    const { messages: history, signals, lastProbeDimension } = get();
    const userMessage: ChatMessage = { role: "user", content };
    set({
      messages: [...history, userMessage, { role: "assistant", content: "" }],
      isStreaming: true,
      error: null,
    });

    try {
      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          birthName,
          history,
          message: content,
          signals,
          lastProbeDimension,
        }),
      });

      if (!res.ok || !res.body) {
        const { error } = await res.json().catch(() => ({ error: "Something went wrong." }));
        throw new Error(error ?? "Something went wrong.");
      }

      const probeDimension = res.headers.get("X-Probe-Dimension") as Dimension | null;
      const turnCount = Number(res.headers.get("X-Turn-Count") ?? "0");
      const signalsHeader = res.headers.get("X-Signals");
      const updatedSignals: Signal[] = signalsHeader
        ? JSON.parse(base64ToUtf8(signalsHeader))
        : signals;

      set({
        lastProbeDimension: probeDimension,
        turnCount,
        signals: updatedSignals,
        canReveal: res.headers.get("X-Can-Reveal") === "true",
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const delta = decoder.decode(value, { stream: true });

        set((state) => {
          const messages = [...state.messages];
          const last = messages[messages.length - 1];
          messages[messages.length - 1] = { ...last, content: last.content + delta };
          return { messages };
        });
      }
    } catch (err) {
      set((state) => {
        const messages = [...state.messages];
        const last = messages[messages.length - 1];
        // Drop the empty assistant placeholder so a failed turn doesn't
        // leave a stray bubble or pollute history sent on the next request.
        if (last?.role === "assistant" && last.content === "") messages.pop();
        return {
          messages,
          error: err instanceof Error ? err.message : "Something went wrong.",
        };
      });
    } finally {
      set({ isStreaming: false });
    }
  },

  requestReveal: async () => {
    const { birthName } = useSessionStore.getState();
    const { signals } = get();
    if (!birthName) return;

    try {
      const archetypeRes = await fetch("/api/archetype", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signals }),
      });

      if (!archetypeRes.ok) {
        const { error } = await archetypeRes
          .json()
          .catch(() => ({ error: "Something went wrong." }));
        set({ error: error ?? "Something went wrong." });
        return;
      }

      const { topArchetype, scores } = await archetypeRes.json();
      const scoreMap: Record<string, number> = Object.fromEntries(
        (scores as { id: string; normalized: number }[]).map((s) => [s.id, s.normalized]),
      );

      const legacyRes = await fetch("/api/legacy-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthName, archetypeId: topArchetype.id }),
      });

      if (!legacyRes.ok) {
        const { error } = await legacyRes
          .json()
          .catch(() => ({ error: "Something went wrong." }));
        set({ error: error ?? "Something went wrong." });
        return;
      }

      const data = await legacyRes.json();
      set({ proposedLegacyName: data.legacyName, proposedArchetype: data.archetype, proposedScores: scoreMap });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Something went wrong." });
    }
  },

  acceptName: () => {
    const { proposedLegacyName, proposedArchetype, proposedScores } = get();
    if (!proposedLegacyName || !proposedArchetype) return;
    useSessionStore.getState().acceptLegacyName(
      proposedLegacyName,
      proposedArchetype.id,
      proposedArchetype.order,
      proposedArchetype.label,
      "",
      ["", "", "", ""] as unknown as [string, string, string, string],
      proposedScores ?? undefined,
    );
    set({ legacyNameAccepted: true });
  },

  rejectName: (choice) => {
    if (choice === "keep-talking") {
      set({ proposedLegacyName: null, proposedArchetype: null, proposedScores: null });
      return;
    }
    // "begin-again": session store keeps birthName; conversation resets fully.
    set({
      messages: [],
      signals: [],
      lastProbeDimension: null,
      turnCount: 0,
      canReveal: false,
      proposedLegacyName: null,
      proposedArchetype: null,
      proposedScores: null,
      legacyNameAccepted: false,
      error: null,
    });
  },
}));
