import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import type { ArchetypeProfile, ArchetypeScore, Dimension, Signal } from "@/types/archetype.types";

function maxPossibleScore(profile: ArchetypeProfile): number {
  return (Object.values(profile.weights) as number[]).reduce((sum, w) => sum + w * 1.0, 0) || 1;
}

function scoreArchetype(profile: ArchetypeProfile, signals: Signal[]): number {
  let score = 0;
  for (const signal of signals) {
    const dimensionScore = signal.confidence * profile.weights[signal.dimension];
    const antiScore = signal.confidence * profile.antiWeights[signal.dimension];
    score += dimensionScore - antiScore;
  }
  return score / maxPossibleScore(profile);
}

// Scores all 20 archetypes against accumulated signals, sorted descending.
export function scoreArchetypes(signals: Signal[]): ArchetypeScore[] {
  return Object.values(ARCHETYPE_DEFINITIONS)
    .map((archetype) => ({ archetype, normalized: scoreArchetype(archetype, signals) }))
    .sort((a, b) => b.normalized - a.normalized);
}

// Winner = top score if it clears that archetype's own confidenceThreshold.
export function selectArchetype(signals: Signal[]): ArchetypeScore | null {
  const [top] = scoreArchetypes(signals);
  if (!top || top.normalized < top.archetype.confidenceThreshold) return null;
  return top;
}

export function dimensionsCovered(signals: Signal[], minConfidence = 0.6): Dimension[] {
  return signals.filter((s) => s.confidence >= minConfidence).map((s) => s.dimension);
}
