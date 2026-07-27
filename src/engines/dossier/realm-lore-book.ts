// Node-side mirror of tools/dossier/realm_lore.py's REALM_LORE — trimmed to
// just the fields the ~23 dynamic dossier pages need (realm_name/jp/symbol/
// meaning/lore_realm blocks). The full realm lore (craft, legends) stays
// Python-only since those pages are archetype-bound and pre-built; keep
// this file's values byte-identical to realm_lore.py if that file changes.
export type RealmLoreEntry = {
  realmName: string;
  realmJp: string;
  symbol: string;
  symbolMeaning: string;
  loreRealm: [string, string][];
};

export const REALM_LORE_BOOK: Record<string, RealmLoreEntry> = {
  Neisei: {
    realmName: "The Shoreline",
    realmJp: "Neisei",
    symbol: "The Open Tideline",
    symbolMeaning: "A horizon is not a wall — it is an invitation nobody has finished answering.",
    loreRealm: [
      ["ANCIENT HISTORY", "Neisei has no single founding — it re-founds itself with every ship that arrives. The oldest stones on its docks are inscribed not with names but with the questions the first traders asked: what do you have, what do you need, what will you trade to find out. Every subsequent generation adds its own line."],
      ["CULTURE", "Neisei culture treats a stranger as a story not yet heard rather than a threat not yet assessed. Wealth here is measured in routes known and contacts kept, not goods held — a Neisei native can tell you which three ports will want what you're carrying before you've decided to sell it."],
      ["TRADITIONS", "The Farewell Tide: nobody leaves Neisei without someone walking them to the waterline, because the culture holds that a departure witnessed is a return promised. It costs nothing and is never skipped."],
    ],
  },
  Kuryo: {
    realmName: "The Mountain Belt",
    realmJp: "Kuryō",
    symbol: "The Unfinished Ascent",
    symbolMeaning: "The summit is not the point — the climb rewires what you thought was possible.",
    loreRealm: [
      ["ANCIENT HISTORY", "Kuryo's earliest recorded structures are observatories, not fortresses — evidence, historians argue, that the first people to settle the high passes were driven up by curiosity about the sky, not by any need for defense."],
      ["CULTURE", "Rank in Kuryo is earned by the boldness of the question you're currently chasing, not the answers you've already banked. A senior scholar who stops asking new questions quietly loses standing, however decorated their past work."],
      ["TRADITIONS", "The First Summit: every Kuryo native is expected to name one peak — literal or intellectual — they have not yet reached, and to be able to explain, at any time, exactly what is stopping them. Having no unclimbed peak is considered a small tragedy."],
    ],
  },
  Murei: {
    realmName: "The Living Forest",
    realmJp: "Murei",
    symbol: "The Grown Ring",
    symbolMeaning: "A tree does not apologise for the years it takes — it simply keeps growing.",
    loreRealm: [
      ["ANCIENT HISTORY", "Murei's oldest institutions are not temples or courts but nurseries — literal ones, tending seedlings, and figurative ones, tending the young and the wounded. The forest is said to have been growing back over abandoned battlefields for longer than anyone can date."],
      ["CULTURE", "Murei measures a life well-lived by what it left standing for others, not by what it accomplished for itself. Patience is not a virtue here so much as a physical law — nothing in Murei is rushed, because nothing that matters ever was."],
      ["TRADITIONS", "The Quiet Season: once a year, Murei settlements observe a week where no major decisions are made and no disputes are settled — time set aside deliberately for things to heal at their own pace before anyone intervenes."],
    ],
  },
  Maruto: {
    realmName: "The Living Heart",
    realmJp: "Maruto",
    symbol: "The Open Forum",
    symbolMeaning: "A capital is not a throne room — it is the loudest room everyone is still allowed into.",
    loreRealm: [
      ["ANCIENT HISTORY", "Maruto grew from a single crossroads market into every continent's civic center, and its historians like to point out that the market never closed — it just built a government around itself."],
      ["CULTURE", "Standing in Maruto is earned in public: through the guilds, the councils, the projects everyone can see. Nothing that matters here happens quietly, because Maruto doesn't fully trust anything it hasn't watched happen."],
      ["TRADITIONS", "The Open Docket: any citizen of Maruto may bring one grievance a season directly before the ruling council, no title or sponsor required — a tradition older than most of the governments that have tried and failed to end it."],
    ],
  },
  Harai: {
    realmName: "The Broken Heart",
    realmJp: "Harai",
    symbol: "The Relit Hearth",
    symbolMeaning: "Endurance is not the absence of ash — it is the second fire.",
    loreRealm: [
      ["ANCIENT HISTORY", "Harai has no founding date because Harai is not a place — it is what Maruto becomes when balance fails. Every continent's histories record its visits: the drought years, the siege years, the years the ledgers burned. And every history records the same ending: The Great Turning, when Harai becomes Maruto again."],
      ["CULTURE", "Harai culture is triage made noble. Rank means little; usefulness means everything. Its people share tools before names and count wealth in what still works. Humour survives here in its driest, toughest form."],
      ["TRADITIONS", "The First Repair: when a community begins recovery, the first thing rebuilt is chosen by the youngest present. Whatever they pick — a well, a doorway, a toy — is restored with full ceremony, to prove that rebuilding has rules of the heart, not only of need."],
    ],
  },
};

export function lookupRealmLore(realmId: string | null | undefined): RealmLoreEntry {
  return (realmId && REALM_LORE_BOOK[realmId]) || REALM_LORE_BOOK.Maruto;
}
