import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import { WHEEL_ORDER, OPPOSITE_TENSIONS } from "@/engines/archetype/archetype-wheel";
import { REALMS } from "@/engines/realms";
import type { ArchetypeProfile } from "@/types/archetype.types";
import type { TurnSnapshot } from "@/lib/journey-renderer";

// Turns a live Giantverse identity (already decided by the existing
// DOB + name + survey engine) into the JSON payload the Python dossier
// generator's persona_builder consumes. This file only reshapes and
// derives presentational data (wheel position, palette, cast) from
// ARCHETYPE_DEFINITIONS / REALMS — it never influences the identity
// itself, which arrives here already final.

// One top-5 visual-discovery match, shaped for the dossier's per-character
// pages — a slim projection of CharacterEntry/CharacterMatch (visual.types.ts),
// not the full design-matching record (axes, keywords, etc. aren't needed
// here and shouldn't cross the wire to the PDF generator unnecessarily).
export type VisualMatchInput = {
  name: string;
  series: string;
  designer: string;
  studio: string;
  franchise: string;
  similarity: number;
  description: string;
  shapeLanguage: string;
  communicates: string[];
  through: string[];
  creatorLinks?: {
    youtube?: string;
    imdb?: string;
    articles?: { label: string; url: string }[];
  };
};

export type SessionSnapshot = {
  realName: string;
  birthName: string;
  legacyName: string;
  archetypeId: string;
  order: "GIANT" | "HUNTER";
  guidingPromise: string;
  scores: Record<string, number> | null;
  // Present only when the participant went through Visual Character
  // Discovery — absent for name+DOB/survey-only identities.
  visualMatches?: VisualMatchInput[] | null;
  // Per-turn score snapshots — powers the dossier's Archetype Journey Map
  // page (src/engines/dossier/journey-map-page.ts). Absent for identities
  // from a path that never recorded turn-by-turn history, in which case
  // that page falls back to a straight dock line with no traced route.
  scoreHistory?: TurnSnapshot[] | null;
};

function snakeProfile(p: ArchetypeProfile) {
  return {
    id: p.id,
    label: p.label,
    order: p.order,
    japanese_name: p.japaneseName,
    romaji_name: p.romajiName,
    description: p.description,
    guiding_promise: p.guidingPromise,
    traits: p.traits,
    trait_descriptions: p.traitDescriptions,
    shadow_trait: p.shadow.trait,
    shadow_description: p.shadow.description,
    weights: p.weights,
  };
}

export function buildPersonaPayload(session: SessionSnapshot) {
  const primary = ARCHETYPE_DEFINITIONS[session.archetypeId];
  if (!primary) throw new Error(`buildPersonaPayload: unknown archetype id "${session.archetypeId}"`);

  const realmId = primary.realmBias ?? "Maruto";
  const realm = REALMS[realmId];
  const size = WHEEL_ORDER.length;

  const pos = WHEEL_ORDER.indexOf(session.archetypeId);
  const rotated = [...WHEEL_ORDER.slice(pos), ...WHEEL_ORDER.slice(0, pos)];
  const order32Labels = rotated.map((id) => ARCHETYPE_DEFINITIONS[id].label);

  const prevAllyId = WHEEL_ORDER[(pos - 1 + size) % size];
  const nextAllyId = WHEEL_ORDER[(pos + 1) % size];
  const oppositeId = WHEEL_ORDER[(pos + size / 2) % size];
  const quarterId = rotated[Math.floor(size / 4)];

  const scores = session.scores ?? {};
  const prevScore = scores[prevAllyId] ?? 0;
  const nextScore = scores[nextAllyId] ?? 0;
  // The "growth" direction is whichever wheel-neighbour the participant's
  // own scores lean toward; falls back to the "next" neighbour when scores
  // are unavailable or tied, so the wheel arrow always has a direction.
  const growthIsPrev = prevScore > nextScore;
  const growthId = growthIsPrev ? prevAllyId : nextAllyId;
  const otherAllyId = growthIsPrev ? nextAllyId : prevAllyId;

  const realmmateIds = WHEEL_ORDER.filter(
    (id) => id !== session.archetypeId && ARCHETYPE_DEFINITIONS[id].realmBias === realmId,
  ).slice(0, 2);

  const primaryScore = scores[session.archetypeId] ?? 0;
  const growthScore = scores[growthId] ?? 0;
  const confidence = primaryScore > 0
    ? Math.round(Math.min(95, Math.max(55, primaryScore * 100)))
    : 78;
  const secondaryPct = primaryScore > 0
    ? Math.round(Math.min(85, Math.max(20, (growthScore / primaryScore) * 100)))
    : 50;

  const realmName = realm?.name ?? realmId;
  const compatibleText = realmmateIds.length
    ? `${realmmateIds.map((id) => ARCHETYPE_DEFINITIONS[id].label).join(" · ")} — fellow travelers of ${realmName}.`
    : `Travelers of ${realmName}.`;

  const visualMatches = (session.visualMatches ?? []).slice(0, 5).map((m) => ({
    name: m.name,
    series: m.series,
    designer: m.designer,
    studio: m.studio,
    franchise: m.franchise,
    similarity: m.similarity,
    description: m.description,
    shape_language: m.shapeLanguage,
    communicates: m.communicates,
    through: m.through,
    creator_links: m.creatorLinks
      ? {
          youtube: m.creatorLinks.youtube ?? null,
          imdb: m.creatorLinks.imdb ?? null,
          articles: m.creatorLinks.articles ?? [],
        }
      : null,
  }));

  return {
    real_name: session.realName || session.birthName,
    birth_name: session.birthName,
    legacy_name: session.legacyName,
    gv_id: `GV-${String(Date.now()).slice(-6)}`,
    order: session.order,
    guiding_promise: session.guidingPromise,
    confidence,
    secondary_pct: secondaryPct,
    realm_id: realmId,
    realm_description: realm?.description ?? "",
    primary: snakeProfile(primary),
    secondary: snakeProfile(ARCHETYPE_DEFINITIONS[growthId]),
    wheel: {
      order32_labels: order32Labels,
      you_idx: 0,
      neighbour_idxs: [rotated.indexOf(growthId), rotated.indexOf(otherAllyId)],
      opposite_idx: rotated.indexOf(oppositeId),
      realmmate_idxs: realmmateIds.map((id) => rotated.indexOf(id)),
      central_question: OPPOSITE_TENSIONS[session.archetypeId] ?? "",
      growth: snakeProfile(ARCHETYPE_DEFINITIONS[growthId]),
      other_ally: snakeProfile(ARCHETYPE_DEFINITIONS[otherAllyId]),
      quarter: snakeProfile(ARCHETYPE_DEFINITIONS[quarterId]),
      opposite: snakeProfile(ARCHETYPE_DEFINITIONS[oppositeId]),
      realmmate: realmmateIds[0] ? snakeProfile(ARCHETYPE_DEFINITIONS[realmmateIds[0]]) : null,
      compatible_text: compatibleText,
    },
    visual_matches: visualMatches,
    score_history: session.scoreHistory ?? null,
    // Full per-archetype score map — kept alongside score_history (rather
    // than derived from its last entry) so the dossier's Invisible
    // Archetypes copy (journey-map-page.ts) always has a score to rank by,
    // even for identities generated via a path that never recorded
    // turn-by-turn history.
    scores: session.scores ?? null,
  };
}
