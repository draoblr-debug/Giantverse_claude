// Visual → Signal bridge — lets a selfie/photo stand alongside the survey
// and chat as a third way to reach an archetype, through the exact same
// engine (scoreArchetypes/selectArchetype) both of those already use.
//
// The mapping below is deliberately playful, not clinical — there is no
// scientific link between jaw shape and "LEADERSHIP". It's the same kind
// of pop-physiognomy trope this whole feature already trades in (an anime
// face-match app), applied to the 8 dimensions instead of a character
// roster, so a single analysis produces one signal per dimension.

import type { Dimension, Signal } from "@/types/archetype.types";
import type { VisualAxes } from "@/types/visual.types";

type AxisWeight = { axis: keyof VisualAxes; invert?: boolean; weight: number };

// Each dimension reads off 2-3 axes; some read the axis inverted (1 - v)
// where the LOW end of that axis is what the dimension trades on (e.g.
// FEARS reads wide-open eyes — low eyeNarrowness — as vigilance).
const DIMENSION_AXES: Record<Dimension, AxisWeight[]> = {
  POWER: [
    { axis: "jawSharpness", weight: 1.2 },
    { axis: "angularity", weight: 1.0 },
    { axis: "browWeight", weight: 0.8 },
  ],
  LEADERSHIP: [
    { axis: "symmetry", weight: 1.1 },
    { axis: "expressionNeutrality", weight: 1.0 },
    { axis: "jawSharpness", weight: 0.9 },
  ],
  DECISIONS: [
    { axis: "contrast", weight: 1.0 },
    { axis: "angularity", weight: 1.0 },
    { axis: "expressionNeutrality", weight: 0.8 },
  ],
  VALUES: [
    { axis: "symmetry", weight: 1.1 },
    { axis: "expressionNeutrality", weight: 0.7 },
    { axis: "warmth", weight: 0.8 },
  ],
  FEARS: [
    { axis: "eyeNarrowness", invert: true, weight: 1.3 },
    { axis: "browWeight", weight: 0.8 },
  ],
  DREAMS: [
    { axis: "eyeNarrowness", invert: true, weight: 1.0 },
    { axis: "hairVolume", weight: 0.9 },
    { axis: "warmth", weight: 0.8 },
  ],
  PEOPLE: [
    { axis: "warmth", weight: 1.2 },
    { axis: "hairVolume", weight: 0.8 },
    { axis: "contrast", invert: true, weight: 0.7 },
  ],
  MOTIVATION: [
    { axis: "hairVolume", weight: 1.0 },
    { axis: "faceLength", weight: 0.8 },
    { axis: "angularity", weight: 0.9 },
  ],
};

const DIMENSIONS: Dimension[] = [
  "VALUES", "FEARS", "DREAMS", "POWER",
  "PEOPLE", "DECISIONS", "LEADERSHIP", "MOTIVATION",
];

function dimensionConfidence(axes: VisualAxes, weights: AxisWeight[]): number {
  let sum = 0;
  let weightSum = 0;
  for (const { axis, invert, weight } of weights) {
    const raw = axes[axis];
    sum += (invert ? 1 - raw : raw) * weight;
    weightSum += weight;
  }
  return weightSum > 0 ? sum / weightSum : 0.5;
}

/** Converts one photo's measured axes into an 8-signal set — one signal
 * per dimension, same shape survey/chat produce, so /api/archetype scores
 * it with zero special-casing. */
export function visualAxesToSignals(axes: VisualAxes): Signal[] {
  return DIMENSIONS.map((dimension, turnIndex) => {
    const confidence = Math.max(0, Math.min(1, dimensionConfidence(axes, DIMENSION_AXES[dimension])));
    const value = confidence > 0.66 ? "strong" : confidence > 0.33 ? "moderate" : "subtle";
    return { dimension, value, confidence, turnIndex };
  });
}
