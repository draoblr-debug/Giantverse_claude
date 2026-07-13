import { describe, expect, it } from "vitest";
import { WHEEL_ORDER } from "@/engines/archetype/archetype-wheel";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import { computeCompatibility, findArchetypeByName } from "@/engines/compatibility/compatibility.engine";

function isError(r: ReturnType<typeof computeCompatibility>): r is { error: string } {
  return "error" in r;
}

describe("findArchetypeByName", () => {
  it("resolves a full legacy name via its surname", () => {
    expect(findArchetypeByName("Teyuka Kanryo")?.id).toBe("kanryo");
  });

  it("resolves the surname alone", () => {
    expect(findArchetypeByName("Kanryo")?.id).toBe("kanryo");
  });

  it("is macron-insensitive", () => {
    expect(findArchetypeByName("Teyuka Kanryō")?.id).toBe("kanryo");
    expect(findArchetypeByName("Kōro")?.id).toBe("koro");
    expect(findArchetypeByName("Koro")?.id).toBe("koro");
  });

  it("is case-insensitive", () => {
    expect(findArchetypeByName("teyuka KANRYO")?.id).toBe("kanryo");
  });

  it("returns null for an unrecognised name", () => {
    expect(findArchetypeByName("Not A Real Surname")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(findArchetypeByName("   ")).toBeNull();
  });

  it("resolves every defined archetype by its own romaji surname", () => {
    for (const profile of Object.values(ARCHETYPE_DEFINITIONS)) {
      expect(findArchetypeByName(profile.romajiName)?.id).toBe(profile.id);
    }
  });
});

describe("computeCompatibility", () => {
  it("is deterministic — same inputs always produce the same result", () => {
    const a = computeCompatibility("Teyuka Kanryo", "Ananya Gijutsu");
    const b = computeCompatibility("Teyuka Kanryo", "Ananya Gijutsu");
    expect(a).toEqual(b);
  });

  it("is symmetric — order of names doesn't change the role or percentage", () => {
    const a = computeCompatibility("Teyuka Kanryo", "Ananya Gijutsu");
    const b = computeCompatibility("Ananya Gijutsu", "Teyuka Kanryo");
    if (isError(a) || isError(b)) throw new Error("expected a valid result");
    expect(a.role).toBe(b.role);
    expect(a.percentage).toBe(b.percentage);
    expect(a.distance).toBe(b.distance);
  });

  it("returns an error for an unrecognised name", () => {
    const r = computeCompatibility("Not A Name", "Teyuka Kanryo");
    expect(isError(r)).toBe(true);
  });

  it("gives the same archetype paired with itself the Ally role at 100%", () => {
    const r = computeCompatibility("Teyuka Kanryo", "Rohan Kanryo");
    if (isError(r)) throw new Error("expected a valid result");
    expect(r.role).toBe("Ally");
    expect(r.percentage).toBe(100);
    expect(r.distance).toBe(0);
  });

  it("gives exact wheel opposites the Villain role at 100%", () => {
    const r = computeCompatibility("Teyuka Tetsugaku", "Rohan Seizon");
    if (isError(r)) throw new Error("expected a valid result");
    expect(r.distance).toBe(16);
    expect(r.role).toBe("Villain");
    expect(r.percentage).toBe(100);
  });

  it("always resolves to one of the five defined Giant Hunt roles, for every pair", () => {
    const allowed = new Set(["Ally", "Mentor", "Romance", "Rival", "Villain"]);
    const ids = WHEEL_ORDER;
    for (const idA of ids) {
      for (const idB of ids) {
        const r = computeCompatibility(
          ARCHETYPE_DEFINITIONS[idA].romajiName,
          ARCHETYPE_DEFINITIONS[idB].romajiName,
        );
        if (isError(r)) throw new Error(`unexpected error for ${idA}/${idB}: ${r.error}`);
        expect(allowed.has(r.role)).toBe(true);
        expect(r.percentage).toBeGreaterThanOrEqual(60);
        expect(r.percentage).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe("mentor/mentee direction", () => {
  it("identifies the same person as mentor regardless of which input slot they're passed in", () => {
    const a = computeCompatibility("Teyuka Kanryo", "Ananya Gijutsu");
    const b = computeCompatibility("Ananya Gijutsu", "Teyuka Kanryo");
    if (isError(a) || isError(b)) throw new Error("expected a valid result");
    expect(a.role).toBe("Mentor");
    expect(b.role).toBe("Mentor");
    expect(a.mentor?.name).toBe("Ananya Gijutsu");
    expect(a.mentee?.name).toBe("Teyuka Kanryo");
    // Same underlying pairing, just passed in the opposite order — the
    // same person must still come out as mentor, not whichever was "A".
    expect(b.mentor?.name).toBe("Ananya Gijutsu");
    expect(b.mentee?.name).toBe("Teyuka Kanryo");
  });

  it("produces the identical directional tagline regardless of input order", () => {
    const a = computeCompatibility("Teyuka Kanryo", "Ananya Gijutsu");
    const b = computeCompatibility("Ananya Gijutsu", "Teyuka Kanryo");
    if (isError(a) || isError(b)) throw new Error("expected a valid result");
    expect(a.tagline).toBe(b.tagline);
    expect(a.tagline).toContain("Ananya Gijutsu has already walked the road Teyuka Kanryo is on");
  });

  it("leaves mentor/mentee unset for every non-Mentor role", () => {
    const ally = computeCompatibility("Teyuka Kanryo", "Rohan Kanryo");
    const villain = computeCompatibility("Teyuka Tetsugaku", "Rohan Seizon");
    for (const r of [ally, villain]) {
      if (isError(r)) throw new Error("expected a valid result");
      expect(r.mentor).toBeUndefined();
      expect(r.mentee).toBeUndefined();
    }
  });
});
