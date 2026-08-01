"use client";

// GiantverseShareCard — ported from Lens-Hunt-anime's ShareCardGenerator.kt.
// Same content: selfie photo, Legacy Name + matched character name, a
// rank-weighted radar of the top-3 archetypes carried by the top-5 matches,
// and five detail boxes pulled from the top match's design commentary. The
// reference draws all of this onto its own bundled template image, which we
// don't have, so positions here are hand-laid-out for a from-scratch canvas
// rather than scaled from its pixel coordinates — same three-across row
// (photo | radar | name) and same five-box grid below it, sized so nothing
// in the taller sections crowds the footer. Branding in the header is ours
// (no GWR/Guinness references — that's the reference app's own promotional
// campaign, not applicable here).

import { useEffect, useRef, useState } from "react";
import type { CharacterMatch } from "@/types/visual.types";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";

const W = 1080;
const H = 1620;

const GOLD = "#ECA72C";
const BLACK = "#050505";

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// A Legacy Name is always "{Birth Name} {Archetype Romaji}".
function splitLegacyName(legacyName: string, romaji: string): { first: string; surname: string } {
  const tokens = legacyName.trim().split(/\s+/);
  const last = tokens[tokens.length - 1];
  if (tokens.length > 1 && last.toLowerCase() === romaji.toLowerCase()) {
    return { first: tokens.slice(0, -1).join(" "), surname: last };
  }
  return { first: legacyName, surname: romaji };
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale, sh = h / scale;
  const sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

// Emulates Android's StaticLayout: word-wraps into at most maxLines,
// ellipsizing the last line if the text still doesn't fit.
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = test;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines) {
    let last = lines[maxLines - 1];
    while (last.length > 1 && ctx.measureText(last + "…").width > maxWidth) last = last.slice(0, -1);
    lines[maxLines - 1] = words.join(" ").length > lines.join(" ").length ? last + "…" : last;
  }
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
}

// Rank-weighted top-3 archetypes for the radar — a different (and simpler)
// calculation than the archetype-vote engine's winner-take-all: weight =
// (5 - rank), so the top match counts for more than the fifth, same as the
// reference's own radar-chart math. Purely a display affordance; the
// winning archetype itself always comes from archetype-vote.engine.ts.
function radarArchetypes(matches: CharacterMatch[]): Array<{ id: string | null; value: number }> {
  const top5 = matches.slice(0, 5);
  const scores: Record<string, number> = {};
  let totalWeight = 0;
  top5.forEach((match, index) => {
    const archetypeId = match.character.archetypeId;
    if (!archetypeId) return;
    const weight = 5 - index;
    scores[archetypeId] = (scores[archetypeId] ?? 0) + match.similarity * weight;
    totalWeight += weight;
  });
  const sorted = Object.entries(scores)
    .map(([id, v]): [string, number] => [id, totalWeight > 0 ? v / totalWeight : 0])
    .sort((a, b) => b[1] - a[1]);
  return [0, 1, 2].map((i) => (sorted[i] ? { id: sorted[i][0], value: sorted[i][1] } : { id: null, value: 50 }));
}

