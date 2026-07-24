import { create } from "zustand";
import type { CharacterMatch } from "@/types/visual.types";
import type { Signal } from "@/types/archetype.types";

// Visual Character Discovery state — one of three ways (alongside survey
// and chat) to reach a Giantverse archetype. The archetype itself is
// derived from `matches` (sum of similarity by archetype across the top 5,
// same as the reference app's MainViewModel.generateUserIdentity) —
// `signals` are kept only to drive the shared journey/convergence
// visualization on the reveal page, not to decide the winning archetype.
//
// Privacy: photoDataUrl lives only in memory for the current tab, never
// uploaded anywhere. It's kept a little longer than the old "drop it the
// instant analysis finishes" rule — the reveal page's share card (a real
// selfie photo, like the reference app's) needs it — but it's still purely
// in-memory, and clearPhoto() drops it the moment the user asks, retakes,
// or finishes the reveal ritual (see /reveal's own cleanup effect).

type VisualStore = {
  photoDataUrl: string | null;   // transient — cleared on delete/retake/reveal-exit
  matches: CharacterMatch[] | null;
  signals: Signal[] | null;
  archetypeId: string | null;
  archetypeScoreMap: Record<string, number> | null;
  analyzedAt: number | null;

  setPhoto: (dataUrl: string) => void;
  clearPhoto: () => void;
  setMatches: (
    matches: CharacterMatch[],
    signals: Signal[],
    archetypeId: string | null,
    archetypeScoreMap: Record<string, number>,
  ) => void;
  reset: () => void;
};

export const useVisualStore = create<VisualStore>((set) => ({
  photoDataUrl: null,
  matches: null,
  signals: null,
  archetypeId: null,
  archetypeScoreMap: null,
  analyzedAt: null,

  setPhoto: (dataUrl) => set({ photoDataUrl: dataUrl }),
  clearPhoto: () => set({ photoDataUrl: null }),
  setMatches: (matches, signals, archetypeId, archetypeScoreMap) =>
    set({ matches, signals, archetypeId, archetypeScoreMap, analyzedAt: Date.now() }),
  reset: () => set({ photoDataUrl: null, matches: null, signals: null, archetypeId: null, archetypeScoreMap: null, analyzedAt: null }),
}));
