import { PDFDocument, PDFPage } from "pdf-lib";
import type { buildPersonaPayload } from "@/engines/dossier/persona-payload";
import { lookupRealmLore } from "@/engines/dossier/realm-lore-book";
import { MASTER_STUDIES, LAST_SPARK, shapeFamilyOf, accentNameOf } from "@/engines/dossier/dossier-content";
import {
  newSheet, loadFonts, drawKicker, drawHeading, drawSub, drawRule, drawLab, drawBody, drawLabBody,
  drawFineprint, drawCommBox, drawBar, safeText, DossierFonts, MARGIN_LEFT, CONTENT_WIDTH, PAGE_WIDTH, PAGE_HEIGHT,
  MM, COLOR,
} from "@/engines/dossier/pdf-kit";

export type DossierPayload = ReturnType<typeof buildPersonaPayload>;

// The ~23 "dynamic" dossier pages — the Node port of every page
// generate_dossier.py tags tier="dynamic" (see that file's add() calls).
// Each function below reproduces its Python counterpart's exact text
// formula against the same wire payload persona-payload.ts already builds
// (the same JSON that used to go to persona_builder.py's build_persona()).
// dynamicId values match generate_dossier.py's build_page_recipe() output
// 1:1 — see tools/dossier/generate_dossier.py and persona_builder.py for
// the originals these are ported from.

function orderFull(order: "GIANT" | "HUNTER"): string {
  return order === "GIANT" ? "Giants" : "Hunters";
}
function orderShort(order: "GIANT" | "HUNTER"): string {
  return order === "GIANT" ? "GIANTS" : "HUNTERS";
}

function centerText(page: PDFPage, fonts: DossierFonts, text: string, y: number, size: number, bold = false, color = COLOR.headingDark): void {
  const font = bold ? fonts.serifBold : fonts.serif;
  const t = safeText(text);
  const width = font.widthOfTextAtSize(t, size);
  page.drawText(t, { x: (PAGE_WIDTH - width) / 2, y, size, font, color });
}

function centerRule(page: PDFPage, y: number, widthMm = 36): number {
  const w = widthMm * MM;
  page.drawLine({ start: { x: (PAGE_WIDTH - w) / 2, y }, end: { x: (PAGE_WIDTH + w) / 2, y }, thickness: 1, color: COLOR.gold, opacity: 0.6 });
  return y - 6 * MM;
}

function centerParagraph(page: PDFPage, fonts: DossierFonts, text: string, y: number, size: number, color: import("pdf-lib").RGB, maxWidth = 140 * MM, lineHeight = 1.75): number {
  const words = safeText(text).split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (fonts.serif.widthOfTextAtSize(candidate, size) > maxWidth && line) { lines.push(line); line = w; } else { line = candidate; }
  }
  if (line) lines.push(line);
  let yy = y;
  for (const l of lines) {
    yy -= size * 0.95;
    const width = fonts.serif.widthOfTextAtSize(l, size);
    page.drawText(l, { x: (PAGE_WIDTH - width) / 2, y: yy, size, font: fonts.serif, color });
    yy -= size * (lineHeight - 1);
  }
  return yy;
}

// ── Front matter ──────────────────────────────────────────────────────
function drawCover(page: PDFPage, fonts: DossierFonts, p: DossierPayload): void {
  let y = PAGE_HEIGHT - 90 * MM;
  centerText(page, fonts, orderShort(p.order).split("").join(" "), y, 9, true, COLOR.gold);
  y -= 16 * MM;
  centerText(page, fonts, p.legacy_name, y, 30, true);
  y -= 10 * MM;
  centerText(page, fonts, `born ${p.birth_name} · the ${p.primary.label}`, y, 9, false, COLOR.sub);
  y -= 12 * MM;
  y = centerRule(page, y);
  centerText(page, fonts, "CHARACTER GENESIS DOSSIER", y, 9, false, COLOR.gold);
  y -= 6 * MM;
  centerText(page, fonts, "PREMIUM COLLECTOR'S EDITION · 2.0", y, 7, false, COLOR.red);
  y -= 8 * MM;
  centerText(page, fonts, `The Giant Hunt · Giantverse Record ${p.gv_id}`, y, 7.5, false, COLOR.footer);
}

