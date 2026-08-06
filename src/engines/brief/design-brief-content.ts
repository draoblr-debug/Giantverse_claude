import { CHARACTER_DATABASE } from "@/data/character-database";
import type { CharacterEntry } from "@/types/visual.types";
import { QUADRANTS, type QuadrantId } from "@/content/landing-atlas";
import type { Order, Temperament } from "@/types/archetype.types";

// Character references for the free "Character Design Brief" — up to 5
// design-language references per archetype, pulled from the same curated
// database Visual Character Discovery matches against (src/data/character-
// database.ts). Not every archetype has 5 tagged characters yet (a few have
// as few as 1 — see that file's header comment on the 182-vs-200-entry
// split), so callers must handle a shorter-than-`count` result rather than
// assuming exactly 5.
export const MAX_CHARACTERS_PER_ARCHETYPE = 5;

export function pickCharactersForArchetype(
  archetypeId: string,
  count = MAX_CHARACTERS_PER_ARCHETYPE,
): CharacterEntry[] {
  return CHARACTER_DATABASE.filter((c) => c.archetypeId === archetypeId).slice(0, count);
}

// Order (Giant/Hunter) x Temperament (Active/Passive) is exactly the
// compass's quadrant split (see landing-atlas.ts's QUADRANT_LABELS comment)
// — computed directly from ArchetypeProfile fields rather than the visual
// compass's 32-slot position array, since that's the only piece this brief
// actually needs.
export function quadrantIdFor(order: Order, temperament: Temperament): QuadrantId {
  if (order === "GIANT") return temperament === "ACTIVE" ? "forgers" : "ascenders";
  return temperament === "ACTIVE" ? "venturers" : "keepers";
}

export type Blurb = { name: string; description: string };

// Mirrors messages/en.json's landing.compass.quadrants/hemispheres copy,
// duplicated as plain English — same pattern card-generator.ts already
// follows for realm epithets: this PDF is assembled server-side via
// pdf-lib, which has no reach into next-intl's request-scoped translations.
export const QUADRANT_BLURBS: Record<QuadrantId, Blurb> = {
  forgers: { name: "Forgers", description: "Giants who drive change — vision forged into decisive, lasting action." },
  venturers: { name: "Venturers", description: "Hunters who move first — courage and momentum carried into the unknown." },
  keepers: { name: "Keepers", description: "Hunters who protect — devotion and quiet endurance for the people they love." },
  ascenders: { name: "Ascenders", description: "Giants who hold steady — conviction and patience shaping what endures." },
};

export const ORDER_BLURBS: Record<Order, Blurb> = {
  GIANT: { name: "Giants", description: "Creators who reshape civilization through vision." },
  HUNTER: { name: "Hunters", description: "Protectors who strengthen civilization through relationships." },
};

export const TEMPERAMENT_BLURBS: Record<Temperament, Blurb> = {
  ACTIVE: { name: "Active", description: "Moves first — drives change through initiative, momentum, and decisive action." },
  PASSIVE: { name: "Passive", description: "Holds steady — sustains through patience, endurance, and quiet care." },
};

export const QUADRANT_COLOR: Record<QuadrantId, string> = Object.fromEntries(
  QUADRANTS.map((q) => [q.id, q.color]),
) as Record<QuadrantId, string>;

export const QUADRANT_ORDER: QuadrantId[] = QUADRANTS.map((q) => q.id);

// Condensed "designer + design language" line for a character reference —
// shared formatting for both the final archetype's fuller cards and the
// invisible archetypes' single-line rows.
export function designLanguageLine(c: CharacterEntry): string {
  return c.design_language.join(", ");
}
