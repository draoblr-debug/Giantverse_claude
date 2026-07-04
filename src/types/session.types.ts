import type { TurnSnapshot } from "@/lib/journey-renderer";

export type SessionStore = {
  sessionId: string | null;
  firstName: string;
  birthDay: number | null;
  birthMonth: number | null;
  birthName: string | null;
  legacyName: string | null;
  archetype: string | null;         // archetype id
  archetypeLabel: string | null;    // e.g. "Survivor"
  guidingPromise: string | null;
  traits: [string, string, string, string] | null;
  order: "GIANT" | "HUNTER" | null;
  scores: Record<string, number> | null; // archetype id → normalized score
  scoreHistory: TurnSnapshot[] | null; // per-turn score snapshots for the journey map

  initSession: (firstName: string, day: number, month: number) => Promise<void>;
  acceptLegacyName: (
    legacyName: string,
    archetypeId: string,
    order: "GIANT" | "HUNTER",
    archetypeLabel: string,
    guidingPromise: string,
    traits: [string, string, string, string],
    scores?: Record<string, number>,
    scoreHistory?: TurnSnapshot[],
  ) => void;
  resetExperience: () => void;
};
