import { extractSignalFromMessage } from "@/engines/conversation/signal-extractor.engine";
import type { Dimension, Signal } from "@/types/archetype.types";

export async function extract(params: {
  dimension: Dimension;
  userMessage: string;
  turnIndex: number;
}): Promise<Signal | null> {
  return extractSignalFromMessage(params);
}

// Merges a new Signal into the accumulated set. One Signal per dimension
// (mirrors the @@unique([sessionId, dimension]) constraint in Section 4) —
// a later, more confident reading replaces an earlier weaker one.
export function update(signals: Signal[], next: Signal | null): Signal[] {
  if (!next) return signals;

  const existing = signals.find((s) => s.dimension === next.dimension);
  if (!existing || next.confidence >= existing.confidence) {
    return [...signals.filter((s) => s.dimension !== next.dimension), next];
  }
  return signals;
}

export function summarize(signals: Signal[]): string {
  if (signals.length === 0) return "Nothing yet — this is early.";
  return signals.map((s) => `- ${s.dimension}: ${s.value}`).join("\n");
}
