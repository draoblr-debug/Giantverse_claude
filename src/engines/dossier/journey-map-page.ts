import { PDFPage } from "pdf-lib";
import { SPOKES, toXY, computeRadialTrajectory, bezierSegments, type TurnSnapshot } from "@/lib/journey-renderer";
import {
  drawKicker, drawHeading, drawSub, drawRule, drawLabBody, drawFineprint,
  hex, safeText, DossierFonts, PAGE_WIDTH, MM, COLOR,
} from "@/engines/dossier/pdf-kit";
import type { buildPersonaPayload } from "@/engines/dossier/persona-payload";

type DossierPayload = ReturnType<typeof buildPersonaPayload>;

// "Your Archetype Journey" — a Node/pdf-lib port of the same radial map
// drawn elsewhere via HTML canvas (src/lib/journey-renderer.ts, used by the
// ID card and the survey's own reveal player). Reuses that file's exported
// geometry (SPOKES, computeRadialTrajectory, bezierSegments, toXY) so the
// trajectory/ranking math is never duplicated — only the DRAWING target
// differs, since pdf-lib has no Canvas2D to hand this off to.
//
// Deliberately simplified vs. the canvas version: labels are drawn
// horizontally (left/right of each dot) rather than rotated along the
// spoke — correct-enough and far simpler than replicating pdf-lib's
// rotate-around-point text semantics for what's normally a sparse set of
// visited-archetype labels. The dock leg is always drawn solid (never
// dashed-as-projection): unlike the live in-quiz player, the dossier only
// ever renders a session whose archetype is already decided.

// Virtual glyph space — matches journey-renderer.ts's own "designed at
// 900" convention (R_TRAVEL=300u, R_RIM=328u there) so this stays visually
// proportioned the same way as the canvas version.
const S = 900;
const CX = 450;
const CY = 450;
const R_TRAVEL = 300;
const R_RIM = 328;

// The 3 next-highest-scoring archetypes after the final one — same
// selection the reveal page and ID card use for "The Invisible
// Archetypes" (close enough in the participant's own answers that a
// slightly different run could have named one of them instead). Exported
// so both the glyph (which highlights them) and the explainer page
// (which names them) share one selection, never two.
export function getInvisibleArchetypes(payload: DossierPayload) {
  const scores = payload.scores ?? {};
  return Object.entries(scores)
    .filter(([id]) => id !== payload.primary.id)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => SPOKES[id])
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

// The most recent turn where the per-turn leading archetype changed —
// the concrete "you turned from X to Y" moment the explainer page invites
// the reader to sit with. Null when a score history isn't available, or
// when one archetype led wire-to-wire (no turn to point to).
function findLastTurn(turns: TurnSnapshot[], trajectory: ReturnType<typeof computeRadialTrajectory>) {
  let found: { turnNumber: number; fromId: string; toId: string; category: string } | null = null;
  for (let i = 1; i < trajectory.length; i++) {
    const fromId = trajectory[i - 1].leaderId;
    const toId = trajectory[i].leaderId;
    if (fromId && toId && fromId !== toId) {
      found = { turnNumber: i + 1, fromId, toId, category: turns[i]?.category ?? "" };
    }
  }
  return found;
}

