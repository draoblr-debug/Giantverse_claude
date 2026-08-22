import { describe, expect, it } from "vitest";
import { scoreArchetypes, selectArchetype, dimensionsCovered } from "@/engines/archetype/archetype.engine";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import { classifyOrder } from "@/engines/archetype/order-classifier";
import { canReveal } from "@/engines/archetype/confidence.engine";
import type { Signal } from "@/types/archetype.types";

describe("archetype-definitions", () => {
  it("defines exactly 32 archetypes", () => {
    expect(Object.keys(ARCHETYPE_DEFINITIONS)).toHaveLength(32);
  });

  it("splits evenly into 16 GIANT and 16 HUNTER archetypes", () => {
    const orders = Object.values(ARCHETYPE_DEFINITIONS).map((a) => a.order);
    expect(orders.filter((o) => o === "GIANT")).toHaveLength(16);
    expect(orders.filter((o) => o === "HUNTER")).toHaveLength(16);
  });

  it("every archetype id matches its own key", () => {
    for (const [key, archetype] of Object.entries(ARCHETYPE_DEFINITIONS)) {
      expect(archetype.id).toBe(key);
    }
  });
});

describe("scoreArchetypes", () => {
  it("returns all 32 archetypes sorted by descending normalized score", () => {
    const signals: Signal[] = [{ dimension: "DECISIONS", value: "loves process", confidence: 0.9, turnIndex: 0 }];
    const scores = scoreArchetypes(signals);
    expect(scores).toHaveLength(32);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1].normalized).toBeGreaterThanOrEqual(scores[i].normalized);
    }
  });

  // GEOMETRIC DIMENSION MODEL: archetype-vs-dimension relationships are no
  // longer hand-authored weights, they're purely a function of angular
  // distance between the archetype's (preserved, unchanged) wheel angle
  // and the dimension's canonical angle (see dimension-geometry.ts). These
  // two archetypes' real wheel angles: kanryo sits 5.625° from POWER
  // (315°), tansa sits 90° from POWER — so a strong POWER signal must rank
  // kanryo well above tansa, purely from geometry, no per-archetype tuning
  // involved.
  it("ranks an archetype whose wheel angle is near the signaled dimension above one far from it", () => {
    const signals: Signal[] = [{ dimension: "POWER", value: "x", confidence: 1, turnIndex: 0 }];
    const scores = scoreArchetypes(signals);
    const kanryo = scores.find((s) => s.archetype.id === "kanryo")!;
    const tansa = scores.find((s) => s.archetype.id === "tansa")!;
    expect(kanryo.raw).toBeGreaterThan(tansa.raw);
  });

  // gijutsu's wheel angle (275.6°) is far from MOTIVATION's (90°, almost
  // opposite) — 2*cos(~186°) is close to -2, the model's maximum
  // opposition — so a confident MOTIVATION signal should pull it strongly
  // negative even though nothing "anti-weighted" it; the sign comes
  // entirely from the angular relationship.
  it("scores negatively for an archetype whose wheel angle sits opposite the signaled dimension", () => {
    const signals: Signal[] = [{ dimension: "MOTIVATION", value: "x", confidence: 0.9, turnIndex: 0 }];
    const gijutsu = scoreArchetypes(signals).find((s) => s.archetype.id === "gijutsu")!;
    expect(gijutsu.raw).toBeLessThan(0);
  });

  // No antiWeights involved anymore — PEOPLE (135°) is also far from
  // gijutsu's angle, so accumulating a second badly-aligned signal must
  // push the RAW signed score further negative. (`.normalized` isn't the
  // right field for this comparison: it rescales by signal count, so its
  // magnitude isn't monotonic with "more negative evidence added" the way
  // the raw cumulative score is.)
  it("accumulates further negative evidence as more badly-aligned signals arrive", () => {
    const withoutPeople = scoreArchetypes([
      { dimension: "MOTIVATION", value: "x", confidence: 0.9, turnIndex: 0 },
    ]).find((s) => s.archetype.id === "gijutsu")!;

    const withPeople = scoreArchetypes([
      { dimension: "MOTIVATION", value: "x", confidence: 0.9, turnIndex: 0 },
      { dimension: "PEOPLE", value: "x", confidence: 0.9, turnIndex: 1 },
    ]).find((s) => s.archetype.id === "gijutsu")!;

    expect(withPeople.raw).toBeLessThan(withoutPeople.raw);
  });
});

describe("selectArchetype", () => {
  it("returns null when there are no signals", () => {
    expect(selectArchetype([])).toBeNull();
  });

  it("returns the top archetype once its confidenceThreshold is cleared", () => {
    const signals: Signal[] = [
      { dimension: "DECISIONS", value: "x", confidence: 0.9, turnIndex: 0 },
      { dimension: "VALUES", value: "x", confidence: 0.9, turnIndex: 1 },
      { dimension: "FEARS", value: "x", confidence: 0.9, turnIndex: 2 },
    ];
    const result = selectArchetype(signals);
    expect(result).not.toBeNull();
    expect(result!.normalized).toBeGreaterThanOrEqual(result!.archetype.confidenceThreshold);
  });
});

describe("classifyOrder", () => {
  it("classifies known archetypes correctly", () => {
    expect(classifyOrder("kanryo")).toBe("GIANT");
    expect(classifyOrder("seizon")).toBe("HUNTER");
  });

  it("throws for an unknown archetype id", () => {
    expect(() => classifyOrder("nonexistent")).toThrow();
  });
});

describe("dimensionsCovered", () => {
  it("only counts signals at or above the confidence threshold", () => {
    const signals: Signal[] = [
      { dimension: "VALUES", value: "x", confidence: 0.8, turnIndex: 0 },
      { dimension: "FEARS", value: "x", confidence: 0.4, turnIndex: 1 },
    ];
    expect(dimensionsCovered(signals, 0.6)).toEqual(["VALUES"]);
  });
});

describe("canReveal (reveal gating)", () => {
  const confident = (n: number): Signal[] =>
    (["VALUES", "FEARS", "DREAMS", "POWER", "PEOPLE", "DECISIONS", "LEADERSHIP", "MOTIVATION"] as const)
      .slice(0, n)
      .map((dimension, i) => ({ dimension, value: "x", confidence: 0.9, turnIndex: i }));

  it("is false with fewer than 5 confident dimensions, even with enough turns", () => {
    expect(canReveal(confident(4), 10)).toBe(false);
  });

  it("is false with 5+ confident dimensions but fewer than 6 turns", () => {
    expect(canReveal(confident(5), 3)).toBe(false);
  });

  it("is true with 5+ confident dimensions and at least 6 turns", () => {
    expect(canReveal(confident(5), 6)).toBe(true);
  });
});
