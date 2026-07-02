/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// The five ecological Realms every Giantverse continent contains.
// See lore/02_realms.md in the project's RAG knowledge base for the
// full narrative version this was derived from.

export interface Realm {
  id: string;
  name: string;
  japanese: string;
  tagline: string;
  description: string;
  represents: string[];
}

export const REALMS: { [key: string]: Realm } = {
  Neisei: {
    id: "Neisei",
    name: "The Shoreline",
    japanese: "Neisei",
    tagline: "Where every journey begins.",
    description: "The coastline where continents first meet the wider world. Every citizen's story starts here, pulled outward by trade, curiosity, and the promise of connection.",
    represents: ["Connection", "Trade", "Curiosity", "Exchange", "Journey"]
  },
  Kuryo: {
    id: "Kuryo",
    name: "The Mountain Belt",
    japanese: "Kuryō",
    tagline: "Where the mind reaches for the summit.",
    description: "The high, thin-aired peaks where thought is clearest. Those drawn here chase vision, discovery, and the kind of knowledge that only comes from climbing higher than everyone else.",
    represents: ["Vision", "Aspiration", "Discovery", "Knowledge"]
  },
  Murei: {
    id: "Murei",
    name: "The Living Forest",
    japanese: "Murei",
    tagline: "Where healing takes root, slowly.",
    description: "A dense, patient forest that rewards those willing to grow at nature's pace. Trust, healing, and quiet resilience all take shape here, far from the noise of the capitals.",
    represents: ["Patience", "Healing", "Trust", "Growth"]
  },
  Maruto: {
    id: "Maruto",
    name: "The Living Heart",
    japanese: "Maruto",
    tagline: "Where civilization gathers its strength.",
    description: "The beating civic center of every continent — capitals, universities, and Guild Headquarters all rise here. This is where community becomes something larger than any one person.",
    represents: ["Civilization", "Community", "Leadership", "Prosperity"]
  },
  Harai: {
    id: "Harai",
    name: "The Broken Heart",
    japanese: "Harai",
    tagline: "Where survival becomes renewal.",
    description: "Not a fixed place, but what Maruto becomes when civilization falls out of balance. Harai is temporary by nature — when balance returns, it transforms back into Maruto, a cycle called The Great Turning.",
    represents: ["Survival", "Endurance", "Adaptation", "Renewal"]
  }
};
