// CharacterImagePromptBuilder — assembles a structured JSON prompt for
// generating original character art of the participant's Giantverse
// identity, drawing on the things the ritual actually knows about them:
//   1. LORE        — the archetype's own description, guiding promise,
//                     traits and shadow (archetype-definitions.ts)
//   2. ENVIRONMENT — the archetype's realmBias resolved against the real
//                     Realm lore (src/engines/realms.ts: terrain, tagline,
//                     what it represents), plus a continent name for scene
//                     flavor. Continents are cosmetic map-artwork labels —
//                     every continent contains all five realms — so the
//                     continent here is a stable-per-archetype flavor pick,
//                     not a lore-level residency (see landing-atlas.ts).
//   3. FACE        — the participant's OWN measured facial geometry, if
//                     they went through Visual Character Discovery
//                     (VisualAxes — never the matched character's design
//                     profile)
//   4. ARCHETYPE   — order (Giant/Hunter), temperament, realm
//
// This never claims to reproduce the participant's likeness — facial axes
// are translated into generic shape-language descriptors (as the visual
// discovery module already does for its "why you resemble" checklist), not
// fed back as a photo reference. The output is meant to be pasted into an
// image generator as a starting point for ORIGINAL concept art.

import type { ArchetypeProfile, Order } from "@/types/archetype.types";
import type { CharacterMatch, VisualAxes } from "@/types/visual.types";
import { REALMS } from "@/engines/realms";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";

// The 3 next-highest-scoring archetypes after the winner — "present in the
// answers, close enough that a slightly different run could have named them
// instead" (same definition/count as the reveal page's invisibleArchetypes).
// Used here as costume INSPIRATION, not lore: a few of their realm/order
// traits get woven into the outfit as accents, so two participants who land
// on the same primary archetype don't get an identical costume description
// — the near-misses are different for almost everyone.
const INVISIBLE_ARCHETYPE_COUNT = 3;

function findInvisibleArchetypes(winnerId: string, scoreMap: Record<string, number> | null | undefined): ArchetypeProfile[] {
  if (!scoreMap) return [];
  return Object.entries(scoreMap)
    .filter(([id]) => id !== winnerId)
    .sort((a, b) => b[1] - a[1])
    .slice(0, INVISIBLE_ARCHETYPE_COUNT)
    .map(([id]) => ARCHETYPE_DEFINITIONS[id])
    .filter((profile): profile is ArchetypeProfile => !!profile);
}

// One garment/material/accessory identity per realm — the actual source of
// costume variety, since realm (unlike Order) has 5 distinct values across
// the 32 archetypes, each grounded in that realm's own established lore
// (src/engines/realms.ts).
const REALM_COSTUME: Record<string, { garment: string; material: string; accessory: string }> = {
  Kuryo: {
    garment: "layered high-altitude robes with a deep cowl",
    material: "quilted wool over violet-grey, slate-toned wraps",
    accessory: "a folded star-chart carried at the hip",
  },
  Murei: {
    garment: "soft, unstructured layered wraps that move with the body",
    material: "undyed linen and forest-toned wool, worn soft with age",
    accessory: "a sprig of grove-moss tied at the wrist",
  },
  Maruto: {
    garment: "structured formal robes with a stiff standing collar",
    material: "heavy brocade over lacquered panelling",
    accessory: "a civic seal pendant",
  },
  Neisei: {
    garment: "a tailored travel coat with a sash of rank",
    material: "salt-worn canvas with sea-glass teal trim",
    accessory: "a wax-sealed letter case",
  },
  Harai: {
    garment: "patched, layered survival gear",
    material: "salvaged leather and weathered, ember-scorched cloth",
    accessory: "a bundle of scavenged tools",
  },
};

const ORDER_TEMPERAMENT_CUT: Record<string, string> = {
  "GIANT_ACTIVE": "a monumental, forward-driving silhouette",
  "GIANT_PASSIVE": "a grounded, weighted silhouette that holds its stance",
  "HUNTER_ACTIVE": "a lean, dynamic silhouette built for sudden movement",
  "HUNTER_PASSIVE": "a watchful, economical silhouette that gives nothing away",
};

// Cosmetic continent labels from the world-map artwork (landing-atlas.ts) —
// every continent contains all five realm zones, so any archetype can be
// flavored onto any of them. Picked deterministically per archetype (below)
// so the same archetype always gets the same continent, not a fresh one
// every time the prompt is regenerated.
const CONTINENTS = ["Akaru", "Ryūsen", "Kaigen", "Seikora", "Hoshima", "Kurogane"] as const;

function pickContinent(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return CONTINENTS[hash % CONTINENTS.length];
}

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
  };
  environment: {
    continent: string;
    realmId: string;
    realmName: string;
    realmJapanese: string;
    tagline: string;
    description: string;
    represents: string[];
    summary: string;
  } | null;
  costume: {
    silhouette: string;
    garment: string;
    material: string;
    accessory: string;
    invisibleInfluences: { archetype: string; realm: string; accent: string }[];
    summary: string;
  } | null;
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

