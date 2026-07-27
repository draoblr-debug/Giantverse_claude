// Node-side mirrors of the small pieces of tools/dossier/content_book.py and
// persona_builder.py needed to author the ~23 "dynamic" dossier pages (see
// generate_dossier.py's tier tagging). Keep byte-identical to the Python
// originals if those change — this is a deliberate, scoped duplication
// (only what the dynamic pages touch), not a full port of the book.

export type MasterStudy = {
  character: string;
  source: string;
  principle: string;
  blocks: [string, string][];
  apply: string; // may reference {name}, {shape}, {accentName}, {shadow}, {realmName}
};

// tools/dossier/content_book.py MASTER_STUDIES — order matches master_study(0..5).
export const MASTER_STUDIES: MasterStudy[] = [
  {
    character: "Tanjiro Kamado", source: "Demon Slayer · Koyoharu Gotouge", principle: "Kindness needs armor",
    blocks: [
      ["SILHOUETTE", "A gentle rounded head over a squared uniform — circle psychology carried on a soldier's frame. You read 'kind' and 'disciplined' in the same second."],
      ["COSTUME AS INHERITANCE", "The checked haori is his father's; the hanafuda earrings are a family rite. Nothing on him is decoration — every element is inherited, which is why fans defend each one."],
      ["THE SCAR", "Placed on the forehead — the first place the eye lands after the eyes themselves. His history is literally the second thing you read."],
      ["COLOUR LOGIC", "Sea-green check against black keeps him calm amid a cast of loud palettes; the red earrings are his 5% accent, doing all the emotional pointing."],
    ],
    apply: "Your record gives {name} the same tools: a symbol to inherit, a realm whose damage stays legible, and a {shape}-family frame to carry it. Decide what your character refuses to take off — then make it small, placed where the eye lands second.",
  },
  {
    character: "Totoro", source: "My Neighbor Totoro · Studio Ghibli", principle: "Shape language at 100% purity",
    blocks: [
      ["ONE FAMILY, NO SEASONING", "Totoro is circles all the way down — body, eyes, nose, claws softened to nubs. Zero triangles. The design commits so completely that a two-year-old reads 'safe' before the first frame ends."],
      ["SILHOUETTE TEST, PASSED FOREVER", "Fill Totoro with black and you still know him — the Ghibli logo is literally that fill test, shipped on every film."],
      ["SCALE AS CHARACTER", "He is enormous and does nothing threatening with it. Size against softness is the contradiction that makes him magnetic rather than merely cute."],
      ["RESTRAINT", "Two colours, no costume, no accessories. Proof that subtraction is a design tool with no upper limit."],
    ],
    apply: "You are building the opposite commitment: {name} leads with {shape}s. Study Totoro not to copy the circle but to copy the discipline — one family, held to, at every scale, until the silhouette alone is a signature.",
  },
  {
    character: "Monkey D. Luffy", source: "One Piece · Eiichiro Oda", principle: "The silhouette is a promise",
    blocks: [
      ["THE HAT IS THE STORY", "The straw hat is a debt to be repaid — a promise worn on the head, breaking the skull's outline so it survives the fill test at any size."],
      ["SIGNATURE BREAK", "Oda gives every crew member one outline-breaking element. Luffy's hat, Zoro's three swords, Sanji's suit — a crew shot reads as pure silhouette."],
      ["SIMPLICITY IS ENDURANCE", "Vest, shorts, sandals: a design drawable ten thousand times without fatigue. Twenty-five years of weekly chapters is the argument."],
      ["SCAR ECONOMY", "Two scars, both with stories the audience watched him pay for. Damage is never texture — it is receipts."],
    ],
    apply: "Give {name} one outline-breaking element that carries a promise — your symbol worn large, a tool that will not fit a bag. Then simplify everything else until that break is the loudest shape in the fill test.",
  },
  {
    character: "Spider-Man", source: "Marvel · Steve Ditko design", principle: "Colour does the acting when the face cannot",
    blocks: [
      ["TWO-VALUE MASTERY", "Red on blue is a warm-advance / cool-recede pairing: the torso and head (story zones) come forward, the limbs sit back. The eye is steered by temperature alone."],
      ["THE MASK PROBLEM, SOLVED", "No visible face, so the eye-shapes were designed as graphic objects — enlarging and narrowing like a logo with moods. Expression without anatomy."],
      ["THE WEB-LINES", "Costume texture that doubles as construction lines — they explain the body's curvature the way a 3D wireframe would. Texture with a job."],
      ["READS AT ANY DISTANCE", "Full figure: red/blue masses. Mid-shot: spider emblem. Close-up: eye shapes. Three reading distances, three deliberate signals."],
    ],
    apply: "Your palette page caps the {accentName} accent under ten percent — Spider-Man is why that rule exists at all: hierarchy, not fireworks. Assign each of your four colours a reading distance, and let the accent own the close-up.",
  },
  {
    character: "Naruto Uzumaki", source: "Naruto · Masashi Kishimoto", principle: "Costume colour as thesis statement",
    blocks: [
      ["ORANGE, EXPLAINED", "The village shuns him; orange is the colour that refuses to be ignored. The costume argues with his circumstances — that argument IS the character."],
      ["SHAPE OVER TIME", "Spiky triangle hair (danger, energy) over a rounded jumpsuit (approachability): the contradiction of a threat who wants to be loved."],
      ["EVOLUTION WITH RECEIPTS", "Every costume change tracks an earned rank — same orange thesis, more discipline in the cut. Redesign as biography, never as reset."],
      ["THE HEADBAND SYSTEM", "One accessory carrying allegiance, plot state (scratched = rogue) and silhouette break at once. Accessories that multitask survive redesigns."],
    ],
    apply: "Ask what {name}'s costume argues with. Your shadow is {shadow} — the costume can defy it (a Survivor who wears open, welcoming layers) or confess it (armour everywhere). Both are theses; pick one on purpose.",
  },
  {
    character: "Violet Evergarden", source: "Violet Evergarden · Kyoto Animation", principle: "Costume is biography you can draw",
    blocks: [
      ["THE GLOVES", "A former weapon learning to write letters — so the design stages its whole story at her hands: white gloves over metal prosthetics. The wound and the aspiration, same location."],
      ["UNIFORM AS REBIRTH", "The Doll uniform is deliberately soft — ribbons, pleats, a silhouette with no remaining edge — worn by a character who was all edge. Costume records the direction of change."],
      ["THE BROOCH", "One emerald accessory, priced in story (a gift bought with her first earnings, matching her eyes). Small, close-up scaled, unforgettable — the accessory rulebook in one object."],
      ["ACTING THROUGH RESTRAINT", "Her expressions barely move; the animation spends its budget on hands. Where a character emotes is a design decision, not an anatomy fact."],
    ],
    apply: "Decide where {name} emotes. The blueprint gives you a default expression and a stress tell — choose the body part that betrays them (hands, jaw, shoulders) and give the workbook's expression sheet that bias.",
  },
];

