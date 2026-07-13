import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import { WHEEL_ORDER } from "@/engines/archetype/archetype-wheel";
import type { ArchetypeProfile } from "@/types/archetype.types";

// Compatibility Checker — deterministic, name-in/result-out. A Giantverse
// Legacy Name is always "{Birth Name} {Archetype Romaji}" (e.g. "Teyuka
// Kanryō"), and the Archetype Romaji is unique across all 32 archetypes —
// so the surname alone identifies the archetype with no ambiguity. The
// result is derived purely from the two archetypes' positions on the
// 32-point wheel (see archetype-wheel.ts) — same two names always produce
// the same result, in either order.

export type GiantHuntRole = "Ally" | "Mentor" | "Romance" | "Rival" | "Villain";

export type CompatibilityResult = {
  nameA: string;
  nameB: string;
  archetypeA: ArchetypeProfile;
  archetypeB: ArchetypeProfile;
  distance: number; // 0–16, circular distance around the 32-point wheel
  role: GiantHuntRole;
  percentage: number; // 84–100, how strongly this pairing fits its role
  descriptor: string; // e.g. "Strong", "Absolute"
  tagline: string; // one-line flavor text for the role
  // Only set when role === "Mentor" — every other role is treated as
  // directionless. See wheelForwardDiff() for how the direction is chosen.
  mentor?: { name: string; archetype: ArchetypeProfile };
  mentee?: { name: string; archetype: ArchetypeProfile };
};

export type CompatibilityError = { error: string };

// Strip macrons so users typing on a plain keyboard ("Kanryo") still match
// the accented romaji stored in ARCHETYPE_DEFINITIONS ("Kanryō").
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // combining diacritics
    .toLowerCase()
    .trim();
}

const ROMAJI_INDEX: Map<string, ArchetypeProfile> = new Map(
  Object.values(ARCHETYPE_DEFINITIONS).map((p) => [normalize(p.romajiName), p]),
);

/** Resolves a raw Giantverse name (full "First Surname" or the surname alone) to its archetype. */
export function findArchetypeByName(input: string): ArchetypeProfile | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const tokens = trimmed.split(/\s+/);
  const lastToken = tokens[tokens.length - 1];

  return (
    ROMAJI_INDEX.get(normalize(lastToken)) ??
    ROMAJI_INDEX.get(normalize(trimmed)) ??
    null
  );
}

const WHEEL_SIZE = WHEEL_ORDER.length;

// Steps from idA to idB moving forward through WHEEL_ORDER (wrapping at
// 32) — the same "growth direction" used elsewhere in the app (see
// persona-payload.ts). Unlike circular distance, this is directional:
// wheelForwardDiff(A, B) !== wheelForwardDiff(B, A) except at the exact
// opposite (distance 16), where both equal 16.
function wheelForwardDiff(idA: string, idB: string): number {
  const posA = WHEEL_ORDER.indexOf(idA);
  const posB = WHEEL_ORDER.indexOf(idB);
  return (posB - posA + WHEEL_SIZE) % WHEEL_SIZE;
}

// Distance buckets across the 0–16 range, ordered closest → farthest.
// Each entry's "center" is its thematic ideal point, used to derive the
// percentage (how squarely the pairing lands in that role, not a
// judgement of "good" vs "bad" — a Villain match at 100% is just as valid
// a result as an Ally match at 100%).
const ROLE_BUCKETS: { role: GiantHuntRole; min: number; max: number; center: number; tagline: string }[] = [
  {
    role: "Ally", min: 0, max: 2, center: 0,
    tagline: "Your paths run parallel — natural teammates who cover each other's blind spots without needing to be asked.",
  },
  {
    role: "Mentor", min: 3, max: 5, center: 4,
    tagline: "One of you has already walked the road the other is on — expect guidance, and occasionally, a lecture.",
  },
  {
    role: "Romance", min: 6, max: 10, center: 8,
    tagline: "Close enough to understand each other, different enough to keep it interesting — the Giantverse calls this a spark worth chasing.",
  },
  {
    role: "Rival", min: 11, max: 13, center: 12,
    tagline: "You want the same things, differently. Expect friction — and each other's best work brought out by it.",
  },
  {
    role: "Villain", min: 14, max: 16, center: 16,
    tagline: "You are the answer to the question the other refuses to ask. Opposition isn't a misunderstanding here — it's the whole story.",
  },
];

function descriptorFor(percentage: number): string {
  if (percentage >= 97) return "Absolute";
  if (percentage >= 91) return "Strong";
  return "Notable";
}

export function computeCompatibility(nameA: string, nameB: string): CompatibilityResult | CompatibilityError {
  const archetypeA = findArchetypeByName(nameA);
  if (!archetypeA) return { error: `"${nameA}" isn't a recognised Giantverse name — try the full name, like "Teyuka Kanryo".` };

  const archetypeB = findArchetypeByName(nameB);
  if (!archetypeB) return { error: `"${nameB}" isn't a recognised Giantverse name — try the full name, like "Teyuka Kanryo".` };

  const forwardDiff = wheelForwardDiff(archetypeA.id, archetypeB.id);
  const distance = Math.min(forwardDiff, WHEEL_SIZE - forwardDiff);
  const bucket = ROLE_BUCKETS.find((b) => distance >= b.min && distance <= b.max) ?? ROLE_BUCKETS[2];
  const percentage = Math.max(60, Math.min(100, Math.round(100 - Math.abs(distance - bucket.center) * 8)));

  let mentor: CompatibilityResult["mentor"];
  let mentee: CompatibilityResult["mentee"];
  let tagline = bucket.tagline;

  if (bucket.role === "Mentor") {
    // Walking forward from A reaches B within the short arc (forwardDiff
    // === distance) → B sits further along that path, so B is cast as the
    // one who's "already been there." Otherwise, A is.
    const bIsAhead = forwardDiff === distance;
    mentor = bIsAhead ? { name: nameB, archetype: archetypeB } : { name: nameA, archetype: archetypeA };
    mentee = bIsAhead ? { name: nameA, archetype: archetypeA } : { name: nameB, archetype: archetypeB };
    tagline = `${mentor.name} has already walked the road ${mentee.name} is on — expect guidance, and occasionally, a lecture.`;
  }

  return {
    nameA,
    nameB,
    archetypeA,
    archetypeB,
    distance,
    role: bucket.role,
    percentage,
    descriptor: descriptorFor(percentage),
    tagline,
    mentor,
    mentee,
  };
}
