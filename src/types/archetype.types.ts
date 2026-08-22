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
  // Signed directional evidence in [-1, +1] for the GEOMETRIC DIMENSION
  // MODEL's scoring formula (see src/engines/archetype/archetype.engine.ts):
  // -1 = strongly against this dimension's direction, +1 = strongly for
  // it. Only survey answers can express this (a Likert/Yes-No response has
  // a real "for or against" direction); chat- and photo-derived signals
  // have no such direction, so they're scored with a positive-only
  // fallback (their `confidence`) instead — see answersToSignals() for
  // where this is actually computed.
  responseSignal?: number;
};

export type ArchetypeProfile = {
  id: string;
  label: string;
  order: Order;
  temperament: Temperament;
  japaneseName: string;
  romajiName: string;
  realmBias?: string;
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
  // Raw signed cumulative score under the GEOMETRIC DIMENSION MODEL —
  // unbounded, positive/negative evidence can cancel. See
  // src/engines/archetype/archetype.engine.ts.
  raw: number;
  // `raw` linearly rescaled for threshold/margin comparisons — not a
  // probability, doesn't sum to anything across archetypes.
  normalized: number;
};
