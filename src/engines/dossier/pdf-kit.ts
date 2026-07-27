import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, type RGB } from "pdf-lib";

// Shared low-level drawing primitives for the dossier's Node-authored pages
// (the ~23 "dynamic" pages that weave the participant's own name into
// prose, plus the ≤182 character-match pages) — reproducing the palette,
// type scale and page geometry of tools/dossier/generate_dossier.py's CSS
// (see that file's `CSS` constant) using pdf-lib's own primitives, since
// there's no HTML/CSS renderer available at request time in production.
//
// Deliberately NOT replicated (decorative, not load-bearing for content
// correctness): CSS letter-spacing on kickers/labels, the large translucent
// archetype-kanji watermark, and the rotating one-line "spark" footer quote.
// Everything that carries information — headings, labels, body copy, rules,
// bars, the page footer identity stamp — is reproduced.

// pdf-lib's standard 14 fonts only support WinAnsi (cp1252) encoding — no
// CJK, Devanagari, Arabic, etc. Real input can carry any of those (a
// participant's own name, an archetype's kanji label) and would otherwise
// throw and abort the whole PDF. Strip anything outside WinAnsi's actual
// repertoire rather than crash — a silently-dropped glyph is a far better
// failure mode than a failed dossier.
//
// WinAnsi isn't simply "codepoint <= 0xFF": cp1252's 0x80-0x9F byte range
// maps to a scattered set of Unicode codepoints above 0xFF (curly quotes,
// en/em dash, ellipsis, bullet, €, ™, …) that this book's own ported prose
// uses throughout (em-dashes especially) — excluding them would silently
// mangle otherwise-ordinary English text, not just guard against script
// mismatches.
const WINANSI_EXTRA = new Set([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030,
  0x0160, 0x2039, 0x0152, 0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022,
  0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x017e, 0x0178,
]);

export function safeText(s: string): string {
  return Array.from(s)
    .filter((ch) => {
      const cp = ch.codePointAt(0)!;
      return cp <= 0xff || WINANSI_EXTRA.has(cp);
    })
    .join("")
    .replace(/[^\S\n]+/g, " ")
    .trim();
}

export const MM = 2.8346456693; // 1mm in PDF points
export const PAGE_WIDTH = 210 * MM;
export const PAGE_HEIGHT = 297 * MM;
export const MARGIN_LEFT = 20 * MM;
export const MARGIN_RIGHT = 20 * MM;
export const MARGIN_TOP = 20 * MM;
export const MARGIN_BOTTOM = 22 * MM;
export const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
export const CONTENT_TOP_Y = PAGE_HEIGHT - MARGIN_TOP; // y of the top of the content box
export const CONTENT_BOTTOM_Y = MARGIN_BOTTOM; // y of the bottom of the content box

export function hex(h: string): RGB {
  const n = parseInt(h.replace("#", ""), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

export const COLOR = {
  gold: hex("#C9A24B"),
  ink: hex("#12100E"),
  black: hex("#060504"),
  paper: hex("#F2EDE2"),
  headingDark: hex("#EFE9DA"),
  headingCream: hex("#2E2A22"),
  bodyDark: hex("#C9C3B6"),
  bodyCream: hex("#4A463C"),
  dim: hex("#8A8478"),
  sub: hex("#9A948A"),
  footer: hex("#6A6458"),
  fineprint: hex("#6E695F"),
  commBg: hex("#3A2F12"), // approximation of rgba(gold,0.06) over ink — flat fill, not true alpha
  red: hex("#B4543F"),
};

export type SheetClass = "dark" | "black" | "cream";

export type DossierFonts = {
  serif: PDFFont; // heading font — Times-Roman stands in for Georgia (no font-licensing dependency)
  serifBold: PDFFont;
  sans: PDFFont; // body/label font — matches the book's Helvetica body font exactly
  sansBold: PDFFont;
};

export async function loadFonts(pdfDoc: PDFDocument): Promise<DossierFonts> {
  return {
    serif: await pdfDoc.embedFont(StandardFonts.TimesRoman),
    serifBold: await pdfDoc.embedFont(StandardFonts.TimesRomanBold),
    sans: await pdfDoc.embedFont(StandardFonts.Helvetica),
    sansBold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
  };
}

function bgColor(cls: SheetClass): RGB {
  return cls === "cream" ? COLOR.paper : cls === "black" ? COLOR.black : COLOR.ink;
}
function bodyColor(cls: SheetClass): RGB {
  return cls === "cream" ? COLOR.bodyCream : COLOR.bodyDark;
}
function headingColor(cls: SheetClass): RGB {
  return cls === "cream" ? COLOR.headingCream : COLOR.headingDark;
}

/** Creates a fresh A4 page, fills its background, and returns a cursor
 * starting at the top of the content box. Mirrors `.sheet`/`.content`. */
export function newSheet(pdfDoc: PDFDocument, cls: SheetClass = "dark"): { page: PDFPage; cursorY: number } {
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: bgColor(cls) });
  return { page, cursorY: CONTENT_TOP_Y };
}

