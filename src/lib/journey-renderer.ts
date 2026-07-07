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
  // Archetype ids to label even in "mini" detail (which otherwise shows no
  // text at all) — e.g. the card inset labels the winner plus a few
  // runner-ups so the rim isn't just unlabeled dots.
  highlightArchetypeIds?: string[];
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

// Distance from (x,y) to the nearest edge of the [0,S]x[0,S] canvas,
// travelling in direction (dirX,dirY). Used to size rotated labels so
// they shrink-to-fit instead of clipping off small canvases (e.g. the
// ~250px card inset) when a label happens to point near an edge.
function reachToEdge(x: number, y: number, dirX: number, dirY: number, S: number): number {
  let reach = Infinity;
  if (dirX > 1e-6) reach = Math.min(reach, (S - x) / dirX);
  else if (dirX < -1e-6) reach = Math.min(reach, (0 - x) / dirX);
  if (dirY > 1e-6) reach = Math.min(reach, (S - y) / dirY);
  else if (dirY < -1e-6) reach = Math.min(reach, (0 - y) / dirY);
  return reach;
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

// Quadrant layout — a psychological-profile grid (Agency × Communion)
// rather than an arbitrary definitions-file order. Bearings follow the
// compass convention toXY() uses (0=N, 90=E, 180=S, 270=W, clockwise),
// which maps directly onto screen quadrants: [0,90)=NE, [90,180)=SE,
// [180,270)=SW, [270,360)=NW.
//
//   NE 0–90    High Agency + High Communion  — active, outgoing Hunters
//   SE 90–180  Low Agency + High Communion   — grounded, supportive Hunters
//   SW 180–270 Low Agency + Low Communion    — introspective, philosophical Giants
//   NW 270–360 High Agency + Low Communion   — governing, systemic Giants
//
// Giants therefore occupy the whole west half (SW+NW, 180–360) and
// Hunters the whole east half (NE+SE, 0–180), same as before — only the
// order within each half changes, which is what actually places each
// archetype into its named quadrant.
const QUADRANT_NE_HUNTERS = ["tansa", "shisha", "koro", "teisatsu", "monogatari", "hatsumei", "mamori", "shokunin"];
const QUADRANT_SE_HUNTERS = ["iyashi", "yuei", "kensetsu", "nogyo", "takumi", "seizon", "kaitaku", "banri"];
const QUADRANT_SW_GIANTS = ["gaiko", "tetsugaku", "senryaku", "riso", "yogen", "kenja", "rekishi", "hozon"];
const QUADRANT_NW_GIANTS = ["gijutsu", "minshu", "kizoku", "kanryo", "kenchiku", "sabaki", "sosai", "kaikaku"];

// Spoke layout built once from canonical archetype definitions.
// Guild → color in first-seen order; Calling color as fallback.
const SPOKES: Record<string, Spoke> = (() => {
  const byId = new Map(
    Object.values(ARCHETYPE_DEFINITIONS).map((a) => [
      a.id,
      {
        id: a.id,
        title: a.label,
        surname: a.romajiName,
        calling: (a.order === "GIANT" ? "Giant" : "Hunter") as "Giant" | "Hunter",
        guild: a.guild,
      },
    ]),
  );
  const all = [...byId.values()];

  const palette = new Map<string, string>();
  let slot = 0;
  for (const a of all) {
    if (a.guild && !palette.has(a.guild)) {
      palette.set(a.guild, GUILD_PALETTE[slot++ % GUILD_PALETTE.length]);
    }
  }
  const colorOf = (a: (typeof all)[number]) =>
    (a.guild && palette.get(a.guild)) || CALLING_COLORS[a.calling];

  const hunters = [...QUADRANT_NE_HUNTERS, ...QUADRANT_SE_HUNTERS].map((id) => byId.get(id)).filter((a): a is (typeof all)[number] => Boolean(a));
  const giants = [...QUADRANT_SW_GIANTS, ...QUADRANT_NW_GIANTS].map((id) => byId.get(id)).filter((a): a is (typeof all)[number] => Boolean(a));

  const spokes: Record<string, Spoke> = {};
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

/** The spoke angle (degrees, 0=north/clockwise) for a canonical archetype id, if known. */
export function getSpokeAngle(id: string): number | undefined {
  return SPOKES[id]?.angleDeg;
}

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

  // Pass 1: raw certainty per turn. vx,vy is a weighted average of unit
  // vectors, so its magnitude (0..1) is how strongly that turn's signals
  // agreed on one direction — but in practice, with scores spread across
  // many archetypes, this rarely gets anywhere near 1, so every point
  // ends up compressed near the center regardless of how the quiz
  // actually progressed.
  const raw = turns.map((turn, i) => {
    const gamma = 1 + i * gammaStep;
    let wSum = 0;
    const sharp: Array<[string, number, number]> = [];
    for (const [id, s] of Object.entries(turn.scores)) {
      if (!SPOKES[id] || s <= 0) continue;
      const w = Math.pow(s, gamma);
      sharp.push([id, w, s]);
      wSum += w;
    }
    if (!wSum) return { vx: 0, vy: 0, certainty: 0, leaderId: null as string | null, category: turn.category };
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
    return { vx, vy, certainty: Math.min(1, Math.hypot(vx, vy)), leaderId, category: turn.category };
  });

  // Pass 2: linearize by RANK, not raw value. Min-max normalization still
  // crowds most points near the center whenever certainty is skewed (a
  // couple of confident turns pull the max up while everything else stays
  // low relative to it) — exactly the case here, since early/mid-quiz
  // scores are usually spread across several archetypes at once. Ranking
  // guarantees the turns are spread evenly across the full 0..1 radius
  // regardless of how bunched up the underlying values are.
  const rank = new Array<number>(raw.length);
  raw
    .map((r, i) => ({ i, certainty: r.certainty }))
    .sort((a, b) => a.certainty - b.certainty)
    .forEach(({ i }, position) => {
      rank[i] = position;
    });
  const lastRank = Math.max(1, raw.length - 1);

  return raw.map((r, i) => {
    if (r.certainty <= 0) return { x: cx, y: cy, leaderId: null, category: r.category };
    const dirX = r.vx / r.certainty;
    const dirY = r.vy / r.certainty;
    const linearized = rank[i] / lastRank; // 0 = least certain turn, 1 = most certain
    const radius = R * linearized;
    return { x: cx + dirX * radius, y: cy + dirY * radius, leaderId: r.leaderId, category: r.category };
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
    highlightArchetypeIds = [],
  } = opts;
  const highlightIds = new Set(highlightArchetypeIds);

  const S = size;
  const cx = S / 2;
  const cy = S / 2;
  const u = S / 900; // designed at 900
  const px = (v: number, min: number) => Math.max(v * u, min); // keep strokes visible at small sizes
  // Font sizes get their own floor, independent of `u` — at small render
  // sizes (e.g. the 380–460px card inset) `v * u` alone shrinks text to
  // near-illegible pixel heights. Everything text-related below routes
  // through this so the map stays readable no matter how small the canvas.
  const fpx = (v: number, min: number) => Math.max(v * u, min);
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
    ctx.fillStyle = "rgba(234,228,211,.4)";
    ctx.font = `${fpx(9, 11)}px monospace`;
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
    const isHighlighted = !isFinal && highlightIds.has(c.id);
    const dimmed = !isFinal && !wasVisited && !isHighlighted;

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
    ctx.arc(
      tip.x, tip.y,
      px(isFinal ? 7 : wasVisited || isHighlighted ? 4.5 : 3, isFinal ? 3.5 : wasVisited || isHighlighted ? 2.2 : 1.2),
      0, Math.PI * 2,
    );
    if (isFinal || wasVisited || isHighlighted) {
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
      detail !== "mini"
        ? labelMode !== "none" && (labelMode === "all" || isFinal || wasVisited)
        : isHighlighted; // mini: only the explicitly highlighted runner-ups get a label
    if (showLabel && !isFinal) {
      // Regular spokes: readable floor, but still modest — there are up
      // to 32 of these sharing the ring. Shrink-to-fit against the actual
      // canvas edge so a highlighted runner-up near the rim (e.g. on the
      // small card inset) never gets clipped.
      const lab = toXY(c.angleDeg, R_LABEL, cx, cy);
      const west = c.angleDeg > 180;
      const rotation = ((west ? c.angleDeg + 90 : c.angleDeg - 90) * Math.PI) / 180;
      const dirLocal = west ? -1 : 1;
      const reach = reachToEdge(lab.x, lab.y, dirLocal * Math.cos(rotation), dirLocal * Math.sin(rotation), S);
      const maxTextW = Math.max(8, reach - fpx(4, 4));

      ctx.save();
      ctx.translate(lab.x, lab.y);
      ctx.rotate(rotation);
      ctx.fillStyle = wasVisited || isHighlighted ? PAPER : DIM;
      ctx.textAlign = west ? "end" : "start";
      ctx.textBaseline = "middle";

      let font = fpx(10, wasVisited || isHighlighted ? 12 : 9);
      ctx.font = `${font}px monospace`;
      while (ctx.measureText(c.title).width > maxTextW && font > 7) {
        font -= 0.5;
        ctx.font = `${font}px monospace`;
      }
      ctx.fillText(c.title, 0, 0);
      ctx.restore();
    }
  }

  ctx.globalAlpha = 1;

  // traced route — solid through every real answer. The final leg (the
  // dock onto the winning archetype) is solid too once the archetype is
  // confirmed; while a step is only showing the tentative leader so far
  // (no explicit finalArchetypeId yet), that same leg is dashed to mark
  // it as a projection rather than a settled answer.
  const segments = bezierSegments(route);
  const dockSegmentIndex = finalC ? segments.length - 1 : -1;
  const dockIsConfirmed = Boolean(requestedFinal);

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = px(2, 1.3);
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(route[0].x, route[0].y);
  segments.forEach(([c1x, c1y, c2x, c2y, x, y], idx) => {
    if (idx === dockSegmentIndex) return; // drawn separately below
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
  });
  ctx.setLineDash([]);
  ctx.stroke();

  if (dockSegmentIndex >= 0) {
    const [c1x, c1y, c2x, c2y, x, y] = segments[dockSegmentIndex];
    const from = route[route.length - 2];
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
    ctx.setLineDash(dockIsConfirmed ? [] : [px(1, 0.8), px(7, 3.5)]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

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
    ctx.arc(p.x, p.y, px(isStart ? 5.5 : 4.5, isStart ? 4 : 3), 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = px(1.5, 1);
    ctx.stroke();
    ctx.fillStyle = accentColor;
    ctx.font = `${fpx(7.5, 8)}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(isStart ? "◦" : isEnd ? "✦" : String(i), p.x, p.y + 0.5 * u);
  });

  // The currently-pointed-at archetype (the leader at whatever step is
  // shown) gets one clearly scaled-up label, drawn last so it sits above
  // the route and every other spoke — same rotated placement as the rest
  // of the ring, just bold, larger, and pill-backed for contrast, with a
  // second line for the romaji name underneath.
  if (finalC) {
    const west = finalC.angleDeg > 180;
    const rotation = ((west ? finalC.angleDeg + 90 : finalC.angleDeg - 90) * Math.PI) / 180;
    const lab = toXY(finalC.angleDeg, R_LABEL + 14 * u, cx, cy);

    // The label extends outward along the (rotated) spoke direction, not
    // necessarily horizontally — so "how much room is left" has to be a
    // real ray-to-canvas-edge distance, not a fixed fraction of width.
    // Without this, a long title on a small canvas (e.g. the ~250px card
    // inset) can extend straight past the edge and get clipped.
    const dirLocal = west ? -1 : 1;
    const reach = reachToEdge(lab.x, lab.y, dirLocal * Math.cos(rotation), dirLocal * Math.sin(rotation), S);
    const maxTextW = Math.max(10, reach - fpx(10, 10));

    ctx.save();
    ctx.translate(lab.x, lab.y);
    ctx.rotate(rotation);
    ctx.textAlign = west ? "end" : "start";
    ctx.textBaseline = "middle";

    let titleFont = fpx(17, 18);
    let surnameFont = fpx(12, 13);
    ctx.font = `700 ${titleFont}px "Georgia", serif`;
    let titleW = ctx.measureText(finalC.title).width;
    while (titleW > maxTextW && titleFont > 8) {
      titleFont -= 0.5;
      ctx.font = `700 ${titleFont}px "Georgia", serif`;
      titleW = ctx.measureText(finalC.title).width;
    }
    ctx.font = `${surnameFont}px monospace`;
    let surnameW = ctx.measureText(finalC.surname).width;
    while (surnameW > maxTextW && surnameFont > 7) {
      surnameFont -= 0.5;
      ctx.font = `${surnameFont}px monospace`;
      surnameW = ctx.measureText(finalC.surname).width;
    }
    const w = Math.max(titleW, surnameW);

    const padX = fpx(7, 7);
    const lineGap = fpx(2, 2);
    const rowH = titleFont * 0.75 + surnameFont * 0.75 + lineGap;
    const boxX = west ? -w - padX : -padX;

    ctx.fillStyle = "rgba(11,17,28,.88)";
    ctx.beginPath();
    ctx.roundRect(boxX, -rowH / 2 - 4 * u, w + padX * 2, rowH + 8 * u, fpx(5, 5));
    ctx.fill();

    ctx.textAlign = "left";
    const textX = west ? -titleW : 0;
    const surnameX = west ? -surnameW : 0;
    ctx.fillStyle = BRASS;
    ctx.font = `700 ${titleFont}px "Georgia", serif`;
    ctx.fillText(finalC.title, textX, -surnameFont * 0.6 - lineGap / 2);
    ctx.fillStyle = PAPER;
    ctx.font = `${surnameFont}px monospace`;
    ctx.fillText(finalC.surname, surnameX, titleFont * 0.55 + lineGap / 2);
    ctx.restore();
  }

  return canvas;
}
