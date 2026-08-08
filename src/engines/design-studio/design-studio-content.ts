// Static content for the Design Studio brainstorm mind map
// (components/design-studio/DesignStudioMindMap.tsx). Unlike the dossier's
// dynamic pages, almost nothing here is per-participant — these are
// universal visual-design categories every character design goes through,
// each broken into 3-4 sub-branches that are just labelled blank space for
// the participant's own brainstorming (no seed text to bias them). The two
// exceptions are the World branches and Artist References, which pull real
// content already used elsewhere in the app (realm lore, master studies,
// the participant's own visual matches) as read-only inspiration alongside
// the same brainstorm fields.

export type SubBranch = {
  id: string;
  label: string;
  placeholder: string;
};

export type Branch = {
  id: string;
  title: string;
  kicker: string;
  icon: "Smile" | "Scissors" | "Eye" | "Zap" | "Ruler" | "User" | "Shirt" | "Footprints" | "Layers" | "Gem" | "Palette" | "Globe" | "Mountain" | "Users";
  sub: SubBranch[];
  /** Read-only inspiration shown above the brainstorm fields, if any. */
  seed?: string[];
};

// ── Visual parameters ──────────────────────────────────────────────────
export const VISUAL_BRANCHES: Branch[] = [
  {
    id: "face", title: "Face Type", kicker: "HEAD & FACE", icon: "Smile",
    sub: [
      { id: "shape", label: "Face shape", placeholder: "Oval, angular, heart, square…" },
      { id: "jaw", label: "Jawline & cheekbones", placeholder: "Soft, sharp, pronounced…" },
      { id: "expression", label: "Default expression", placeholder: "What the face does at rest" },
      { id: "tell", label: "The stress \"tell\"", placeholder: "The micro-expression under pressure" },
    ],
  },
  {
    id: "hair", title: "Hairstyle", kicker: "HEAD & FACE", icon: "Scissors",
    sub: [
      { id: "silhouette", label: "Cut & silhouette", placeholder: "Length, spikes, flow, mass grouping…" },
      { id: "color", label: "Colour", placeholder: "Natural or stylised, gradient, streaks…" },
      { id: "texture", label: "Texture & movement", placeholder: "Straight, coiled, windswept, weighted…" },
      { id: "adornment", label: "Hair accessories", placeholder: "Pins, beads, wraps, headbands…" },
    ],
  },
  {
    id: "eyes", title: "Eye Colour & Shape", kicker: "HEAD & FACE", icon: "Eye",
    sub: [
      { id: "shape", label: "Eye shape", placeholder: "Tapered, round, hooded, upturned…" },
      { id: "color", label: "Eye colour", placeholder: "Realistic or symbolic (e.g. tied to your symbol)" },
      { id: "brows", label: "Eyebrow style", placeholder: "Thick, thin, angled, scarred through…" },
      { id: "special", label: "Anything unusual", placeholder: "Heterochromia, glow, markings…" },
    ],
  },
  {
    id: "scars", title: "Scars & Marks", kicker: "HEAD & FACE", icon: "Zap",
    sub: [
      { id: "location", label: "Location", placeholder: "Where the eye lands second, per the blueprint" },
      { id: "origin", label: "Origin story", placeholder: "What caused it — you never have to draw the event" },
      { id: "treatment", label: "Visual treatment", placeholder: "Clean line, jagged, faded, glowing…" },
      { id: "meaning", label: "What it signals", placeholder: "Pride, shame, hidden, worn openly…" },
    ],
  },
  {
    id: "body", title: "Body Type & Height", kicker: "BUILD", icon: "Ruler",
    sub: [
      { id: "build", label: "Build", placeholder: "Lean, stocky, agile, powerful…" },
      { id: "height", label: "Height reference", placeholder: "Head-count, relative to cast…" },
      { id: "posture", label: "Posture & stance", placeholder: "Weight distribution, default stance" },
      { id: "proportion", label: "Proportion notes", placeholder: "Limb ratio, torso length…" },
    ],
  },
  {
    id: "topwear", title: "Top Wear", kicker: "WARDROBE", icon: "Shirt",
    sub: [
      { id: "silhouette", label: "Silhouette", placeholder: "Fitted, layered, oversized…" },
      { id: "layering", label: "Layering", placeholder: "How many layers, what order" },
      { id: "fabric", label: "Fabric", placeholder: "Weight, drape, sheen…" },
      { id: "details", label: "Closures & details", placeholder: "Buttons, ties, wraps, seams…" },
    ],
  },
  {
    id: "bottomwear", title: "Bottom Wear", kicker: "WARDROBE", icon: "Shirt",
    sub: [
      { id: "silhouette", label: "Silhouette", placeholder: "Wide, tapered, layered, asymmetric…" },
      { id: "fit", label: "Fit & movement", placeholder: "How it moves in action poses" },
      { id: "fabric", label: "Fabric", placeholder: "Matches or contrasts the top?" },
      { id: "details", label: "Details", placeholder: "Pockets, straps, wraps, patches…" },
    ],
  },
  {
    id: "footwear", title: "Footwear", kicker: "WARDROBE", icon: "Footprints",
    sub: [
      { id: "style", label: "Style", placeholder: "Boots, sandals, wraps, bare…" },
      { id: "material", label: "Material", placeholder: "Leather, cloth, metal-shod…" },
      { id: "wear", label: "Condition", placeholder: "Pristine, worn, repaired…" },
      { id: "function", label: "Function", placeholder: "Built for terrain, speed, ceremony…" },
    ],
  },
  {
    id: "costume", title: "Costume Variations", kicker: "WARDROBE", icon: "Layers",
    sub: [
      { id: "everyday", label: "Everyday / casual", placeholder: "What they wear when off-duty" },
      { id: "action", label: "Battle / action state", placeholder: "What changes when it matters" },
      { id: "formal", label: "Formal / ceremonial", placeholder: "For guild or realm occasions" },
      { id: "damaged", label: "Damaged / worn state", placeholder: "How the costume shows a fight" },
    ],
  },
  {
    id: "accessories", title: "Accessories", kicker: "DETAIL", icon: "Gem",
    sub: [
      { id: "signature", label: "Signature item", placeholder: "The one outline-breaking element" },
      { id: "tools", label: "Functional tools", placeholder: "Weapon, kit, instrument…" },
      { id: "jewelry", label: "Jewelry / adornment", placeholder: "Rings, cuffs, piercings…" },
      { id: "markers", label: "Guild / Realm markers", placeholder: "Insignia, seals, patches…" },
    ],
  },
  {
    id: "materials", title: "Materials & Textures", kicker: "DETAIL", icon: "Layers",
    sub: [
      { id: "primary", label: "Primary material", placeholder: "What most of the design is made of" },
      { id: "secondary", label: "Secondary material", placeholder: "The contrast material" },
      { id: "wear", label: "Wear patterns", placeholder: "Where damage/repair shows first" },
      { id: "realm", label: "Realm-native materials", placeholder: "What your Realm would actually supply" },
    ],
  },
  {
    id: "design-language", title: "Design Language", kicker: "STYLE DIRECTION", icon: "Palette",
    seed: [
      "Reference styles to react to, mix, or reject — not a menu to pick one from:",
      "Shonen Anime · Seinen / Gritty Realism · Studio Ghibli Warmth · Western Comic Bold-Line · Pixar/3D Stylised · Cyberpunk Techwear · Traditional Folk Dress · High Fantasy Ornate · Minimalist Graphic",
    ],
    sub: [
      { id: "primary-ref", label: "Primary reference style", placeholder: "Which one pulls you first, and why" },
      { id: "secondary-ref", label: "Secondary reference style", placeholder: "What you'd blend in" },
      { id: "reject", label: "What you're deliberately avoiding", placeholder: "A style that would fight your archetype" },
      { id: "hybrid", label: "Your hybrid direction", placeholder: "One sentence describing the mix that's yours" },
    ],
  },
];