function drawPlate(page: PDFPage, fonts: DossierFonts, p: DossierPayload): void {
  let y = PAGE_HEIGHT - 90 * MM;
  centerText(page, fonts, "FOUNDING COHORT · FIRST PRINTING", y, 8, false, COLOR.gold);
  y -= 14 * MM;
  centerText(page, fonts, "This record belongs to", y, 18);
  y -= 12 * MM;
  centerText(page, fonts, p.legacy_name, y, 24, true, COLOR.gold);
  y -= 8 * MM;
  centerText(page, fonts, `known before the Hunt as ${p.real_name}`, y, 9, false, COLOR.sub);
  y -= 10 * MM;
  y = centerRule(page, y, 40);
  y = centerParagraph(page, fonts,
    "One identity. One record. One entry in the world-record attempt. No other copy of this book contains this name.",
    y, 10, COLOR.dim, 120 * MM, 1.5) - 8 * MM;
  centerText(page, fonts, p.gv_id, y, 9, false, COLOR.footer);
}

// ── Identity ──────────────────────────────────────────────────────────
function drawIdentityRecord1(page: PDFPage, fonts: DossierFonts, cursorY: number, p: DossierPayload): void {
  let y = drawKicker(page, fonts, "dark", cursorY, "IDENTITY", "RECORD ONE");
  y = drawHeading(page, fonts, "dark", y, "The Name You Were Given");
  y = drawSub(page, fonts, y, "Every citizen of the Giantverse carries two names. The first is given. The second is earned.");
  y = drawRule(page, y);
  y = drawLab(page, fonts, y, "BIRTH NAME");
  y = drawHeading(page, fonts, "dark", y, p.birth_name, 24) - 1 * MM;
  y = drawLab(page, fonts, y, "LEGACY NAME");
  y = drawHeading(page, fonts, "dark", y, p.legacy_name, 24) - 1 * MM;
  y = drawLab(page, fonts, y, "THE MOTTO");
  page.drawText(safeText(`"${p.guiding_promise}"`), { x: MARGIN_LEFT, y: y - 13, size: 13, font: fonts.serif, color: COLOR.gold });
  y -= 13 + 5 * MM;
  drawBody(page, fonts, "dark", y,
    `The Legacy Name is not a replacement of the Birth Name — it is the Birth Name, kept. ${p.birth_name} is who arrived at the Hunt. ${p.legacy_name} is who the Hunt revealed. Both are entered in this record, and both are yours.`,
    { dim: true });
}

function drawIdentityRecord2(page: PDFPage, fonts: DossierFonts, cursorY: number, p: DossierPayload, realmName: string, realmJp: string, symbol: string, symbolMeaning: string): void {
  let y = drawKicker(page, fonts, "dark", cursorY, "IDENTITY", "RECORD TWO");
  y = drawHeading(page, fonts, "dark", y, "Official Identity Record");
  y = drawRule(page, y);
  const rows: [string, string][] = [
    ["Giantverse ID", p.gv_id], ["Real Name", p.real_name], ["Birth Name", p.birth_name],
    ["Legacy Name", p.legacy_name], ["Order", `Order of ${orderFull(p.order)}`],
    ["Primary Archetype", `${p.primary.label} · ${p.primary.romaji_name} (${p.primary.japanese_name})`],
    ["Secondary Archetype", `${p.secondary.label} · ${p.secondary.romaji_name}`],
    ["Home Realm", `${realmName} · ${realmJp}`],
    ["Personal Symbol", symbol],
  ];
  for (const [k, v] of rows) {
    page.drawText(safeText(k.toUpperCase()), { x: MARGIN_LEFT, y: y - 8, size: 8, font: fonts.sansBold, color: COLOR.dim });
    page.drawText(safeText(v), { x: MARGIN_LEFT + 52 * MM, y: y - 10, size: 10, font: fonts.serif, color: COLOR.bodyDark });
    y -= 2.4 * MM + 10;
  }
  y -= 2 * MM;
  y = drawLabBody(page, fonts, "dark", y, "SYMBOL MEANING", symbolMeaning);
  drawLab(page, fonts, y, "REALM");
  drawBody(page, fonts, "dark", y - 9, p.realm_description, { dim: true });
}

