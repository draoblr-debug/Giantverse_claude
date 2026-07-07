import { buildSystemPrompt } from "@/engines/prompt/system-prompt.builder";
import { selectNextProbe } from "@/engines/conversation/probe.engine";
import { extract, summarize, update } from "@/engines/conversation/memory.engine";
import { detectTension } from "@/engines/archetype/tension.engine";
import { streamCounterpartReply } from "@/services/ai/ai.service";
import type { ChatMessage } from "@/types/conversation.types";
import type { Dimension, Signal } from "@/types/archetype.types";

export async function receive(params: {
  firstName: string;
  birthName: string;
  history: ChatMessage[];
  message: string;
  signals: Signal[];
  lastProbeDimension: Dimension | null;
}) {
  const { firstName, birthName, history, message, lastProbeDimension } = params;

  const turnIndex = history.filter((m) => m.role === "user").length;

  // The user's reply answers the dimension probed last turn, if any.
  // Extraction is a secondary, best-effort call — a transient failure here
  // shouldn't block the counterpart's actual reply.
  let signals = params.signals;
  if (lastProbeDimension) {
    try {
      const newSignal = await extract({
        dimension: lastProbeDimension,
        userMessage: message,
        turnIndex,
      });
      signals = update(signals, newSignal);
    } catch {
      // skip this turn's signal; conversation continues unaffected.
    }
  }

  const probeDimension = selectNextProbe(turnIndex, signals);
  const systemInstruction = buildSystemPrompt({
    firstName,
    birthName,
    probeDimension,
    signalSummary: summarize(signals),
    tension: detectTension(signals),
  });

  const fullHistory = [...history, { role: "user" as const, content: message }];
  const stream = await streamCounterpartReply({ systemInstruction, history: fullHistory });

  return { stream, signals, probeDimension, turnIndex: turnIndex + 1 };
}
