// Structural (non-translatable) data for the landing-page atlas sections:
// realm accents/icons, world-map region geometry, and the compass quadrant/
// hemisphere layout. All display text lives in the "landing" namespace of
// messages/{locale}.json — this module only carries ids, geometry, and color.

// ── Realms ──────────────────────────────────────────────────────────

export const REALM_ORDER = ["Kuryo", "Murei", "Maruto", "Neisei", "Harai"] as const;
export type RealmId = (typeof REALM_ORDER)[number];

export interface RealmMeta {
  accent: string;
  /** 24x24 stroke icon path(s) drawn in the realm card. */
  iconPaths: string[];
}

// No archetype is tied to a realm here — any of the 32 archetypes can be
// born in, or travel to, any of the five lands. Only the wheel's
// realmBias (archetype-definitions.ts) exists, and that's a per-result
// flavor pick for one participant's reveal, not a lore-level residency.
export const REALM_META: Record<RealmId, RealmMeta> = {
  Neisei: {
    accent: "#5FB4C9",
    iconPaths: [
      "M2 14c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2",
      "M4 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2",
      "M14 4l5 5h-3.5v3h-3V9H9z",
    ],
  },
  Kuryo: {
    accent: "#9B8CC9",
    iconPaths: ["M3 19L9.5 6l4.5 7 2.5-4L21 19z", "M9.5 6l1.5 3-1.5 2-1.5-2z"],
  },
  Murei: {
    accent: "#6FAE7F",
    iconPaths: [
      "M12 21v-6",
      "M12 15c-4.2 0-6.5-2.4-6.5-5.4C5.5 6.2 8.2 4 12 4s6.5 2.2 6.5 5.6c0 3-2.3 5.4-6.5 5.4z",
    ],
  },
  Maruto: {
    accent: "#C9A84C",
    iconPaths: ["M5 20V10.5L8 8V5h2.5v2h3V5H16v3l3 2.5V20z", "M10.5 20v-4h3v4"],
  },
  Harai: {
    accent: "#D96C5B",
    iconPaths: ["M12 3l7.5 8.5L12 21 4.5 11.5z", "M12 3l-2 7 3 2-1.5 6"],
  },
};

// ── World map ───────────────────────────────────────────────────────
// Detailed atlas artwork (public/Images/world-map-detailed.webp). Every
// continent is drawn with the same four zone types — a mountain belt,
// a forest, a coastal port, and a central heart that's either painted
// gold (civil, harmony) or red (wastes, turmoil) depending on that
// continent's current place in the cycle. The image's own continent
// names (Akaru, Ryūsen, Kaigen, Seikora, Hoshima, Kurogane) and named
// landmarks (Hikari Sanzan, Tenshō City, etc.) are cosmetic scenery
// baked into the art; each zone's actual tooltip content is the real
// Neisei/Kuryo/Murei/Maruto/Harai lore, same as every other zone of
// that type on every other continent — any of the five lands can and
// does appear anywhere.
//
// Zone-type → realm mapping: mountains → Kuryo, forest → Murei, port →
// Neisei, heart → Maruto (gold) or Harai (red), read directly off the
// artwork's own coloring per continent:
//   Akaru: Maruto   Ryūsen: Harai   Kaigen: Maruto
//   Seikora: Harai   Hoshima: Maruto   Kurogane: Harai

export const WORLD_MAP_IMAGE = "/Images/world-map-detailed.webp";
export const WORLD_MAP_SIZE = { width: 1536, height: 1024 };

export interface MapZone {
  id: RealmId;
  /** Cosmetic continent label from the artwork — accessibility context only. */
  continent: string;
  /** Center of the zone, as a percentage of the image's width/height. */
  xPct: number;
  yPct: number;
  /** Radius of the hover/focus glow ring, as a percentage of image width. */
  radiusPct: number;
}

