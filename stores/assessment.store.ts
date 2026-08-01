import { create } from "zustand";
import type { Signal } from "@/types/archetype.types";

export interface AssessmentResult {
  source: "survey" | "chat" | "visual";
  signals: Signal[];
  currentVector?: number[];
  vectorHistory?: number[][];
  chatThemes?: string[];
  // Visual source only: the archetype already decided by summing similarity
  // across the top-5 character matches (see archetype-vote.engine.ts) — the
  // reveal page uses this directly instead of re-deriving one from signals.
  archetypeId?: string;
  archetypeScoreMap?: Record<string, number>;
}

interface AssessmentStore {
  result: AssessmentResult | null;
  setResult: (result: AssessmentResult) => void;
  clearResult: () => void;
}

export const useAssessmentStore = create<AssessmentStore>((set) => ({
  result: null,
  setResult: (result) => set({ result }),
  clearResult: () => set({ result: null }),
}));
