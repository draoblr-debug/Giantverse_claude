"use client";

// CompatibilityShareCard — canvas-rendered share card for a Compatibility
// Checker result, drawn on top of the official "Compatibility card_template.png"
// (two portrait busts — gold for Side A, silver for Side B — under a shared
// Giant Hunt / Guinness World Records header, with a decorative Giantverse
// emblem filling the bottom ~23% of the card). Field layout below is
// pixel-scanned from that 1080x1920 template, mirroring the calibration
// approach used by src/lib/card-generator.ts for the identity card.

import { useEffect, useRef, useState } from "react";
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

const ROLE_PLURAL: Record<CompatibilityResult["role"], string> = {
  Ally: "Allies",
  Mentor: "Mentors",
  Romance: "Romances",
  Rival: "Rivals",
  Villain: "Villains",
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

async function renderCompatibilityCard(result: CompatibilityResult, realNameA?: string, realNameB?: string): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  const template = await loadImage("/Compatibility card_template.png");
  const W = template ? template.naturalWidth : 1080;
  const H = template ? template.naturalHeight : 1920;
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
  // Left (gold) bust centered at x=22.5%, right (silver) bust at x=78.1%
  // (pixel-scanned from the "REAL NAME" labels baked into the template,
  // which now sit directly BELOW each bust — this template dropped the
  // old "BIRTH NAME"-above-the-bust layout entirely). Big Legacy Name
  // fills the large gap above the bust; the Real Name value sits just
  // below the baked-in label.
  const columns = [
    { x: px(0.225), name: result.nameA, romaji: result.archetypeA.romajiName, realName: realNameA || extractBirthName(result.nameA, result.archetypeA.romajiName), color: GOLD, dim: GOLD_DIM },
    { x: px(0.7806), name: result.nameB, romaji: result.archetypeB.romajiName, realName: realNameB || extractBirthName(result.nameB, result.archetypeB.romajiName), color: SILVER, dim: SILVER_DIM },
  ];

  const nameTopY = py(0.1516);        // top divider under the "GIANTVERSE" wordmark
  const bustTopY = py(0.337);         // where the bust art begins
  const realNameLabelBottomY = py(0.5802); // bottom of the baked-in "REAL NAME" label
  const realNameZoneBottomY = py(0.615);   // safe cutoff before the "RELATIONSHIP" label
  const colMaxW = px(0.32);

  for (const col of columns) {
    // Legacy Name — large, vertically centered in the gap above the bust, split into two lines.
    const legacyZoneTop = nameTopY;
    const gvBirthName = extractBirthName(col.name, col.romaji).toUpperCase();
    const gvSurname = col.romaji.toUpperCase();
    
    // Fit font for both lines
    let legacyFont = Math.round(W * 0.07);
    ctx.font = `bold ${legacyFont}px Georgia, serif`;
    while (legacyFont > 8 && (ctx.measureText(gvBirthName).width > colMaxW || ctx.measureText(gvSurname).width > colMaxW)) {
      legacyFont -= 0.5;
      ctx.font = `bold ${legacyFont}px Georgia, serif`;
    }
    
    const capHeight = legacyFont * 0.72;
    const lineSpacing = legacyFont * 1.1;
    const totalTextHeight = lineSpacing + capHeight;
    const startY = legacyZoneTop + (bustTopY - legacyZoneTop - totalTextHeight) / 2 + capHeight;

    ctx.fillStyle = col.color;
    ctx.fillText(gvBirthName, col.x, startY);
    ctx.fillText(gvSurname, col.x, startY + lineSpacing);

    // Real Name — the actual first name, below the baked-in "REAL NAME" label.
    const realName = col.realName;
    const nameFont = fitFont(realName.toUpperCase(), Math.round(W * 0.022), colMaxW, "");
    const nameY = realNameLabelBottomY + (realNameZoneBottomY - realNameLabelBottomY) * 0.55;
    ctx.font = `${nameFont}px Helvetica, Arial`;
    ctx.fillStyle = col.dim;
    ctx.fillText(realName.toUpperCase(), col.x, nameY);
  }

  // ── COMPATIBILITY % — the gap between the "COMPATIBILITY" label and
  // the compass ornament beneath it (39.4%–48.9%), centered on both busts.
  // Width-capped so it can never reach into the busts' decorative rings,
  // which close in to about 20% of the card's width at this height.
  const pctGapTop = py(0.3941);
  const pctGapBottom = py(0.4886);
  const pctFont = fitFont(`${result.percentage}%`, Math.round(W * 0.070), px(0.19), "700");
  const pctCap = pctFont * 0.72;
  const pctBaseline = pctGapTop + (pctGapBottom - pctGapTop + pctCap) / 2;
  ctx.fillStyle = roleColor;
  ctx.fillText(`${result.percentage}%`, px(0.5), pctBaseline);

  // ── RELATIONSHIP — role, descriptor, mentor/mentee and tagline fill the
  // band below the "RELATIONSHIP" divider (~65.9%), now much tighter than
  // before since it has to clear the decorative Giantverse emblem that
  // fills the bottom ~23% of this template (starts around 76.5%).
  let cy = py(0.682); // Shifted down to add space below the baked-in 'RELATIONSHIP' label
  const contentMaxW = px(0.8);

  ctx.font = `700 ${Math.round(W * 0.052)}px Georgia, serif`;
  const roleText = result.role.toUpperCase();
  const roleTextWidth = ctx.measureText(roleText).width;
  const linePadding = W * 0.03; // space between text and lines
  const lineWidth = (contentMaxW - roleTextWidth) / 2 - linePadding;
  
  ctx.fillStyle = roleColor;
  ctx.fillText(roleText, px(0.5), cy);
  
  // Draw left and right lines dynamically
  ctx.strokeStyle = roleColor;
  ctx.lineWidth = Math.round(W * 0.003);
  const lineY = cy - W * 0.015;
  const arrowW = W * 0.01;
  const arrowH = W * 0.008;
  
  // Left line (arrowhead pointing right)
  const leftStart = px(0.5) - contentMaxW / 2;
  const leftEnd = px(0.5) - roleTextWidth / 2 - linePadding;
  ctx.beginPath();
  ctx.moveTo(leftStart, lineY);
  ctx.lineTo(leftEnd, lineY);
  ctx.lineTo(leftEnd - arrowW, lineY - arrowH);
  ctx.moveTo(leftEnd, lineY);
  ctx.lineTo(leftEnd - arrowW, lineY + arrowH);
  ctx.stroke();
  
  // Right line (arrowhead pointing left)
  const rightStart = px(0.5) + contentMaxW / 2;
  const rightEnd = px(0.5) + roleTextWidth / 2 + linePadding;
  ctx.beginPath();
  ctx.moveTo(rightStart, lineY);
  ctx.lineTo(rightEnd, lineY);
  ctx.lineTo(rightEnd + arrowW, lineY - arrowH);
  ctx.moveTo(rightEnd, lineY);
  ctx.lineTo(rightEnd + arrowW, lineY + arrowH);
  ctx.stroke();

  // 1. Setup tagline font and constraints
  const taglineFontSize = Math.round(W * 0.023); // Slightly larger than original 0.020
  const taglineLineH = Math.round(W * 0.030); // Corresponding line height
  const paraMaxW = px(0.85); // Allow wider to avoid awkward wraps
  ctx.font = `italic ${taglineFontSize}px Georgia, serif`;
  
  // Pre-calculate tagline lines to know exact block height
  const words = result.tagline.split(" ");
  const taglineLines: string[] = [];
  let currentLine = "";
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const test = currentLine ? `${currentLine} ${word}` : word;
    const shouldBreakEarly = taglineLines.length === 0 && words.length < 10 && i === Math.floor(words.length / 2);
    
    if (ctx.measureText(test).width > paraMaxW || shouldBreakEarly) {
      if (taglineLines.length < 2) {
        taglineLines.push(currentLine);
      }
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  if (currentLine && taglineLines.length < 2) {
    taglineLines.push(currentLine);
  }

  // 2. Sum up visual heights of the text blocks
  const hasMentor = !!(result.mentor && result.mentee);
  const descriptorH = Math.round(W * 0.028); // Slightly larger than original 0.025
  const mentorH = hasMentor ? Math.round(W * 0.018) : 0; // Slightly larger than 0.016
  
  // Total tagline block height = (number of lines - 1) * lineH + fontSize
  const taglineH = (taglineLines.length - 1) * taglineLineH + taglineFontSize;
  const totalContentH = descriptorH + mentorH + taglineH;
  
  // 3. Calculate exact equal gaps
  // topBound is exactly at the baseline of the ALLY/ROMANCE text
  // bottomBound is exactly where the Giantverse emblem begins (0.765)
  const topBound = py(0.682); 
  const bottomBound = py(0.765); 
  const availableH = bottomBound - topBound;
  
  const numGaps = hasMentor ? 4 : 3;
  const gap = (availableH - totalContentH) / numGaps;
  
  // 4. Draw elements using textBaseline = "middle" for mathematically perfect centering
  ctx.textBaseline = "middle";
  let currentY = topBound;
  
  // Draw Descriptor
  currentY += gap + descriptorH / 2;
  ctx.font = `600 ${descriptorH}px Helvetica, Arial`;
  ctx.fillStyle = "#EFE9DA";
  ctx.fillText(`${result.descriptor} ${result.role}`, px(0.5), currentY);
  currentY += descriptorH / 2;

  // Draw Mentor (if present)
  if (hasMentor) {
    currentY += gap + mentorH / 2;
    ctx.font = `600 ${mentorH}px Helvetica, Arial`;
    ctx.fillStyle = roleColor;
    ctx.fillText(`${result.mentor!.name} is the Mentor · ${result.mentee!.name} is the Mentee`, px(0.5), currentY);
    currentY += mentorH / 2;
  }

  // Draw Tagline
  currentY += gap + taglineH / 2;
  ctx.font = `italic ${taglineFontSize}px Georgia, serif`;
  ctx.fillStyle = "#8A8478";
  
  const firstLineY = currentY - ((taglineLines.length - 1) * taglineLineH) / 2;
  for (let i = 0; i < taglineLines.length; i++) {
    ctx.fillText(taglineLines[i], px(0.5), firstLineY + (i * taglineLineH));
  }
  
  // Reset baseline for safety
  ctx.textBaseline = "alphabetic";

  return canvas;
}

export function CompatibilityShareCard({ result, realNameA, realNameB }: { result: CompatibilityResult; realNameA?: string; realNameB?: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Renders as soon as a result exists — the card is the result, not an
  // optional extra step behind a button.
  useEffect(() => {
    let cancelled = false;
    setPreview(null);
    canvasRef.current = null;
    renderCompatibilityCard(result, realNameA, realNameB).then((canvas) => {
      if (cancelled) return;
      canvasRef.current = canvas;
      setPreview(canvas.toDataURL("image/png"));
    });
    return () => {
      cancelled = true;
    };
  }, [result, realNameA, realNameB]);

  // Invites whoever "Side B" is to take the survey and get their own
  // Legacy Name — carries the same ?invite=&name= payload the /ending
  // invite flow uses, so they land on the personalized compatibility
  // landing page once they click through.
  async function handleInviteFriend() {
    if (typeof window === "undefined") return;
    const birthNameA = extractBirthName(result.nameA, result.archetypeA.romajiName);
    const birthNameB = extractBirthName(result.nameB, result.archetypeB.romajiName);
    const params = new URLSearchParams({ invite: result.nameA, name: birthNameA });
    const url = `${window.location.origin}/compatibility?${params.toString()}`;
    const shareText = `Myself ${birthNameA} and ${birthNameB} are found ${ROLE_PLURAL[result.role]} in Giantverse. I am curious how we are related in Giantverse. Take this survey to get your Giantverse identity. It is Fun and accurate.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Giant Hunt Compatibility", text: shareText, url });
        return;
      } catch {
        // user cancelled the share sheet — fall through to clipboard copy
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      // clipboard unavailable — nothing more we can do without a fallback UI
    }
  }

  return (
    <div className="txt-center">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Compatibility share card preview"
          className="m-auto mb-3"
          style={{ width: "100%", maxWidth: 460, borderRadius: 8, border: "1px solid #3a2f12" }}
        />
      ) : (
        <p className="f-12 mb-3" style={{ color: "#6E695F" }}>Rendering your card…</p>
      )}
      <button type="button" className="btn bdr-rds2" onClick={handleInviteFriend}>
        {linkCopied ? "✓ Copied!" : "🔗 Invite Friend"}
      </button>
    </div>
  );
}