export const MAP_ZONES: MapZone[] = [
  // Akaru — The Dawn Continent (heart: Maruto)
  { id: "Kuryo", continent: "Akaru", xPct: 36.5, yPct: 10.3, radiusPct: 2 },
  { id: "Murei", continent: "Akaru", xPct: 45.9, yPct: 19.0, radiusPct: 2 },
  { id: "Maruto", continent: "Akaru", xPct: 38.1, yPct: 19.5, radiusPct: 2 },
  { id: "Neisei", continent: "Akaru", xPct: 35.5, yPct: 28.3, radiusPct: 2 },

  // Ryūsen — The Dragon Current (heart: Harai)
  { id: "Kuryo", continent: "Ryūsen", xPct: 73.6, yPct: 9.8, radiusPct: 2 },
  { id: "Murei", continent: "Ryūsen", xPct: 74.9, yPct: 16.6, radiusPct: 2 },
  { id: "Harai", continent: "Ryūsen", xPct: 71.0, yPct: 21.0, radiusPct: 2 },
  { id: "Neisei", continent: "Ryūsen", xPct: 66.7, yPct: 26.1, radiusPct: 2 },

  // Kaigen — The Realm of Origins (heart: Maruto)
  { id: "Kuryo", continent: "Kaigen", xPct: 48.5, yPct: 31.7, radiusPct: 2 },
  { id: "Murei", continent: "Kaigen", xPct: 42.3, yPct: 39.1, radiusPct: 2 },
  { id: "Maruto", continent: "Kaigen", xPct: 50.5, yPct: 43.9, radiusPct: 2 },
  { id: "Neisei", continent: "Kaigen", xPct: 48.8, yPct: 54.4, radiusPct: 2 },

  // Seikora — Sea of New Horizons (heart: Harai)
  { id: "Kuryo", continent: "Seikora", xPct: 28.0, yPct: 58.1, radiusPct: 2 },
  { id: "Murei", continent: "Seikora", xPct: 21.5, yPct: 64.5, radiusPct: 2 },
  { id: "Harai", continent: "Seikora", xPct: 29.0, yPct: 69.3, radiusPct: 2 },
  { id: "Neisei", continent: "Seikora", xPct: 25.4, yPct: 79.4, radiusPct: 2 },

  // Hoshima — Island of Stars (heart: Maruto)
  { id: "Kuryo", continent: "Hoshima", xPct: 59.9, yPct: 63.0, radiusPct: 2 },
  { id: "Murei", continent: "Hoshima", xPct: 67.1, yPct: 69.8, radiusPct: 2 },
  { id: "Maruto", continent: "Hoshima", xPct: 60.5, yPct: 73.7, radiusPct: 2 },
  { id: "Neisei", continent: "Hoshima", xPct: 57.6, yPct: 81.9, radiusPct: 2 },

  // Kurogane — The Iron Continent (heart: Harai)
  { id: "Kuryo", continent: "Kurogane", xPct: 87.9, yPct: 47.9, radiusPct: 2 },
  { id: "Murei", continent: "Kurogane", xPct: 79.4, yPct: 57.6, radiusPct: 2 },
  { id: "Harai", continent: "Kurogane", xPct: 84.0, yPct: 58.6, radiusPct: 2 },
  { id: "Neisei", continent: "Kurogane", xPct: 82.7, yPct: 71.5, radiusPct: 2 },
];

