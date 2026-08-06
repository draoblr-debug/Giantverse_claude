import { renderJourneyMap, type TurnSnapshot } from "@/lib/journey-renderer";

export type CardParams = {
  birthName: string;
  legacyName: string;
  archetypeLabel: string;
  archetypeRomaji: string;
  order: "GIANT" | "HUNTER";
  guidingPromise: string;
  traits: [string, string, string, string];
  realName: string;
  gvId: string;
  /** Cosmetic continent name for this result's birthplace, e.g. "Ryūsen" — see pickContinentForRealm. */
  continentName: string;
  /** Realm id + epithet for this result's birthplace, e.g. "Kuryo — The Mountain Belt". */
  landType: string;
  /** Canonical archetype id (e.g. "kizoku") — needed to dock the journey
   * glyph on the right wheel spoke; archetypeLabel/archetypeRomaji alone
   * aren't enough since renderJourneyMap keys everything off the id. */
  archetypeId: string;
  /** Per-turn score snapshots for the journey glyph — absent for identities
   * generated via a path that never recorded turn-by-turn history, in which
   * case the template's decorative circle is simply left empty. */
  scoreHistory?: TurnSnapshot[] | null;
  /** Final per-archetype scores — used only to pick the top 3 archetypes
   * labelled on the journey glyph's rim (the winner plus its two closest
   * runners-up). Absent for identities from a path that never recorded a
   * score map, in which case only the winner's spoke gets a label. */
  scores?: Record<string, number> | null;
};

