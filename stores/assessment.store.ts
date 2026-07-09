import { create } from "zustand";
import type { Signal } from "@/types/archetype.types";

export interface AssessmentResult {
  source: "survey" | "chat";
  signals: Signal[];
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
