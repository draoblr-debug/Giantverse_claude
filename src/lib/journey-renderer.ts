// GIANTVERSE · JOURNEY MAP glyph (browser port of journeyCardRender.v2)
//
// Renders the participant's turn-by-turn drift across the 32 archetypes as
// a radial map: Giants fill the western semicircle, Hunters the eastern;
// spokes are colored by guild; the traced route is the participant's own
// path, docking on the winning archetype. The renderer owns zero world
// data — it is constructed from ARCHETYPE_DEFINITIONS, and score snapshots
// referencing unknown archetype ids throw, so schema drift can never
// silently introduce a 33rd archetype.

import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";

export interface TurnSnapshot {
  category: string;
  scores: Record<string, number>;
}

export interface JourneyRenderOptions {
  finalArchetypeId?: string; // defaults to last-turn leader
  size?: number; // px, square. default 760
  transparent?: boolean; // default true (for compositing)
  background?: string; // used when transparent=false
  labelMode?: "visited" | "all" | "none"; // default "visited"
  detail?: "full" | "mini"; // "mini" = glyph only, for the card inset
  gammaStep?: number; // sharpening per turn, default 0.22
  accentColor?: string; // tints the traced path
}

interface Spoke {
  id: string;
  angleDeg: number; // 0° = north, clockwise
  title: string;
  surname: string;
  calling: "Giant" | "Hunter";
  color: string;
}

interface Waypoint {
  x: number;
  y: number;
  leaderId: string | null;
  category: string;
}

const INK = "#0B111C";
const PAPER = "#EAE4D3";
const DIM = "#9AA0AC";
const BRASS = "#C9A24B";
const CALLING_COLORS: Record<"Giant" | "Hunter", string> = {
  Giant: "#C9A24B", // brass — thought
  Hunter: "#4FA3A5", // teal — action
};
const GUILD_PALETTE = [
  "#C9A24B", "#4FA3A5", "#7286B8", "#6FA06A",
  "#B4543F", "#9B6FB8", "#C4885A", "#8A9BA8",
];

function toXY(angleDeg: number, r: number, cx: number, cy: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

// Catmull-Rom smoothing for canvas bezier drawing
function bezierSegments(pts: Array<{ x: number; y: number }>) {
  const segs: Array<[number, number, number, number, number, number]> = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    segs.push([
      p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6,
      p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6,
      p2.x, p2.y,
    ]);
  }
  return segs;
}

// Spoke layout built once from canonical archetype definitions.
// Guild → color in first-seen order; Calling color as fallback.
const SPOKES: Record<string, Spoke> = (() => {
  const all = Object.values(ARCHETYPE_DEFINITIONS).map((a) => ({
    id: a.id,
    title: a.label,
    surname: a.romajiName,
    calling: (a.order === "GIANT" ? "Giant" : "Hunter") as "Giant" | "Hunter",
    guild: a.guild,
  }));

  const palette = new Map<string, string>();
  let slot = 0;
  for (const a of all) {
    if (a.guild && !palette.has(a.guild)) {
      palette.set(a.guild, GUILD_PALETTE[slot++ % GUILD_PALETTE.length]);
    }
  }
  const colorOf = (a: (typeof all)[number]) =>
    (a.guild && palette.get(a.guild)) || CALLING_COLORS[a.calling];

  const spokes: Record<string, Spoke> = {};
  const giants = all.filter((a) => a.calling === "Giant");
  const hunters = all.filter((a) => a.calling === "Hunter");
  hunters.forEach((a, i) => {
    const step = 180 / hunters.length;
    spokes[a.id] = { id: a.id, angleDeg: step / 2 + i * step, title: a.title, surname: a.surname, calling: a.calling, color: colorOf(a) };
  });
  giants.forEach((a, i) => {
    const step = 180 / giants.length;
    spokes[a.id] = { id: a.id, angleDeg: 180 + step / 2 + i * step, title: a.title, surname: a.surname, calling: a.calling, color: colorOf(a) };
  });
  return spokes;
})();

function assertKnown(turns: TurnSnapshot[]) {
  const unknown = new Set<string>();
  for (const t of turns) {
    for (const id of Object.keys(t.scores)) {
      if (!SPOKES[id]) unknown.add(id);
    }
  }
  if (unknown.size) {
    throw new Error(
      `journey-renderer: score snapshots reference archetypes not in canonical data: ${[...unknown].join(", ")}`,
    );
  }
}