// ── Archetype confidence/secondary bars ─────────────────────────────
// Dynamic, not a static-page overlay: the two bars' Y position depends on
// how many lines the archetype description wraps to above them, which
// varies per archetype — not safe to overlay onto a pre-built page at a
// fixed coordinate (see generate_dossier.py's build_archetype() comment).
function drawArchetypeBars(page: PDFPage, fonts: DossierFonts, cursorY: number, p: DossierPayload): void {
  const { growth } = p.wheel;
  const growthNote = `${growth.label} (${growth.romaji_name}) — the wheel-neighbour your scores already lean toward. Growth in the Giantverse is a drift, not a leap.`;
  let y = drawKicker(page, fonts, "dark", cursorY, "ARCHETYPE", "ANALYSIS");
  y = drawHeading(page, fonts, "dark", y, `The ${p.primary.label}`);
  y = drawSub(page, fonts, y, p.primary.description);
  y = drawRule(page, y);
  y = drawLab(page, fonts, y, `Primary · ${p.primary.label}`);
  y = drawBar(page, fonts, y, p.confidence);
  y = drawBody(page, fonts, "dark", y, "Confidence — how consistently your answers converged on this archetype.", { dim: true }) - 1.5 * MM;
  y = drawLab(page, fonts, y, `Secondary · ${p.secondary.label}`);
  y = drawBar(page, fonts, y, p.secondary_pct);
  y = drawBody(page, fonts, "dark", y, "The current running underneath the primary.", { dim: true }) - 1.5 * MM;
  y = drawLabBody(page, fonts, "dark", y, "GROWTH ARCHETYPE", growthNote);
  drawLabBody(page, fonts, "dark", y, "SHADOW ARCHETYPE", `${p.primary.shadow_trait} — ${p.primary.shadow_description}`);
}

// ── Master studies ────────────────────────────────────────────────────
function drawMasterStudy(page: PDFPage, fonts: DossierFonts, cursorY: number, index: number, p: DossierPayload): void {
  const m = MASTER_STUDIES[index];
  const shape = shapeFamilyOf(p.primary.weights);
  const realm = lookupRealmLore(p.realm_id);
  const accentName = accentNameOf(realm.symbol, p.order);
  const applyText = m.apply
    .replace(/\{name\}/g, p.legacy_name)
    .replace(/\{shape\}/g, shape.shapeWord)
    .replace(/\{accentName\}/g, accentName)
    .replace(/\{shadow\}/g, p.primary.shadow_trait.toLowerCase())
    .replace(/\{realmName\}/g, realm.realmName);

  let y = drawKicker(page, fonts, "dark", cursorY, `MASTER STUDY · No. ${index + 1}`, m.principle.toUpperCase());
  y = drawHeading(page, fonts, "dark", y, m.character);
  y = drawSub(page, fonts, y, m.source);
  y = drawRule(page, y);
  for (const [lab, body] of m.blocks) y = drawLabBody(page, fonts, "dark", y, lab, body);
  y = drawCommBox(page, fonts, y, "APPLIED TO YOUR RECORD", applyText);
  drawFineprint(page, fonts, y, "Master studies teach principles, never imitation. Study why it works; design your own answer.");
}

// ── Lore ──────────────────────────────────────────────────────────────
function drawLoreRealm1(page: PDFPage, fonts: DossierFonts, cursorY: number, p: DossierPayload): void {
  const realm = lookupRealmLore(p.realm_id);
  let y = drawKicker(page, fonts, "dark", cursorY, "LORE", "HOME REALM");
  y = drawHeading(page, fonts, "dark", y, `${realm.realmName} (${realm.realmJp})`);
  y = drawSub(page, fonts, y, `This is the ground that shaped ${p.legacy_name} — read it as a designer reads a character's childhood.`);
  y = drawRule(page, y);
  for (const [lab, body] of realm.loreRealm) y = drawLabBody(page, fonts, "dark", y, lab, body);
}

