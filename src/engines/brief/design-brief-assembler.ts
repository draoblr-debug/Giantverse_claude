import { PDFDocument, PDFPage } from "pdf-lib";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import { drawJourneyMapPage } from "@/engines/dossier/journey-map-page";
import type { buildPersonaPayload } from "@/engines/dossier/persona-payload";
import {
  newSheet, loadFonts, drawKicker, drawHeading, drawSub, drawRule, drawLab, drawBody, drawParagraph,
  drawFineprint, drawFooter, hex, safeText, DossierFonts, PAGE_WIDTH, MARGIN_LEFT, MARGIN_BOTTOM,
  CONTENT_WIDTH, MM, COLOR,
} from "@/engines/dossier/pdf-kit";
import {
  pickCharactersForArchetype, quadrantIdFor, designLanguageLine,
  QUADRANT_BLURBS, QUADRANT_COLOR, QUADRANT_ORDER,
} from "@/engines/brief/design-brief-content";
import type { ArchetypeProfile } from "@/types/archetype.types";
import type { QuadrantId } from "@/content/landing-atlas";

type DossierPayload = ReturnType<typeof buildPersonaPayload>;

// The free "Character Design Brief" — a ≤5-page PDF offered directly on
// the reveal page (no payment gate, unlike the 111-page Dossier this
// borrows its drawing primitives and journey-map page from). Structure:
//   1. Cover
//   2. Your Archetype Journey (reuses journey-map-page.ts's own page unmodified)
//   3. Action & Thought — the rationale, plus the Relationship Chart
//   4. Character references for the final archetype (up to 5)
//   5. Character references for the 3 invisible archetypes (up to 5 each)

