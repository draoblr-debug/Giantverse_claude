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

  it("scores the Bureaucrat highest for strong DECISIONS + VALUES + FEARS signals", () => {
    const signals: Signal[] = [
      { dimension: "DECISIONS", value: "needs process", confidence: 0.9, turnIndex: 0 },
      { dimension: "VALUES", value: "values order", confidence: 0.9, turnIndex: 1 },
      { dimension: "FEARS", value: "dreads chaos", confidence: 0.9, turnIndex: 2 },
    ];
    const [top] = scoreArchetypes(signals);
    expect(top.archetype.id).toBe("kanryo");
  });

  it("scores zero for an archetype with no matching signals", () => {
    const signals: Signal[] = [{ dimension: "POWER", value: "x", confidence: 1, turnIndex: 0 }];
    const scores = scoreArchetypes(signals);
    const tansa = scores.find((s) => s.archetype.id === "tansa")!;
    expect(tansa.normalized).toBe(0);
  });

  it("applies antiWeights to reduce score (Technocrat vs. strong PEOPLE signal)", () => {
    const withoutPeople = scoreArchetypes([
      { dimension: "MOTIVATION", value: "x", confidence: 0.9, turnIndex: 0 },
    ]).find((s) => s.archetype.id === "gijutsu")!;

    const withPeople = scoreArchetypes([
      { dimension: "MOTIVATION", value: "x", confidence: 0.9, turnIndex: 0 },
      { dimension: "PEOPLE", value: "x", confidence: 0.9, turnIndex: 1 },
    ]).find((s) => s.archetype.id === "gijutsu")!;

    expect(withPeople.normalized).toBeLessThan(withoutPeople.normalized);
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
    expect(result?.archetype.id).toBe("kanryo");
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