// ── Cast ──────────────────────────────────────────────────────────────
function castTitles(p: DossierPayload, realmName: string): [string, string][] {
  const { growth, quarter, opposite, other_ally: otherAlly, realmmate } = p.wheel;
  return [
    ["THE HERO", `The ${growth.label} You Are Becoming`],
    ["THE HEROINE", `The ${quarter.label} of the Crossing Path`],
    ["THE MENTOR", realmmate ? `The Elder ${realmmate.label} of ${realmName}` : `The Elder of ${realmName}`],
    ["THE RIVAL", `The ${opposite.label} Across the Wheel`],
    ["THE ALLY", `The ${otherAlly.label} at Your Shoulder`],
    ["THE MONSTER", `The Beast of ${p.primary.shadow_trait}`],
    ["THE VILLAIN", `The Fallen ${opposite.label}`],
    ["THE SHADOW SELF", `The ${p.primary.label}, Unchecked`],
  ];
}

function drawCastListing(page: PDFPage, fonts: DossierFonts, cursorY: number, p: DossierPayload): void {
  const realm = lookupRealmLore(p.realm_id);
  let y = drawKicker(page, fonts, "dark", cursorY, "RELATIONSHIPS");
  y = drawHeading(page, fonts, "dark", y, "The Cast Around You");
  y = drawSub(page, fonts, y, `No character exists alone. These eight figures are derived from ${p.legacy_name}'s exact position on the wheel — each one is a design brief for a supporting character in your story.`);
  y = drawRule(page, y);
  for (const [role, title] of castTitles(p, realm.realmName)) {
    page.drawText(safeText(role), { x: MARGIN_LEFT, y: y - 9, size: 9, font: fonts.serif, color: COLOR.gold });
    page.drawText(safeText(title), { x: MARGIN_LEFT + 30 * MM, y: y - 9, size: 9.5, font: fonts.serif, color: COLOR.bodyDark });
    y -= 2.6 * MM + 9;
  }
  y -= 3 * MM;
  drawCommBox(page, fonts, y, "WHY THIS MATTERS",
    "Ensemble design is contrast management. Eight briefs above, one rule beneath them all: no two silhouettes may agree. The cast exists to make YOUR outline unmistakable in the group shot.");
}

function drawCastPerfectTeam(page: PDFPage, fonts: DossierFonts, cursorY: number, p: DossierPayload): void {
  const { growth, quarter, realmmate } = p.wheel;
  const selfTrait0 = p.primary.traits[0];
  let y = drawKicker(page, fonts, "dark", cursorY, "RELATIONSHIPS", "ROSTER");
  y = drawHeading(page, fonts, "dark", y, "The Perfect Team");
  y = drawSub(page, fonts, y, `If ${p.legacy_name} could choose any three companions for the Hunt, the wheel recommends these.`);
  y = drawRule(page, y);
  const rows: [string, string, string][] = [
    [growth.romaji_name.toUpperCase(), growth.label, `Momentum — the ${growth.label} converts your ${selfTrait0.toLowerCase()} into motion.`],
    [
      realmmate ? realmmate.romaji_name.toUpperCase() : growth.romaji_name.toUpperCase(),
      realmmate ? realmmate.label : growth.label,
      realmmate ? "Perspective — a fellow child of your Realm, fluent in your Calling's craft." : "Perspective — someone who has already paid for the lessons you're about to buy.",
    ],
    [quarter.romaji_name.toUpperCase(), quarter.label, "Depth — the quarter-turn companion, fluent in what you find hardest."],
  ];
  for (const [jp, nm, blurb] of rows) y = drawLabBody(page, fonts, "dark", y, `${jp} · ${nm}`, blurb);
}

// ── Journey ───────────────────────────────────────────────────────────
const JOURNEY_TITLES = [
  "Why You Were Chosen", "The Quest", "The Greatest Fear",
  "The Hidden Strength", "The Greatest Trial", "The Transformation", "The Final Destiny",
];

function drawJourneyListing(page: PDFPage, fonts: DossierFonts, cursorY: number, p: DossierPayload): void {
  let y = drawKicker(page, fonts, "dark", cursorY, "HERO JOURNEY");
  y = drawHeading(page, fonts, "dark", y, `The Hunt of ${p.legacy_name}`);
  y = drawSub(page, fonts, y, "Seven beats of a personal Giant Hunt narrative — generated from your identity, your shadow, and your position on the wheel. Use it as the spine of your character's story, or argue with it. Both are canon.");
  y = drawRule(page, y);
  JOURNEY_TITLES.forEach((title, i) => {
    page.drawText(String(i + 1).padStart(2, "0"), { x: MARGIN_LEFT, y: y - 9, size: 9, font: fonts.serif, color: COLOR.gold });
    page.drawText(title, { x: MARGIN_LEFT + 10 * MM, y: y - 9, size: 10, font: fonts.serif, color: COLOR.bodyDark });
    y -= 2.6 * MM + 9;
  });
}

