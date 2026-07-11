import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import { WHEEL_ORDER, OPPOSITE_TENSIONS } from "@/engines/archetype/archetype-wheel";
import { REALMS } from "@/engines/realms";
import type { ArchetypeProfile } from "@/types/archetype.types";

// Turns a live Giantverse identity (already decided by the existing
// DOB + name + survey engine) into the JSON payload the Python dossier
// generator's persona_builder consumes. This file only reshapes and
// derives presentational data (wheel position, palette, cast) from
// ARCHETYPE_DEFINITIONS / REALMS — it never influences the identity
// itself, which arrives here already final.

export type SessionSnapshot = {
  realName: string;
  birthName: string;
  legacyName: string;
  archetypeId: string;
  order: "GIANT" | "HUNTER";
  guidingPromise: string;
  scores: Record<string, number> | null;
};

function snakeProfile(p: ArchetypeProfile) {
  return {
    id: p.id,
    label: p.label,
    order: p.order,
    japanese_name: p.japaneseName,
    romaji_name: p.romajiName,
    guild: p.guild ?? "Guild of Survivors",
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
  const guild = primary.guild ?? "Guild of Survivors";
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

  const guildmateIds = WHEEL_ORDER.filter(
    (id) => id !== session.archetypeId && (ARCHETYPE_DEFINITIONS[id].guild ?? "Guild of Survivors") === guild,
  ).slice(0, 2);

  const primaryScore = scores[session.archetypeId] ?? 0;
  const growthScore = scores[growthId] ?? 0;
  const confidence = primaryScore > 0
    ? Math.round(Math.min(95, Math.max(55, primaryScore * 100)))
    : 78;
  const secondaryPct = primaryScore > 0
    ? Math.round(Math.min(85, Math.max(20, (growthScore / primaryScore) * 100)))
    : 50;

  const compatibleText = guildmateIds.length
    ? `${guildmateIds.map((id) => ARCHETYPE_DEFINITIONS[id].label).join(" · ")} — your fellow members of the ${guild}.`
    : `Members of the ${guild}.`;

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
      guild_idxs: guildmateIds.map((id) => rotated.indexOf(id)),
      central_question: OPPOSITE_TENSIONS[session.archetypeId] ?? "",
      growth: snakeProfile(ARCHETYPE_DEFINITIONS[growthId]),
      other_ally: snakeProfile(ARCHETYPE_DEFINITIONS[otherAllyId]),
      quarter: snakeProfile(ARCHETYPE_DEFINITIONS[quarterId]),
      opposite: snakeProfile(ARCHETYPE_DEFINITIONS[oppositeId]),
      guildmate: guildmateIds[0] ? snakeProfile(ARCHETYPE_DEFINITIONS[guildmateIds[0]]) : null,
      compatible_text: compatibleText,
    },
  };
}
