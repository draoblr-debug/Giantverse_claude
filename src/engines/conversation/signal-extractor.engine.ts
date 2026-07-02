import { extractSignal } from "@/services/ai/ai.service";
import { PROBE_TEMPLATES } from "@/engines/prompt/probe-templates";
import type { Dimension, Signal } from "@/types/archetype.types";

// Extracts a dimensional Signal from the participant's reply to a given
// probe, via a secondary AI call. Returns null if nothing meaningful surfaced.
export async function extractSignalFromMessage(params: {
  dimension: Dimension;
  userMessage: string;
  turnIndex: number;
}): Promise<Signal | null> {
  const { dimension, userMessage, turnIndex } = params;

  const raw = await extractSignal({
    dimension,
    probeQuestion: PROBE_TEMPLATES[dimension],
    userMessage,
  });

  if (!raw.found || !raw.value) return null;

  return {
    dimension,
    value: raw.value,
    confidence: Math.max(0, Math.min(1, raw.confidence)),
    turnIndex,
  };
}
