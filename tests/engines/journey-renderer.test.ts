import { describe, expect, it } from "vitest";
import { computeRadialTrajectory, SPOKES } from "@/lib/journey-renderer";
import type { TurnSnapshot } from "@/lib/journey-renderer";

const R = 300;
const CX = 450;
const CY = 450;

function distance(x: number, y: number) {
  return Math.hypot(x - CX, y - CY);
}

// A synthetic 5-turn history where the same archetype (kanryo) keeps
// accumulating positive evidence turn over turn — score magnitude only
// grows, never resets — so any radius behavior here is purely about how
// computeRadialTrajectory maps that history to the canvas, not about the
// underlying score.
const someId = Object.keys(SPOKES)[0];
const otherId = Object.keys(SPOKES)[1];

function buildTurns(n: number): TurnSnapshot[] {
  return Array.from({ length: n }, (_, i) => ({
    category: "TEST",
    scores: { [someId]: 0.5 + i * 0.5, [otherId]: 0.3 },
  }));
}

describe("computeRadialTrajectory", () => {
  it("plots turn 1 near the center and the last turn at the full radius", () => {
    const traj = computeRadialTrajectory(buildTurns(5), R, CX, CY);
    expect(traj).toHaveLength(5);
    expect(distance(traj[0].x, traj[0].y)).toBeCloseTo(R * (1 / 5), 6);
    expect(distance(traj[4].x, traj[4].y)).toBeCloseTo(R, 6);
  });

  it("radius increases monotonically with turn index regardless of score magnitude", () => {
    const traj = computeRadialTrajectory(buildTurns(6), R, CX, CY);
    const radii = traj.map((p) => distance(p.x, p.y));
    for (let i = 1; i < radii.length; i++) {
      expect(radii[i]).toBeGreaterThan(radii[i - 1]);
    }
  });

  it("direction still reflects that turn's actual leaning evidence, not a fixed schedule", () => {
    const turns: TurnSnapshot[] = [
      { category: "A", scores: { [someId]: 1 } },
      { category: "B", scores: { [otherId]: 1 } },
    ];
    const traj = computeRadialTrajectory(turns, R, CX, CY);
    expect(traj[0].leaderId).toBe(someId);
    expect(traj[1].leaderId).toBe(otherId);
    // Different leaders at 90°+ apart on the wheel should not point the
    // same direction from center.
    const dir0 = Math.atan2(traj[0].y - CY, traj[0].x - CX);
    const dir1 = Math.atan2(traj[1].y - CY, traj[1].x - CX);
    expect(Math.abs(dir0 - dir1)).toBeGreaterThan(0.01);
  });

  it("plots at the center for a turn with no positive evidence", () => {
    const traj = computeRadialTrajectory([{ category: "X", scores: {} }], R, CX, CY);
    expect(traj[0].x).toBe(CX);
    expect(traj[0].y).toBe(CY);
    expect(traj[0].leaderId).toBeNull();
  });
});