function drawJourneyGlyph(
  page: PDFPage,
  fonts: DossierFonts,
  centerX: number,
  topY: number,
  coreRadiusPt: number,
  payload: DossierPayload,
): number {
  const k = coreRadiusPt / R_RIM;
  const centerY = topY - coreRadiusPt;

  const mapPt = (vx: number, vy: number) => ({
    x: centerX + (vx - CX) * k,
    y: centerY + (CY - vy) * k,
  });

  const turns = payload.score_history ?? [];
  const finalId = payload.primary.id;
  const trajectory = computeRadialTrajectory(turns, R_TRAVEL, CX, CY);
  const visited = new Set<string>();
  for (const p of trajectory) if (p.leaderId) visited.add(p.leaderId);
  // The invisible archetypes are highlighted on the glyph the same way a
  // visited spoke is (see below) even when the trajectory itself never
  // led through them — the explainer page names them by title, so they
  // need to actually be findable on this diagram.
  for (const s of getInvisibleArchetypes(payload)) visited.add(s.id);

  const finalSpoke = SPOKES[finalId] as (typeof SPOKES)[string] | undefined;
  const route: { x: number; y: number }[] = [{ x: CX, y: CY }, ...trajectory];
  if (finalSpoke) route.push(toXY(finalSpoke.angleDeg, R_RIM, CX, CY));

  // certainty rings — dashed except the outer rim, which is solid
  for (const f of [0.25, 0.5, 0.75, 1]) {
    page.drawCircle({
      x: centerX, y: centerY, size: R_TRAVEL * f * k,
      borderColor: hex("#EAE4D3"), borderWidth: f === 1 ? 1 : 0.6,
      borderOpacity: f === 1 ? 0.22 : 0.1,
      borderDashArray: f === 1 ? undefined : [1.5, 4],
    });
  }

  // calling meridian
  const top = mapPt(CX, CY - R_RIM);
  const bottom = mapPt(CX, CY + R_RIM);
  page.drawLine({ start: top, end: bottom, thickness: 0.6, color: hex("#EAE4D3"), opacity: 0.1 });

  // spokes + tips
  for (const spoke of Object.values(SPOKES)) {
    const isFinal = spoke.id === finalId;
    const wasVisited = visited.has(spoke.id) && !isFinal;
    const dimmed = !isFinal && !wasVisited;

    const from = mapPt(toXY(spoke.angleDeg, R_TRAVEL + 6, CX, CY).x, toXY(spoke.angleDeg, R_TRAVEL + 6, CX, CY).y);
    const tipV = toXY(spoke.angleDeg, R_RIM, CX, CY);
    const tip = mapPt(tipV.x, tipV.y);
    const color = hex(spoke.color);

    page.drawLine({
      start: from, end: tip, thickness: isFinal ? 1.3 : 0.7, color,
      opacity: isFinal ? 0.9 : dimmed ? 0.2 : 0.55,
    });
    page.drawCircle({
      x: tip.x, y: tip.y,
      size: (isFinal ? 3.4 : wasVisited ? 2.2 : 1.4) * (coreRadiusPt / 130),
      color: isFinal || wasVisited ? color : undefined,
      borderColor: color, borderWidth: 0.7,
      opacity: dimmed ? 0.45 : 1, borderOpacity: dimmed ? 0.45 : 1,
    });

    if (isFinal) {
      for (const [r, a] of [[13, 0.6], [19, 0.3]] as const) {
        page.drawCircle({
          x: tip.x, y: tip.y, size: r * (coreRadiusPt / 130),
          borderColor: color, borderWidth: 0.8, borderOpacity: a,
        });
      }
    }

    if (isFinal || wasVisited) {
      const east = spoke.angleDeg <= 180;
      const size = isFinal ? 8 : 6.5;
      const font = isFinal ? fonts.serifBold : fonts.sans;
      const label = safeText(spoke.title);
      const textW = font.widthOfTextAtSize(label, size);
      // The final archetype's pulse rings (drawn above) extend to 19 glyph
      // units — clear them, not just the dot itself, or the label runs
      // straight through the outer ring.
      const gap = isFinal ? 19 * (coreRadiusPt / 130) + 3 : 3;
      const textX = east ? tip.x + gap : tip.x - gap - textW;
      page.drawText(label, {
        x: textX, y: tip.y - size * 0.32, size, font,
        color: isFinal ? COLOR.gold : hex("#EAE4D3"),
      });
    }
  }

  // traced route — a single continuous solid stroke (the dossier only ever
  // renders a session whose archetype is already decided, so there's no
  // "tentative leader" dashed leg to distinguish, unlike the live player).
  if (route.length > 1) {
    const segs = bezierSegments(route);
    const toSvg = (x: number, y: number) => `${(x * k).toFixed(2)},${(y * k).toFixed(2)}`;
    let d = `M ${toSvg(route[0].x, route[0].y)}`;
    for (const [c1x, c1y, c2x, c2y, x, y] of segs) {
      d += ` C ${toSvg(c1x, c1y)} ${toSvg(c2x, c2y)} ${toSvg(x, y)}`;
    }
    page.drawSvgPath(d, {
      x: centerX - CX * k, y: centerY + CY * k,
      borderColor: COLOR.gold, borderWidth: 1.6, borderOpacity: 0.95,
    });
    // waypoint dots
    route.forEach((p, i) => {
      const isStart = i === 0;
      const isEnd = i === route.length - 1;
      const at = mapPt(p.x, p.y);
      page.drawCircle({
        x: at.x, y: at.y, size: (isStart || isEnd ? 3.2 : 2.2) * (coreRadiusPt / 130),
        color: COLOR.ink, borderColor: COLOR.gold, borderWidth: 1,
      });
    });
  }

  return centerY - coreRadiusPt;
}