// Lighting sourced from the participant's REALM rather than their Order —
// Order only has two values, so keying lighting off it meant every Hunter
// (half the cast) got the identical "cool edge-light" description.
//
// Inspired by Sangam-era Tamil poetics (Tolkāppiyam's Thiṇai/திணை
// classification): each of the five classical landscapes carries its own
// canonical time of day and season, not just a mood. This app's five realms
// already mirror those five landscapes closely enough to borrow their light
// directly rather than inventing something arbitrary:
//   Kuryo (mountains)   ≈ குறிஞ்சி Kuriñci — deep night, dew/cold season
//   Murei (forest)      ≈ முல்லை Mullai   — dusk, rainy season
//   Maruto (river-plain) ≈ மருதம் Marutam — dawn
//   Neisei (coast)      ≈ நெய்தல் Neytal  — sunset/twilight
//   Harai (wasteland)   ≈ பாலை Pālai     — high noon, hot season
// Continent is woven into the sentence for per-person flavor (see
// buildLighting below) even though the light quality itself is realm-driven
// — continents don't otherwise carry any distinct physical trait to hang a
// second axis of variation on.
const REALM_THINAI_LIGHTING: Record<string, string> = {
  Kuryo: "cold, high-altitude moonlight and starlight, a faint silver-blue glow through thin night air and drifting mist — the deep-night hour and dew-cold season of the mountain heights",
  Murei: "soft, diffused dusk light filtering through rain-heavy forest canopy, a muted grey-green glow with mist rising off wet leaves — the evening hour of the rainy season in the deep woods",
  Maruto: "warm golden dawn light breaking low across fertile plains and river-mist, a soft horizontal glow catching dust and haze — the first-light hour of the civic heartland",
  Neisei: "warm amber sunset light low over open water, long shadows and a salt-haze glow on the tideline — the dusk hour where every journey along this coast begins",
  Harai: "harsh, high-contrast noon sun overhead, heat-shimmer haze and bleached-white light against stark black shadow — the hottest hour of the dry season, when the land itself is in crisis",
};

function buildLighting(order: Order, environment: CharacterImagePrompt["environment"]): string {
  const base = environment ? REALM_THINAI_LIGHTING[environment.realmId] : undefined;
  if (!base || !environment) return ORDER_ART_DIRECTION[order].lighting;
  return `${base}, as it falls over ${environment.continent}`;
}

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
  scoreMap?: Record<string, number> | null;
}): CharacterImagePrompt {
  const { legacyName, archetypeLabel, archetypeProfile, order, guidingPromise, traits, visualAxes, faceConfidence, visualTop, scoreMap } = params;

  const traitDescriptions = archetypeProfile?.traitDescriptions ?? (["", "", "", ""] as [string, string, string, string]);
  const loreTraits = traits.map((name, i) => ({ name, description: traitDescriptions[i] ?? "" }));

  const costume = (() => {
    const realmId = archetypeProfile?.realmBias;
    const base = realmId ? REALM_COSTUME[realmId] : undefined;
    if (!base || !archetypeProfile) return null;

    const silhouette = ORDER_TEMPERAMENT_CUT[`${order}_${archetypeProfile.temperament}`] ?? "a distinctive, purposeful silhouette";
    const invisibleArchetypes = findInvisibleArchetypes(archetypeProfile.id, scoreMap);
    const invisibleInfluences = invisibleArchetypes
      .filter((a) => a.realmBias && a.realmBias !== realmId) // only genuinely different realms add a new accent
      .map((a) => {
        const accentRealm = a.realmBias as string;
        const accentSource = REALM_COSTUME[accentRealm];
        return {
          archetype: a.label,
          realm: accentRealm,
          accent: accentSource
            ? `a ${accentSource.accessory.replace(/^(a|an)\s+/i, "")} echoing ${accentRealm}`
            : `a bearing that echoes the ${a.label}`,
        };
      });

    const influenceText = invisibleInfluences.length > 0
      ? ` Subtle accents nod to the near-miss archetypes this participant almost became: ${invisibleInfluences.map((i) => i.accent).join("; ")}.`
      : "";

    return {
      silhouette,
      garment: base.garment,
      material: base.material,
      accessory: base.accessory,
      invisibleInfluences,
      summary: `Wearing ${base.garment} in ${base.material}, cut into ${silhouette}, finished with ${base.accessory}.${influenceText}`,
    };
  })();

  const realm = archetypeProfile?.realmBias ? REALMS[archetypeProfile.realmBias] : undefined;
  const environment = realm
    ? (() => {
        const continent = pickContinent(archetypeProfile?.id ?? archetypeLabel);
        return {
          continent,
          realmId: realm.id,
          realmName: realm.name,
          realmJapanese: realm.japanese,
          tagline: realm.tagline,
          description: realm.description,
          represents: realm.represents,
          summary: `Set on the continent of ${continent}, within ${realm.name} (${realm.japanese}) — ${realm.tagline.toLowerCase()} ${realm.description}`,
        };
      })()
    : null;

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

  const artDirection = { ...ORDER_ART_DIRECTION[order], lighting: buildLighting(order, environment) };

  const promptParts = [
    `An original fantasy character portrait of "${legacyName}", ${archetypeLabel.toLowerCase()} of the Giantverse.`,
    guidingPromise,
    environment ? environment.summary : null,
    costume ? costume.summary : null,
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
    },
    environment,
    costume,
    facialFeatures,
    styleReference,
    artDirection,
    prompt: promptParts.join(" "),
  };
}
