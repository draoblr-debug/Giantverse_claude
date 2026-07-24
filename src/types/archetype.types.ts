export type Dimension =
  | "VALUES"
  | "FEARS"
  | "DREAMS"
  | "POWER"
  | "PEOPLE"
  | "DECISIONS"
  | "LEADERSHIP"
  | "MOTIVATION";

export type Order = "GIANT" | "HUNTER";

// The compass's second axis, independent of Order: whether an archetype
// principally drives events forward (initiative, momentum, decisive force)
// or holds steady (endurance, patience, receptive care). Positions the
// archetype in the compass's Northern (Active) or Southern (Passive) half,
// the same way Order positions it East (Giants) or West (Hunters).
export type Temperament = "ACTIVE" | "PASSIVE";

export type Signal = {
  dimension: Dimension;
  value: string;
  confidence: number; // 0.0 – 1.0
  turnIndex: number;
};

export type ArchetypeProfile = {
  id: string;
  label: string;
  order: Order;
  temperament: Temperament;
  japaneseName: string;
  romajiName: string;
  realmBias?: string;
  guild?: string;
  weights: Record<Dimension, number>; // 0.0 – 2.0, how strongly this dimension defines the archetype
  antiWeights: Record<Dimension, number>; // signals that argue against this archetype
  description: string;
  guidingPromise: string;
  traits: [string, string, string, string];
  traitDescriptions: [string, string, string, string];
  confidenceThreshold: number;
  // What this archetype becomes under pressure, when its own strength is
  // taken to an unchecked extreme. Not a flaw list — a warning label.
  shadow: { trait: string; description: string };
};

export type ArchetypeScore = {
  archetype: ArchetypeProfile;
  normalized: number;
};