function journeyBeatText(i: number, p: DossierPayload, realm: ReturnType<typeof lookupRealmLore>): string {
  const orderFullStr = orderFull(p.order);
  switch (i) {
    case 0:
      return `${p.legacy_name} was not chosen for being flawless. The Order of ${orderFullStr} marked them because, of everyone in ${realm.realmName}, they alone answered the old question the way a ${p.primary.label} must — ${p.primary.description} The Giant Hunt does not summon the strongest. It summons the necessary.`;
    case 1:
      return `To carry ${realm.symbol.toLowerCase()} across all five realms and prove that "${p.guiding_promise}" is not a motto but a method — sealing their name, ${p.birth_name} become ${p.legacy_name}, into the record of the Hunt.`;
    case 2:
      return `Not death, and not defeat — ${p.primary.shadow_trait.toLowerCase()}. ${p.primary.shadow_description} ${p.legacy_name} has seen this happen to greater ${p.primary.label}s, and lies awake knowing the difference between them was never talent.`;
    default:
      throw new Error(`journeyBeatText: index ${i} is archetype-bound, not dynamic`);
  }
}

function drawJourneyBeat(page: PDFPage, fonts: DossierFonts, i: number, p: DossierPayload): void {
  const realm = lookupRealmLore(p.realm_id);
  let y = PAGE_HEIGHT - 60 * MM;
  centerText(page, fonts, `HERO JOURNEY  ·  BEAT ${i + 1} OF 7`, y, 8, false, COLOR.gold);
  y -= 12 * MM;
  centerText(page, fonts, JOURNEY_TITLES[i], y, 22, true);
  y -= 8 * MM;
  y = centerRule(page, y);
  centerParagraph(page, fonts, journeyBeatText(i, p, realm), y, 15, COLOR.bodyDark, 140 * MM, 1.75);
}

// ── Blueprint ─────────────────────────────────────────────────────────
function drawBlueprintShape(page: PDFPage, fonts: DossierFonts, cursorY: number, p: DossierPayload): void {
  const shape = shapeFamilyOf(p.primary.weights);
  const [t0, t1] = p.primary.traits;
  let y = drawKicker(page, fonts, "dark", cursorY, "BLUEPRINT");
  y = drawHeading(page, fonts, "dark", y, "Character Design Blueprint");
  y = drawSub(page, fonts, y, `A professional design brief for drawing ${p.legacy_name} — derived from Order, Realm, Calling and archetype. Recommendations, not rules: your hand makes the final call.`);
  y = drawRule(page, y);
  y = drawLabBody(page, fonts, "dark", y, "SHAPE LANGUAGE", `${shape.shapeWord} — ${shape.note}`);
  y = drawLabBody(page, fonts, "dark", y, "WHY", `${t0} and ${t1} are ${shape.shapeWord}-family traits in classical design theory — ${shape.whyPhrase}.`);
  y = drawLabBody(page, fonts, "dark", y, "HEIGHT & BUILD", "Proportions and stance follow the archetype's Order: Giants read grounded and vertical, Hunters read agile and directional. Built to be drawn mid-action, not standing at parade rest.");
  y = drawLabBody(page, fonts, "dark", y, "SILHOUETTE", `A silhouette that leads with ${shape.shapeWord}s — let ${t0.toLowerCase()} and ${t1.toLowerCase()} be visible in the outline before any detail is added.`);
  drawCommBox(page, fonts, y, "WHY THIS MATTERS",
    `${shape.shapeWord}s appear here because your two strongest traits sit in the ${shape.shapeWord}-family of classical shape theory. When a recommendation and your instinct disagree, your instinct wins — but now it argues against a stated reason, which sharpens both.`);
}

