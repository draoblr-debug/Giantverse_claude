import { renderJourneyMap, getSpokeAngle, type TurnSnapshot } from "@/lib/journey-renderer";

export type CardParams = {
  birthName: string;
  legacyName: string;
  archetypeId?: string; // canonical id, anchors the journey map's final dock
  archetypeLabel: string;
  archetypeRomaji: string;
  order: "GIANT" | "HUNTER";
  guidingPromise: string;
  traits: [string, string, string, string];
  traitDescriptions: [string, string, string, string];
  realName: string;
  gvId: string;
  scoreHistory?: TurnSnapshot[]; // per-turn snapshots; when present, the journey glyph replaces the starburst
};

const GOLD = "#C9A84C";
const GOLD_DIM = "#8B6914";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function drawCard(canvas: HTMLCanvasElement, params: CardParams): Promise<void> {
  let template: HTMLImageElement | null = null;
  try {
    template = await loadImage("/card-template.png");
  } catch { /* fallback */ }

  // Template is 900x1585. All y% values below are calibrated to these exact separator
  // pixel positions found by scanning: 505(31.9%), 661(41.7%), 824(52%), 982(62%),
  // 1194(75.3%), 1463(92.3%)
  const W = template ? template.naturalWidth : 900;
  const H = template ? template.naturalHeight : 1585;
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (template) {
    ctx.drawImage(template, 0, 0, W, H);
  } else {
    ctx.fillStyle = "#0A0A0A";
    ctx.fillRect(0, 0, W, H);
  }

  const px = (pct: number) => W * pct;
  const py = (pct: number) => H * pct;
  const fw = (pct: number) => W * pct;

  // Right panel background color (sampled from template at x=75%, y=30%)
  // Python confirmed: rgb(10,10,10) = #0A0A0A
  const RIGHT_BG = "#0A0A0A";

  ctx.textAlign = "left";

  // Shrinks font size until the text fits maxWidth; sets ctx.font and returns the size.
  const fitFont = (text: string, baseSize: number, maxWidth: number, style: string): number => {
    let size = baseSize;
    ctx.font = `${style} ${size}px Arial`.trim();
    while (size > 8 && ctx.measureText(text).width > maxWidth) {
      size -= 0.5;
      ctx.font = `${style} ${size}px Arial`.trim();
    }
    return size;
  };

  // ── CENTER PANEL FIELD VALUES ─────────────────────────────────────
  // Label rows (white text, pixel-scanned on the 900x1585 template):
  //   BIRTH NAME    411-427 → value baseline 470 (29.7%), zone ends at separator 505
  //   LEGACY MANTLE 567-583 → value baseline 621 (39.2%), separator 661
  //   ARCHETYPE     705-721, mountain icon 293-464/756-823 → value beside icon, separator 824
  //   ORDER         872-888, chevron icon 294-464/909-981 → value beside icon, separator 982
  //   ID NUMBER     1030-1046 → value baseline 1101 (69.5%), separator/zone-end 1194
  const fldFont = fw(0.019); // ~17px
  const smFont = fw(0.016);  // ~14px for tighter zones
  const fldX = px(0.324);   // label text starts at x=292 — align values with labels
  const fldMaxW = px(0.275); // center column width

  // ── LEGACY NAME (large, center panel) ─────────────────────────────
  // Left-aligned with the BIRTH NAME value (fldX), vertically centered in
  // the gap between the panel's top border (y=195, 12.3%) and the top of
  // the BIRTH NAME label (y=411, 25.9%) so spacing above/below is even.
  const nameParts = params.legacyName.toUpperCase().split(" ");
  const nameFontSize = fw(0.058); // ~52px — "TETSUGAKU" fits in ~324px center column
  const nameLineH = nameFontSize + 6;
  const nameCapHeight = nameFontSize * 0.72;
  const nameBlockH = nameLineH * (nameParts.length - 1) + nameCapHeight;
  const panelTopY = py(0.123);
  const birthLabelTopY = py(0.259);
  const nameBlockTop = panelTopY + (birthLabelTopY - panelTopY - nameBlockH) / 2;
  const nameBaseline1 = nameBlockTop + nameCapHeight;
  nameParts.forEach((part, i) => {
    const lineY = nameBaseline1 + i * nameLineH;
    ctx.font = `bold ${nameFontSize}px Arial`;
    ctx.fillStyle = GOLD;
    ctx.fillText(part, fldX, lineY);
  });

  fitFont(params.birthName.toUpperCase(), fldFont, fldMaxW, "bold");
  ctx.fillStyle = GOLD;
  ctx.fillText(params.birthName.toUpperCase(), fldX, py(0.297));

  fitFont(params.legacyName.toUpperCase(), fldFont, fldMaxW, "bold");
  ctx.fillStyle = GOLD;
  ctx.fillText(params.legacyName.toUpperCase(), fldX, py(0.392));

  // Archetype & Order values sit beside their icons (not below them),
  // vertically centered on the icon's bounding box. Icon boxes
  // (pixel-scanned): mountain x=293-464 y=756-823, chevron x=294-464
  // y=909-981 — both wider double-glyphs than the old template's single
  // icons. Values start clear of the icon and stop before the
  // center/right panel divider at x=660.
  const iconValueX = px(0.527);              // clear of both (wider) icons
  const iconValueMaxW = px(0.728) - iconValueX; // stop before divider (x=660)

  const mountainCenterY = py(0.498); // (756+823)/2 / 1585
  const archetypeText = `${params.archetypeLabel.toUpperCase()} (${params.archetypeRomaji.toUpperCase()})`;
  const archFont = fitFont(archetypeText, smFont, iconValueMaxW, "bold");
  ctx.fillStyle = GOLD;
  ctx.fillText(archetypeText, iconValueX, mountainCenterY + archFont * 0.35);

  const chevronCenterY = py(0.596); // (909+981)/2 / 1585
  const orderText = `${params.order}S`;
  const orderFont = fitFont(orderText, smFont, iconValueMaxW, "bold");
  ctx.fillStyle = GOLD;
  ctx.fillText(orderText, iconValueX, chevronCenterY + orderFont * 0.35);

  ctx.font = `${smFont}px monospace`;
  ctx.fillStyle = GOLD;
  ctx.fillText(params.gvId, fldX, py(0.695));

  // ── RIGHT PANEL: 4 TRAITS ─────────────────────────────────────────
  // Placeholder labels (INSIGHT/PATIENCE/HUMILITY/UNDERSTANDING) pixel-scanned
  // at rows 590-601, 749-760, 908-919, 1067-1078; circle icons at x≈679-722;
  // label text starts at x≈731; right border line at x=898.
  // Clear each label zone (text area only, sparing circles and border),
  // then draw the actual trait name on the label's baseline + a short
  // description below it.
  const traitTextX = px(0.812);             // 731
  const traitClearX = px(0.801);            // 721
  const traitClearW = px(0.99) - traitClearX; // up to 891, inside border at 898
  const traitNameFont = fw(0.016);
  const traitDescFont = fw(0.0125);
  const traitMaxW = px(0.99) - traitTextX;

  // Baselines = bottom of each scanned label row
  const traitYs = [py(0.379), py(0.480), py(0.580), py(0.680)];

  params.traits.forEach((trait, i) => {
    const ty = traitYs[i];
    // Clear from just above the label top to below our description line.
    ctx.fillStyle = RIGHT_BG;
    ctx.fillRect(traitClearX, ty - traitNameFont - 8, traitClearW, traitNameFont + traitDescFont * 2 + 22);
    // Trait name
    fitFont(trait.toUpperCase(), traitNameFont, traitMaxW, "bold");
    ctx.fillStyle = GOLD;
    ctx.fillText(trait.toUpperCase(), traitTextX, ty);
    // Trait description
    fitFont(params.traitDescriptions[i], traitDescFont, traitMaxW, "");
    ctx.fillStyle = GOLD_DIM;
    ctx.fillText(params.traitDescriptions[i], traitTextX, ty + traitNameFont + 3);
  });

  // ── GUIDING PROMISE ───────────────────────────────────────────────
  // Zone: 1194–1463 (75.3%–92.3%). Label at ~81-82%. Text starts at ~86.4%.
  const promiseX = px(0.061);
  const promiseY = py(0.864);
  const promiseMaxW = px(0.568);
  const promiseFont = fw(0.021);
  const lineH = promiseFont + 7;

  ctx.font = `bold ${promiseFont}px Arial`;
  ctx.fillStyle = GOLD;
  ctx.textAlign = "left";

  const words = params.guidingPromise.toUpperCase().split(" ");
  let line = "";
  let cy = promiseY;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > promiseMaxW && line) {
      ctx.fillText(line, promiseX, cy);
      line = word;
      cy += lineH;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, promiseX, cy);

  // ── JOURNEY MAP GLYPH ─────────────────────────────────────────────
  // Replaces the decorative starburst on the right of the promise band
  // (measured on the 900x1585 template: zone x 566–897, y 1197–1461).
  // Traces the participant's per-turn drift across the 32 archetypes,
  // docking on the winning spoke.
  if (params.scoreHistory?.length) {
    try {
      const coverX = px(0.629); // 566
      const coverY = py(0.755); // 1197
      const coverW = px(0.996) - coverX; // → 896, inside the right border
      const coverH = py(0.922) - coverY; // → 1461, above the footer separator
      ctx.fillStyle = RIGHT_BG; // sampled band background
      ctx.fillRect(coverX, coverY, coverW, coverH);

      // Beyond the winning archetype, label the 3 next-strongest runner-ups
      // (by the final turn's scores) so the mini glyph's rim isn't just
      // unlabeled dots — a little context on what else the answers brushed.
      // Picked greedily for angular spread too: two labels on adjacent
      // spokes overlap and become unreadable on the card's small canvas,
      // so a candidate too close to an already-picked spoke (or to the
      // final spoke) is skipped in favor of the next-highest score.
      const lastTurn = params.scoreHistory[params.scoreHistory.length - 1];
      const MIN_LABEL_SEPARATION_DEG = 24;
      const angleDiff = (a: number, b: number) => {
        const d = Math.abs(a - b) % 360;
        return d > 180 ? 360 - d : d;
      };
      const rankedCandidates = Object.entries(lastTurn.scores)
        .filter(([id]) => id !== params.archetypeId)
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => id);
      const finalAngle = params.archetypeId ? getSpokeAngle(params.archetypeId) : undefined;
      const chosenAngles = finalAngle !== undefined ? [finalAngle] : [];
      const runnerUpIds: string[] = [];
      for (const id of rankedCandidates) {
        if (runnerUpIds.length >= 3) break;
        const angle = getSpokeAngle(id);
        const tooClose = angle !== undefined && chosenAngles.some((a) => angleDiff(a, angle) < MIN_LABEL_SEPARATION_DEG);
        if (tooClose) continue;
        runnerUpIds.push(id);
        if (angle !== undefined) chosenAngles.push(angle);
      }
      // Not enough well-separated candidates (small/lopsided score set) —
      // fill the rest by score alone rather than showing fewer than 3.
      for (const id of rankedCandidates) {
        if (runnerUpIds.length >= 3) break;
        if (!runnerUpIds.includes(id)) runnerUpIds.push(id);
      }

      const glyphSize = px(0.2657); // ~239 on the 900x1585 template
      const glyph = renderJourneyMap(params.scoreHistory, {
        finalArchetypeId: params.archetypeId,
        size: Math.round(glyphSize),
        transparent: true,
        detail: "mini",
        accentColor: GOLD,
        highlightArchetypeIds: runnerUpIds,
      });
      // centered in the covered zone
      ctx.drawImage(glyph, coverX + (coverW - glyphSize) / 2, coverY + (coverH - glyphSize) / 2);
    } catch {
      // Journey glyph is decorative — never let it break the card render.
    }
  }

  // ── REAL WORLD IDENTITY ───────────────────────────────────────────
  // Footer zone: 1463–1585 (92.3%–100%). Real name sits below the
  // "REAL WORLD IDENTITY" label as its value line, left-aligned with the
  // label's left edge (~10.8%) and dropped down into the empty space
  // beneath it (~97.8%) so it doesn't crowd the label text above it.
  ctx.font = `${fw(0.016)}px Arial`;
  ctx.fillStyle = GOLD;
  ctx.textAlign = "left";
  ctx.fillText(params.realName, px(0.108), py(0.978));
}
