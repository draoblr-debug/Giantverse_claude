import { PDFDocument, PDFPage } from "pdf-lib";
import {
  newSheet, loadFonts, drawKicker, drawHeading, drawSub, drawRule, drawLab, drawBody, drawFineprint,
  CONTENT_WIDTH, DossierFonts, MM,
} from "@/engines/dossier/pdf-kit";
import type { buildPersonaPayload } from "@/engines/dossier/persona-payload";

// Matches the wire (snake_case) shape of one entry in
// buildPersonaPayload()'s `visual_matches` array — not VisualMatchInput
// (persona-payload.ts's camelCase INPUT type before it snake_cases for the
// wire), since that's the shape this module actually receives from
// pdf-assembler.ts's payload.
export type DossierVisualMatch = ReturnType<typeof buildPersonaPayload>["visual_matches"][number];

// One self-contained page per Visual Character Discovery match — the Node
// port of tools/dossier/generate_dossier.py's visual_match_page(). Pure
// function of a single character's data (name/series/designer/etc.) plus
// this participant's own similarity score for it — nothing archetype- or
// identity-derived leaks in, same as the Python original.
//
// Rendered fresh per request (via pdf-assembler.ts), not pre-built: unlike
// the ~85 WeasyPrint-rendered archetype pages, this is a plain text-block
// layout that costs almost nothing to draw, and `similarity` is genuinely
// per-request — pre-building would need the same fragile text-region
// overlay this feature otherwise avoids, for no real performance benefit.
export async function drawCharacterPage(
  pdfDoc: PDFDocument,
  fonts: DossierFonts,
  m: DossierVisualMatch,
  index: number,
): Promise<PDFPage> {
  const { page, cursorY } = newSheet(pdfDoc, "dark");

  let y = drawKicker(page, fonts, "dark", cursorY, `Visual Match · No. ${index + 1}`, `${Math.round(m.similarity)}% Similarity`);
  y = drawHeading(page, fonts, "dark", y, m.name);
  y = drawSub(page, fonts, y, m.series);
  y = drawRule(page, y);

  y = drawLab(page, fonts, y, "Designer");
  y = drawBody(page, fonts, "dark", y, m.designer) - 1.5 * MM;
  y = drawLab(page, fonts, y, "Studio");
  y = drawBody(page, fonts, "dark", y, m.studio) - 1.5 * MM;
  y = drawLab(page, fonts, y, "Franchise");
  y = drawBody(page, fonts, "dark", y, m.franchise) - 1.5 * MM;
  y = drawLab(page, fonts, y, "Shape Language");
  y = drawBody(page, fonts, "dark", y, m.shape_language) - 1.5 * MM;

  y = drawBody(page, fonts, "dark", y, m.description, { dim: true, maxWidth: CONTENT_WIDTH }) - 1.5 * MM;

  y = drawLab(page, fonts, y, "Design Principles");
  y = drawBody(page, fonts, "dark", y, `Communicates: ${m.communicates.join(", ")}`) - 0.5 * MM;
  y = drawBody(page, fonts, "dark", y, `Through: ${m.through.join(", ")}`, { dim: true }) - 1.5 * MM;

  y = drawLab(page, fonts, y, "Learn More About the Creator");
  const links = m.creator_links;
  const linkLines: string[] = [];
  if (links?.youtube) linkLines.push(links.youtube);
  if (links?.imdb) linkLines.push(links.imdb);
  for (const art of links?.articles ?? []) linkLines.push(`${art.label}: ${art.url}`);
  if (linkLines.length) {
    for (const line of linkLines) y = drawBody(page, fonts, "dark", y, line);
  } else {
    y = drawBody(page, fonts, "dark", y, "Not yet verified for this character — check back in a future edition.", { dim: true });
  }

  drawFineprint(page, fonts, y, "Matched by design language, not identity — an inspiration for the character you draw, never a claim about your own face.");

  return page;
}

/** Standalone single-page PDF — used only for isolated testing/preview. */
export async function renderCharacterPagePdf(m: DossierVisualMatch, index: number): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fonts = await loadFonts(pdfDoc);
  await drawCharacterPage(pdfDoc, fonts, m, index);
  return pdfDoc.save();
}