// ── Compass ─────────────────────────────────────────────────────────
// COMPASS_ORDER lays the 32 archetypes out as a true two-axis compass —
// deliberately a SEPARATE array from WHEEL_ORDER (archetype-wheel.ts).
// WHEEL_ORDER encodes relationship semantics (opposites exactly 16 slots
// apart, for the Compatibility Checker's distance math); this array encodes
// visual position (Order/Temperament quadrants). The two constraints can't
// share one array: some hand-authored opposite pairs share an Order or a
// Temperament, so "opposite in content" and "opposite quadrant" aren't the
// same thing. Position 0 sits at 9 o'clock and the order runs clockwise
// over the top, so:
//   - East/West (longitude) = Order: positions 8–23 (the right/eastern
//     half) are the Order of Giants, positions 24–31 & 0–7 (the left/
//     western half) are the Order of Hunters.
//   - North/South (latitude) = Temperament: positions 0–15 (the top/
//     northern half) are Active archetypes, positions 16–31 (the bottom/
//     southern half) are Passive.
// The four quadrants are the intersection of the two: Northeast (Giants,
// Active) = Forgers, Southeast (Giants, Passive) = Ascenders, Southwest
// (Hunters, Passive) = Havens, Northwest (Hunters, Active) = Venturers.

export type QuadrantId = "forgers" | "ascenders" | "havens" | "venturers";
export type NSHemisphereId = "north" | "south";
export type EWHemisphereId = "east" | "west";
export type HemisphereId = NSHemisphereId | EWHemisphereId;

export const COMPASS_ORDER: string[] = [
  // Northwest — Order of Hunters, Active
  "koro", "teisatsu", "shisha", "tansa", "kensetsu", "hatsumei", "kaitaku", "shokunin",
  // Northeast — Order of Giants, Active
  "kizoku", "senryaku", "sosai", "gijutsu", "riso", "kenchiku", "kaikaku", "yogen",
  // Southeast — Order of Giants, Passive
  "hozon", "gaiko", "minshu", "sabaki", "tetsugaku", "kenja", "rekishi", "kanryo",
  // Southwest — Order of Hunters, Passive
  "mamori", "seizon", "iyashi", "banri", "monogatari", "nogyo", "yuei", "takumi",
];

const COMPASS_POSITION_BY_ID: Record<string, number> = Object.fromEntries(
  COMPASS_ORDER.map((id, i) => [id, i]),
);

/** An archetype's slot on the visual compass (not the semantic WHEEL_ORDER). */
export function compassPosition(archetypeId: string): number {
  const pos = COMPASS_POSITION_BY_ID[archetypeId];
  if (pos === undefined) {
    throw new Error(`compassPosition: unknown archetype id "${archetypeId}"`);
  }
  return pos;
}

export interface Quadrant {
  id: QuadrantId;
  /** Compass positions [start, start+8) belong to this quadrant. */
  start: number;
  color: string;
  /** Unicode symbol engraved beside the quadrant name. */
  symbol: string;
}

export const QUADRANTS: Quadrant[] = [
  { id: "venturers", start: 0, color: "#D98A5B", symbol: "➤" },
  { id: "forgers", start: 8, color: "#C9A84C", symbol: "⚒" },
  { id: "ascenders", start: 16, color: "#7FA6E0", symbol: "✦" },
  { id: "havens", start: 24, color: "#6FAE7F", symbol: "❖" },
];

export function quadrantOf(position: number): Quadrant {
  return QUADRANTS[Math.floor(position / 8)];
}

/** Active (north) vs. Passive (south) — the compass's Temperament axis. */
export function nsHemisphereOf(position: number): NSHemisphereId {
  return position < 16 ? "north" : "south";
}

/** Order of Giants (east) vs. Order of Hunters (west) — the compass's Order axis. */
export function ewHemisphereOf(position: number): EWHemisphereId {
  return position >= 8 && position < 24 ? "east" : "west";
}

const SLOT_DEGREES = 360 / COMPASS_ORDER.length;

/**
 * Standard-position angle (degrees) of a compass slot's center. Position 0
 * is just clockwise of 9 o'clock; the order proceeds clockwise, so the
 * northern hemisphere (0–15) spans the top half of the circle.
 */
export function wheelAngle(position: number): number {
  return 180 - (position + 0.5) * SLOT_DEGREES;
}

export function wheelPoint(
  position: number,
  radius: number,
  cx: number,
  cy: number,
): { x: number; y: number } {
  const rad = (wheelAngle(position) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy - radius * Math.sin(rad) };
}
