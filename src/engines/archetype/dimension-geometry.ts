// GEOMETRIC DIMENSION MODEL — the single source of truth for how the 8
// psychological dimensions sit on the 360° archetype wheel, and for the
// quadrant structure (Active/Passive Builders/Explorers) that wheel is
// divided into.
//
// This is the ONLY place dimension angles or quadrant boundaries are
// defined. Everything else (the scoring engine, the journey-map renderer,
// developer tooling) asks this module rather than hard-coding degrees.
//
// It does NOT own archetype angles — those remain whatever the renderer
// already assigns (see src/lib/journey-renderer.ts's SPOKES), preserved
// unchanged per the wheel-model spec. This module only relates a given
// angle (an archetype's) to the 8 fixed dimension angles below.

import type { Dimension } from "@/types/archetype.types";

export type QuadrantId = "Q1" | "Q2" | "Q3" | "Q4";

// Canonical dimension → angle map. 45° apart, starting at DREAMS (0°).
// A dimension sitting at a multiple of 90° is a quadrant CORE (the center
// of that quadrant); a dimension at a multiple of 90°+45°... no — read the
// table below plainly: cores sit at 45/135/225/315, edges at 0/90/180/270.
export const DIMENSION_AXES: Record<Dimension, number> = {
  DREAMS: 0,
  LEADERSHIP: 45,
  MOTIVATION: 90,
  PEOPLE: 135,
  FEARS: 180,
  VALUES: 225,
  DECISIONS: 270,
  POWER: 315,
};

// Ordered by angle, for neighbor lookups.
const DIMENSION_RING: Dimension[] = [
  "DREAMS", "LEADERSHIP", "MOTIVATION", "PEOPLE",
  "FEARS", "VALUES", "DECISIONS", "POWER",
];

export type QuadrantMeta = {
  id: QuadrantId;
  name: string;
  family: "Builders" | "Explorers";
  order: "GIANT" | "HUNTER";
  mode: "ACTIVE" | "PASSIVE";
  startAngle: number; // inclusive
  endAngle: number; // exclusive (360 wraps to 0)
  coreDimension: Dimension;
  leftEdgeDimension: Dimension;
  rightEdgeDimension: Dimension;
};

// Q1–Q4 canonical metadata (spec section 15). GIANTS = BUILDERS,
// HUNTERS = EXPLORERS.
export const QUADRANTS: Record<QuadrantId, QuadrantMeta> = {
  Q1: {
    id: "Q1", name: "Active Builders", family: "Builders", order: "GIANT", mode: "ACTIVE",
    startAngle: 0, endAngle: 90,
    coreDimension: "LEADERSHIP", leftEdgeDimension: "DREAMS", rightEdgeDimension: "MOTIVATION",
  },
  Q2: {
    id: "Q2", name: "Active Explorers", family: "Explorers", order: "HUNTER", mode: "ACTIVE",
    startAngle: 90, endAngle: 180,
    coreDimension: "PEOPLE", leftEdgeDimension: "MOTIVATION", rightEdgeDimension: "FEARS",
  },
  Q3: {
    id: "Q3", name: "Passive Explorers", family: "Explorers", order: "HUNTER", mode: "PASSIVE",
    startAngle: 180, endAngle: 270,
    coreDimension: "VALUES", leftEdgeDimension: "FEARS", rightEdgeDimension: "DECISIONS",
  },
  Q4: {
    id: "Q4", name: "Passive Builders", family: "Builders", order: "GIANT", mode: "PASSIVE",
    startAngle: 270, endAngle: 360,
    coreDimension: "POWER", leftEdgeDimension: "DECISIONS", rightEdgeDimension: "DREAMS",
  },
};

const QUADRANT_ORDER: QuadrantId[] = ["Q1", "Q2", "Q3", "Q4"];

/** Wraps any angle (including negatives) into [0, 360). */
export function wrapAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/** Normalizes an angular difference to (-180, 180]. */
export function normalizeAngle(delta: number): number {
  const wrapped = wrapAngle(delta);
  return wrapped > 180 ? wrapped - 360 : wrapped;
}

export function getDimensionAngle(dimension: Dimension): number {
  return DIMENSION_AXES[dimension];
}

/**
 * Which quadrant an angle belongs to for DISPLAY purposes. Boundaries are
 * explicit and half-open on the low side per spec section 14: 0° belongs
 * to Q1, 90° to Q2, 180° to Q3, 270° to Q4 (360°/0° wraps to Q1). This is
 * quadrant OWNERSHIP only — it says nothing about which quadrant "owns" a
 * dimension axis that sits exactly on a boundary (those are shared edge
 * dimensions; see getQuadrantForDimension below).
 */
