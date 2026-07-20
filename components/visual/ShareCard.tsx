"use client";

// ShareCard — canvas-rendered "Anime Twin" share card, drawn over the
// official GWR-branded template (public/anime-twin-sharecard.png). Layout
// and coordinates ported from the Lens Hunt Android app's
// ShareCardGenerator.kt so the web card matches it field-for-field.

import { useCallback, useState } from "react";
import type { CharacterMatch } from "@/types/visual.types";

const W = 941, H = 1672;
const GOLD = "#ECA72C";

// Material-icon path data (viewBox 0 0 24 24), ported verbatim from the
// Android app's drawable XML so no extra icon assets need to be bundled.
const ICONS = {
  designer: "M12,3c-4.97,0 -9,4.03 -9,9s4.03,9 9,9c0.83,0 1.5,-0.67 1.5,-1.5 0,-0.39 -0.15,-0.74 -0.39,-1.01 -0.23,-0.26 -0.38,-0.61 -0.38,-0.99 0,-0.83 0.67,-1.5 1.5,-1.5h1.77c2.9,0 5.23,-2.33 5.23,-5.23C21,7.03 16.97,3 12,3zM6.5,12c-0.83,0 -1,-0.17 -1,-1s0.17,-1 1,-1 1,0.17 1,1 -0.17,1 -1,1zM9.5,8c-0.83,0 -1,-0.17 -1,-1s0.17,-1 1,-1 1,0.17 1,1 -0.17,1 -1,1zM14.5,8c-0.83,0 -1,-0.17 -1,-1s0.17,-1 1,-1 1,0.17 1,1 -0.17,1 -1,1zM17.5,12c-0.83,0 -1,-0.17 -1,-1s0.17,-1 1,-1 1,0.17 1,1 -0.17,1 -1,1z",
  language: "M9.5,6c-3.04,0 -5.5,2.46 -5.5,5.5s2.46,5.5 5.5,5.5 5.5,-2.46 5.5,-5.5S12.54,6 9.5,6zM9.5,15c-1.93,0 -3.5,-1.57 -3.5,-3.5S7.57,8 9.5,8s3.5,1.57 3.5,3.5S11.43,15 9.5,15zM14.5,6c-0.28,0 -0.5,0.22 -0.5,0.5s0.22,0.5 0.5,0.5c1.93,0 3.5,1.57 3.5,3.5s-1.57,3.5 -3.5,3.5c-0.28,0 -0.5,0.22 -0.5,0.5s0.22,0.5 0.5,0.5c3.04,0 5.5,-2.46 5.5,-5.5S17.54,6 14.5,6z",
  visual: "M12,4.5C7,4.5 2.73,7.61 1,12c1.73,4.39 6,7.5 11,7.5s9.27,-3.11 11,-7.5c-1.73,-4.39 -6,-7.5 -11,-7.5zM12,17c-2.76,0 -5,-2.24 -5,-5s2.24,-5 5,-5 5,2.24 5,5 -2.24,5 -5,5zM12,9c-1.66,0 -3,1.34 -3,3s1.34,3 3,3 3,-1.34 3,-3 -1.34,-3 -3,-3z",
  overview: "M21,5c-1.11,-0.9 -2.45,-1.5 -4,-1.5 -1.74,0 -3.41,0.81 -4.5,2.09C11.41,4.31 9.74,3.5 8,3.5c-1.55,0 -2.89,0.6 -4,1.5c-0.61,0.55 -1,1.35 -1,2.25v12.25c0,1.38 1.13,2.5 2.5,2.5H8c1.6,0 3.08,0.73 4,2 0.92,-1.27 2.4,-2 4,-2h3.5c1.38,0 2.5,-1.12 2.5,-2.5V7.25c0,-0.9 -0.39,-1.7 -1,-2.25zM10,18.5H4.5V7.25c0,-0.41 0.34,-0.75 0.75,-0.75 0.81,0 1.57,-0.31 2.22,-0.84 0.61,-0.5 1.4,-0.66 2.03,-0.66c0.35,0 0.5,0.1 0.5,0.25v13.25zM20,18.5h-5.5V5.25c0,-0.15 0.15,-0.25 0.5,-0.25 0.63,0 1.42,0.16 2.03,0.66 0.65,0.53 1.41,0.84 2.22,0.84 0.41,0 0.75,0.34 0.75,0.75v11.25z",
  principles: "M14,2H6c-1.1,0 -1.99,0.9 -1.99,2L4,20c0,1.1 0.89,2 1.99,2H18c1.1,0 2,-0.9 2,-2V8l-6,-6zM16,18H8v-2h8v2zM16,14H8v-2h8v2zM13,9V3.5L18.5,9H13z",
};

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Cover-fit crop, matching Android's scaleAndCropCenter.
function drawCoverCropped(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale, sh = h / scale;
  const sx = (img.naturalWidth - sw) / 2, sy = (img.naturalHeight - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

// Octagon (corner-cut rect) path used for both photo boxes.
function cutCornerPath(x: number, y: number, w: number, h: number, cut: number): Path2D {
  const p = new Path2D();
  p.moveTo(x + cut, y);
  p.lineTo(x + w - cut, y);
  p.lineTo(x + w, y + cut);
  p.lineTo(x + w, y + h - cut);
  p.lineTo(x + w - cut, y + h);
  p.lineTo(x + cut, y + h);
  p.lineTo(x, y + h - cut);
  p.lineTo(x, y + cut);
  p.closePath();
  return p;
}

function drawIcon(ctx: CanvasRenderingContext2D, path: string, x: number, y: number, size: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.fillStyle = color;
  ctx.fill(new Path2D(path));
  ctx.restore();
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Word-wrapped body text, capped at maxLines (last line ellipsised only if
// the text genuinely overflows) — mirrors Android's StaticLayout maxLines.
function drawWrapped(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number,
) {
  let lines = wrapLines(ctx, text, maxWidth);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    let last = lines[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 1) {
      last = last.slice(0, -1);
    }
    lines[maxLines - 1] = `${last}…`;
  }
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
}

function drawBox(
  ctx: CanvasRenderingContext2D,
  opts: { icon: string; title: string; left: number; top: number; body: string; bodyMaxWidth: number; bodyLines: number },
) {
  const { icon, title, left, top, body, bodyMaxWidth, bodyLines } = opts;
  const iconSize = 24;
  const textStart = left + 15 + iconSize + 10;

  drawIcon(ctx, icon, left + 15, top + 15, iconSize, GOLD);

  ctx.textAlign = "left";
  ctx.fillStyle = GOLD;
  ctx.font = "italic bold 16px Arial";
  ctx.fillText(title, textStart, top + 32);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 18px Arial";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 3;
  drawWrapped(ctx, body, textStart, top + 51, bodyMaxWidth, 22, bodyLines);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

async function renderShareCard(match: CharacterMatch, photoDataUrl: string | null): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const [template, photo] = await Promise.all([
    loadImage("/anime-twin-sharecard.png"),
    photoDataUrl ? loadImage(photoDataUrl) : Promise.resolve(null),
  ]);

  if (template) {
    ctx.drawImage(template, 0, 0, W, H);
  } else {
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, W, H);
  }

  const c = match.character;

  // Left box: the user's own uploaded photo, cover-cropped into the
  // corner-cut frame. If no photo is available, the box is left as-is
  // (the template already renders its frame decoration).
  if (photo) {
    const boxX = 50, boxY = 615, boxW = 274, boxH = 459, cut = 24;
    const path = cutCornerPath(boxX, boxY, boxW, boxH, cut);
    ctx.save();
    ctx.clip(path);
    drawCoverCropped(ctx, photo, boxX, boxY, boxW, boxH);
    ctx.restore();
  }

  // Right box: matched character's name, stacked one word per line like
  // the Android card, vertically centered in the frame.
  const rightBoxX = 605, rightBoxY = 615, rightBoxW = 282, rightBoxH = 459;
  ctx.textAlign = "center";
  ctx.fillStyle = GOLD;
  ctx.font = "bold 56px Georgia, serif";
  ctx.shadowColor = "rgba(0,0,0,0.7)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  const nameWords = c.name.split(" ");
  const nameLineHeight = 56 * 1.1;
  const nameTotalHeight = (nameWords.length - 1) * nameLineHeight;
  const nameStartY = rightBoxY + rightBoxH / 2 - nameTotalHeight / 2 + 18;
  nameWords.forEach((word, i) => {
    ctx.fillText(word, rightBoxX + rightBoxW / 2, nameStartY + i * nameLineHeight);
  });
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Center: match percentage, gold gradient.
  const centerCx = W / 2, centerCyText = 722;
  ctx.fillStyle = GOLD;
  ctx.font = "bold 18px Arial";
  ctx.fillText("MATCH", centerCx, centerCyText - 30);

  const gradient = ctx.createLinearGradient(centerCx, centerCyText - 20, centerCx, centerCyText + 50);
  gradient.addColorStop(0, "#FFF4D0");
  gradient.addColorStop(0.5, GOLD);
  gradient.addColorStop(1, "#B8860B");
  ctx.fillStyle = gradient;
  ctx.font = "bold 64px Georgia, serif";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;
  ctx.fillText(`${match.similarity}%`, centerCx, centerCyText + 40);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Five detail boxes.
  const designLanguage = c.design_language.join(", ");
  const visualTraits = c.visual_traits.join(", ");
  const designBreakdown = `${c.design_breakdown.communicates.join(", ")} through ${c.design_breakdown.through.join(", ")}`;

  // Box widths mirror the Kotlin source's coordinates: left-column boxes
  // (left=40) stop before x=459, right-column boxes (left=475) stop before
  // x=898; the visual-traits box spans the full row (right bound x=898).
  drawBox(ctx, { icon: ICONS.designer, title: "CREATOR / DESIGNER", left: 40, top: 1092, body: c.designer, bodyMaxWidth: 355, bodyLines: 1 });
  drawBox(ctx, { icon: ICONS.language, title: "DESIGN LANGUAGE", left: 475, top: 1092, body: designLanguage, bodyMaxWidth: 359, bodyLines: 1 });
  drawBox(ctx, { icon: ICONS.visual, title: "VISUAL TRAITS", left: 40, top: 1193, body: visualTraits, bodyMaxWidth: 794, bodyLines: 2 });
  drawBox(ctx, { icon: ICONS.overview, title: "CHARACTER OVERVIEW", left: 40, top: 1295, body: c.description, bodyMaxWidth: 355, bodyLines: 4 });
  drawBox(ctx, { icon: ICONS.principles, title: "DESIGN PRINCIPLES", left: 475, top: 1295, body: designBreakdown, bodyMaxWidth: 359, bodyLines: 4 });

  return canvas;
}

export function ShareCard({ match, photoDataUrl }: { match: CharacterMatch; photoDataUrl: string | null }) {
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setBusy(true);
    try {
      const canvas = await renderShareCard(match, photoDataUrl);
      setPreview(canvas.toDataURL("image/png"));
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `anime-twin-${match.character.id}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } finally {
      setBusy(false);
    }
  }, [match, photoDataUrl]);

  return (
    <div className="txt-center">
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Share card preview" className="m-auto mb-3" style={{ maxWidth: 260, borderRadius: 8, border: "1px solid #3a2f12" }} />
      )}
      <button type="button" className="btn bdr-rds2" onClick={generate} disabled={busy} style={{ cursor: busy ? "wait" : "pointer" }}>
        {busy ? "Rendering…" : "⬇ Share Card — Who's My Anime Twin?"}
      </button>
    </div>
  );
}
