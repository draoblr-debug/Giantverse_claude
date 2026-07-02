import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";

// The 8 Guilds every archetype belongs to. Membership is derived from
// each archetype's `guild` field in archetype-definitions.ts rather than
// duplicated here, so the two can never drift out of sync.
//
// 6 of these 8 guild names are directly confirmed by the original lore
// doc (Philosophy, Guardians, Builders, Diplomats, Strategists, Survivors).
// Governance and Artisans were added to give the remaining archetypes a
// home — see lore/04_archetypes_guilds.md for the full provenance note.

export interface Guild {
  id: string;
  name: string;
  tagline: string;
  confirmed: boolean; // false = proposed/extended, not from original lore doc
}

export const GUILDS: { [key: string]: Guild } = {
  "Guild of Philosophy": {
    id: "Guild of Philosophy",
    name: "Guild of Philosophy",
    tagline: "Seekers of truth, memory, and meaning.",
    confirmed: true,
  },
  "Guild of Governance": {
    id: "Guild of Governance",
    name: "Guild of Governance",
    tagline: "Stewards of order, law, and lasting institutions.",
    confirmed: false,
  },
  "Guild of Strategists": {
    id: "Guild of Strategists",
    name: "Guild of Strategists",
    tagline: "Those who think three moves ahead.",
    confirmed: true,
  },
  "Guild of Builders": {
    id: "Guild of Builders",
    name: "Guild of Builders",
    tagline: "Turners of vision into lasting structure.",
    confirmed: true,
  },
  "Guild of Diplomats": {
    id: "Guild of Diplomats",
    name: "Guild of Diplomats",
    tagline: "Bridges between distant shores and distant hearts.",
    confirmed: true,
  },
  "Guild of Guardians": {
    id: "Guild of Guardians",
    name: "Guild of Guardians",
    tagline: "The watch that never sleeps.",
    confirmed: true,
  },
  "Guild of Survivors": {
    id: "Guild of Survivors",
    name: "Guild of Survivors",
    tagline: "Those who endure, adapt, and begin again.",
    confirmed: true,
  },
  "Guild of Artisans": {
    id: "Guild of Artisans",
    name: "Guild of Artisans",
    tagline: "Keepers of craft, care, and what must not be lost.",
    confirmed: false,
  },
};

/** Returns every archetype id belonging to a given guild. */
export function getGuildMembers(guildId: string): string[] {
  return Object.values(ARCHETYPE_DEFINITIONS)
    .filter((a) => a.guild === guildId)
    .map((a) => a.id);
}
