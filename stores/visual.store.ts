import { create } from "zustand";
import type { CharacterMatch } from "@/types/visual.types";

// Visual Character Discovery state. Deliberately isolated from
// session.store: the visual match is inspiration-only and NEVER feeds the
// Giantverse identity engine (DOB + name + archetype logic stays the sole
// source of truth for identity).
//
// Privacy: photoDataUrl lives only in memory for the current tab; nothing
// here is persisted to storage, and clearPhoto() drops the pixels the
// moment the user asks (or as soon as analysis completes).

type VisualStore = {
  photoDataUrl: string | null;   // transient — cleared after analysis/delete
  matches: CharacterMatch[] | null;
  analyzedAt: number | null;

  setPhoto: (dataUrl: string) => void;
  clearPhoto: () => void;
  setMatches: (matches: CharacterMatch[]) => void;
  reset: () => void;
};

export const useVisualStore = create<VisualStore>((set) => ({
  photoDataUrl: null,
  matches: null,
  analyzedAt: null,

  setPhoto: (dataUrl) => set({ photoDataUrl: dataUrl }),
  clearPhoto: () => set({ photoDataUrl: null }),
  setMatches: (matches) => set({ matches, analyzedAt: Date.now() }),
  reset: () => set({ photoDataUrl: null, matches: null, analyzedAt: null }),
}));