function computeRadialTrajectory(
  turns: TurnSnapshot[],
  R: number,
  cx: number,
  cy: number,
  gammaStep = 0.22,
): Waypoint[] {
  assertKnown(turns);
  return turns.map((turn, i) => {
    const gamma = 1 + i * gammaStep;
    let wSum = 0;
    const sharp: Array<[string, number, number]> = [];
    for (const [id, s] of Object.entries(turn.scores)) {
      if (!SPOKES[id] || s <= 0) continue;
      const w = Math.pow(s, gamma);
      sharp.push([id, w, s]);
      wSum += w;
    }
    if (!wSum) return { x: cx, y: cy, leaderId: null, category: turn.category };
    let vx = 0;
    let vy = 0;
    let leaderId: string | null = null;
    let best = -Infinity;
    for (const [id, w, s] of sharp) {
      const a = ((SPOKES[id].angleDeg - 90) * Math.PI) / 180;
      vx += (w / wSum) * Math.cos(a);
      vy += (w / wSum) * Math.sin(a);
      if (s > best) {
        best = s;
        leaderId = id;
      }
    }
    return { x: cx + vx * R, y: cy + vy * R, leaderId, category: turn.category };
  });
}

/** Renders the journey glyph into a fresh canvas and returns it. */
export function renderJourneyMap(
  turns: TurnSnapshot[],
  opts: JourneyRenderOptions = {},
): HTMLCanvasElement {
  const {
    size = 760,
    transparent = true,
    background = INK,
    labelMode = "visited",
    detail = "full",
    gammaStep = 0.22,
    accentColor = BRASS,
  } = opts;

  const S = size;
  const cx = S / 2;
  const cy = S / 2;
  const u = S / 900; // designed at 900
  const px = (v: number, min: number) => Math.max(v * u, min); // keep strokes visible at small sizes
  const R_TRAVEL = 300 * u;
  const R_RIM = 328 * u;
  const R_LABEL = 350 * u;

  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  if (!transparent) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, S, S);
  }

  const trajectory = computeRadialTrajectory(turns, R_TRAVEL, cx, cy, gammaStep);
  const requestedFinal = opts.finalArchetypeId ?? null;
  if (requestedFinal && !SPOKES[requestedFinal]) {
    throw new Error(`journey-renderer: finalArchetypeId "${requestedFinal}" is not in canonical data`);
  }
  const finalId = requestedFinal || trajectory[trajectory.length - 1]?.leaderId || null;
  const finalC = finalId ? SPOKES[finalId] : null;

  const visited = new Set<string>();
  for (const p of trajectory) if (p.leaderId) visited.add(p.leaderId);

  // route: center → waypoints → dock on winner
  const route: Array<{ x: number; y: number }> = [{ x: cx, y: cy }, ...trajectory];
  if (finalC) route.push(toXY(finalC.angleDeg, R_RIM, cx, cy));

  // certainty rings
  for (const f of [0.25, 0.5, 0.75, 1]) {
    ctx.beginPath();
    ctx.arc(cx, cy, R_TRAVEL * f, 0, Math.PI * 2);
    ctx.strokeStyle = f === 1 ? "rgba(234,228,211,.14)" : "rgba(234,228,211,.06)";
    ctx.lineWidth = px(1, 0.6);
    ctx.setLineDash(f === 1 ? [] : [px(2, 1), px(8, 4)]);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // calling meridian
  ctx.beginPath();
  ctx.moveTo(cx, cy - R_RIM);
  ctx.lineTo(cx, cy + R_RIM);
  ctx.strokeStyle = "rgba(234,228,211,.08)";
  ctx.lineWidth = px(1, 0.5);
  ctx.stroke();

  // orientation labels — "certainty" grows outward from center; Giants
  // fill the west half, Hunters the east.
  if (detail !== "mini") {
    ctx.fillStyle = "rgba(234,228,211,.35)";
    ctx.font = `${9 * u}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("CERTAINTY →", cx, cy - R_RIM - 10 * u);

    ctx.fillStyle = CALLING_COLORS.Giant;
    ctx.textAlign = "right";
    ctx.fillText("△ GIANTS", cx - R_RIM * 0.55, cy + 4 * u);

    ctx.fillStyle = CALLING_COLORS.Hunter;
    ctx.textAlign = "left";
    ctx.fillText("HUNTERS ◇", cx + R_RIM * 0.55, cy + 4 * u);
  }

  // spokes, tips, labels
  for (const c of Object.values(SPOKES)) {
    const isFinal = c.id === finalId;
    const wasVisited = visited.has(c.id) && !isFinal;
    const dimmed = !isFinal && !wasVisited;

    const from = toXY(c.angleDeg, R_TRAVEL + 6 * u, cx, cy);
    const tip = toXY(c.angleDeg, R_RIM, cx, cy);

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.strokeStyle = c.color;
    ctx.globalAlpha = isFinal ? 0.9 : dimmed ? 0.2 : 0.55;
    ctx.lineWidth = px(isFinal ? 2 : 1, isFinal ? 1.2 : 0.6);
    ctx.stroke();

    ctx.globalAlpha = dimmed ? 0.4 : 1;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, px(isFinal ? 7 : wasVisited ? 4.5 : 3, isFinal ? 3.5 : wasVisited ? 2.2 : 1.2), 0, Math.PI * 2);
    if (isFinal || wasVisited) {
      ctx.fillStyle = c.color;
      ctx.fill();
    }
    ctx.strokeStyle = c.color;
    ctx.lineWidth = px(1.3, 0.6);
    ctx.stroke();

    if (isFinal) {
      // static pulse = double ring
      for (const [r, a] of [[14, 0.7], [21, 0.3]] as Array<[number, number]>) {
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, px(r, r * 0.45), 0, Math.PI * 2);
        ctx.strokeStyle = c.color;
        ctx.globalAlpha = a;
        ctx.lineWidth = px(1.4, 0.7);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    const showLabel =
      detail !== "mini" && labelMode !== "none" && (labelMode === "all" || isFinal || wasVisited);
    if (showLabel) {
      const lab = toXY(c.angleDeg, R_LABEL, cx, cy);
      const west = c.angleDeg > 180;
      ctx.save();
      ctx.translate(lab.x, lab.y);
      ctx.rotate(((west ? c.angleDeg + 90 : c.angleDeg - 90) * Math.PI) / 180);
      ctx.fillStyle = isFinal ? BRASS : wasVisited ? PAPER : DIM;
      ctx.font = `${isFinal ? "600 " : ""}${(isFinal ? 13 : 10) * u}px monospace`;
      ctx.textAlign = west ? "end" : "start";
      ctx.textBaseline = "middle";
      ctx.fillText(c.title, 0, 0);
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;

  // traced route — the participant's own path
  ctx.beginPath();
  ctx.moveTo(route[0].x, route[0].y);
  for (const [c1x, c1y, c2x, c2y, x, y] of bezierSegments(route)) {
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
  }
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = px(2, 1.3);
  ctx.setLineDash([px(1, 0.8), px(7, 3.5)]);
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.setLineDash([]);

  // waypoints
  route.forEach((p, i) => {
    const isStart = i === 0;
    const isEnd = i === route.length - 1;
    if (detail === "mini") {
      ctx.beginPath();
      ctx.arc(p.x, p.y, px(isStart || isEnd ? 4 : 2.6, isStart || isEnd ? 2.4 : 1.5), 0, Math.PI * 2);
      ctx.fillStyle = accentColor;
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, (isStart ? 5.5 : 4.5) * u, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5 * u;
    ctx.stroke();
    ctx.fillStyle = accentColor;
    ctx.font = `${7.5 * u}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(isStart ? "◦" : isEnd ? "✦" : String(i), p.x, p.y + 0.5 * u);
  });

  // winner caption under their spoke tip
  if (finalC && detail !== "mini") {
    const tip = toXY(finalC.angleDeg, R_RIM, cx, cy);
    const below = tip.y > cy;
    ctx.fillStyle = BRASS;
    ctx.font = `700 ${15 * u}px Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = below ? "top" : "bottom";
    ctx.fillText(finalC.surname, tip.x, tip.y + (below ? 26 : -26) * u);
  }

  return canvas;
}