// The book's last design spark (content_book.py SPARKS[-1]) — quoted once,
// on the colophon page.
export const LAST_SPARK = "Finish. The finished ugly teaches; the perfect unfinished doesn't.";

// persona_builder.py SHAPE_FAMILIES + _shape_family() — determines the
// blueprint's shape language from the primary archetype's dimension
// weights. Needed only by the dynamic "blueprint-shape" page and the
// master-study "apply" lines' {shape} placeholder.
type Dimension = "VALUES" | "FEARS" | "DREAMS" | "POWER" | "PEOPLE" | "DECISIONS" | "LEADERSHIP" | "MOTIVATION";

const SHAPE_FAMILIES: Record<string, { dims: Dimension[]; shapeWord: string; note: string; whyPhrase: string }> = {
  TRIANGLE: {
    dims: ["POWER", "LEADERSHIP", "DECISIONS"],
    shapeWord: "triangle",
    note: "Lead with triangles in costume blocking, props and hair masses; use the opposing shape family only for the shadow-self and villain variants.",
    whyPhrase: "directional, assertive traits are triangle-family in classical design theory",
  },
  CIRCLE: {
    dims: ["PEOPLE", "VALUES", "DREAMS"],
    shapeWord: "circle",
    note: "Lead with circles and soft curves in costume blocking, props and hair masses; reserve hard angles for the shadow-self and villain variants.",
    whyPhrase: "warm, connective traits are circle-family in classical design theory",
  },
  SQUARE: {
    dims: ["FEARS", "MOTIVATION"],
    shapeWord: "square",
    note: "Lead with squares and stable rectangles in costume blocking, props and hair masses; use the opposing shape family only for the shadow-self and villain variants.",
    whyPhrase: "grounded, protective traits are square-family in classical design theory",
  },
};

export function shapeFamilyOf(weights: Partial<Record<Dimension, number>>) {
  let best = "TRIANGLE";
  let bestScore = -Infinity;
  for (const [key, fam] of Object.entries(SHAPE_FAMILIES)) {
    const score = fam.dims.reduce((sum, d) => sum + (weights[d] ?? 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = key;
    }
  }
  return { key: best, ...SHAPE_FAMILIES[best] };
}

// persona_builder.py's accent_name formula (build_persona():123).
export function accentNameOf(realmSymbol: string, order: "GIANT" | "HUNTER"): string {
  const lastWord = realmSymbol.split(" ").slice(-1)[0];
  return order === "HUNTER" ? `${lastWord} Signal` : `${lastWord} Seal`;
}