// ── Hunt / Founding / Colophon ───────────────────────────────────────
function drawHuntDesigning(page: PDFPage, fonts: DossierFonts, cursorY: number, p: DossierPayload): void {
  let y = drawKicker(page, fonts, "dark", cursorY, "THE GIANT HUNT", "GUIDE");
  y = drawHeading(page, fonts, "dark", y, "Designing Your Character");
  y = drawSub(page, fonts, y, `Everything in this dossier converges here: turning ${p.legacy_name} into a finished, hand-drawn character.`);
  y = drawRule(page, y);
  const steps: [string, string][] = [
    ["STEP 1 — READ YOUR BRIEF", "Your Blueprint pages are the design brief: shape language, proportions, palette, costume logic. Read them twice before touching paper."],
    ["STEP 2 — THUMBNAIL", "Ten small silhouettes using the workflow lesson. Choose the one that passes the fill test at thumbnail size."],
    ["STEP 3 — BUILD ON THE SHEETS", "Work through the workbook in order: head grid → eyes → expressions → poses → costume → turnaround. Each sheet feeds the next."],
    ["STEP 4 — FINAL TURNAROUND", "Present front, side and back on the turnaround sheet at a consistent head count. Flat colour from your palette page. This is your submission artwork."],
  ];
  for (const [lab, body] of steps) y = drawLabBody(page, fonts, "dark", y, lab, body);
}

function drawHuntWorldRecord(page: PDFPage, fonts: DossierFonts, cursorY: number, p: DossierPayload): void {
  let y = drawKicker(page, fonts, "dark", cursorY, "THE GIANT HUNT", "GUIDE");
  y = drawHeading(page, fonts, "dark", y, "The World Record Attempt");
  y = drawRule(page, y);
  const blocks: [string, string][] = [
    ["THE ATTEMPT", "The Giant Hunt is organised as an official Guinness World Records attempt for original character designs created within a single campaign. Every verified, guideline-compliant submission counts toward the total."],
    ["WHAT VERIFICATION MEANS", "Independent adjudication requires each entry to be an original, individually-created character design with a verifiable creator. Your Giantverse ID is your verification key — keep this dossier."],
    ["YOUR PART", `${p.legacy_name} is one name in the attempt. If the record stands, every counted participant is part of a world record — permanently, and provably.`],
    ["AFTER SUBMISSION", "You'll receive confirmation of receipt, then verification status, then — record or not — your entry joins the public Giantverse gallery unless you opt out. Selected designs are featured; all verified designs are counted."],
  ];
  for (const [lab, body] of blocks) y = drawLabBody(page, fonts, "dark", y, lab, body);
}

function drawFoundingBenefits(page: PDFPage, fonts: DossierFonts, cursorY: number, p: DossierPayload): void {
  let y = drawKicker(page, fonts, "dark", cursorY, "FOUNDER'S PASS");
  y = drawHeading(page, fonts, "dark", y, "Founding Creator Benefits");
  y = drawSub(page, fonts, y, `The Giant Hunt Founder's Pass makes ${p.real_name} a founding creator of the Giantverse platform — the first cohort, permanently marked as such.`);
  y = drawRule(page, y);
  const blocks: [string, string][] = [
    ["YOURS NOW", "Lifetime access to this Giantverse identity profile and dossier — view online and re-download anytime. Founding Creator badge on your identity record. Verified entry in the Giant Hunt and the world record attempt."],
    ["PLANNED PLATFORM BENEFITS", "As the Giantverse platform grows, founding creators are first in line for: a public creator profile, access to future platform updates and creator tools, eligibility for a future creator marketplace, and priority entry to future competitions and events."],
    ["THE HONEST PRINT", "Items listed as planned are exactly that — planned platform benefits and future features under active development, not guaranteed outcomes and not financial returns of any kind. What you are buying today is fully delivered today: this dossier, the masterclass, the workbook, and your verified place in the Hunt."],
  ];
  for (const [lab, body] of blocks) y = drawLabBody(page, fonts, "dark", y, lab, body);
}

