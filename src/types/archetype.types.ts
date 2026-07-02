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
};

export type ArchetypeScore = {
  archetype: ArchetypeProfile;
  normalized: number;
};
