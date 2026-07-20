import { create } from "zustand";
import type { CharacterMatch, GenderFilter } from "@/types/visual.types";

// Visual Character Discovery state. Deliberately isolated from
// session.store: the visual match is inspiration-only and NEVER feeds the
// Giantverse identity engine (DOB + name + archetype logic stays the sole
// source of truth for identity).
//
// Privacy: photoDataUrl lives only in memory for the current tab; nothing
// here is persisted to storage. It's kept through the results stage so the
// share card can embed it, and clearPhoto() drops the pixels the moment
// the user asks (or as soon as the discovery module unmounts).

type VisualStore = {
  photoDataUrl: string | null;   // transient — cleared after analysis/delete
  matches: CharacterMatch[] | null;
  analyzedAt: number | null;
  // Persists across sessions on this device (not a privacy-sensitive value)
  // so the user doesn't have to reselect it every time, matching the
  // Android app's AUTO/MALE/FEMALE/ANY control.
  genderFilter: GenderFilter;

  setPhoto: (dataUrl: string) => void;
  clearPhoto: () => void;
  setMatches: (matches: CharacterMatch[]) => void;
  setGenderFilter: (filter: GenderFilter) => void;
  reset: () => void;
};

export const useVisualStore = create<VisualStore>((set) => ({
  photoDataUrl: null,
  matches: null,
  analyzedAt: null,
  genderFilter: "AUTO",

  setPhoto: (dataUrl) => set({ photoDataUrl: dataUrl }),
  clearPhoto: () => set({ photoDataUrl: null }),
  setMatches: (matches) => set({ matches, analyzedAt: Date.now() }),
  setGenderFilter: (genderFilter) => set({ genderFilter }),
  reset: () => set({ photoDataUrl: null, matches: null, analyzedAt: null }),
}));