// ── World ─────────────────────────────────────────────────────────────
export function worldBranches(realmName: string, realmJp: string, symbol: string, loreRealm: [string, string][]): Branch[] {
  const cultureBlock = loreRealm.find(([lab]) => lab === "CULTURE")?.[1];
  const traditionsBlock = loreRealm.find(([lab]) => lab === "TRADITIONS")?.[1];
  return [
    {
      id: "world-research", title: "World Research", kicker: "LORE", icon: "Globe",
      seed: [
        `${realmName} (${realmJp}) — Symbol: ${symbol}`,
        cultureBlock ? `Culture: ${cultureBlock}` : "",
        traditionsBlock ? `Traditions: ${traditionsBlock}` : "",
      ].filter(Boolean),
      sub: [
        { id: "history", label: "History reference", placeholder: "Real-world periods/places this realm echoes" },
        { id: "culture", label: "Culture & society", placeholder: "Class, ritual, daily life notes" },
        { id: "architecture", label: "Architecture & materials", placeholder: "What buildings/props look like here" },
        { id: "symbols", label: "Symbols & traditions", placeholder: "Marks, ceremonies, taboos" },
      ],
    },
    {
      id: "world-parameters", title: "World Parameters", kicker: "SETTING DIMENSIONS", icon: "Mountain",
      seed: [
        "Setting dimensions to pin down before drawing environments:",
        "Scale (village / city / continent) · Era (see the Chronoscope epochs: Mythic Dawn, Bronze Hunt, Steam Current, Neon Pulse, Singular Horizon) · Climate & geography · Technology level · Governing Guild presence",
      ],
      sub: [
        { id: "scale", label: "Scale & geography", placeholder: "How big is the world your character moves through" },
        { id: "era", label: "Time period / era", placeholder: "Which Chronoscope epoch, or your own" },
        { id: "tech", label: "Technology level", placeholder: "What's available, what isn't" },
        { id: "guild", label: "Guild / Order presence", placeholder: "Who holds power in this setting" },
      ],
    },
  ];
}

