// Visual Character Discovery — types.
//
// IMPORTANT DISTINCTION (maintained everywhere): the face image produces a
// VISUAL EMBEDDING used only for design-language similarity against fictional
// characters. It never feeds the Giantverse identity engine, which remains
// driven exclusively by DOB + first name + archetype logic.

// The named axes of the visual embedding. Every value is normalized 0..1.
// These are geometric/photometric measurements — not identity, not emotion.
export type VisualAxes = {
  faceLength: number;        // 0 round/compact … 1 long/narrow
  jawSharpness: number;      // 0 soft/curved … 1 angular/pointed
  eyeNarrowness: number;     // 0 wide/open … 1 narrow/tapered
  browWeight: number;        // 0 light/faint … 1 heavy/dark
  hairDarkness: number;      // 0 light … 1 dark
  hairVolume: number;        // 0 close-cropped … 1 voluminous/tall
  expressionNeutrality: number; // 0 animated mouth region … 1 flat/neutral
  symmetry: number;          // 0 asymmetric … 1 mirror-symmetric
  contrast: number;          // 0 soft tonal range … 1 high contrast
  angularity: number;        // 0 curve-dominant … 1 straight/diagonal-dominant
  glasses: number;           // 0 none detected … 1 strong eyewear signal
  warmth: number;            // 0 cool tones … 1 warm tones
};

export const VISUAL_AXES: (keyof VisualAxes)[] = [
  "faceLength", "jawSharpness", "eyeNarrowness", "browWeight",
  "hairDarkness", "hairVolume", "expressionNeutrality", "symmetry",
  "contrast", "angularity", "glasses", "warmth",
];

// Human-readable labels for the "why you resemble" checklist.
export const AXIS_LABELS: Record<keyof VisualAxes, string> = {
  faceLength: "Face geometry",
  jawSharpness: "Jawline",
  eyeNarrowness: "Eye proportions",
  browWeight: "Eyebrow style",
  hairDarkness: "Hair tone",
  hairVolume: "Hair silhouette",
  expressionNeutrality: "Neutral expression",
  symmetry: "Facial balance",
  contrast: "Tonal contrast",
  angularity: "Shape language",
  glasses: "Eyewear",
  warmth: "Colour temperature",
};

export type VisualEmbedding = {
  axes: VisualAxes;
  // raw quality signals — used to warn on bad crops, never stored
  faceConfidence: number; // how confident the face-region detection was
};

export type CharacterCollection =
  | "anime" | "games" | "movies" | "animation" | "comics"
  | "historical" | "mythology" | "giantverse";

export type CharacterEntry = {
  id: string;
  name: string;
  series: string;
  designer: string;
  studio: string;
  franchise: string;
  collection: CharacterCollection;
  visual_traits: string[];
  design_language: string[];
  shape_language: string;
  primary_colors: string[];
  silhouette: string;
  archetype: string;      // the character's narrative archetype (context only)
  temperament: string;
  keywords: string[];
  image: string | null;   // no copyrighted images bundled — monogram rendered instead
  copyright_notice: string;
  description: string;
  // Position of this character's DESIGN on the same measurement axes.
  // Hand-authored from published art; drives similarity matching.
  profile: VisualAxes;
  // Educational breakdown: what the design communicates, and through what.
  design_breakdown: {
    communicates: string[];
    through: string[];
  };
  // Real tie into the 32-archetype wheel (archetype-definitions.ts ids) +
  // Order — present on the 182 characters ported from Lens-Hunt-anime,
  // undefined on the older 200-entry seed authored before that mapping
  // existed. The participant's own archetype is derived from these tags —
  // summed by similarity across their top-5 character matches, same as the
  // reference app's MainViewModel.generateUserIdentity — so only
  // archetypeId-tagged characters are eligible for visual-discovery
  // matching (see CharacterDatabase.archetypeEligible()).
  archetypeId?: string;
  order?: "GIANT" | "HUNTER";
  // One of Lens-Hunt-anime's 5 hand-authored design clusters (Clean & Stoic,
  // Sharp & Cool, Mature & Structured, Highly Stylized, Non Human/Fantasy).
  // Narrows the matching candidate pool to the cluster(s) the user's own
  // axes best fit, same as the reference app's ClusterManager.
  cluster?: string;
};

export type CharacterMatch = {
  character: CharacterEntry;
  similarity: number;              // 0..100, display percentage
  matchedAxes: (keyof VisualAxes)[]; // strongest-agreeing axes, for the checklist
};
