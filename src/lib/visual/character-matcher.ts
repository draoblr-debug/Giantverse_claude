// CharacterMatcher — visual-similarity ranking over any character collection.
//
// Consumes only the shared measurement axes, so every collection (anime,
// games, comics, future Giantverse originals…) matches without code changes.
// Output is always "you visually RESEMBLE this design" — a similarity score
// between measured axes and a hand-authored design profile. It is not
// recognition and carries no identity claim.

import type { CharacterEntry, CharacterMatch, GenderFilter, VisualAxes, VisualPresentation } from "@/types/visual.types";
import { VISUAL_AXES } from "@/types/visual.types";
import { CharacterDatabase } from "@/data/character-database";

// Gender-filter mechanism ported from the Lens Hunt Android app
// (AppRepository.findMatches): MALE/FEMALE keep that gender plus nonbinary
// characters, ANY keeps everyone, and AUTO defers to the detected visual
// presentation only when it's confident enough — otherwise it's a no-op.
function applyGenderFilter(
  pool: CharacterEntry[],
  filter: GenderFilter,
  presentation?: VisualPresentation,
  presentationConfidence = 0,
): CharacterEntry[] {
  const byPresentation = (p: "male" | "female") =>
    pool.filter((c) => c.gender === p || c.gender === "nonbinary");

  switch (filter) {
    case "MALE": return byPresentation("male");
    case "FEMALE": return byPresentation("female");
    case "ANY": return pool;
    case "AUTO":
    default:
      if (presentationConfidence >= 0.6 && (presentation === "male" || presentation === "female")) {
        return byPresentation(presentation);
      }
      return pool;
  }
}

// Perceptual weighting: axes people actually notice when they say two
// faces "look alike" count more than photometric ones.
const AXIS_WEIGHTS: Record<keyof VisualAxes, number> = {
  faceLength: 1.4, jawSharpness: 1.3, eyeNarrowness: 1.4, browWeight: 0.9,
  hairDarkness: 1.1, hairVolume: 1.2, expressionNeutrality: 1.0, symmetry: 0.6,
  contrast: 0.5, angularity: 0.9, glasses: 1.2, warmth: 0.5,
};

function similarityTo(user: VisualAxes, profile: VisualAxes): { score: number; agreements: Array<{ axis: keyof VisualAxes; diff: number }> } {
  let weighted = 0, weightSum = 0;
  const agreements: Array<{ axis: keyof VisualAxes; diff: number }> = [];
  for (const axis of VISUAL_AXES) {
    const w = AXIS_WEIGHTS[axis];
    const diff = Math.abs(user[axis] - profile[axis]);
    weighted += (1 - diff) * w;
    weightSum += w;
    agreements.push({ axis, diff });
  }
  return { score: weighted / weightSum, agreements };
}

/**
 * Rank characters by visual similarity to the embedding. Always returns the
 * requested count (default 5) so the UI never shows a single "you are X"
 * result. Percentages are calibrated to a display range that keeps honest
 * spacing between ranks.
 */
export function matchCharacters(
  user: VisualAxes,
  opts: {
    count?: number;
    collection?: CharacterEntry["collection"];
    genderFilter?: GenderFilter;
    visualPresentation?: VisualPresentation;
    presentationConfidence?: number;
  } = {},
): CharacterMatch[] {
  const { count = 5, collection, genderFilter = "AUTO", visualPresentation, presentationConfidence } = opts;
  const basePool = collection ? CharacterDatabase.byCollection(collection) : CharacterDatabase.all();
  const pool = applyGenderFilter(basePool, genderFilter, visualPresentation, presentationConfidence);

  const scored = pool
    .map((character) => {
      const { score, agreements } = similarityTo(user, character.profile);
      const matchedAxes = agreements
        .sort((a, b) => a.diff - b.diff)
        .slice(0, 5)
        .map((a) => a.axis);
      return { character, raw: score, matchedAxes };
    })
    .sort((a, b) => b.raw - a.raw)
    .slice(0, count);

  // Calibrate raw cosine-like scores (typically ~0.55–0.9) into a display
  // percentage band. Rank order is preserved exactly; the mapping only
  // spreads the band so differences stay legible.
  const top = scored[0]?.raw ?? 1;
  const bottom = scored[scored.length - 1]?.raw ?? 0;
  const span = Math.max(0.02, top - bottom);

  return scored.map(({ character, raw, matchedAxes }, i) => {
    const rankSpread = (raw - bottom) / span;         // 1 for top, 0 for last
    const base = 62 + raw * 24;                        // honesty anchor from raw score
    const display = Math.round(Math.min(94, base + rankSpread * 8 - i * 0.5));
    return { character, similarity: display, matchedAxes };
  });
}