export function drawJourneyMapPage(page: PDFPage, fonts: DossierFonts, cursorY: number, payload: DossierPayload): void {
  let y = drawKicker(page, fonts, "dark", cursorY, "THE WHEEL OF THIRTY-TWO", "YOUR JOURNEY");
  y = drawHeading(page, fonts, "dark", y, "Your Archetype Journey");
  y = drawSub(
    page, fonts, y,
    `Turn by turn, the exact path ${payload.legacy_name}'s own answers traced across the wheel on the way to ` +
    `${payload.primary.label} — the gold line is that route. The other labelled spokes aren't near-misses; they're ` +
    `other archetypes that rose close enough to matter. What they mean is on the next page.`,
  );
  y = drawRule(page, y);

  const coreRadius = 56 * MM;
  const glyphBottom = drawJourneyGlyph(page, fonts, PAGE_WIDTH / 2, y - 4 * MM, coreRadius, payload);

  drawFineprint(
    page, fonts, glyphBottom - 6 * MM,
    "Certainty grows outward from the center; Giants fill the western half of the wheel, Hunters the eastern half.",
  );
}

export function drawJourneyMapExplainerPage(page: PDFPage, fonts: DossierFonts, cursorY: number, payload: DossierPayload): void {
  const legacyName = payload.legacy_name;
  const primaryLabel = payload.primary.label;
  const invisible = getInvisibleArchetypes(payload);
  const invisibleNames = joinNames(invisible.map((s) => s.title));

  const turns = payload.score_history ?? [];
  const trajectory = computeRadialTrajectory(turns, R_TRAVEL, CX, CY);
  const lastTurn = findLastTurn(turns, trajectory);

  let y = drawKicker(page, fonts, "dark", cursorY, "THE WHEEL OF THIRTY-TWO", "THE INVISIBLE ARCHETYPES");
  y = drawHeading(page, fonts, "dark", y, "The Archetypes You Also Are");
  y = drawSub(
    page, fonts, y,
    `This page isn't about how the diagram was drawn — it's about what it means. ${legacyName} isn't only ` +
    `${primaryLabel}. Here's who else showed up, and how to find your own turn.`,
  );
  y = drawRule(page, y);

  const blocks: [string, string][] = [];

  blocks.push([
    "OTHER CHARACTERS YOU CARRY",
    invisibleNames
      ? `No one is only one archetype. ${invisibleNames} rose close enough in ${legacyName}'s own answers that a ` +
        `slightly different day could have named one of them instead. They aren't almosts to be discarded — they're ` +
        `other characters ${legacyName} carries, worn less often than ${primaryLabel}, but no less real.`
      : `No one is only one archetype. ${primaryLabel} is simply the one that spoke loudest in ${legacyName}'s ` +
        `answers this time — not the only one present.`,
  ]);

  blocks.push([
    "PAST SELF, OR NOT YET",
    `Each invisible archetype can be read two ways. It might be someone ${legacyName} already was — a chapter that ` +
    `closed before ${primaryLabel} took the lead. Or it might be a potential not yet reached — one more turn away. ` +
    `The map doesn't decide which one it is; only ${legacyName} can.`,
  ]);

  blocks.push([
    "FIND YOUR OWN TURN",
    lastTurn
      ? `Look back at the traced line around turn ${lastTurn.turnNumber} — the one about "${lastTurn.category}": up ` +
        `to that point the lead belonged to ${SPOKES[lastTurn.fromId]?.title ?? lastTurn.fromId}; then it didn't, ` +
        `and ${SPOKES[lastTurn.toId]?.title ?? lastTurn.toId} took over. What happened, in life and not just in ` +
        `this survey, between those two turns? What would it take to tip back?`
      : `${legacyName}'s answers barely wavered — ${primaryLabel} led from very early on, turn after turn. That's ` +
        `its own kind of answer: some people arrive at themselves quickly. Look at the other labelled spokes anyway, ` +
        `and ask what a different mood, a different year, might have tipped toward instead.`,
  ]);

  blocks.push([
    "A TOOL, NOT A VERDICT",
    "Come back to this page after a hard year, a new job, a relationship that ended or began, and retrace the line " +
    "in your head. The wheel itself doesn't move — but where your own answers would land on it might. That's the " +
    "reason to keep this map, not just to read it once.",
  ]);

  for (const [lab, body] of blocks) y = drawLabBody(page, fonts, "dark", y, lab, body);
}