function wrapText(font: PDFFont, size: number, text: string, maxWidth: number): string[] {
  const words = safeText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export type ParagraphOpts = {
  font: PDFFont;
  size: number;
  color: RGB;
  maxWidth?: number;
  lineHeight?: number; // multiple of size, mirrors CSS line-height
};

/** Draws word-wrapped text starting at (x, cursorY) with the text's cap
 * height just below cursorY (matching CSS block flow), returns the new
 * cursorY just below the last line. */
export function drawParagraph(
  page: PDFPage,
  x: number,
  cursorY: number,
  text: string,
  opts: ParagraphOpts,
): number {
  const { font, size, color, maxWidth = CONTENT_WIDTH, lineHeight = 1.5 } = opts;
  const lines = wrapText(font, size, text, maxWidth);
  let y = cursorY;
  for (const line of lines) {
    y -= size * 0.95; // baseline offset below the block's top
    page.drawText(line, { x, y, size, font, color });
    y -= size * (lineHeight - 1);
  }
  return y;
}

export function drawKicker(page: PDFPage, fonts: DossierFonts, cls: SheetClass, cursorY: number, a: string, b?: string): number {
  const size = 8;
  const text = safeText(b ? `${a.toUpperCase()}  ·  ${b.toUpperCase()}` : a.toUpperCase());
  page.drawText(text, { x: MARGIN_LEFT, y: cursorY - size, size, font: fonts.sansBold, color: COLOR.gold });
  return cursorY - size - 3 * MM;
}

export function drawHeading(page: PDFPage, fonts: DossierFonts, cls: SheetClass, cursorY: number, text: string, size = 24): number {
  page.drawText(safeText(text), { x: MARGIN_LEFT, y: cursorY - size, size, font: fonts.serifBold, color: headingColor(cls) });
  return cursorY - size - 2.5 * MM;
}

export function drawSub(page: PDFPage, fonts: DossierFonts, cursorY: number, text: string, maxWidth = 150 * MM): number {
  return drawParagraph(page, MARGIN_LEFT, cursorY, text, { font: fonts.sans, size: 10, color: COLOR.sub, maxWidth, lineHeight: 1.6 }) - 2 * MM;
}

export function drawRule(page: PDFPage, cursorY: number): number {
  page.drawLine({
    start: { x: MARGIN_LEFT, y: cursorY - 1 },
    end: { x: MARGIN_LEFT + CONTENT_WIDTH, y: cursorY - 1 },
    thickness: 1,
    color: COLOR.gold,
    opacity: 0.6,
  });
  return cursorY - 1 - 5 * MM;
}

export function drawLab(page: PDFPage, fonts: DossierFonts, cursorY: number, text: string): number {
  const size = 7.5;
  page.drawText(safeText(text.toUpperCase()), { x: MARGIN_LEFT, y: cursorY - size, size, font: fonts.sansBold, color: COLOR.gold });
  return cursorY - size - 1.3 * MM;
}

export function drawBody(page: PDFPage, fonts: DossierFonts, cls: SheetClass, cursorY: number, text: string, opts?: { dim?: boolean; maxWidth?: number }): number {
  const color = opts?.dim ? COLOR.dim : bodyColor(cls);
  return drawParagraph(page, MARGIN_LEFT, cursorY, text, { font: fonts.sans, size: 10, color, maxWidth: opts?.maxWidth ?? 158 * MM, lineHeight: 1.65 });
}

/** A "lab" + "body" pair, matching blocks()'s output — returns new cursorY. */
export function drawLabBody(page: PDFPage, fonts: DossierFonts, cls: SheetClass, cursorY: number, lab: string, body: string): number {
  let y = drawLab(page, fonts, cursorY, lab);
  y = drawBody(page, fonts, cls, y, body);
  return y - 1.5 * MM;
}

export function drawFineprint(page: PDFPage, fonts: DossierFonts, cursorY: number, text: string): number {
  return drawParagraph(page, MARGIN_LEFT, cursorY - 5.5 * MM, text, { font: fonts.sans, size: 7.5, color: COLOR.fineprint, lineHeight: 1.5 });
}

export function drawCommBox(page: PDFPage, fonts: DossierFonts, cursorY: number, label: string, text: string): number {
  const size = 9;
  const boxTop = cursorY - 5.5 * MM;
  const lines = wrapText(fonts.sans, size, `${label} — ${text}`, CONTENT_WIDTH - 2 * 4.5 * MM);
  const boxHeight = lines.length * size * 1.6 + 2 * 4 * MM;
  page.drawRectangle({ x: MARGIN_LEFT, y: boxTop - boxHeight, width: CONTENT_WIDTH, height: boxHeight, color: COLOR.commBg, opacity: 0.5 });
  page.drawLine({ start: { x: MARGIN_LEFT, y: boxTop }, end: { x: MARGIN_LEFT, y: boxTop - boxHeight }, thickness: 1.7, color: COLOR.gold });
  let y = boxTop - 4 * MM;
  for (const line of lines) {
    y -= size * 0.95;
    page.drawText(line, { x: MARGIN_LEFT + 4.5 * MM, y, size, font: fonts.sans, color: hex("#BDB7A9") });
    y -= size * 0.6;
  }
  return boxTop - boxHeight - 2 * MM;
}

/** A confidence/secondary_pct-style progress bar with trailing percentage —
 * mirrors bar()/.bar/.bar-fill/.bar-pct. Used both for freshly-authored
 * dynamic pages and (via drawBarAt) as an overlay on pre-built pages. */
export function drawBar(page: PDFPage, fonts: DossierFonts, cursorY: number, pct: number): number {
  const barY = cursorY - 2.6 * MM - 1.5 * MM;
  return drawBarAt(page, fonts, MARGIN_LEFT, barY, 150 * MM, pct) - 2 * MM;
}

/** Same visual as drawBar but at an explicit (x, y) — for overlaying a
 * numeric bar onto a pre-built static page at a pre-measured position. */
export function drawBarAt(page: PDFPage, fonts: DossierFonts, x: number, y: number, width: number, pct: number): number {
  const height = 2.6 * MM;
  page.drawRectangle({ x, y, width, height, color: COLOR.gold, opacity: 0.12 });
  page.drawRectangle({ x, y, width: width * Math.max(0, Math.min(100, pct)) / 100, height, color: COLOR.gold });
  page.drawText(`${Math.round(pct)}%`, { x: x + width - 10, y: y + height + 1 * MM, size: 8, font: fonts.serif, color: COLOR.gold });
  return y;
}

export function drawFooter(page: PDFPage, fonts: DossierFonts, cls: SheetClass, left: string, right: string): void {
  const size = 6.5;
  const y = MARGIN_BOTTOM - 3 * MM;
  const color = cls === "cream" ? hex("#8F897B") : COLOR.footer;
  const leftText = safeText(left.toUpperCase());
  page.drawText(leftText, { x: MARGIN_LEFT, y, size, font: fonts.sansBold, color });
  const rightText = safeText(right.toUpperCase());
  const rightWidth = fonts.sansBold.widthOfTextAtSize(rightText, size);
  page.drawText(rightText, { x: PAGE_WIDTH - MARGIN_RIGHT - rightWidth, y, size, font: fonts.sansBold, color });
}
