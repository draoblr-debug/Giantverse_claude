"use client";

// CompatibilityShareCard — canvas-rendered share card for a Compatibility
// Checker result, drawn on top of the official "Compatibility card_template.png"
// (two portrait busts — gold for Side A, silver for Side B — under a shared
// Giant Hunt / Guinness World Records header). Field layout below is
// pixel-scanned from that 941x1672 template, mirroring the calibration
// approach used by src/lib/card-generator.ts for the identity card.

import { useCallback, useState } from "react";
import type { CompatibilityResult } from "@/engines/compatibility/compatibility.engine";

const GOLD = "#C9A24B";
const GOLD_DIM = "#8B6914";
const SILVER = "#A9BAC9";
const SILVER_DIM = "#5F6B78";

const ROLE_COLOR: Record<CompatibilityResult["role"], string> = {
  Ally: "#C9A24B",
  Mentor: "#7B8FA3",
  Romance: "#D97BA0",
  Rival: "#D98E3B",
  Villain: "#B4543F",
};

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// A Legacy Name is always "{Birth Name} {Archetype Romaji}" — strip the
// known romaji suffix to recover just the real-world first name typed
// into the checker.
function extractBirthName(fullName: string, romaji: string): string {
  const tokens = fullName.trim().split(/\s+/);
  const last = tokens[tokens.length - 1];
  if (tokens.length > 1 && last.toLowerCase() === romaji.toLowerCase()) {
    return tokens.slice(0, -1).join(" ");
  }
  return fullName;
}

