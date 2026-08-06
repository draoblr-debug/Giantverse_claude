// One-time maintainer script: dumps a persona-payload.ts-shaped JSON
// document for every (archetype, growth-branch) pair. tools/dossier/
// prebuild.py reads these to pre-render the ~85 static/archetype-bound
// dossier pages once per pair instead of once per participant.
//
// Two branches per archetype, not one: buildPersonaPayload()'s "growth"
// wheel-neighbour is resolved from the participant's own live quiz scores
// (prevAlly vs nextAlly — see persona-payload.ts's `growthIsPrev` check),
// and that choice ripples into content this feature treats as pre-buildable
// per archetype (cast's "Hero"/"Ally" entries, the team list, journey beats
// 4-7, the wheel diagram's neighbour highlighting). Forcing scores so each
// branch is unambiguous keeps that real personalization intact instead of
// silently collapsing it to one fixed neighbour.
//
// Run with: npx tsx scripts/dump-archetype-payloads.ts
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { WHEEL_ORDER, getAllyIds } from "@/engines/archetype/archetype-wheel";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import { buildPersonaPayload } from "@/engines/dossier/persona-payload";
import type { VisualMatchInput } from "@/engines/dossier/persona-payload";

const OUT_DIR = path.join(process.cwd(), "tools", "dossier", "archetype-payloads");
mkdirSync(OUT_DIR, { recursive: true });

// Placeholder visual matches — only their PRESENCE (not content) matters for
// the static body: it's what makes build_page_recipe()/assemble_static_body()
// include the "Your Visual Discovery Matches" intro page. The 5 real
// per-participant match pages are pre-built separately, once per character,
// and spliced in at request time.
const PLACEHOLDER_MATCH: VisualMatchInput = {
  name: "—", series: "—", designer: "—", studio: "—", franchise: "—",
  similarity: 0, description: "—", shapeLanguage: "—", communicates: ["—"], through: ["—"],
};

let count = 0;
for (const archetypeId of WHEEL_ORDER) {
  const order = ARCHETYPE_DEFINITIONS[archetypeId].order;
  const [prevAllyId, nextAllyId] = getAllyIds(archetypeId);

  for (const branch of ["prev", "next"] as const) {
    const scores =
      branch === "prev"
        ? { [prevAllyId]: 1, [nextAllyId]: 0 }
        : { [prevAllyId]: 0, [nextAllyId]: 1 };

    const payload = buildPersonaPayload({
      realName: "—",
      birthName: "—",
      legacyName: "—",
      archetypeId,
      order,
      guidingPromise: "—",
      scores,
      visualMatches: Array.from({ length: 5 }, () => ({ ...PLACEHOLDER_MATCH })),
    });

    writeFileSync(
      path.join(OUT_DIR, `${archetypeId}__${branch}.json`),
      JSON.stringify(payload),
      "utf-8",
    );
    count++;
  }
}

console.log(`wrote ${count} archetype payloads (32 archetypes x 2 growth branches) to ${OUT_DIR}`);