function drawFoundingGoDraw(page: PDFPage, fonts: DossierFonts, p: DossierPayload): void {
  let y = PAGE_HEIGHT - 70 * MM;
  centerText(page, fonts, "FOUNDER'S PASS", y, 8, false, COLOR.gold);
  y -= 12 * MM;
  centerText(page, fonts, "Go Draw", y, 22, true);
  y -= 8 * MM;
  y = centerRule(page, y);
  y = centerParagraph(page, fonts, "Everything before this page was analysis. Everything after it is craft — and craft only happens on paper.", y, 15, COLOR.bodyDark) - 4 * MM;
  y = centerParagraph(page, fonts, "You have a name, a realm, a calling, a cast, a story, a brief, a masterclass, six master studies, three studio pipelines and fourteen sheets of guides. You have, without noticing, completed a character design course. The Giantverse has done its part.", y, 15, COLOR.bodyDark) - 4 * MM;
  centerParagraph(page, fonts, `The Hunt is waiting, ${p.legacy_name}.`, y, 15, COLOR.gold);
}

function drawColophon(page: PDFPage, fonts: DossierFonts, p: DossierPayload): void {
  let y = PAGE_HEIGHT - 80 * MM;
  centerText(page, fonts, "COLOPHON", y, 8, false, COLOR.gold);
  y -= 14 * MM;
  centerText(page, fonts, "About This Edition", y, 18);
  y -= 10 * MM;
  y = centerRule(page, y, 40);
  y = centerParagraph(page, fonts,
    `Character Genesis Dossier 2.0 — Premium Collector's Edition. Composed for ${p.legacy_name}, record ${p.gv_id}, from the Giantverse identity engine. One hundred design sparks are scattered through these pages; the first is on the Identity record, the last is below. All studio and character analyses are educational commentary; all rights in the works discussed remain with their creators. Quotes are verbatim where attributed plainly and labelled where paraphrased.`,
    y, 10, COLOR.dim, 120 * MM, 1.5) - 8 * MM;
  y = centerRule(page, y, 40);
  centerText(page, fonts, LAST_SPARK, y, 15, false, COLOR.headingDark);
}

// ── Dispatcher ────────────────────────────────────────────────────────
export async function renderDynamicPage(
  pdfDoc: PDFDocument,
  fonts: DossierFonts,
  dynamicId: string,
  payload: DossierPayload,
): Promise<PDFPage> {
  const cls = "dark" as const;
  const { page, cursorY } = newSheet(pdfDoc, cls);

  if (dynamicId === "cover") drawCover(page, fonts, payload);
  else if (dynamicId === "plate") drawPlate(page, fonts, payload);
  else if (dynamicId === "identity-record-1") drawIdentityRecord1(page, fonts, cursorY, payload);
  else if (dynamicId === "identity-record-2") {
    const realm = lookupRealmLore(payload.realm_id);
    drawIdentityRecord2(page, fonts, cursorY, payload, realm.realmName, realm.realmJp, realm.symbol, realm.symbolMeaning);
  } else if (dynamicId === "archetype-bars") drawArchetypeBars(page, fonts, cursorY, payload);
  else if (dynamicId.startsWith("master-study-")) drawMasterStudy(page, fonts, cursorY, Number(dynamicId.split("-").pop()), payload);
  else if (dynamicId === "lore-realm-1") drawLoreRealm1(page, fonts, cursorY, payload);
  else if (dynamicId === "cast-listing") drawCastListing(page, fonts, cursorY, payload);
  else if (dynamicId === "cast-perfect-team") drawCastPerfectTeam(page, fonts, cursorY, payload);
  else if (dynamicId === "journey-listing") drawJourneyListing(page, fonts, cursorY, payload);
  else if (dynamicId.startsWith("journey-beat-")) drawJourneyBeat(page, fonts, Number(dynamicId.split("-").pop()), payload);
  else if (dynamicId === "blueprint-shape") drawBlueprintShape(page, fonts, cursorY, payload);
  else if (dynamicId === "hunt-designing") drawHuntDesigning(page, fonts, cursorY, payload);
  else if (dynamicId === "hunt-world-record") drawHuntWorldRecord(page, fonts, cursorY, payload);
  else if (dynamicId === "founding-benefits") drawFoundingBenefits(page, fonts, cursorY, payload);
  else if (dynamicId === "founding-go-draw") drawFoundingGoDraw(page, fonts, payload);
  else if (dynamicId === "colophon") drawColophon(page, fonts, payload);
  else throw new Error(`renderDynamicPage: unknown dynamicId "${dynamicId}"`);

  // Footer is applied uniformly across the whole assembled document by
  // pdf-assembler.ts (it needs the final page order/count, only known
  // after every static/dynamic/character page has been placed).
  return page;
}

export { loadFonts };
