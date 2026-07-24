// CharacterImagePromptBuilder — assembles a structured JSON prompt for
// generating original character art of the participant's Giantverse
// identity, drawing on the three things the ritual actually knows about
// them:
//   1. LORE      — the archetype's own description, guiding promise, traits
//                   and shadow (src/engines/archetype/archetype-definitions.ts)
//   2. FACE       — the participant's OWN measured facial geometry, if they
//                   went through Visual Character Discovery (VisualAxes —
//                   never the matched character's design profile)
//   3. ARCHETYPE  — order (Giant/Hunter), temperament, realm/guild
//
// This never claims to reproduce the participant's likeness — facial axes
// are translated into generic shape-language descriptors (as the visual
// discovery module already does for its "why you resemble" checklist), not
// fed back as a photo reference. The output is meant to be pasted into an
// image generator as a starting point for ORIGINAL concept art.

import type { ArchetypeProfile, Order } from "@/types/archetype.types";
import type { CharacterMatch, VisualAxes } from "@/types/visual.types";

export type CharacterImagePrompt = {
  subject: {
    name: string;
    title: string;
    japaneseName: string;
    romajiName: string;
    order: Order;
    temperament: string;
  };
  lore: {
    description: string;
    guidingPromise: string;
    traits: { name: string; description: string }[];
    shadow: { trait: string; description: string };
    realm: string | null;
    guild: string | null;
  };
  facialFeatures: {
    summary: string;
    details: string[];
    confidence: number;
  } | null;
  styleReference: {
    inspiredBy: string;
    series: string;
    shapeLanguage: string;
    similarity: number;
    note: string;
  } | null;
  artDirection: {
    medium: string;
    palette: string;
    lighting: string;
    mood: string;
    composition: string;
  };
  prompt: string;
};

// Only axes that sit meaningfully away from neutral (0.5) produce a
// descriptor — a wall of twelve "medium X" lines is worse than a shorter,
// honest list of what's actually distinctive.
const AXIS_DESCRIPTORS: Record<
  keyof VisualAxes,
  { high: [number, string]; low: [number, string] }
> = {
  faceLength: { high: [0.62, "an elongated, narrow face shape"], low: [0.38, "a compact, rounded face shape"] },
  jawSharpness: { high: [0.62, "a sharp, angular jawline"], low: [0.38, "a soft, rounded jawline"] },
  eyeNarrowness: { high: [0.62, "narrow, tapered eyes"], low: [0.38, "wide, open eyes"] },
  browWeight: { high: [0.62, "heavy, defined brows"], low: [0.38, "light, faint brows"] },
  hairDarkness: { high: [0.62, "dark hair"], low: [0.38, "light hair"] },
  hairVolume: { high: [0.62, "voluminous, tall hair"], low: [0.38, "close-cropped hair"] },
  expressionNeutrality: { high: [0.62, "a calm, composed expression"], low: [0.38, "an animated, expressive face"] },
  symmetry: { high: [0.75, "strikingly symmetrical features"], low: [-1, ""] },
  contrast: { high: [0.72, "high tonal contrast"], low: [-1, ""] },
  angularity: { high: [0.62, "angular, geometric shape language"], low: [0.38, "soft, curved shape language"] },
  glasses: { high: [0.5, "wearing glasses"], low: [-1, ""] },
  warmth: { high: [0.62, "warm skin tones"], low: [0.38, "cool skin tones"] },
};

function describeFacialAxes(axes: VisualAxes): string[] {
  const details: string[] = [];
  for (const key of Object.keys(AXIS_DESCRIPTORS) as (keyof VisualAxes)[]) {
    const value = axes[key];
    const { high, low } = AXIS_DESCRIPTORS[key];
    if (high[0] >= 0 && value >= high[0]) details.push(high[1]);
    else if (low[0] >= 0 && value <= low[0]) details.push(low[1]);
  }
  return details;
}

const ORDER_ART_DIRECTION: Record<Order, CharacterImagePrompt["artDirection"]> = {
  GIANT: {
    medium: "digital painting, fantasy character concept art",
    palette: "warm gold and deep bronze against near-black shadow",
    lighting: "monumental, low-angle dramatic lighting, as if lit from below by torchlight",
    mood: "legendary, grounded, quietly immense",
    composition: "three-quarter portrait, imposing scale, heroic framing",
  },
  HUNTER: {
    medium: "digital painting, fantasy character concept art",
    palette: "cool gunmetal and gold accents against deep shadow",
    lighting: "sharp, precise rim lighting, cool edge-light against dark background",
    mood: "focused, sharp-edged, coiled tension",
    composition: "three-quarter portrait, dynamic asymmetry, close framing",
  },
};

export function buildCharacterImagePrompt(params: {
  legacyName: string;
  archetypeLabel: string;
  archetypeProfile: ArchetypeProfile | undefined;
  order: Order;
  guidingPromise: string;
  traits: [string, string, string, string];
  visualAxes: VisualAxes | null;
  faceConfidence: number | null;
  visualTop: CharacterMatch | null;
}): CharacterImagePrompt {
  const { legacyName, archetypeLabel, archetypeProfile, order, guidingPromise, traits, visualAxes, faceConfidence, visualTop } = params;

  const traitDescriptions = archetypeProfile?.traitDescriptions ?? (["", "", "", ""] as [string, string, string, string]);
  const loreTraits = traits.map((name, i) => ({ name, description: traitDescriptions[i] ?? "" }));

  const facialFeatures = visualAxes
    ? {
        summary:
          describeFacialAxes(visualAxes).length > 0
            ? `A face defined by ${describeFacialAxes(visualAxes).slice(0, 3).join(", ")}.`
            : "A face with balanced, moderate proportions across every measured axis.",
        details: describeFacialAxes(visualAxes),
        confidence: faceConfidence ?? 0,
      }
    : null;

  const styleReference = visualTop
    ? {
        inspiredBy: visualTop.character.name,
        series: visualTop.character.series,
        shapeLanguage: visualTop.character.shape_language,
        similarity: visualTop.similarity,
        note: "Design-language inspiration only — draw an ORIGINAL character, never this character's likeness.",
      }
    : null;

  const artDirection = ORDER_ART_DIRECTION[order];

  const promptParts = [
    `An original fantasy character portrait of "${legacyName}", ${archetypeLabel.toLowerCase()} of the Giantverse.`,
    guidingPromise,
    facialFeatures ? facialFeatures.summary : null,
    styleReference
      ? `Shape language inspired by the design principles of ${styleReference.inspiredBy} (${styleReference.shapeLanguage}) — an original character, not a likeness.`
      : null,
    `Style: ${artDirection.medium}, ${artDirection.palette}, ${artDirection.lighting}. Mood: ${artDirection.mood}. Composition: ${artDirection.composition}.`,
  ].filter((p): p is string => Boolean(p && p.trim()));

  return {
    subject: {
      name: legacyName,
      title: archetypeLabel,
      japaneseName: archetypeProfile?.japaneseName ?? "",
      romajiName: archetypeProfile?.romajiName ?? archetypeLabel,
      order,
      temperament: archetypeProfile?.temperament ?? "",
    },
    lore: {
      description: archetypeProfile?.description ?? "",
      guidingPromise,
      traits: loreTraits,
      shadow: archetypeProfile?.shadow ?? { trait: "", description: "" },
      realm: archetypeProfile?.realmBias ?? null,
      guild: archetypeProfile?.guild ?? null,
    },
    facialFeatures,
    styleReference,
    artDirection,
    prompt: promptParts.join(" "),
  };
}
