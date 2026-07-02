import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";

export function buildLegacyName(birthName: string, archetypeId: string): string {
  const archetype = ARCHETYPE_DEFINITIONS[archetypeId];
  if (!archetype) {
    throw new Error(`buildLegacyName: unknown archetype id "${archetypeId}"`);
  }
  return `${birthName} ${archetype.romajiName}`;
}