async function renderShareCard(
  matches: CharacterMatch[],
  photoDataUrl: string | null,
  legacyName: string,
  romajiName: string,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const top = matches[0];

  ctx.fillStyle = BLACK;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 4;
  ctx.strokeRect(28, 28, W - 56, H - 56);
  ctx.lineWidth = 1;
  ctx.strokeRect(42, 42, W - 84, H - 84);
  ctx.fillStyle = GOLD;
  for (const [cx, cy] of [[22, 22], [W - 46, 22], [22, H - 46], [W - 46, H - 46]]) {
    ctx.fillRect(cx, cy, 24, 24);
  }

  const [logo, template] = await Promise.all([
    loadImage("/Images/thegianthunt.png"),
    loadImage("/card-template.png"),
  ]);

  // ── Header ──────────────────────────────────────────────────────────
  if (logo) {
    const lw = 300, lh = (logo.naturalHeight / logo.naturalWidth) * lw;
    ctx.drawImage(logo, 80, 70, lw, lh);
  }
  ctx.textAlign = "right";
  ctx.fillStyle = GOLD;
  ctx.font = "600 42px Georgia, serif";
  ctx.fillText("GIANTVERSE", W - 80, 130);
  ctx.font = "20px Helvetica, Arial";
  ctx.fillStyle = "#8A8478";
  ctx.fillText("VISUAL DISCOVERY", W - 80, 160);

  ctx.strokeStyle = "rgba(236,167,44,0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, 210);
  ctx.lineTo(W - 80, 210);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = GOLD;
  ctx.font = "28px Helvetica, Arial";
  ctx.save();
  ctx.letterSpacing = "4px";
  ctx.fillText("VISUAL ARCHETYPE MATCH", W / 2, 260);
  ctx.restore();

  // ── Row: photo | radar | name — all sharing one vertical band ───────
  const rowTop = 300, rowHeight = 520;
  const photoX = 60, photoWidth = 300, cornerCut = 22;
  const photoPath = new Path2D();
  photoPath.moveTo(photoX + cornerCut, rowTop);
  photoPath.lineTo(photoX + photoWidth - cornerCut, rowTop);
  photoPath.lineTo(photoX + photoWidth, rowTop + cornerCut);
  photoPath.lineTo(photoX + photoWidth, rowTop + rowHeight - cornerCut);
  photoPath.lineTo(photoX + photoWidth - cornerCut, rowTop + rowHeight);
  photoPath.lineTo(photoX + cornerCut, rowTop + rowHeight);
  photoPath.lineTo(photoX, rowTop + rowHeight - cornerCut);
  photoPath.lineTo(photoX, rowTop + cornerCut);
  photoPath.closePath();

  const selfie = photoDataUrl ? await loadImage(photoDataUrl) : null;
  ctx.save();
  ctx.clip(photoPath);
  if (selfie) {
    drawCover(ctx, selfie, photoX, rowTop, photoWidth, rowHeight);
  } else {
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(photoX, rowTop, photoWidth, rowHeight);
  }
  ctx.restore();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5;
  ctx.stroke(photoPath);

  // Radar — centered in the gap between the photo and the name column.
  const radar = radarArchetypes(matches);
  const centerCx = photoX + photoWidth + 155;
  const centerCy = rowTop + rowHeight / 2;
  const radarRadius = 90;
  const angles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];

  ctx.strokeStyle = "rgba(236,167,44,0.27)";
  ctx.lineWidth = 2;
  for (let level = 1; level <= 3; level++) {
    const r = radarRadius * (level / 3);
    ctx.beginPath();
    angles.forEach((angle, i) => {
      const px = centerCx + r * Math.cos(angle), py = centerCy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.stroke();
  }

  const maxVal = Math.max(...radar.map((r) => r.value), 0.0001);
  ctx.beginPath();
  radar.forEach((r, i) => {
    const ratio = Math.min(1, Math.max(0.2, r.value / maxVal));
    const px = centerCx + radarRadius * ratio * Math.cos(angles[i]);
    const py = centerCy + radarRadius * ratio * Math.sin(angles[i]);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(236,167,44,0.53)";
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.font = "700 18px Helvetica, Arial";
  ctx.fillStyle = "white";
  ctx.shadowColor = "black";
  ctx.shadowBlur = 4;
  radar.forEach((r, i) => {
    const labelR = radarRadius + 26;
    const px = centerCx + labelR * Math.cos(angles[i]);
    const py = centerCy + labelR * Math.sin(angles[i]) + (i === 0 ? -6 : 12);
    const label = r.id ? ARCHETYPE_DEFINITIONS[r.id]?.label ?? r.id : "—";
    ctx.fillText(label, px, py);
  });
  ctx.shadowBlur = 0;

  // Name reveal — right column.
  const nameX = photoX + photoWidth + 310;
  const nameColWidth = W - 60 - nameX;
  const { first, surname } = splitLegacyName(legacyName, romajiName);
  const nameCenterX = nameX + nameColWidth / 2;

  const fitFont = (text: string, baseSize: number, maxWidth: number, weight: string): number => {
    let size = baseSize;
    ctx.font = `${weight} ${size}px Georgia, serif`;
    while (size > 16 && ctx.measureText(text).width > maxWidth) {
      size -= 1;
      ctx.font = `${weight} ${size}px Georgia, serif`;
    }
    return size;
  };

  ctx.textAlign = "center";
  ctx.fillStyle = GOLD;
  ctx.shadowColor = "black";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  const nameFont = Math.min(fitFont(first, 48, nameColWidth, "700"), fitFont(surname, 48, nameColWidth, "700"));
  ctx.font = `700 ${nameFont}px Georgia, serif`;
  ctx.fillText(first, nameCenterX, centerCy - 34);
  ctx.fillText(surname, nameCenterX, centerCy + nameFont * 0.85 - 34);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.font = "24px Helvetica, Arial";
  ctx.fillStyle = "#CCCCCC";
  ctx.fillText(`(${top.character.name})`, nameCenterX, centerCy + nameFont * 1.7 - 34);

  // ── Detail boxes — laid out with a running cursor so nothing can ever
  // crowd the footer, whatever length the text turns out to be. ────────
  const titlePaint = () => {
    ctx.font = "italic 700 18px Georgia, serif";
    ctx.fillStyle = GOLD;
  };
  const bodyPaint = (size: number) => {
    ctx.font = `700 ${size}px Helvetica, Arial`;
    ctx.fillStyle = "white";
  };

  ctx.textAlign = "left";
  const colLeft = 60, colRight = W / 2 + 20, colWidth = W / 2 - 80;
  let cursorY = rowTop + rowHeight + 70;

  titlePaint();
  ctx.fillText("CREATOR / DESIGNER", colLeft, cursorY);
  ctx.fillText("DESIGN LANGUAGE", colRight, cursorY);
  bodyPaint(20);
  ctx.fillText(top.character.designer, colLeft, cursorY + 34);
  wrapText(ctx, top.character.design_language.join(", "), colRight, cursorY + 34, colWidth, 26, 2);
  cursorY += 100;

  titlePaint();
  ctx.fillText("VISUAL TRAITS", colLeft, cursorY);
  bodyPaint(18);
  wrapText(ctx, top.character.visual_traits.join(", "), colLeft, cursorY + 32, W - 120, 24, 2);
  cursorY += 100;

  titlePaint();
  ctx.fillText("CHARACTER OVERVIEW", colLeft, cursorY);
  ctx.fillText("DESIGN PRINCIPLES", colRight, cursorY);
  bodyPaint(17);
  wrapText(ctx, top.character.description, colLeft, cursorY + 32, colWidth, 24, 4);
  const principles = `${top.character.design_breakdown.communicates.join(", ")} — through ${top.character.design_breakdown.through.join("; ")}`;
  wrapText(ctx, principles, colRight, cursorY + 32, colWidth, 24, 4);
  cursorY += 4 * 24 + 60;

  // ── Footer — QR crop from the shared card template, matching the app's
  // other share cards. Follows directly after the content cursor so the
  // card never has to guess how tall the boxes above turned out.
  const footerY = cursorY + 40;
  const qrSize = 140;
  if (template) {
    ctx.drawImage(template, 687, 356, 190, 190, W - 80 - qrSize, footerY, qrSize, qrSize);
    ctx.textAlign = "center";
    ctx.font = "16px Helvetica, Arial";
    ctx.fillStyle = "#8A8478";
    ctx.fillText("Discover yours", W - 80 - qrSize / 2, footerY + qrSize + 24);
  }
  ctx.textAlign = "left";
  ctx.fillStyle = GOLD;
  const domainText = "giantverse.thegianthunt.com";
  const domainMaxWidth = W - 80 - qrSize - 100;
  let domainFont = 28;
  ctx.font = `600 ${domainFont}px Georgia, serif`;
  while (domainFont > 14 && ctx.measureText(domainText).width > domainMaxWidth) {
    domainFont -= 1;
    ctx.font = `600 ${domainFont}px Georgia, serif`;
  }
  ctx.fillText(domainText, 80, footerY + qrSize / 2 + 10);

  return canvas;
}

export function GiantverseShareCard({
  matches,
  photoDataUrl,
  legacyName,
  romajiName,
}: {
  matches: CharacterMatch[];
  photoDataUrl: string | null;
  legacyName: string;
  romajiName: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    renderShareCard(matches, photoDataUrl, legacyName, romajiName).then((canvas) => {
      if (cancelled) return;
      canvasRef.current = canvas;
      setPreview(canvas.toDataURL("image/png"));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, photoDataUrl, legacyName, romajiName]);

  async function handleShare() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(true);
    try {
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;
      const file = new File([blob], "giantverse-identity.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "My Giantverse Identity" });
          return;
        } catch {
          // user cancelled — fall through to download
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "giantverse-identity.png";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="txt-center">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Giantverse identity share card preview"
          className="m-auto mb-3"
          style={{ width: "100%", maxWidth: 340, borderRadius: 8, border: "1px solid #3a2f12" }}
        />
      ) : (
        <p className="f-12 mb-3" style={{ color: "#6E695F" }}>Rendering your share card…</p>
      )}
      <button type="button" className="btn bdr-rds2" onClick={handleShare} disabled={!preview || busy}>
        {busy ? "Preparing…" : "⬇ Share My Giantverse Identity"}
      </button>
    </div>
  );
}
