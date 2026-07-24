// CharacterMatcher — visual-similarity ranking, ported from Lens-Hunt-anime's
// AppRepository.findMatches + SimilarityCalculator (exact formulas, not an
// approximation): cluster-narrow the candidate pool to the design cluster
// the user's axes best fit, weight-rank by distance, then run a diversity
// pass so near-duplicate designs don't crowd out the top results. Without
// that diversity pass, a handful of "average" characters dominated every
// result regardless of the input photo — this file is the fix for that.
//
// Output is always "you visually RESEMBLE this design" — a similarity score
// between measured axes and a hand-authored design profile. It is not
// recognition and carries no identity claim.

import type { CharacterEntry, CharacterMatch, VisualAxes } from "@/types/visual.types";
import { VISUAL_AXES } from "@/types/visual.types";
import { CharacterDatabase } from "@/data/character-database";
import { determineUserCluster, getNearestClusters } from "@/lib/visual/cluster-manager";

// Exact weights from the reference's SimilarityCalculator — shape language
// (angularity, eye shape, jawline) is what people mean when they say two
// faces "look alike", far more than photometric detail. contrast/glasses/
// warmth are zeroed there too: kept at zero here rather than the modest
// weight an earlier version gave them, since parity with the reference's
// tested diversity behavior matters more than rewarding the extra signal
// our analyzer (unlike theirs) can actually measure for those three.
const AXIS_WEIGHTS: Record<keyof VisualAxes, number> = {
  faceLength: 1.0, jawSharpness: 1.5, eyeNarrowness: 2.0, browWeight: 0.25,
  hairDarkness: 0.25, hairVolume: 0.25, expressionNeutrality: 0.25, symmetry: 1.0,
  contrast: 0.0, angularity: 3.5, glasses: 0.0, warmth: 0.0,
};

// Excluded from the "why you resemble this design" checklist — either
// zero-weighted or (hair) too coarse a signal to read as a confident match
// reason, matching the reference's ResultsScreen filter exactly.
const EXCLUDED_FROM_EXPLANATION = new Set<keyof VisualAxes>([
  "hairDarkness", "hairVolume", "glasses", "contrast", "warmth",
]);

type DistanceResult = { distance: number; contributions: Array<{ axis: keyof VisualAxes; contribution: number }> };

// Weighted-Euclidean distance: each axis contributes w * diff², summed and
// square-rooted. A single badly-mismatched heavily-weighted axis dominates
// the distance — intentional, matching the reference's behavior — rather
// than being diluted by averaging across all twelve axes.
function distanceBetween(a: VisualAxes, b: VisualAxes): DistanceResult {
  let sumSq = 0;
  const contributions: Array<{ axis: keyof VisualAxes; contribution: number }> = [];
  for (const axis of VISUAL_AXES) {
    const w = AXIS_WEIGHTS[axis];
    const diff = a[axis] - b[axis];
    const contribution = diff * diff * w;
    sumSq += contribution;
    contributions.push({ axis, contribution });
  }
  return { distance: Math.sqrt(sumSq), contributions };
}

/**
 * Rank characters by visual similarity to the embedding, following the
 * reference app's exact pipeline: narrow to the user's design cluster (or
 * cluster + neighbors, if that call wasn't confident), relatively normalize
 * distance within that candidate pool, nudge by cluster membership, then
 * apply rank decay + a diversity penalty so visually-similar characters
 * don't both crowd the top of the list. Always returns `count` results
 * (default 5) so the UI never shows a single "you are X" result.
 */
export function matchCharacters(
  user: VisualAxes,
  opts: { count?: number; collection?: CharacterEntry["collection"] } = {},
): CharacterMatch[] {
  const { count = 5, collection } = opts;
  const basePool = collection ? CharacterDatabase.byCollection(collection) : CharacterDatabase.archetypeEligible();

  const { cluster: primaryCluster, confidence } = determineUserCluster(user);
  const targetClusters = confidence < 0.7 ? [primaryCluster, ...getNearestClusters(primaryCluster)] : [primaryCluster];
  const clusterFiltered = basePool.filter((c) => c.cluster && targetClusters.includes(c.cluster));
  const candidates = clusterFiltered.length > 0 ? clusterFiltered : basePool;

  const rawResults = candidates.map((character) => ({
    character,
    ...distanceBetween(user, character.profile),
  }));

  const distances = rawResults.map((r) => r.distance);
  const minDist = Math.min(...distances);
  const maxDist = Math.max(...distances);
  const range = Math.max(0.0001, maxDist - minDist);

  const scored = rawResults
    .map(({ character, distance, contributions }) => {
      let normalizedScore = 0.98 - 0.28 * ((distance - minDist) / range);
      if (character.cluster === primaryCluster) {
        normalizedScore += 0.02;
      } else if (confidence < 0.7 && character.cluster && targetClusters.includes(character.cluster)) {
        normalizedScore -= 0.03;
      } else {
        normalizedScore -= 0.15;
      }
      normalizedScore = Math.max(0, Math.min(0.98, normalizedScore));
      return { character, score: normalizedScore, contributions };
    })
    .sort((a, b) => b.score - a.score);

  // Rank decay so results aren't all bunched at 95%+, plus a diversity
  // penalty against every already-accepted result that's too similar (own
  // profile-to-profile distance < 0.3) — this is what stops a handful of
  // characters from dominating every match regardless of the input photo.
  const diverseResults: Array<{ character: CharacterEntry; score: number; contributions: typeof scored[number]["contributions"] }> = [];
  scored.forEach(({ character, score, contributions }, rank) => {
    let penalty = rank * 0.04;
    for (const accepted of diverseResults) {
      const { distance } = distanceBetween(character.profile, accepted.character.profile);
      if (distance < 0.3) penalty += 0.06;
    }
    const finalScore = Math.max(0.5, Math.min(0.98, score - penalty));
    diverseResults.push({ character, score: finalScore, contributions });
  });

  return diverseResults
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ character, score, contributions }) => {
      const matchedAxes = contributions
        .filter((c) => !EXCLUDED_FROM_EXPLANATION.has(c.axis))
        .sort((a, b) => a.contribution - b.contribution)
        .slice(0, 4)
        .map((c) => c.axis);
      return { character, similarity: Math.round(score * 100), matchedAxes };
    });
}
