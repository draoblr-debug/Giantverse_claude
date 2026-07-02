import { describe, expect, it } from "vitest";
import { buildLegacyName } from "@/engines/naming/legacy-name.engine";

describe("buildLegacyName", () => {
  it("matches the spec's worked example: Toyuho + Kanryo archetype", () => {
    expect(buildLegacyName("Toyuho", "kanryo")).toBe("Toyuho Kanryō");
  });

  it("concatenates birth name and archetype romaji name with a space", () => {
    expect(buildLegacyName("Naheku", "tansa")).toBe("Naheku Tansa");
  });

  it("throws for an unknown archetype id", () => {
    expect(() => buildLegacyName("Naheku", "nonexistent")).toThrow();
  });
});
