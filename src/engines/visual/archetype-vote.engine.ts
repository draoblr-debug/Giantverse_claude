// Archetype-from-matches — ported from Lens-Hunt-anime's
// MainViewModel.generateUserIdentity: the participant's archetype is
// whichever archetype the top-5 character matches carry the most combined
// similarity for, NOT a separate signals-based measurement. This is the
// reference app's actual mechanism; a prior version of this file computed
// archetype from a parallel signals engine instead, which is what let the
// result drift out of sync with the (also under-diverse, now-fixed)
// character matches.

import type { CharacterMatch } from "@/types/visual.types";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";

export type ArchetypeVoteResult = {
  archetypeId: string | null;
  // Normalized 0..1 per archetype id, for every one of the 32 — only the
  // archetypes actually represented in the top-5 matches score above 0.
  // Lets the shared reveal page populate "invisible archetypes" etc.
  // without a second, disagreeing scoring pass.
  scoreMap: Record<string, number>;
};

export function deriveArchetypeFromMatches(matches: CharacterMatch[]): ArchetypeVoteResult {
  const top5 = matches.slice(0, 5);
  const archetypeScores: Record<string, number> = {};
  for (const match of top5) {
    const archetypeId = match.character.archetypeId;
    if (!archetypeId) continue;
    archetypeScores[archetypeId] = (archetypeScores[archetypeId] ?? 0) + match.similarity;
  }

  const entries = Object.entries(archetypeScores);
  const archetypeId = entries.length > 0 ? entries.sort((a, b) => b[1] - a[1])[0][0] : null;
  const maxScore = entries.length > 0 ? Math.max(...entries.map(([, v]) => v)) : 1;

  const scoreMap: Record<string, number> = {};
  for (const id of Object.keys(ARCHETYPE_DEFINITIONS)) {
    scoreMap[id] = (archetypeScores[id] ?? 0) / maxScore;
  }

  return { archetypeId, scoreMap };
}
