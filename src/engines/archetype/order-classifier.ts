import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import type { Order } from "@/types/archetype.types";

export function classifyOrder(archetypeId: string): Order {
  const archetype = ARCHETYPE_DEFINITIONS[archetypeId];
  if (!archetype) {
    throw new Error(`classifyOrder: unknown archetype id "${archetypeId}"`);
  }
  return archetype.order;
}