const GOLD = "#C9A84C";

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
    template = await loadImage("/id-card-template.png");
  } catch { /* fallback */ }

  // Template is 932x1688. Every label, icon, and separator line below is
  // baked into the template art itself — this only draws the per-person
  // VALUE for each field, on the blank line/box the template leaves for it.
  // Positions were pixel-scanned off the template the same way the prior
  // card-template.png was calibrated (scanning for the gold separator-line
  // rows/columns rather than eyeballing percentages).
  const W = template ? template.naturalWidth : 932;
  const H = template ? template.naturalHeight : 1688;
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

  // ── ARCHETYPE JOURNEY MAP — the template's blank decorative circle on
  // the left panel (empty, tick-marked ring under the GIANTVERSE trident)
  // is a designed placeholder for this. Circle center/radius were measured
  // directly off the template art (pixel-scanned the gold ring, the same
  // way every other field position here was calibrated). Rendered a good
  // deal larger than its final draw size and scaled down for retina
  // sharpness; inset slightly inside the ring so the glyph's own content
  // doesn't collide with the template's decorative rim.
  if (params.scoreHistory?.length) {
    const ringCx = px(0.172);
    const ringCy = py(0.730);
    const ringR = px(0.121);
    const drawR = ringR * 0.88;
    const renderSize = 480;

    // Top 3 archetypes by final score — the winner (labelled via
    // finalSimpleLabel, same plain style as the other two so it doesn't
    // need the full pill-boxed callout) plus its two closest runners-up.
    const topIds = Object.entries(params.scores ?? {})
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id)
      .filter((id) => id !== params.archetypeId)
      .slice(0, 2);

    const glyph = renderJourneyMap(params.scoreHistory, {
      finalArchetypeId: params.archetypeId,
      size: renderSize,
      transparent: true,
      detail: "mini",
      labelMode: "none",
      showFinalLabel: false,
      finalSimpleLabel: true,
      highlightArchetypeIds: topIds,
    });
    ctx.drawImage(glyph, ringCx - drawR, ringCy - drawR, drawR * 2, drawR * 2);
  }

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

  // ── LEGACY NAME — large hero text, centered in the top box ───────────
  // The box now spans nearly the full card width (unlike the old cramped
  // center column), so this is a single centered line rather than a
  // word-per-line stack — and there's no separate "LEGACY MANTLE" row
  // repeating the same value further down, which the old template had.
  ctx.textAlign = "center";
  const legacyText = params.legacyName.toUpperCase();
  const legacyFont = fitFont(legacyText, fw(0.062), px(0.78), "bold");
  ctx.font = `bold ${legacyFont}px Arial`;
  ctx.fillStyle = GOLD;
  ctx.fillText(legacyText, W / 2, py(0.201));

  // ── CENTER COLUMN FIELDS ───────────────────────────────────────────────
  ctx.textAlign = "left";
  const fldFont = fw(0.019);

  // Baselines sit a full ~10px above each field's underline rather than
  // hugging it — Arial's parentheses (used by the archetype field's
  // "Label (Romaji)" format) dip below the alphabetic baseline enough to
  // visually collide with the line and its diamond marker at a tighter gap.
  fitFont(params.birthName.toUpperCase(), fldFont, px(0.335), "bold");
  ctx.fillStyle = GOLD;
  ctx.fillText(params.birthName.toUpperCase(), px(0.331), py(0.342));

  // BIRTHPLACE IN GIANTVERSE — two stacked lines: the cosmetic continent
  // name, then the realm ("land type") it belongs to. This is a personal
  // result for this one card, not a fixed fact about the archetype — see
  // pickContinentForRealm in landing-atlas.ts.
  const birthplaceMaxW = px(0.259);
  fitFont(params.continentName.toUpperCase(), fldFont, birthplaceMaxW, "bold");
  ctx.fillStyle = GOLD;
  ctx.fillText(params.continentName.toUpperCase(), px(0.406), py(0.430));

  fitFont(params.landType.toUpperCase(), fldFont, birthplaceMaxW, "bold");
  ctx.fillStyle = GOLD;
  ctx.fillText(params.landType.toUpperCase(), px(0.406), py(0.467));

  const archetypeText = `${params.archetypeLabel.toUpperCase()} (${params.archetypeRomaji.toUpperCase()})`;
  fitFont(archetypeText, fldFont, px(0.334), "bold");
  ctx.fillStyle = GOLD;
  ctx.fillText(archetypeText, px(0.332), py(0.569));

  const orderText = `${params.order}S`;
  fitFont(orderText, fldFont, px(0.334), "bold");
  ctx.fillStyle = GOLD;
  ctx.fillText(orderText, px(0.332), py(0.668));

  // ID NUMBER has no separate underline in this template — its value sits
  // beside the icon, vertically centered on it, like the old ARCHETYPE/
  // ORDER rows did.
  ctx.font = `${fw(0.016)}px monospace`;
  ctx.fillStyle = GOLD;
  ctx.fillText(params.gvId, px(0.408), py(0.742));

  // ── RIGHT PANEL: 4 TRAITS — one line each, icon baked in ──────────────
  // Simplified from the old two-line "name + description" rows: this
  // template gives each trait a single line, so only the trait name is
  // drawn (the per-trait description text is dropped). Unlike the other
  // fields, this template bakes "TRAIT 1"/"TRAIT 2"/... directly where the
  // value belongs (a fill-in-the-blank placeholder, not a permanent label
  // like "BIRTH NAME") — clear it first or the two texts overlap.
  const TRAIT_BG = "rgb(4,4,3)";
  const traitFont = fw(0.017);
  const traitClearX = px(0.805);
  const traitClearW = px(0.96) - traitClearX;
  const traitX = px(0.853);
  const traitMaxW = px(0.96) - traitX;
  const traitYs = [py(0.494), py(0.572), py(0.646), py(0.718)];

  // All four traits share one font size (whichever the longest name needs
  // to fit) rather than each shrinking independently — otherwise a single
  // two-word trait like "Collective Will" renders noticeably smaller than
  // its single-word neighbors and the row reads as uneven.
  const uniformTraitFont = Math.min(
    ...params.traits.map((trait) => fitFont(trait.toUpperCase(), traitFont, traitMaxW, "bold")),
  );

  params.traits.forEach((trait, i) => {
    const ty = traitYs[i];
    ctx.fillStyle = TRAIT_BG;
    ctx.fillRect(traitClearX, ty - fw(0.02), traitClearW, fw(0.034));
    ctx.font = `bold ${uniformTraitFont}px Arial`;
    ctx.fillStyle = GOLD;
    ctx.fillText(trait.toUpperCase(), traitX, ty);
  });

  // ── GUIDING PROMISE — centered, word-wrapped ──────────────────────────
  const promiseMaxW = px(0.59);
  const promiseFont = fw(0.02);
  const promiseLineH = promiseFont + 8;
  ctx.font = `bold ${promiseFont}px Arial`;
  ctx.fillStyle = GOLD;
  ctx.textAlign = "center";

  const words = params.guidingPromise.toUpperCase().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > promiseMaxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  const promiseStartY = py(0.889) - ((lines.length - 1) * promiseLineH) / 2;
  lines.forEach((l, i) => ctx.fillText(l, W / 2, promiseStartY + i * promiseLineH));

  // ── FOOTER: REAL WORLD IDENTITY ────────────────────────────────────────
  ctx.textAlign = "left";
  ctx.font = `${fw(0.016)}px Arial`;
  ctx.fillStyle = GOLD;
  ctx.fillText(params.realName, px(0.06), py(0.979));
}