export function getQuadrant(angleDeg: number): QuadrantId {
  const a = wrapAngle(angleDeg);
  if (a < 90) return "Q1";
  if (a < 180) return "Q2";
  if (a < 270) return "Q3";
  return "Q4";
}

export function getQuadrantMeta(id: QuadrantId): QuadrantMeta {
  return QUADRANTS[id];
}

export function getQuadrantCoreDimension(id: QuadrantId): Dimension {
  return QUADRANTS[id].coreDimension;
}

/** Every quadrant this dimension participates in — one quadrant (as core)
 * for a core dimension, two quadrants (as the shared edge) for an edge
 * dimension. */
export function getQuadrantsForDimension(dimension: Dimension): QuadrantId[] {
  return QUADRANT_ORDER.filter(
    (id) => QUADRANTS[id].coreDimension === dimension
      || QUADRANTS[id].leftEdgeDimension === dimension
      || QUADRANTS[id].rightEdgeDimension === dimension,
  );
}

export function isEdgeDimension(dimension: Dimension): boolean {
  return DIMENSION_AXES[dimension] % 90 === 0;
}

export function isCoreDimension(dimension: Dimension): boolean {
  return !isEdgeDimension(dimension);
}

/** The two neighboring dimensions on the wheel, 45° to either side. */
export function getAdjacentDimensions(dimension: Dimension): [Dimension, Dimension] {
  const i = DIMENSION_RING.indexOf(dimension);
  const n = DIMENSION_RING.length;
  return [DIMENSION_RING[(i - 1 + n) % n], DIMENSION_RING[(i + 1) % n]];
}

// Ceiling of a single question's contribution — used to rescale the raw
// signed cumulative score for threshold/margin comparisons elsewhere in
// the app. See archetype.engine.ts for how it's used; this constant is
// just the geometric weight's own max magnitude (2.0 * cos(0)).
export const MAX_DIMENSIONAL_WEIGHT = 2.0;

/**
 * The geometric dimensional weight W(k,d): how strongly an archetype at
 * `archetypeAngleDeg` relates to a given dimension, derived purely from
 * the angular distance between the archetype's position and that
 * dimension's canonical angle. +2.0 = maximum positive affinity (0°
 * apart), 0 = neutral (90° apart), -2.0 = maximum opposition (180° apart).
 * This REPLACES the old manually-authored weights/antiWeights table for
 * scoring purposes — nothing here is hand-tuned per archetype.
 */
export function geometricWeight(archetypeAngleDeg: number, dimension: Dimension): number {
  const delta = normalizeAngle(archetypeAngleDeg - getDimensionAngle(dimension));
  return MAX_DIMENSIONAL_WEIGHT * Math.cos((delta * Math.PI) / 180);
}

export type DimensionalMatrixRow = {
  archetypeId: string;
  archetypeName: string;
  angle: number;
  quadrant: QuadrantId;
  family: QuadrantMeta["family"];
  mode: QuadrantMeta["mode"];
} & Record<Dimension, number>;

const MATRIX_DIMENSION_COLUMNS: Dimension[] = [
  "VALUES", "FEARS", "DREAMS", "POWER", "PEOPLE", "DECISIONS", "LEADERSHIP", "MOTIVATION",
];

/**
 * Developer/debug export: 32 archetypes × 8 dimensions, every cell derived
 * live from geometricWeight() — never hand-populated. `family`/`mode` are
 * read off the archetype's angle-derived quadrant (which, since the
 * existing archetype angles predate this wheel model, does not always
 * match that archetype's own GIANT/HUNTER + ACTIVE/PASSIVE identity — see
 * docs/ARCHITECTURE.md for the documented mismatch).
 */
export function generateDimensionalMatrix(
  archetypes: Array<{ id: string; name: string; angle: number }>,
): DimensionalMatrixRow[] {
  return archetypes.map(({ id, name, angle }) => {
    const quadrant = getQuadrant(angle);
    const meta = QUADRANTS[quadrant];
    const row = {
      archetypeId: id,
      archetypeName: name,
      angle,
      quadrant,
      family: meta.family,
      mode: meta.mode,
    } as DimensionalMatrixRow;
    for (const dim of MATRIX_DIMENSION_COLUMNS) {
      row[dim] = geometricWeight(angle, dim);
    }
    return row;
  });
}
