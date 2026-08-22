import { describe, expect, it } from "vitest";
import {
  DIMENSION_AXES,
  QUADRANTS,
  geometricWeight,
  getAdjacentDimensions,
  getDimensionAngle,
  getQuadrant,
  getQuadrantCoreDimension,
  getQuadrantsForDimension,
  generateDimensionalMatrix,
  normalizeAngle,
  wrapAngle,
} from "@/engines/archetype/dimension-geometry";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import { SPOKES } from "@/lib/journey-renderer";
import { answersToSignals } from "@/engines/survey/survey-scoring.engine";
import { SURVEY_QUESTIONS } from "@/engines/survey/survey-questions";

describe("dimension geometry — A. dimension geometry", () => {
  it("0° apart (archetype exactly on Leadership) gives +2", () => {
    expect(geometricWeight(45, "LEADERSHIP")).toBeCloseTo(2, 10);
  });

  it("90° apart gives 0", () => {
    expect(geometricWeight(135, "LEADERSHIP")).toBeCloseTo(0, 10);
  });

  it("180° apart gives -2", () => {
    expect(geometricWeight(225, "LEADERSHIP")).toBeCloseTo(-2, 10);
  });

  it("never exceeds +2 or -2 for any angle", () => {
    for (let a = 0; a < 360; a += 3.75) {
      for (const dim of Object.keys(DIMENSION_AXES) as (keyof typeof DIMENSION_AXES)[]) {
        const w = geometricWeight(a, dim);
        expect(w).toBeLessThanOrEqual(2 + 1e-9);
        expect(w).toBeGreaterThanOrEqual(-2 - 1e-9);
      }
    }
  });
});

describe("dimension geometry — B. response mapping (Likert)", () => {
  const answers = { v1: 1 } as Record<string, number>; // v1 is the VALUES likert question
  const cases: [number, number][] = [[1, -1], [2, -0.5], [3, 0], [4, 0.5], [5, 1]];

  it.each(cases)("likert %i maps to responseSignal %f", (likert, expected) => {
    const [signal] = answersToSignals({ v1: likert }, SURVEY_QUESTIONS.filter((q) => q.id === "v1"));
    expect(signal.responseSignal).toBeCloseTo(expected, 10);
  });

  it("yes/no questions map YES=+1, NO=-1 (directional statements)", () => {
    const [yes] = answersToSignals({ v2: 1 }, SURVEY_QUESTIONS.filter((q) => q.id === "v2"));
    const [no] = answersToSignals({ v2: 0 }, SURVEY_QUESTIONS.filter((q) => q.id === "v2"));
    expect(yes.responseSignal).toBe(1);
    expect(no.responseSignal).toBe(-1);
  });

  void answers;
});

describe("dimension geometry — C. score direction", () => {
  it("a positive response toward a dimension produces positive evidence for archetypes near it", () => {
    // sosai sits at 343.13°, 28.13° from POWER (315°) — well within the
    // positive-affinity range.
    const w = geometricWeight(SPOKES["sosai"].angleDeg, "POWER");
    const responseSignal = 1; // strongly agree
    expect(responseSignal * w).toBeGreaterThan(0);
  });

  it("a negative response reverses the evidence sign", () => {
    const w = geometricWeight(SPOKES["sosai"].angleDeg, "POWER");
    const positive = 1 * w;
    const negative = -1 * w;
    expect(negative).toBeCloseTo(-positive, 10);
    expect(Math.sign(negative)).not.toBe(Math.sign(positive));
  });
});

describe("dimension geometry — D. edge dimensions", () => {
  it("MOTIVATION (90°) is the right edge of Q1 and left edge of Q2", () => {
    expect(QUADRANTS.Q1.rightEdgeDimension).toBe("MOTIVATION");
    expect(QUADRANTS.Q2.leftEdgeDimension).toBe("MOTIVATION");
    expect(getQuadrantsForDimension("MOTIVATION").sort()).toEqual(["Q1", "Q2"]);
  });

  it("FEARS (180°) is the right edge of Q2 and left edge of Q3", () => {
    expect(QUADRANTS.Q2.rightEdgeDimension).toBe("FEARS");
    expect(QUADRANTS.Q3.leftEdgeDimension).toBe("FEARS");
    expect(getQuadrantsForDimension("FEARS").sort()).toEqual(["Q2", "Q3"]);
  });

  it("DECISIONS (270°) is the right edge of Q3 and left edge of Q4", () => {
    expect(QUADRANTS.Q3.rightEdgeDimension).toBe("DECISIONS");
    expect(QUADRANTS.Q4.leftEdgeDimension).toBe("DECISIONS");
    expect(getQuadrantsForDimension("DECISIONS").sort()).toEqual(["Q3", "Q4"]);
  });

  it("DREAMS (0°) is the right edge of Q4 and left edge of Q1", () => {
    expect(QUADRANTS.Q4.rightEdgeDimension).toBe("DREAMS");
    expect(QUADRANTS.Q1.leftEdgeDimension).toBe("DREAMS");
    expect(getQuadrantsForDimension("DREAMS").sort()).toEqual(["Q1", "Q4"]);
  });
});

