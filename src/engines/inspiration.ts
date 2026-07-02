import { INSPIRATION_GRAPH, InspirationEntry } from "@/engines/inspiration-graph";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";

export type InspirationCategory = "personalities" | "books" | "cinema" | "anime" | "games";

// The graph is keyed by English archetype names ("democrat", "scout", …)
// while the app uses romaji ids ("minshu", "teisatsu", …). Resolve via the
// archetype's label so either form of id works.
function toGraphKey(archetypeId: string): string {
  const profile = ARCHETYPE_DEFINITIONS[archetypeId];
  return (profile?.label ?? archetypeId).toLowerCase();
}

/** Full inspiration entry for a single archetype, or null if unknown. */
export function getInspiration(archetypeId: string): InspirationEntry | null {
  return INSPIRATION_GRAPH[toGraphKey(archetypeId)] || null;
}

/** A single pick for display: personalities picks 2, everything else picks 1. */
export function getInspirationHighlights(archetypeId: string): {
  personalities: string[];
  book: string | null;
  film: string | null;
} {
  const entry = getInspiration(archetypeId);
  if (!entry) return { personalities: [], book: null, film: null };
  return {
    personalities: entry.personalities.slice(0, 2),
    book: entry.books[0] || null,
    film: entry.cinema[0] || null,
  };
}

/**
 * Bridge nodes: entities that appear under BOTH given archetypes. Powers
 * combined-resonance lines when a participant scores close between two
 * archetypes rather than cleanly matching one.
 */
export function getBridgeEntities(
  archetypeIdA: string,
  archetypeIdB: string,
): { category: InspirationCategory; entity: string }[] {
  const a = getInspiration(archetypeIdA);
  const b = getInspiration(archetypeIdB);
  if (!a || !b || archetypeIdA === archetypeIdB) return [];

  const categories: InspirationCategory[] = ["personalities", "books", "cinema", "anime", "games"];
  const bridges: { category: InspirationCategory; entity: string }[] = [];

  for (const cat of categories) {
    const setB = new Set(b[cat]);
    for (const entity of a[cat]) {
      if (setB.has(entity)) bridges.push({ category: cat, entity });
    }
  }
  return bridges;
}

/**
 * Given accumulated archetype scores, returns the top 2 archetype ids by
 * score, highest first. Used to check for a combined-resonance bridge even
 * when the primary archetype has already been decided.
 */
export function getTopTwoArchetypes(
  scores: Record<string, number>,
): [string | null, string | null] {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return [sorted[0]?.[0] ?? null, sorted[1]?.[0] ?? null];
}
