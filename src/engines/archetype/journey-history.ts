import { scoreArchetypes } from "@/engines/archetype/archetype.engine";
import type { Signal } from "@/types/archetype.types";
import type { TurnSnapshot } from "@/lib/journey-renderer";

// Replays the scoring engine cumulatively over the answered signals so the
// journey map can trace how the participant's resonance drifted turn by
// turn. Snapshot i = scores after the first i+1 signals; category = the
// dimension that turn probed. Negative scores are clamped to 0 — the
// renderer treats <=0 as "no pull toward this spoke".
export function buildScoreHistory(signals: Signal[]): TurnSnapshot[] {
  return signals.map((signal, i) => {
    const scores: Record<string, number> = {};
    for (const s of scoreArchetypes(signals.slice(0, i + 1))) {
      scores[s.archetype.id] = Math.max(0, s.normalized);
    }
    return { category: signal.dimension, scores };
  });
}
