import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import type { ArchetypeProfile } from "@/types/archetype.types";

// The 32 archetypes as a 32-point relationship wheel — this is the
// SEMANTIC wheel (compatibility distance, opposites, allies), not the
// compass's visual layout (see COMPASS_ORDER in src/content/landing-atlas.ts
// for that — the two are deliberately separate arrays). Every hand-authored
// opposite pair (OPPOSITE_TENSIONS) sits exactly 16 slots apart here — the
// Compatibility Checker (compatibility.engine.ts) and the dossier payload
// (persona-payload.ts) both depend on that invariant for their distance
// math, and it cannot hold if this array is also forced into the compass's
// Order/Temperament quadrant grouping (some opposite pairs share an Order or
// a Temperament, so "straight across the wheel" and "opposite quadrant"
// aren't the same constraint). Its Allies are its immediate neighbors
// (i - 1, i + 1) — the archetypes a person naturally drifts toward as they
// grow; grouped thematically here, but with no independent ground truth to
// preserve beyond that.
export const WHEEL_ORDER: string[] = [
  "minshu", "kenja", "kanryo", "sabaki", "riso", "yogen", "gijutsu", "hatsumei",
  "senryaku", "sosai", "kenchiku", "gaiko", "tetsugaku", "rekishi", "shisha", "nogyo",
  "kizoku", "teisatsu", "kaikaku", "banri", "hozon", "kensetsu", "iyashi", "shokunin",
  "mamori", "kaitaku", "tansa", "koro", "seizon", "monogatari", "yuei", "takumi",
];

const WHEEL_SIZE = WHEEL_ORDER.length;

const POSITION_BY_ID: Record<string, number> = Object.fromEntries(
  WHEEL_ORDER.map((id, i) => [id, i]),
);

// The central question each Opposite pair answers differently. Both
// archetypes in a pair map to the same question — deliberately never
// framed as good vs. evil, just two answers to one thing that matters.
export const OPPOSITE_TENSIONS: Record<string, string> = {
  tetsugaku: "Should we understand first, or endure first?",
  seizon: "Should we understand first, or endure first?",
  minshu: "Should power come from everyone, or from the exceptional?",
  kizoku: "Should power come from everyone, or from the exceptional?",
  kanryo: "Should we preserve the system, or change it?",
  kaikaku: "Should we preserve the system, or change it?",
  senryaku: "Should we win the conflict, or protect the people?",
  mamori: "Should we win the conflict, or protect the people?",
  hatsumei: "Should we create the new, or perfect the existing?",
  shokunin: "Should we create the new, or perfect the existing?",
  gaiko: "Should we build relationships, or seek new horizons?",
  koro: "Should we build relationships, or seek new horizons?",
  kenchiku: "Should we build a home, or discover a new one?",
  tansa: "Should we build a home, or discover a new one?",
  riso: "Should we imagine tomorrow, or preserve yesterday?",
  hozon: "Should we imagine tomorrow, or preserve yesterday?",
  gijutsu: "Should we optimize the system, or tend to the person?",
  iyashi: "Should we optimize the system, or tend to the person?",
  sabaki: "Should justice be weighed case by case, or upheld as an unbending line?",
  banri: "Should justice be weighed case by case, or upheld as an unbending line?",
  kenja: "Should we wait for wisdom to settle, or act before understanding is complete?",
  teisatsu: "Should we wait for wisdom to settle, or act before understanding is complete?",
  sosai: "Should we hold the center steady, or abandon it for the frontier?",
  kaitaku: "Should we hold the center steady, or abandon it for the frontier?",
  yogen: "Should we speak the pattern before it's proven, or build only what's already real?",
  kensetsu: "Should we speak the pattern before it's proven, or build only what's already real?",
  rekishi: "Should we preserve what happened, or keep alive the story of who we are?",
  monogatari: "Should we preserve what happened, or keep alive the story of who we are?",
  shisha: "Should truth be carried urgently to those who need it, or found patiently by walking between worlds?",
  yuei: "Should truth be carried urgently to those who need it, or found patiently by walking between worlds?",
  nogyo: "Should we control every detail until it's perfect, or trust a process we can't fully control?",
  takumi: "Should we control every detail until it's perfect, or trust a process we can't fully control?",
};

export function wheelPosition(archetypeId: string): number {
  const pos = POSITION_BY_ID[archetypeId];
  if (pos === undefined) {
    throw new Error(`wheelPosition: unknown archetype id "${archetypeId}"`);
  }
  return pos;
}

// Built from OPPOSITE_TENSIONS rather than wheel position: every id maps to
// whichever other id shares its central-question text (there are always
// exactly two). A content relationship, not a geometric one — it doesn't
// assume opposites sit 180° apart, which the compass's Order/Temperament
// layout can't guarantee for all 16 pairs (see WHEEL_ORDER above).
const OPPOSITE_BY_ID: Record<string, string> = (() => {
  const byQuestion = new Map<string, string[]>();
  for (const [id, question] of Object.entries(OPPOSITE_TENSIONS)) {
    const pair = byQuestion.get(question) ?? [];
    pair.push(id);
    byQuestion.set(question, pair);
  }
  const result: Record<string, string> = {};
  for (const [id, other] of byQuestion.values()) {
    result[id] = other;
    result[other] = id;
  }
  return result;
})();

// The archetype that answers the same central question differently.
export function getOppositeId(archetypeId: string): string {
  wheelPosition(archetypeId); // throws for an unknown id, same as before
  return OPPOSITE_BY_ID[archetypeId];
}

// The two neighboring archetypes on the wheel — the natural directions of
// gradual drift as a person's answers evolve over time.
export function getAllyIds(archetypeId: string): [string, string] {
  const pos = wheelPosition(archetypeId);
  return [
    WHEEL_ORDER[(pos - 1 + WHEEL_SIZE) % WHEEL_SIZE],
    WHEEL_ORDER[(pos + 1) % WHEEL_SIZE],
  ];
}

export type ArchetypeRelations = {
  opposite: ArchetypeProfile;
  allies: [ArchetypeProfile, ArchetypeProfile];
  centralQuestion: string;
};

export function getArchetypeRelations(archetypeId: string): ArchetypeRelations {
  const [allyA, allyB] = getAllyIds(archetypeId);
  return {
    opposite: ARCHETYPE_DEFINITIONS[getOppositeId(archetypeId)],
    allies: [ARCHETYPE_DEFINITIONS[allyA], ARCHETYPE_DEFINITIONS[allyB]],
    centralQuestion: OPPOSITE_TENSIONS[archetypeId],
  };
}