// ── Artists & References ────────────────────────────────────────────────
export type ArtistReference = {
  name: string;
  source: string;
  principle: string;
  takeaway: string;
  origin: "matched" | "master-study";
};

// Mirrors dossier-content.ts's MASTER_STUDIES — kept as a small local copy
// (character/source/principle/one-line takeaway only) since the mind map
// only needs the reference, not the full multi-block essay.
const MASTER_STUDY_REFERENCES: ArtistReference[] = [
  { name: "Tanjiro Kamado", source: "Demon Slayer · Koyoharu Gotouge", principle: "Kindness needs armor", takeaway: "Circle-family softness on a squared, disciplined silhouette.", origin: "master-study" },
  { name: "Totoro", source: "My Neighbor Totoro · Studio Ghibli", principle: "Shape language at 100% purity", takeaway: "One shape family, held with total discipline, at every scale.", origin: "master-study" },
  { name: "Monkey D. Luffy", source: "One Piece · Eiichiro Oda", principle: "The silhouette is a promise", takeaway: "One outline-breaking signature element carries the whole story.", origin: "master-study" },
  { name: "Spider-Man", source: "Marvel · Steve Ditko design", principle: "Colour does the acting", takeaway: "Two-value palette steers the eye by temperature alone.", origin: "master-study" },
  { name: "Naruto Uzumaki", source: "Naruto · Masashi Kishimoto", principle: "Costume colour as thesis statement", takeaway: "The costume argues with the character's circumstances.", origin: "master-study" },
  { name: "Violet Evergarden", source: "Violet Evergarden · Kyoto Animation", principle: "Costume is biography you can draw", takeaway: "One priced, story-earned accessory outweighs a dozen decorative ones.", origin: "master-study" },
];

export type VisualMatchLike = {
  name: string;
  series: string;
  designer: string;
  studio: string;
  shapeLanguage: string;
};

export function buildArtistReferences(matches: VisualMatchLike[] | null | undefined): ArtistReference[] {
  const matched: ArtistReference[] = (matches ?? []).map((m) => ({
    name: m.name,
    source: `${m.series} · ${m.designer} (${m.studio})`,
    principle: m.shapeLanguage,
    takeaway: "Matched to your own face by the Visual Character Discovery engine.",
    origin: "matched" as const,
  }));
  return [...matched, ...MASTER_STUDY_REFERENCES];
}

export const ARTIST_SUB_BRANCHES: SubBranch[] = [
  { id: "borrow", label: "What I'll borrow", placeholder: "A technique or choice worth stealing" },
  { id: "avoid", label: "What I'll avoid", placeholder: "Where this reference wouldn't fit your archetype" },
  { id: "twist", label: "My twist on it", placeholder: "How you'd make it yours" },
];
