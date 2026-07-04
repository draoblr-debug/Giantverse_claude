import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import type { ArchetypeProfile, Dimension, Signal } from "@/types/archetype.types";

const DIMENSION_PHRASES: Record<Dimension, string> = {
  VALUES: "what you value",
  FEARS: "what you fear",
  DREAMS: "what you dream of",
  POWER: "how you relate to power",
  PEOPLE: "how you relate to people",
  DECISIONS: "how you make decisions",
  LEADERSHIP: "how you lead",
  MOTIVATION: "what motivates you",
};

export type Convergence = {
  secondary: ArchetypeProfile;
  dimension: Dimension;
  reasoning: string;
};

/**
 * When the participant's final scores put a second archetype close behind
 * the winner, this explains *why* — which dimension of their answers
 * pulled toward that runner-up — so the reveal isn't just a name, it's a
 * legible trade-off the participant can weigh themselves.
 *
 * Returns null when there's no meaningful runner-up (score gap too wide,
 * or the runner-up barely registered at all).
 */
export function computeConvergence(
  signals: Signal[],
  scoreMap: Record<string, number>,
  primaryId: string,
  closeMargin = 0.12,
): Convergence | null {
  const sorted = Object.entries(scoreMap).sort((a, b) => b[1] - a[1]);
  const primaryScore = scoreMap[primaryId] ?? 0;
  const runnerUp = sorted.find(([id, score]) => id !== primaryId && score > 0);
  if (!runnerUp) return null;

  const [secondaryId, secondaryScore] = runnerUp;
  if (primaryScore - secondaryScore > closeMargin) return null;

  const primary = ARCHETYPE_DEFINITIONS[primaryId];
  const secondary = ARCHETYPE_DEFINITIONS[secondaryId];
  if (!primary || !secondary) return null;

  // Average signal confidence per dimension, so we can weight dimensions
  // by how strongly (and how often) the participant actually leaned there.
  const byDimension = new Map<Dimension, { sum: number; count: number }>();
  for (const s of signals) {
    const entry = byDimension.get(s.dimension) ?? { sum: 0, count: 0 };
    entry.sum += s.confidence;
    entry.count += 1;
    byDimension.set(s.dimension, entry);
  }

  // Find the dimension where secondary's weight most outpaces primary's,
  // scaled by how strongly the participant actually answered in it.
  let bestDim: Dimension | null = null;
  let bestPull = -Infinity;
  for (const dim of Object.keys(secondary.weights) as Dimension[]) {
    const avgConfidence = byDimension.get(dim) ? byDimension.get(dim)!.sum / byDimension.get(dim)!.count : 0;
    const pull = (secondary.weights[dim] - primary.weights[dim]) * avgConfidence;
    if (pull > bestPull) {
      bestPull = pull;
      bestDim = dim;
    }
  }
  if (!bestDim || bestPull <= 0) return null;

  const trait = secondary.traits[0]?.toLowerCase() ?? secondary.label.toLowerCase();
  const reasoning = `Your answers about ${DIMENSION_PHRASES[bestDim]} leaned toward ${secondary.label}'s defining trait — ${trait} — even though ${primary.label} carried the stronger overall pull.`;

  return { secondary, dimension: bestDim, reasoning };
}
