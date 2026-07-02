import { dimensionsCovered } from "@/engines/archetype/archetype.engine";
import type { Signal } from "@/types/archetype.types";

const MIN_CONFIDENT_DIMENSIONS = 5;
const MIN_TURNS = 6;
const CONFIDENT_THRESHOLD = 0.6;

// Reveal gating per Section 5: at least 5 of 8 dimensions confident (≥0.6),
// and a minimum of 6 conversation turns. Whether the AI has already revealed
// this cycle is session UI state, not this engine's concern.
export function canReveal(signals: Signal[], turnCount: number): boolean {
  const confidentCount = dimensionsCovered(signals, CONFIDENT_THRESHOLD).length;
  return confidentCount >= MIN_CONFIDENT_DIMENSIONS && turnCount >= MIN_TURNS;
}