function joinNames(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function drawCoverPage(doc: PDFDocument, fonts: DossierFonts, payload: DossierPayload): PDFPage {
  const { page, cursorY } = newSheet(doc, "dark");
  let y = drawKicker(page, fonts, "dark", cursorY, "GIANTVERSE", "CHARACTER DESIGN BRIEF");
  y = drawHeading(page, fonts, "dark", y, payload.legacy_name, 30);
  y = drawSub(
    page, fonts, y,
    `${payload.primary.label} (${payload.primary.romaji_name}) · Order of ${payload.order === "GIANT" ? "Giants" : "Hunters"}`,
  );
  y = drawRule(page, y);

  y -= 1 * MM;
  y = drawParagraph(page, MARGIN_LEFT, y, `“${payload.guiding_promise}”`, {
    font: fonts.serif, size: 13, color: COLOR.gold, maxWidth: 150 * MM, lineHeight: 1.5,
  }) - 5 * MM;

  y = drawLab(page, fonts, y, "Inside This Brief");
  y = drawBody(
    page, fonts, "dark", y,
    "Your Archetype Journey · the Relationship Chart · your Archetype's Cast · the Invisible Cast — " +
    "four pages built fresh from your own answers, not a template.",
  ) - 6 * MM;

  drawFineprint(
    page, fonts, y,
    `Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · ${payload.gv_id}`,
  );
  return page;
}

const CELL_DIR: Record<QuadrantId, { ox: number; oy: number }> = {
  forgers: { ox: -1, oy: 1 },
  venturers: { ox: 1, oy: 1 },
  keepers: { ox: 1, oy: -1 },
  ascenders: { ox: -1, oy: -1 },
};

type ArchDot = { label: string; quadrant: QuadrantId; isPrimary: boolean };

function drawRelationshipChart(
  page: PDFPage,
  fonts: DossierFonts,
  cursorY: number,
  payload: DossierPayload,
  invisible: ArchetypeProfile[],
): number {
  const half = 30 * MM;
  const centerX = PAGE_WIDTH / 2;
  const top = cursorY - 2 * MM;
  const centerY = top - half;

  page.drawRectangle({
    x: centerX - half, y: centerY - half, width: half * 2, height: half * 2,
    borderColor: COLOR.gold, borderWidth: 1, borderOpacity: 0.4,
  });
  page.drawLine({ start: { x: centerX - half, y: centerY }, end: { x: centerX + half, y: centerY }, thickness: 0.6, color: COLOR.gold, opacity: 0.25 });
  page.drawLine({ start: { x: centerX, y: centerY - half }, end: { x: centerX, y: centerY + half }, thickness: 0.6, color: COLOR.gold, opacity: 0.25 });

  const axisSize = 7.5;
  const centered = (text: string, cx: number, y: number) => {
    const w = fonts.sansBold.widthOfTextAtSize(text, axisSize);
    page.drawText(text, { x: cx - w / 2, y, size: axisSize, font: fonts.sansBold, color: COLOR.sub });
  };
  centered("ACTIVE", centerX, centerY + half + 3.5 * MM);
  centered("PASSIVE", centerX, centerY - half - 3.5 * MM - axisSize);
  page.drawText("GIANTS", { x: centerX - half - 3 * MM - fonts.sansBold.widthOfTextAtSize("GIANTS", axisSize), y: centerY - axisSize / 2, size: axisSize, font: fonts.sansBold, color: COLOR.sub });
  page.drawText("HUNTERS", { x: centerX + half + 3 * MM, y: centerY - axisSize / 2, size: axisSize, font: fonts.sansBold, color: COLOR.sub });

  for (const qid of QUADRANT_ORDER) {
    const dir = CELL_DIR[qid];
    const label = QUADRANT_BLURBS[qid].name.toUpperCase();
    const size = 8;
    const w = fonts.sansBold.widthOfTextAtSize(label, size);
    const x = centerX + dir.ox * (half - 4 * MM) - (dir.ox > 0 ? 0 : w);
    const y = centerY + dir.oy * (half - 4 * MM) - (dir.oy > 0 ? 0 : size);
    page.drawText(label, { x, y, size, font: fonts.sansBold, color: hex(QUADRANT_COLOR[qid]) });
  }

  const dots: ArchDot[] = [
    { label: payload.primary.label, quadrant: quadrantIdFor(payload.order, ARCHETYPE_DEFINITIONS[payload.primary.id].temperament), isPrimary: true },
    ...invisible.map((a) => ({ label: a.label, quadrant: quadrantIdFor(a.order, a.temperament), isPrimary: false })),
  ];
  const byQuadrant = new Map<QuadrantId, ArchDot[]>();
  for (const d of dots) byQuadrant.set(d.quadrant, [...(byQuadrant.get(d.quadrant) ?? []), d]);

  for (const [qid, arr] of byQuadrant) {
    const dir = CELL_DIR[qid];
    arr.forEach((d, i) => {
      const f = (i + 1) / (arr.length + 1);
      const x = centerX + dir.ox * half * f;
      const y = centerY + dir.oy * half * f;
      const r = d.isPrimary ? 3.2 : 2;
      page.drawCircle({
        x, y, size: r,
        color: d.isPrimary ? COLOR.gold : undefined,
        borderColor: COLOR.gold, borderWidth: 1,
        opacity: d.isPrimary ? 1 : 0.8, borderOpacity: d.isPrimary ? 1 : 0.65,
      });
      const labelSize = d.isPrimary ? 7.5 : 6.5;
      const font = d.isPrimary ? fonts.serifBold : fonts.sans;
      page.drawText(safeText(d.label), {
        x: x + r + 2, y: y - labelSize * 0.32, size: labelSize, font,
        color: d.isPrimary ? COLOR.gold : hex("#C9C3B6"),
      });
    });
  }

  let y = centerY - half - 6 * MM;
  for (const qid of QUADRANT_ORDER) {
    const blurb = QUADRANT_BLURBS[qid];
    const size = 8.5;
    const nameText = safeText(blurb.name.toUpperCase());
    page.drawText(nameText, { x: MARGIN_LEFT, y: y - size, size, font: fonts.sansBold, color: hex(QUADRANT_COLOR[qid]) });
    const nameWidth = fonts.sansBold.widthOfTextAtSize(nameText, size);
    y = drawParagraph(page, MARGIN_LEFT + nameWidth + 2 * MM, y, blurb.description, {
      font: fonts.sans, size, color: COLOR.bodyDark, maxWidth: CONTENT_WIDTH - nameWidth - 2 * MM, lineHeight: 1.4,
    }) - 1.3 * MM;
  }

  return drawFineprint(
    page, fonts, y,
    "Active/Passive is the compass's north-south axis; Giants/Hunters is its east-west axis — the four quadrants are where they meet.",
  );
}

function drawRationalePage(doc: PDFDocument, fonts: DossierFonts, payload: DossierPayload, invisible: ArchetypeProfile[]): void {
  const { page, cursorY } = newSheet(doc, "dark");
  const legacyName = payload.legacy_name;
  const primaryLabel = payload.primary.label;
  const invisibleNames = joinNames(invisible.map((a) => `${a.label} (${a.romajiName})`));

  let y = drawKicker(page, fonts, "dark", cursorY, "THE WHEEL OF THIRTY-TWO", "ACTION & THOUGHT");
  y = drawHeading(page, fonts, "dark", y, "Why These Four Archetypes");
  y = drawSub(
    page, fonts, y,
    `One archetype became ${legacyName}'s Action — the identity the answers actually named. Three more moved just ` +
    "beneath it as Thought: close enough to have won, present in the reasoning without ever becoming the verdict.",
  );
  y = drawRule(page, y);

  y = drawLab(page, fonts, y, "Final Archetype — Action");
  y = drawBody(
    page, fonts, "dark", y,
    `${legacyName} is named ${primaryLabel} (${payload.primary.romaji_name}) — not because the other three were ` +
    "absent, but because this is the one the answers turned into a decision. Action is whichever archetype actually " +
    "wins: not the strongest possible self, just the one that showed up when it counted.",
  ) - 2.5 * MM;

  y = drawLab(page, fonts, y, "The Invisible Three — Thought");
  y = drawBody(
    page, fonts, "dark", y,
    invisible.length
      ? `${invisibleNames} scored close enough behind ${primaryLabel} that a slightly different day could have named ` +
        "one of them instead. They never became the Action — but they were part of the Thought that led to it, the " +
        "weighing-up that happens before any answer is final."
      : `No other archetype scored close enough to ${primaryLabel} to register as an undercurrent — the answers ` +
        "were unusually decisive.",
  ) - 3 * MM;

  y = drawLab(page, fonts, y, "The Relationship Chart");
  drawRelationshipChart(page, fonts, y, payload, invisible);
}

function drawFinalCastPage(doc: PDFDocument, fonts: DossierFonts, payload: DossierPayload): void {
  const { page, cursorY } = newSheet(doc, "dark");
  const chars = pickCharactersForArchetype(payload.primary.id);

  let y = drawKicker(page, fonts, "dark", cursorY, "CHARACTER REFERENCES", "YOUR ARCHETYPE");
  y = drawHeading(page, fonts, "dark", y, `The Cast of ${payload.primary.label}`);
  y = drawSub(
    page, fonts, y,
    `Published character designs that carry the same design language as ${payload.primary.label} — studied here ` +
    "for their craft, never claimed as a resemblance to you.",
  );
  y = drawRule(page, y);

  if (chars.length === 0) {
    y = drawBody(page, fonts, "dark", y, "No verified character references are tagged for this archetype yet — check back in a future edition.", { dim: true });
  }
  for (const c of chars) {
    y = drawLab(page, fonts, y, `${c.name} — ${c.series}`);
    y = drawBody(page, fonts, "dark", y, `Designer: ${c.designer} · Studio: ${c.studio}`) - 0.5 * MM;
    y = drawBody(page, fonts, "dark", y, `Design language: ${designLanguageLine(c)}`, { dim: true }) - 0.5 * MM;
    y = drawBody(page, fonts, "dark", y, `Communicates: ${c.design_breakdown.communicates.join(", ")}`, { dim: true }) - 2.2 * MM;
  }

  drawFineprint(
    page, fonts, y,
    "Referenced for educational design commentary only — no artwork reproduced; each character remains the property of its rightful owners.",
  );
}

function drawInvisibleCastPage(doc: PDFDocument, fonts: DossierFonts, invisible: ArchetypeProfile[]): void {
  const { page, cursorY } = newSheet(doc, "dark");

  let y = drawKicker(page, fonts, "dark", cursorY, "CHARACTER REFERENCES", "THE INVISIBLE THREE");
  y = drawHeading(page, fonts, "dark", y, "The Cast of the Undercurrent");
  y = drawSub(
    page, fonts, y,
    "Character references for the three archetypes that shaped the Thought behind your Action — never your identity, but part of how it was reasoned out.",
  );
  y = drawRule(page, y);

  if (invisible.length === 0) {
    y = drawBody(page, fonts, "dark", y, "Your answers were unusually decisive — no other archetype registered strongly enough to list here.", { dim: true });
  }

  for (const a of invisible) {
    y = drawLab(page, fonts, y, `${a.label} (${a.romajiName})`);
    const chars = pickCharactersForArchetype(a.id);
    if (chars.length === 0) {
      y = drawBody(page, fonts, "dark", y, "No verified character references tagged yet.", { dim: true }) - 1.8 * MM;
      continue;
    }
    for (const c of chars) {
      y = drawBody(page, fonts, "dark", y, `${c.name} (${c.series}) — ${c.designer} — ${designLanguageLine(c)}`, { dim: true }) - 0.3 * MM;
    }
    y -= 1.8 * MM;
  }

  drawFineprint(
    page, fonts, y,
    "Referenced for educational design commentary only — no artwork reproduced; each character remains the property of its rightful owners.",
  );
}

export async function assembleDesignBriefPdf(
  payload: DossierPayload,
  invisibleArchetypeIds: string[],
): Promise<Uint8Array> {
  const invisible = invisibleArchetypeIds
    .map((id) => ARCHETYPE_DEFINITIONS[id])
    .filter((a): a is ArchetypeProfile => Boolean(a));

  const doc = await PDFDocument.create();
  const fonts = await loadFonts(doc);

  drawCoverPage(doc, fonts, payload);
  {
    const { page, cursorY } = newSheet(doc, "dark");
    drawJourneyMapPage(page, fonts, cursorY, payload);
  }
  drawRationalePage(doc, fonts, payload, invisible);
  drawFinalCastPage(doc, fonts, payload);
  drawInvisibleCastPage(doc, fonts, invisible);

  const sections = ["", "The Journey", "The Relationship Chart", "Your Archetype's Cast", "The Invisible Cast"];
  const pages = doc.getPages();
  for (let i = 1; i < pages.length; i++) {
    const page = pages[i];
    page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: MARGIN_BOTTOM + 8 * MM, color: COLOR.ink });
    drawFooter(page, fonts, "dark", `${payload.legacy_name} · ${payload.gv_id}`, `${sections[i]} · ${i + 1} / ${pages.length}`);
  }

  return doc.save();
}
