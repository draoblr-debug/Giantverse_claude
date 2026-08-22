// Developer/debug export for the GEOMETRIC DIMENSION MODEL: a 32
// archetypes × 8 dimensions matrix, every cell generated live from
// geometricWeight() (angle-derived, never hand-populated), plus each
// archetype's angle/quadrant/family/mode and each dimension's own
// angle/quadrant/core-or-edge designation, for verification against
// docs/ARCHITECTURE.md §6.
//
// Run with: npx tsx scripts/dump-dimensional-matrix.ts
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import { SPOKES } from "@/lib/journey-renderer";
import {
  DIMENSION_AXES,
  generateDimensionalMatrix,
  getQuadrant,
  getQuadrantsForDimension,
  isCoreDimension,
} from "@/engines/archetype/dimension-geometry";
import type { Dimension } from "@/types/archetype.types";

const OUT_DIR = path.join(process.cwd(), "tools", "dossier");
mkdirSync(OUT_DIR, { recursive: true });

const archetypes = Object.values(ARCHETYPE_DEFINITIONS)
  .map((a) => ({ id: a.id, name: a.label, angle: SPOKES[a.id].angleDeg, order: a.order, temperament: a.temperament }))
  .sort((a, b) => a.angle - b.angle);

const matrix = generateDimensionalMatrix(archetypes);

const dimensionRows = (Object.keys(DIMENSION_AXES) as Dimension[]).map((dimension) => {
  const angle = DIMENSION_AXES[dimension];
  return {
    dimension,
    angle,
    quadrant: getQuadrant(angle),
    designation: isCoreDimension(dimension) ? "core" : "edge",
    quadrants: getQuadrantsForDimension(dimension),
  };
});

// Rows where the angle-derived quadrant disagrees with the archetype's own
// GIANT/HUNTER + ACTIVE/PASSIVE identity — see docs/ARCHITECTURE.md §6
// "Known mismatch".
const mismatches = archetypes
  .map((a) => ({ ...a, quadrant: getQuadrant(a.angle) }))
  .filter((a) => {
    const expectedOrder = a.quadrant === "Q1" || a.quadrant === "Q4" ? "GIANT" : "HUNTER";
    return expectedOrder !== a.order;
  })
  .map(({ id, order, temperament, angle, quadrant }) => ({ id, order, temperament, angle, quadrant }));

const outPath = path.join(OUT_DIR, "dimensional-matrix.json");
writeFileSync(outPath, JSON.stringify({ dimensionRows, matrix, mismatchCount: mismatches.length, mismatches }, null, 2));

console.log(`Wrote ${matrix.length} archetype rows × ${dimensionRows.length} dimension columns to ${outPath}`);
console.log(`Angle-derived quadrant vs. archetype's own Order mismatches: ${mismatches.length} / ${archetypes.length}`);
