import { describe, expect, it } from "vitest";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import {
  WHEEL_ORDER,
  getAllyIds,
  getOppositeId,
  getArchetypeRelations,
  OPPOSITE_TENSIONS,
} from "@/engines/archetype/archetype-wheel";
import { detectTension } from "@/engines/archetype/tension.engine";
import type { Signal } from "@/types/archetype.types";

describe("WHEEL_ORDER", () => {
  it("contains every defined archetype exactly once", () => {
    const definedIds = Object.keys(ARCHETYPE_DEFINITIONS).sort();
    expect([...WHEEL_ORDER].sort()).toEqual(definedIds);
  });
});

describe("getOppositeId", () => {
  it("is symmetric: opposite of opposite is the original archetype", () => {
    for (const id of WHEEL_ORDER) {
      expect(getOppositeId(getOppositeId(id))).toBe(id);
    }
  });

  it("never returns the archetype itself", () => {
    for (const id of WHEEL_ORDER) {
      expect(getOppositeId(id)).not.toBe(id);
    }
  });

  it("matches the documented Philosopher/Survivor tension", () => {
    expect(getOppositeId("tetsugaku")).toBe("seizon");
    expect(getOppositeId("seizon")).toBe("tetsugaku");
  });

  it("throws for an unknown archetype id", () => {
    expect(() => getOppositeId("nonexistent")).toThrow();
  });
});

describe("getAllyIds", () => {
  it("never includes the archetype itself or its opposite", () => {
    for (const id of WHEEL_ORDER) {
      const allies = getAllyIds(id);
      expect(allies).not.toContain(id);
      expect(allies).not.toContain(getOppositeId(id));
    }
  });

  it("is mutually reflected by immediate neighbors", () => {
    const [prev, next] = getAllyIds("tetsugaku");
    expect(getAllyIds(prev)).toContain("tetsugaku");
    expect(getAllyIds(next)).toContain("tetsugaku");
  });
});

describe("OPPOSITE_TENSIONS", () => {
  it("gives both archetypes in a pair the same central question", () => {
    for (const id of WHEEL_ORDER) {
      expect(OPPOSITE_TENSIONS[getOppositeId(id)]).toBe(OPPOSITE_TENSIONS[id]);
    }
  });
});

describe("getArchetypeRelations", () => {
  it("bundles opposite, allies, and the shared central question", () => {
    const relations = getArchetypeRelations("tetsugaku");
    expect(relations.opposite.id).toBe("seizon");
    expect(relations.allies.map((a) => a.id)).toEqual(getAllyIds("tetsugaku"));
    expect(relations.centralQuestion).toBe(OPPOSITE_TENSIONS.tetsugaku);
  });
});

describe("archetype shadows", () => {
  it("gives every archetype a non-empty shadow trait and description", () => {
    for (const archetype of Object.values(ARCHETYPE_DEFINITIONS)) {
      expect(archetype.shadow.trait.length).toBeGreaterThan(0);
      expect(archetype.shadow.description.length).toBeGreaterThan(0);
    }
  });
});

describe("detectTension", () => {
  it("returns null with no signals", () => {
    expect(detectTension([])).toBeNull();
  });

  it("returns null when the leader has no close opposite pull", () => {
    const signals: Signal[] = [
      { dimension: "DECISIONS", value: "needs process", confidence: 0.9, turnIndex: 0 },
      { dimension: "VALUES", value: "values order", confidence: 0.9, turnIndex: 1 },
      { dimension: "FEARS", value: "dreads chaos", confidence: 0.9, turnIndex: 2 },
    ];
    // Bureaucrat (kanryo) leads clearly here with no Reformer (kaikaku) signal at all.
    expect(detectTension(signals)).toBeNull();
  });

  it("surfaces the tension when the opposite is pulling almost as hard as the leader", () => {
    // Philosopher (VALUES/DREAMS/MOTIVATION) leads, but its opposite Survivor
    // (FEARS/VALUES/MOTIVATION) shares enough weight to trail closely.
    const signals: Signal[] = [
      { dimension: "VALUES", value: "seeks truth", confidence: 0.9, turnIndex: 0 },
      { dimension: "FEARS", value: "must endure", confidence: 0.9, turnIndex: 1 },
      { dimension: "DREAMS", value: "chases understanding", confidence: 0.9, turnIndex: 2 },
    ];
    const tension = detectTension(signals);
    expect(tension).not.toBeNull();
    expect([tension?.core.id, tension?.opposite.id].sort()).toEqual(["seizon", "tetsugaku"]);
    expect(tension?.centralQuestion).toBe(OPPOSITE_TENSIONS.tetsugaku);
  });
});
