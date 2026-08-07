"use client";

// Best-effort recovery of a previously-created Giantverse identity from a
// saved ID card image (src/lib/card-generator.ts's output), for anyone who
// wants to redownload their Character Design Brief without repeating the
// ritual. OCR of a small, stylized card is inherently noisy — every field
// this returns is meant to be shown to the user for review/correction
// before it's used (see app/brief/page.tsx), never trusted blind.
//
// Only the legacy name and the archetype are load-bearing: order and the
// guiding promise are pure functions of the archetype id (looked up from
// ARCHETYPE_DEFINITIONS, never OCR'd), birth name has no effect on the
// brief's rendered content at all and safely falls back to the legacy
// name if unread, and the invisible archetypes are recovered on a
// strictly best-effort basis from the card's own journey-map inset —
// which only ever labels the final archetype plus its top 2 runner-ups
// (see card-generator.ts's `topIds = ... .slice(0, 2)`), so at most 2 of
// the "true" 3 invisible archetypes can ever come back this way.

import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";

export type ExtractedCard = {
  legacyName: string;
  birthName: string;
  archetypeId: string | null;
  archetypeRawText: string;
  invisibleArchetypeIds: string[];
  invisibleRawText: string;
};

type FieldSpec = {
  align: "left" | "center";
  xFrac: number;
  yFrac: number;
  sizeFrac: number;
  maxWFrac: number;
};

// Mirrors the exact anchor points card-generator.ts draws each field at —
// percentages of the template's own width/height, matching that file's
// own px()/py()/fw() helpers. Kept in sync by hand; if that file's layout
// changes, these crops drift out of alignment with it.
const FIELDS: Record<"legacyName" | "birthName" | "archetype", FieldSpec> = {
  legacyName: { align: "center", xFrac: 0.5, yFrac: 0.201, sizeFrac: 0.062, maxWFrac: 0.78 },
  birthName: { align: "left", xFrac: 0.331, yFrac: 0.342, sizeFrac: 0.019, maxWFrac: 0.335 },
  archetype: { align: "left", xFrac: 0.332, yFrac: 0.569, sizeFrac: 0.019, maxWFrac: 0.334 },
};

// The journey-map glyph is drawn as a square of side 2*drawR pixels,
// where drawR is itself derived only from the template's WIDTH (see
// card-generator.ts: `ringR = px(0.121); drawR = ringR * 0.88`) and
// applied equally in both directions — so this crop uses W for both the
// horizontal and vertical half-extent, not H.
const GLYPH_RING = { xFrac: 0.172, yFrac: 0.730, rFrac: 0.121 * 0.88 };

// Every label/name Tesseract needs to read is drawn upscaled here first —
// the source regions are tiny (a tag on a wallet-sized card), and OCR
// reads upscaled, high-contrast text far more reliably than native pixel
// size, especially for the journey glyph's small runner-up labels.
const TARGET_CROP_WIDTH = 900;

function cropAndUpscale(img: HTMLImageElement, sx: number, sy: number, sw: number, sh: number): HTMLCanvasElement {
  const clampedSx = Math.max(0, sx);
  const clampedSy = Math.max(0, sy);
  const clampedSw = Math.max(1, Math.min(sw, img.naturalWidth - clampedSx));
  const clampedSh = Math.max(1, Math.min(sh, img.naturalHeight - clampedSy));

  const scale = TARGET_CROP_WIDTH / clampedSw;
  const canvas = document.createElement("canvas");
  canvas.width = TARGET_CROP_WIDTH;
  canvas.height = Math.round(clampedSh * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, clampedSx, clampedSy, clampedSw, clampedSh, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function cropField(img: HTMLImageElement, spec: FieldSpec): HTMLCanvasElement {
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const fontPx = W * spec.sizeFrac;
  const maxWPx = W * spec.maxWFrac;
  const xAnchor = W * spec.xFrac;
  const yBaseline = H * spec.yFrac;

  const pad = fontPx * 0.4;
  const x0 = spec.align === "center" ? xAnchor - maxWPx / 2 - pad : xAnchor - pad;
  const x1 = spec.align === "center" ? xAnchor + maxWPx / 2 + pad : xAnchor + maxWPx + pad;
  const y0 = yBaseline - fontPx * 1.3;
  const y1 = yBaseline + fontPx * 0.6;

  return cropAndUpscale(img, x0, y0, x1 - x0, y1 - y0);
}

function cropGlyphRing(img: HTMLImageElement): HTMLCanvasElement {
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const cx = W * GLYPH_RING.xFrac;
  const cy = H * GLYPH_RING.yFrac;
  const r = W * GLYPH_RING.rFrac * 1.05; // small safety margin only
  return cropAndUpscale(img, cx - r, cy - r, r * 2, r * 2);
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image file."));
    img.src = URL.createObjectURL(file);
  });
}

