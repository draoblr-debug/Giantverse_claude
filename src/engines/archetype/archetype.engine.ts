import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import { geometricWeight, MAX_DIMENSIONAL_WEIGHT } from "@/engines/archetype/dimension-geometry";
import { getSpokeAngle } from "@/lib/journey-renderer";
import type { ArchetypeProfile, ArchetypeScore, Dimension, Signal } from "@/types/archetype.types";

// GEOMETRIC DIMENSION MODEL scoring — see docs/ARCHITECTURE.md.
//
// response → responseSignal → question dimension → dimension angle →
// angular relationship to the archetype's own (preserved, unchanged)
// wheel angle → geometric dimensional weight → signed archetype evidence
// → cumulative archetype evidence.
//
// This replaces the old response → dimension → manually-authored weight →
// antiWeight → normalized-by-profile-max score pipeline. Nothing here is
// hand-tuned per archetype: every dimensional relationship is derived
// purely from where that archetype sits on the wheel relative to where
// each dimension sits (DIMENSION_AXES in dimension-geometry.ts).

// A signal's directional evidence. Survey answers carry a real signed
// responseSignal (see survey-scoring.engine.ts). Chat- and photo-derived
// signals don't have a "for or against" direction to report — only how
// confident the detector was that the dimension showed up at all — so
// those fall back to their (always non-negative) confidence. In that
// fallback case, direction still emerges correctly: the geometric weight
// itself is signed, so a confident PEOPLE signal still pulls positively
// toward archetypes near PEOPLE's angle and negatively away from
// archetypes on the opposite side of the wheel, exactly as it would for a
// "strongly agree" survey answer on the same dimension.
function responseSignalOf(signal: Signal): number {
  return signal.responseSignal ?? signal.confidence;
}

// questionScore(k,q) = responseSignal(q) * 2.0 * cos(archetypeAngle[k] - dimensionAngle[q.dimension])
function questionScore(archetypeAngleDeg: number, signal: Signal): number {
  return responseSignalOf(signal) * geometricWeight(archetypeAngleDeg, signal.dimension);
}

// cumulativeScore(k) = Σ questionScore(k,q) — a raw signed sum, never
// divided by anything. Positive and negative evidence can (and should)
// cancel; this is intentionally unbounded as more signals accumulate.
function cumulativeScore(archetypeAngleDeg: number, signals: Signal[]): number {
  let score = 0;
  for (const signal of signals) score += questionScore(archetypeAngleDeg, signal);
  return score;
}

// The raw score has no fixed ceiling (it grows with the number of
// signals), so callers that compare against a fixed threshold — e.g.
// selectArchetype's confidenceThreshold, or the close-margin checks in
// tension.engine.ts/convergence.ts — need something scale-stable instead.
// This rescales by the true per-question ceiling (every archetype's best
// possible questionScore is exactly MAX_DIMENSIONAL_WEIGHT, achieved only
// if its angle exactly matches the question's dimension every time), so
// it's a plain linear rescale of the signed score — NOT a probability
// normalization across archetypes, and it still preserves sign and
// relative ordering exactly. This is distinct from (and unrelated to) the
// positive-only p[k] distribution used for the radial visualization,
// which is computed separately per turn — see journey-history.ts /
// journey-renderer.ts's computeRadialTrajectory.
function rescaleForThreshold(raw: number, signalCount: number): number {
  if (signalCount === 0) return 0;
  return raw / (MAX_DIMENSIONAL_WEIGHT * signalCount);
}

function archetypeAngle(profile: ArchetypeProfile): number {
  const angle = getSpokeAngle(profile.id);
  if (angle === undefined) {
    throw new Error(`archetype.engine: no wheel angle known for archetype "${profile.id}"`);
  }
  return angle;
}

// Scores all 32 archetypes against accumulated signals, sorted descending.
// `raw` is the true signed cumulativeScore (unbounded, positive/negative
// evidence can cancel — this is "the psychological score"). `normalized`
// is that same value linearly rescaled into a fixed, comparable range for
// threshold/margin comparisons (see rescaleForThreshold above) — it is
// NOT a probability and does not sum to anything meaningful across
// archetypes.
export function scoreArchetypes(signals: Signal[]): ArchetypeScore[] {
  return Object.values(ARCHETYPE_DEFINITIONS)
    .map((archetype) => {
      const angle = archetypeAngle(archetype);
      const raw = cumulativeScore(angle, signals);
      return { archetype, raw, normalized: rescaleForThreshold(raw, signals.length) };
    })
    .sort((a, b) => b.raw - a.raw);
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
