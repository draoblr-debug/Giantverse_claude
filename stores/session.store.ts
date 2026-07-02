import { create } from "zustand";
import type { SessionStore } from "@/types/session.types";

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessionId: null,
  firstName: "",
  birthDay: null,
  birthMonth: null,
  birthName: null,
  legacyName: null,
  archetype: null,
  archetypeLabel: null,
  guidingPromise: null,
  traits: null,
  order: null,
  scores: null,

  initSession: async (firstName, day, month) => {
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, day, month }),
    });

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Something went wrong." }));
      throw new Error(error ?? "Something went wrong.");
    }

    const data = await res.json();
    set({
      sessionId: data.sessionId,
      firstName: data.firstName,
      birthDay: data.day,
      birthMonth: data.month,
      birthName: data.birthName,
    });

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("giantverse:sessionId", data.sessionId);
    }
  },

  acceptLegacyName: (legacyName, archetypeId, order, archetypeLabel, guidingPromise, traits, scores) => {
    set({ legacyName, archetype: archetypeId, order, archetypeLabel, guidingPromise, traits, scores: scores ?? null });
  },

  resetExperience: () => {
    const { birthName } = get();
    set({
      sessionId: null,
      firstName: "",
      birthDay: null,
      birthMonth: null,
      birthName,
      legacyName: null,
      archetype: null,
      archetypeLabel: null,
      guidingPromise: null,
      traits: null,
      order: null,
      scores: null,
    });
  },
}));