// Classic Levenshtein edit distance — used to fuzzy-match noisy OCR text
// against the fixed, known set of 32 archetype labels/romaji names rather
// than requiring an exact string match.
function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function normalize(s: string): string {
  return s.toUpperCase().replace(/[^A-Z]/g, "");
}

// Smallest edit distance between `needle` and any same-length window of
// `haystack` (plus the whole haystack itself, for when OCR under-reads a
// longer candidate) — handles OCR text that includes extra noise before
// or after the actual label.
function bestWindowDistance(haystack: string, needle: string): number {
  if (!needle) return Infinity;
  let best = levenshtein(haystack, needle);
  for (let i = 0; i <= Math.max(0, haystack.length - needle.length); i++) {
    best = Math.min(best, levenshtein(haystack.slice(i, i + needle.length), needle));
  }
  return best;
}

type ArchetypeMatch = { id: string; distance: number; candidateLen: number };

// Best archetype match for a noisy OCR string, scored against every
// archetype's label AND romaji name (whichever is closer wins) — handles
// OCR reading "ARISTOCRAT (KIZOKU)" as one blob or splitting it oddly.
function bestArchetypeMatch(rawText: string): ArchetypeMatch | null {
  const tokens = normalize(rawText);
  if (!tokens) return null;
  let best: ArchetypeMatch | null = null;
  for (const profile of Object.values(ARCHETYPE_DEFINITIONS)) {
    for (const candidate of [profile.label, profile.romajiName]) {
      const n = normalize(candidate);
      if (!n) continue;
      const distance = bestWindowDistance(tokens, n);
      if (best === null || distance < best.distance) best = { id: profile.id, distance, candidateLen: n.length };
    }
  }
  return best;
}

// Scans OCR'd glyph text for mentions of any archetype OTHER than the
// already-identified final one — the card's mini journey-map inset labels
// the winner plus its top 2 runner-ups (see this file's header comment),
// so this recovers at most 2 of the "true" 3 invisible archetypes.
function findInvisibleMentions(rawText: string, excludeId: string | null): string[] {
  const tokens = normalize(rawText);
  if (!tokens) return [];
  const found: string[] = [];
  for (const profile of Object.values(ARCHETYPE_DEFINITIONS)) {
    if (profile.id === excludeId) continue;
    const n = normalize(profile.label);
    if (n.length < 4) continue; // too short to match safely by substring
    const distance = bestWindowDistance(tokens, n);
    // Tolerant threshold, scaled to the label's own length — OCR on a
    // tiny glyph label is noisy, but a short label needs a tighter bound
    // or it starts matching by luck.
    if (distance <= Math.max(1, Math.floor(n.length * 0.3))) {
      found.push(profile.id);
    }
  }
  return found.slice(0, 2);
}

// Card text is drawn all-uppercase; convert back to a normal-looking name
// for the review form rather than shouting it back at the user.
function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function extractIdCardData(
  file: File,
  onProgress?: (label: string) => void,
): Promise<ExtractedCard> {
  const { createWorker } = await import("tesseract.js");
  const img = await loadImage(file);
  const worker = await createWorker("eng");

  try {
    async function ocr(canvas: HTMLCanvasElement): Promise<string> {
      const { data } = await worker.recognize(canvas);
      return data.text.trim();
    }

    onProgress?.("Reading legacy name…");
    const legacyNameText = await ocr(cropField(img, FIELDS.legacyName));
    onProgress?.("Reading birth name…");
    const birthNameText = await ocr(cropField(img, FIELDS.birthName));
    onProgress?.("Identifying your archetype…");
    const archetypeText = await ocr(cropField(img, FIELDS.archetype));
    onProgress?.("Reading the journey map…");
    const glyphText = await ocr(cropGlyphRing(img));

    const archetypeMatch = bestArchetypeMatch(archetypeText);
    // A match worse than this (relative to the candidate's own length) is
    // treated as "no confident match" — better to leave it for the user
    // to pick than to silently commit to the wrong archetype.
    const archetypeId = archetypeMatch && archetypeMatch.distance <= Math.max(2, Math.floor(archetypeMatch.candidateLen * 0.35))
      ? archetypeMatch.id
      : null;

    const invisibleArchetypeIds = findInvisibleMentions(glyphText, archetypeId);
    const legacyName = titleCase(legacyNameText);
    const birthName = titleCase(birthNameText) || legacyName;

    return {
      legacyName,
      birthName,
      archetypeId,
      archetypeRawText: archetypeText,
      invisibleArchetypeIds,
      invisibleRawText: glyphText,
    };
  } finally {
    await worker.terminate();
    URL.revokeObjectURL(img.src);
  }
}