describe("dimension geometry — E. core dimensions", () => {
  it("LEADERSHIP = Q1 core, PEOPLE = Q2 core, VALUES = Q3 core, POWER = Q4 core", () => {
    expect(getQuadrantCoreDimension("Q1")).toBe("LEADERSHIP");
    expect(getQuadrantCoreDimension("Q2")).toBe("PEOPLE");
    expect(getQuadrantCoreDimension("Q3")).toBe("VALUES");
    expect(getQuadrantCoreDimension("Q4")).toBe("POWER");
  });

  it("each core dimension belongs to exactly one quadrant", () => {
    for (const dim of ["LEADERSHIP", "PEOPLE", "VALUES", "POWER"] as const) {
      expect(getQuadrantsForDimension(dim)).toHaveLength(1);
    }
  });
});

describe("dimension geometry — helpers", () => {
  it("normalizeAngle wraps into (-180, 180]", () => {
    expect(normalizeAngle(190)).toBeCloseTo(-170, 10);
    expect(normalizeAngle(-190)).toBeCloseTo(170, 10);
    expect(normalizeAngle(0)).toBe(0);
    expect(normalizeAngle(180)).toBe(180);
  });

  it("wrapAngle wraps into [0, 360)", () => {
    expect(wrapAngle(-10)).toBeCloseTo(350, 10);
    expect(wrapAngle(370)).toBeCloseTo(10, 10);
  });

  it("getDimensionAngle matches the canonical map", () => {
    expect(getDimensionAngle("DREAMS")).toBe(0);
    expect(getDimensionAngle("LEADERSHIP")).toBe(45);
    expect(getDimensionAngle("MOTIVATION")).toBe(90);
    expect(getDimensionAngle("PEOPLE")).toBe(135);
    expect(getDimensionAngle("FEARS")).toBe(180);
    expect(getDimensionAngle("VALUES")).toBe(225);
    expect(getDimensionAngle("DECISIONS")).toBe(270);
    expect(getDimensionAngle("POWER")).toBe(315);
  });

  it("getQuadrant assigns boundary angles per spec (0→Q1, 90→Q2, 180→Q3, 270→Q4)", () => {
    expect(getQuadrant(0)).toBe("Q1");
    expect(getQuadrant(90)).toBe("Q2");
    expect(getQuadrant(180)).toBe("Q3");
    expect(getQuadrant(270)).toBe("Q4");
    expect(getQuadrant(360)).toBe("Q1");
  });

  it("getAdjacentDimensions returns the two 45°-neighbors on the ring", () => {
    expect(getAdjacentDimensions("LEADERSHIP")).toEqual(["DREAMS", "MOTIVATION"]);
    expect(getAdjacentDimensions("DREAMS")).toEqual(["POWER", "LEADERSHIP"]);
  });
});

describe("32×8 debug matrix export", () => {
  const archetypes = Object.values(ARCHETYPE_DEFINITIONS).map((a) => ({
    id: a.id, name: a.label, angle: SPOKES[a.id].angleDeg,
  }));
  const matrix = generateDimensionalMatrix(archetypes);

  it("has exactly 32 rows, one per archetype", () => {
    expect(matrix).toHaveLength(32);
  });

  it("every row has all 8 dimension columns, each generated (not hand-populated)", () => {
    for (const row of matrix) {
      for (const dim of Object.keys(DIMENSION_AXES) as (keyof typeof DIMENSION_AXES)[]) {
        expect(row[dim]).toBeCloseTo(geometricWeight(row.angle, dim), 10);
      }
    }
  });
});