async function renderCompatibilityCard(result: CompatibilityResult): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  const template = await loadImage("/Compatibility card_template.png");
  const W = template ? template.naturalWidth : 941;
  const H = template ? template.naturalHeight : 1672;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const roleColor = ROLE_COLOR[result.role];

  if (template) {
    ctx.drawImage(template, 0, 0, W, H);
  } else {
    ctx.fillStyle = "#0A0A0A";
    ctx.fillRect(0, 0, W, H);
  }

  const px = (pct: number) => W * pct;
  const py = (pct: number) => H * pct;

  ctx.textAlign = "center";

  const fitFont = (text: string, baseSize: number, maxWidth: number, style: string): number => {
    let size = baseSize;
    ctx.font = `${style} ${size}px Georgia, serif`.trim();
    while (size > 8 && ctx.measureText(text).width > maxWidth) {
      size -= 0.5;
      ctx.font = `${style} ${size}px Georgia, serif`.trim();
    }
    return size;
  };

  // ── COLUMN LAYOUT ─────────────────────────────────────────────────
  // Left (gold) bust centered at x=23.2%, right (silver) bust at x=76.3%
  // (pixel-scanned from the "BIRTH NAME" labels baked into the template,
  // which sit directly above each bust). Both share the same vertical
  // rhythm: big Legacy Name in the gap above the label, small Birth Name
  // value just below it.
  const columns = [
    { x: px(0.2323), name: result.nameA, romaji: result.archetypeA.romajiName, color: GOLD, dim: GOLD_DIM },
    { x: px(0.7631), name: result.nameB, romaji: result.archetypeB.romajiName, color: SILVER, dim: SILVER_DIM },
  ];

  const nameTopY = py(0.1513);       // top divider under the "GIANTVERSE" wordmark
  const labelTopY = py(0.2960);      // top of the baked-in "BIRTH NAME" label
  const labelBottomY = py(0.3044);   // bottom of that label
  const bustTopY = py(0.341);        // where the bust art begins
  const colMaxW = px(0.34);

  for (const col of columns) {
    // Legacy Name — large, vertically centered in the gap above the label.
    const legacyFont = fitFont(col.name.toUpperCase(), Math.round(W * 0.052), colMaxW, "bold");
    const capHeight = legacyFont * 0.72;
    const baselineY = nameTopY + (labelTopY - nameTopY + capHeight) / 2;
    ctx.font = `bold ${legacyFont}px Georgia, serif`;
    ctx.fillStyle = col.color;
    ctx.fillText(col.name.toUpperCase(), col.x, baselineY);

    // Birth Name — small, real-world first name, between the label and bust art.
    const birthName = extractBirthName(col.name, col.romaji);
    const birthFont = fitFont(birthName.toUpperCase(), Math.round(W * 0.022), colMaxW, "");
    const birthY = labelBottomY + (bustTopY - labelBottomY) * 0.62;
    ctx.font = `${birthFont}px Helvetica, Arial`;
    ctx.fillStyle = col.dim;
    ctx.fillText(birthName.toUpperCase(), col.x, birthY);
  }

  // ── COMPATIBILITY % — the gap between the "COMPATIBILITY" label and
  // the compass ornament beneath it (39.4%–48.9%), centered on both busts.
  // Width-capped so it can never reach into the busts' decorative rings,
  // which close in to about 20% of the card's width at this height.
  const pctGapTop = py(0.3941);
  const pctGapBottom = py(0.4886);
  const pctFont = fitFont(`${result.percentage}%`, Math.round(W * 0.085), px(0.19), "700");
  const pctCap = pctFont * 0.72;
  const pctBaseline = pctGapTop + (pctGapBottom - pctGapTop + pctCap) / 2;
  ctx.fillStyle = roleColor;
  ctx.fillText(`${result.percentage}%`, px(0.5), pctBaseline);

  // ── RELATIONSHIP — role, descriptor, mentor/mentee and tagline fill
  // the blank band below the "RELATIONSHIP" divider (71.5%–99%).
  let cy = py(0.755);
  const contentMaxW = px(0.8);

  ctx.font = `700 ${Math.round(W * 0.075)}px Georgia, serif`;
  ctx.fillStyle = roleColor;
  ctx.fillText(result.role.toUpperCase(), px(0.5), cy);
  cy += W * 0.05;

  ctx.font = `600 ${Math.round(W * 0.028)}px Helvetica, Arial`;
  ctx.fillStyle = "#EFE9DA";
  ctx.fillText(`${result.descriptor} ${result.role}`, px(0.5), cy);
  cy += W * 0.045;

  if (result.mentor && result.mentee) {
    ctx.font = `600 ${Math.round(W * 0.022)}px Helvetica, Arial`;
    ctx.fillStyle = roleColor;
    ctx.fillText(`${result.mentor.name} is the Mentor · ${result.mentee.name} is the Mentee`, px(0.5), cy);
    cy += W * 0.04;
  }

  cy += W * 0.015;
  ctx.font = `${Math.round(W * 0.024)}px Georgia, serif`;
  ctx.fillStyle = "#8A8478";
  const words = result.tagline.split(" ");
  let line = "";
  const lineH = W * 0.032;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > contentMaxW && line) {
      ctx.fillText(line, px(0.5), cy);
      line = word;
      cy += lineH;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, px(0.5), cy);

  // ── FOOTER BRAND ──────────────────────────────────────────────────
  ctx.font = `600 ${Math.round(W * 0.021)}px Georgia, serif`;
  ctx.fillStyle = GOLD;
  ctx.fillText("giantverse.com", px(0.5), py(0.975));

  return canvas;
}

export function CompatibilityShareCard({ result }: { result: CompatibilityResult }) {
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setBusy(true);
    try {
      const canvas = await renderCompatibilityCard(result);
      setPreview(canvas.toDataURL("image/png"));
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `giant-hunt-compatibility-${result.role.toLowerCase()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } finally {
      setBusy(false);
    }
  }, [result]);

  return (
    <div className="txt-center">
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Compatibility share card preview"
          className="m-auto mb-3"
          style={{ maxWidth: 220, borderRadius: 8, border: "1px solid #3a2f12" }}
        />
      )}
      <button type="button" className="btn bdr-rds2" onClick={generate} disabled={busy} style={{ cursor: busy ? "wait" : "pointer" }}>
        {busy ? "Rendering…" : "⬇ Share This Result"}
      </button>
    </div>
  );
}
