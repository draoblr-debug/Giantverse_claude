import { renderJourneyMap, type TurnSnapshot } from "@/lib/journey-renderer";

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

  // Template is 941x1672. All y% values below are calibrated to these exact separator
  // pixel positions found by scanning: 674(40.3%), 820(49%), 912(54.5%), 999(59.7%),
  // 1146(68.5%), 1259(75.3%), 1528(91.4%)
  const W = template ? template.naturalWidth : 941;
  const H = template ? template.naturalHeight : 1672;
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (template) {
    ctx.drawImage(template, 0, 0, W, H);
  } else {
    ctx.fillStyle = "#000507";
    ctx.fillRect(0, 0, W, H);
  }

  const px = (pct: number) => W * pct;
  const py = (pct: number) => H * pct;
  const fw = (pct: number) => W * pct;

  // Right panel background color (sampled from template at x=75%, y=44%)
  // Python confirmed: rgb(0,5,6) = #000506
  const RIGHT_BG = "#000506";

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
  // Label rows (white text, pixel-scanned):
  //   BIRTH NAME    583-597 → value baseline 640 (38.3%), zone ends at separator 674
  //   LEGACY MANTLE 715-729 → value baseline 775 (46.4%), separator 820
  //   ARCHETYPE     860-873, mountain icon 894-989 → value beside icon, separator 999
  //   ORDER         1034-1048, chevron icon 1048-1122 → value beside icon, separator 1146
  //   ID NUMBER     1176-1190 → value baseline 1212 (72.5%), separator 1259
  const fldFont = fw(0.019); // ~18px
  const smFont = fw(0.016);  // ~15px for tighter zones
  const fldX = px(0.335);   // label text starts at x=315 — align values with labels
  const fldMaxW = px(0.29); // center column width

  // ── LEGACY NAME (large, center panel) ─────────────────────────────
  // Left-aligned with the BIRTH NAME value (fldX), vertically centered in
  // the gap between the panel's top border (y=214, 12.8%) and the top of
  // the BIRTH NAME label (y=583, 34.9%) so spacing above/below is even.
  const nameParts = params.legacyName.toUpperCase().split(" ");
  const nameFontSize = fw(0.058); // ~55px — "TETSUGAKU" fits in ~339px center column
  const nameLineH = nameFontSize + 6;
  const nameCapHeight = nameFontSize * 0.72;
  const nameBlockH = nameLineH * (nameParts.length - 1) + nameCapHeight;
  const panelTopY = py(0.128);
  const birthLabelTopY = py(0.349);
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
  ctx.fillText(params.birthName.toUpperCase(), fldX, py(0.383));

  fitFont(params.legacyName.toUpperCase(), fldFont, fldMaxW, "bold");
  ctx.fillStyle = GOLD;
  ctx.fillText(params.legacyName.toUpperCase(), fldX, py(0.464));

  // Archetype & Order values sit beside their icons (not below them),
  // vertically centered on the icon's bounding box. Icon boxes
  // (pixel-scanned): mountain x=276-380 y=894-989, chevron x≈276-380
  // y=1048-1122. Values start clear of the icon and stop before the
  // center/right panel divider at x=725.
  const iconValueX = px(0.415);              // ~390, clear of both icons
  const iconValueMaxW = px(0.765) - iconValueX; // stop before divider (x=725)

  const mountainCenterY = py(0.5631); // (894+989)/2 / 1672
  const archetypeText = `${params.archetypeLabel.toUpperCase()} (${params.archetypeRomaji.toUpperCase()})`;
  const archFont = fitFont(archetypeText, smFont, iconValueMaxW, "bold");
  ctx.fillStyle = GOLD;
  ctx.fillText(archetypeText, iconValueX, mountainCenterY + archFont * 0.35);

  const chevronCenterY = py(0.6489); // (1048+1122)/2 / 1672
  const orderText = `${params.order}S`;
  const orderFont = fitFont(orderText, smFont, iconValueMaxW, "bold");
  ctx.fillStyle = GOLD;
  ctx.fillText(orderText, iconValueX, chevronCenterY + orderFont * 0.35);

  ctx.font = `${smFont}px monospace`;
  ctx.fillStyle = GOLD;
  ctx.fillText(params.gvId, fldX, py(0.725));

  // ── RIGHT PANEL: 4 TRAITS ─────────────────────────────────────────
  // Placeholder labels (INQUIRY/DEPTH/TRUTH/WISDOM) pixel-scanned at rows
  // 629-644, 770-789, 928-943, 1079-1097; circle icons at x≈744-806;
  // label text starts at x≈824; right border line at x=931.
  // Clear each label zone (text area only, sparing circles and border),
  // then draw the actual trait name on the label's baseline + a short
  // description below it.
  const traitTextX = px(0.8757);            // 824
  const traitClearX = px(0.864);            // 813
  const traitClearW = px(0.985) - traitClearX; // up to 927, inside border at 931
  const traitNameFont = fw(0.016);
  const traitDescFont = fw(0.0125);
  const traitMaxW = px(0.985) - traitTextX;

  // Baselines = bottom of each scanned label row
  const traitYs = [py(0.3852), py(0.4719), py(0.5640), py(0.6561)];

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
  // Zone: 1259–1528 (75.3%–91.4%). Text area: ~81.9%–90.9%. Start at ~84%.
  const promiseX = px(0.072);
  const promiseY = py(0.840);
  const promiseMaxW = px(0.555);
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
  // (measured on the 941×1672 template: zone x 592–931, y 1262–1526).
  // Traces the participant's per-turn drift across the 32 archetypes,
  // docking on the winning spoke.
  if (params.scoreHistory?.length) {
    try {
      const coverX = px(0.6291); // 592
      const coverY = py(0.7548); // 1262
      const coverW = px(0.9894) - coverX; // → 931, inside the right border
      const coverH = py(0.9127) - coverY; // → 1526, above the footer separator
      ctx.fillStyle = "#010505"; // sampled band background
      ctx.fillRect(coverX, coverY, coverW, coverH);

      const glyphSize = px(0.2657); // 250 on the reference template
      const glyph = renderJourneyMap(params.scoreHistory, {
        finalArchetypeId: params.archetypeId,
        size: Math.round(glyphSize),
        transparent: true,
        detail: "mini",
        accentColor: GOLD,
      });
      // centered in the covered zone
      ctx.drawImage(glyph, coverX + (coverW - glyphSize) / 2, coverY + (coverH - glyphSize) / 2);
    } catch {
      // Journey glyph is decorative — never let it break the card render.
    }
  }

  // ── REAL WORLD IDENTITY ───────────────────────────────────────────
  // Footer zone: 1528–1672 (91.4%–100%). Real name at ~96.7%.
  ctx.font = `${fw(0.016)}px Arial`;
  ctx.fillStyle = GOLD;
  ctx.textAlign = "left";
  ctx.fillText(params.realName, px(0.118), py(0.967));
}
