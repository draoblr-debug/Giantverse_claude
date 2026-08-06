import { readFileSync } from "node:fs";
import path from "node:path";
import { PDFDocument, PDFPage } from "pdf-lib";
import { getAllyIds } from "@/engines/archetype/archetype-wheel";
import { renderDynamicPage, loadFonts, DossierPayload } from "@/engines/dossier/dynamic-pages";
import { drawCharacterPage } from "@/engines/dossier/character-page";
import { COLOR, drawFooter, PAGE_WIDTH, MARGIN_BOTTOM, MM } from "@/engines/dossier/pdf-kit";

// Assembles a full, per-participant dossier PDF entirely in Node — no
// Python/WeasyPrint at request time, so this runs on Vercel's serverless
// functions. Combines three pre-built/pre-authored sources per the page
// order tools/dossier/generate_dossier.py's build_page_recipe() computed
// (public/dossier-prebuilt/page-recipe.json, checked into the repo):
//   - "static"    pages: copied from public/dossier-prebuilt/archetypes/
//                 {archetypeId}__{prev|next}.pdf (pre-rendered once via
//                 WeasyPrint, offline — see tools/dossier/prebuild.py)
//   - "dynamic"   pages: authored fresh here via dynamic-pages.ts (the
//                 ~24 pages that weave the participant's own name into
//                 prose, so can't be pre-built)
//   - "character" pages: authored fresh here via character-page.ts, one
//                 per real top-5 visual match (similarity varies per
//                 request, so these aren't pre-built either — see that
//                 file's header comment)
// A uniform footer-redaction pass runs last: every pre-built static page
// carries a placeholder footer (baked in by a synthetic persona at
// pre-build time — see prebuild.py), so every final page gets its footer
// area painted over and the real name/GV-ID/section/page-number redrawn.

type RecipeSlot = {
  tier: "static" | "dynamic" | "character";
  id?: string;
  slot?: number;
  overlay?: "wheel-confidence";
  conditional?: "has-visual-matches";
  quote?: boolean;
  section: string;
  cls: "dark" | "black" | "cream";
};

const PREBUILT_DIR = path.join(process.cwd(), "public", "dossier-prebuilt");

function loadRecipe(): RecipeSlot[] {
  return JSON.parse(readFileSync(path.join(PREBUILT_DIR, "page-recipe.json"), "utf-8"));
}

function growthBranch(payload: DossierPayload): "prev" | "next" {
  const [prevAllyId] = getAllyIds(payload.primary.id);
  return payload.wheel.growth.id === prevAllyId ? "prev" : "next";
}

// Measured directly against the pre-built wheel page via `pdftotext -bbox`
// and re-verified across archetypes with very different name lengths — see
// this feature's plan notes. Stable across all 64 archetype/branch variants
// because nothing above the wheel diagram on that page varies in height.
const WHEEL_CONFIDENCE_CENTER_X = 297.64;
const WHEEL_CONFIDENCE_BASELINE_Y = 469.6;

async function applyWheelConfidenceOverlay(
  page: PDFPage,
  fonts: Awaited<ReturnType<typeof loadFonts>>,
  confidence: number,
): Promise<void> {
  page.drawRectangle({ x: 220, y: 458, width: 155, height: 24, color: COLOR.ink });
  const text = `confidence ${Math.round(confidence)}%`;
  const size = 10;
  const width = fonts.serif.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: WHEEL_CONFIDENCE_CENTER_X - width / 2,
    y: WHEEL_CONFIDENCE_BASELINE_Y,
    size,
    font: fonts.serif,
    color: COLOR.dim,
  });
}

function bgColorFor(cls: RecipeSlot["cls"]) {
  return cls === "cream" ? COLOR.paper : cls === "black" ? COLOR.black : COLOR.ink;
}

export async function assembleDossierPdf(
  payload: DossierPayload,
): Promise<{ bytes: Uint8Array; pages: number; quotePages: number[] }> {
  const recipe = loadRecipe();
  const archetypeId = payload.primary.id;
  const branch = growthBranch(payload);
  const staticPath = path.join(PREBUILT_DIR, "archetypes", `${archetypeId}__${branch}.pdf`);
  const staticDoc = await PDFDocument.load(readFileSync(staticPath));

  const outDoc = await PDFDocument.create();
  const fonts = await loadFonts(outDoc);
  const matches = payload.visual_matches ?? [];

  // Copying pages one at a time in a loop makes pdf-lib re-embed shared
  // resources (fonts, etc.) per call instead of sharing them across the
  // batch — a single bulk copyPages() up front keeps those resources
  // deduplicated, which is the difference between a multi-megabyte and a
  // few-hundred-kilobyte output file.
  const staticIndices = Array.from({ length: staticDoc.getPageCount() }, (_, i) => i);
  const copiedStaticPages = await outDoc.copyPages(staticDoc, staticIndices);

  let staticCursor = 0;
  let characterSlot = 0;
  // Parallel to outDoc's eventual page list — built up as pages are added,
  // since some recipe slots are skipped (no visual matches, fewer than 5
  // matches) and the two lists must stay in lockstep for the footer pass.
  const outputSections: string[] = [];
  const outputCls: RecipeSlot["cls"][] = [];
  const quotePages: number[] = []; // 1-based indices, for DossierPreview's free-page sampler

  for (const slot of recipe) {
    if (slot.tier === "static") {
      const copied = copiedStaticPages[staticCursor];
      staticCursor++;
      const include = slot.conditional !== "has-visual-matches" || matches.length > 0;
      if (!include) continue;

      outDoc.addPage(copied);
      if (slot.overlay === "wheel-confidence") await applyWheelConfidenceOverlay(copied, fonts, payload.confidence);
      if (slot.quote) quotePages.push(outDoc.getPageCount());
      outputSections.push(slot.section);
      outputCls.push(slot.cls);
    } else if (slot.tier === "dynamic") {
      await renderDynamicPage(outDoc, fonts, slot.id!, payload);
      outputSections.push(slot.section);
      outputCls.push(slot.cls);
    } else {
      if (characterSlot >= matches.length) { characterSlot++; continue; }
      const m = matches[characterSlot];
      const indexInBook = characterSlot;
      characterSlot++;
      await drawCharacterPage(outDoc, fonts, m, indexInBook);
      outputSections.push(slot.section);
      outputCls.push(slot.cls);
    }
  }

  const total = outDoc.getPageCount();
  const pages = outDoc.getPages();
  for (let i = 0; i < total; i++) {
    if (i === 0) continue; // page 1 (the cover) carries no footer, matching generate_dossier.py
    const page = pages[i];
    const cls = outputCls[i];
    page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: MARGIN_BOTTOM + 8 * MM, color: bgColorFor(cls) });
    drawFooter(page, fonts, cls, `${payload.legacy_name} · ${payload.gv_id}`, `${outputSections[i]} · ${i + 1} / ${total}`);
  }

  const bytes = await outDoc.save();
  return { bytes, pages: total, quotePages };
}
