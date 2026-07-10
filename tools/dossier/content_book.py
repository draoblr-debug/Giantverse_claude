# GIANTVERSE DOSSIER 2.0 — universal book content.
# Everything here is persona-independent; strings may contain {placeholders}
# that the generator fills from the persona (name, archetype, shape, etc.).
#
# QUOTE POLICY: only verified quotes are attributed plainly. Anything not
# rock-solid is explicitly labelled "paraphrased" — never invented and
# passed off as verbatim.

# ── Chapter opener quotes ────────────────────────────────────────────
# kind: "verified" (documented) | "paraphrase" (labelled as such on page)
CHAPTER_QUOTES = {
    "identity": {
        "quote": "The way to get started is to quit talking and begin doing.",
        "author": "Walt Disney",
        "kind": "verified",
        "why": "This dossier begins with who you are — but it exists so you will draw. "
               "Every page of analysis that follows is fuel for a pencil. Read it the way "
               "Disney meant it: as the shortest possible route to begin.",
    },
    "archetype": {
        "quote": "Be wrong as fast as you can.",
        "author": "Andrew Stanton · Pixar, WALL-E, Finding Nemo",
        "kind": "verified",
        "why": "An archetype reading is a first draft of a person. Treat the percentages in "
               "this chapter like Pixar treats story reels — a fast, honest guess to be "
               "improved, not a verdict to be obeyed.",
    },
    "wheel": {
        "quote": "A character should be recognisable from the silhouette of their position — who they stand beside, and who they stand against.",
        "author": "paraphrased from character-design practice popularised by Akira Toriyama's ensemble work",
        "kind": "paraphrase",
        "why": "The Wheel is the Giantverse cast photo. Where you stand on it — your "
               "neighbours, your opposite — is itself a piece of design information, and this "
               "chapter teaches you to read it like a designer.",
    },
    "lore": {
        "quote": "A character is shaped by the world that raised them, long before the artist arrives.",
        "author": "paraphrased from Hayao Miyazaki's writings on world-building",
        "kind": "paraphrase",
        "why": "Ghibli films begin with places, not faces: the town teaches you who the "
               "character must be. Read your Realm and Guild pages the same way — as the "
               "childhood your character wears.",
    },
    "cast": {
        "quote": "Not everyone can become a great artist, but a great artist can come from anywhere.",
        "author": "written by Brad Bird · Ratatouille (2007)",
        "kind": "verified",
        "why": "A cast exists to test the hero from every direction — mentor, rival, monster. "
               "Bird's line is the test each of your eight companions poses to your character: "
               "greatness has no permitted address.",
    },
    "journey": {
        "quote": "You do not draw a character. You draw a life that happens to be visible.",
        "author": "paraphrased from Glen Keane's animation lectures",
        "kind": "paraphrase",
        "why": "Keane animated Ariel and the Beast by acting the feeling before drawing the "
               "line. Your Hero Journey chapter is that feeling written down — act it before "
               "you draw a single pose.",
    },
    "blueprint": {
        "quote": "Quality is the best business plan.",
        "author": "John Lasseter",
        "kind": "verified",
        "why": "The Blueprint chapter converts everything known about you into professional "
               "design decisions. Quality here means fit — every recommendation earns its "
               "place by matching who the record says you are.",
    },
    "masterclass": {
        "quote": "Every artist has thousands of bad drawings in them, and the only way to get rid of them is to draw them out.",
        "author": "Chuck Jones · Warner Bros., Looney Tunes",
        "kind": "verified",
        "why": "Nine lessons follow. None of them will make your first drawing good — they "
               "will make your hundredth drawing extraordinary. Jones is telling you the "
               "price, and promising it is payable.",
    },
    "workbook": {
        "quote": "There is no shortcut hiding behind talent — the hand learns by repetition what the eye already knows.",
        "author": "paraphrased from Yusuke Murata's interviews on practice",
        "kind": "paraphrase",
        "why": "Murata redrew One-Punch Man chapters he had already finished, for free, "
               "because the hand could do better. These worksheets are your version of that "
               "discipline — cheap paper, honest reps.",
    },
    "hunt": {
        "quote": "Animation offers a medium of storytelling and visual entertainment which can bring pleasure and information to people of all ages everywhere in the world.",
        "author": "Walt Disney",
        "kind": "verified",
        "why": "The Giant Hunt ends with your drawing joining thousands of others — a "
               "world-record cast of original characters. This chapter is the practical "
               "bridge from your desk to that record.",
    },
}

# ── Professional Secrets (full black pages) ─────────────────────────
PRO_SECRETS = [
    {
        "secret": "Professionals don't start with faces. They start with silhouettes.",
        "gloss": "A face is a detail. A silhouette is a decision. Every studio pipeline in this book runs in that order.",
    },
    {
        "secret": "The audience remembers contrast, not detail.",
        "gloss": "One sharp value change outlives fifty perfect buckles. Spend your effort where the eye actually goes.",
    },
    {
        "secret": "Every accessory should be earned.",
        "gloss": "If you cannot say where the character got it, the audience cannot feel why they keep it.",
    },
    {
        "secret": "Rendering never fixes weak design.",
        "gloss": "Polish is a multiplier. Multiply a weak idea and you get a shinier weak idea.",
    },
    {
        "secret": "Design emotion before beauty.",
        "gloss": "Beautiful and forgettable ship together constantly. Felt and imperfect is the rarer cargo.",
    },
    {
        "secret": "The quiet poses are where personality lives.",
        "gloss": "Anyone can pose a punch. Judges look at how your character waits.",
    },
]

# ── Master Studies ───────────────────────────────────────────────────
# Each entry teaches a principle through one legendary character, then
# applies it to the reader. "apply" may use {name}, {archetype}, {shape},
# {accent_name}, {shadow}.
MASTER_STUDIES = [
    {
        "character": "Tanjiro Kamado",
        "source": "Demon Slayer · Koyoharu Gotouge",
        "principle": "Kindness needs armor",
        "blocks": [
            ("SILHOUETTE", "A gentle rounded head over a squared uniform — circle psychology carried on a soldier's frame. You read 'kind' and 'disciplined' in the same second."),
            ("COSTUME AS INHERITANCE", "The checked haori is his father's; the hanafuda earrings are a family rite. Nothing on him is decoration — every element is inherited, which is why fans defend each one."),
            ("THE SCAR", "Placed on the forehead — the first place the eye lands after the eyes themselves. His history is literally the second thing you read."),
            ("COLOUR LOGIC", "Sea-green check against black keeps him calm amid a cast of loud palettes; the red earrings are his 5% accent, doing all the emotional pointing."),
        ],
        "apply": "Your record gives {name} the same tools: a symbol to inherit, a realm whose damage stays legible, and a {shape}-family frame to carry it. Decide what your character refuses to take off — then make it small, placed where the eye lands second.",
    },
    {
        "character": "Totoro",
        "source": "My Neighbor Totoro · Studio Ghibli",
        "principle": "Shape language at 100% purity",
        "blocks": [
            ("ONE FAMILY, NO SEASONING", "Totoro is circles all the way down — body, eyes, nose, claws softened to nubs. Zero triangles. The design commits so completely that a two-year-old reads 'safe' before the first frame ends."),
            ("SILHOUETTE TEST, PASSED FOREVER", "Fill Totoro with black and you still know him — the Ghibli logo is literally that fill test, shipped on every film."),
            ("SCALE AS CHARACTER", "He is enormous and does nothing threatening with it. Size against softness is the contradiction that makes him magnetic rather than merely cute."),
            ("RESTRAINT", "Two colours, no costume, no accessories. Proof that subtraction is a design tool with no upper limit."),
        ],
        "apply": "You are building the opposite commitment: {name} leads with {shape}s. Study Totoro not to copy the circle but to copy the discipline — one family, held to, at every scale, until the silhouette alone is a signature.",
    },
    {
        "character": "Monkey D. Luffy",
        "source": "One Piece · Eiichiro Oda",
        "principle": "The silhouette is a promise",
        "blocks": [
            ("THE HAT IS THE STORY", "The straw hat is a debt to be repaid — a promise worn on the head, breaking the skull's outline so it survives the fill test at any size."),
            ("SIGNATURE BREAK", "Oda gives every crew member one outline-breaking element. Luffy's hat, Zoro's three swords, Sanji's suit — a crew shot reads as pure silhouette."),
            ("SIMPLICITY IS ENDURANCE", "Vest, shorts, sandals: a design drawable ten thousand times without fatigue. Twenty-five years of weekly chapters is the argument."),
            ("SCAR ECONOMY", "Two scars, both with stories the audience watched him pay for. Damage is never texture — it is receipts."),
        ],
        "apply": "Give {name} one outline-breaking element that carries a promise — your symbol worn large, a tool that will not fit a bag. Then simplify everything else until that break is the loudest shape in the fill test.",
    },
    {
        "character": "Spider-Man",
        "source": "Marvel · Steve Ditko design",
        "principle": "Colour does the acting when the face cannot",
        "blocks": [
            ("TWO-VALUE MASTERY", "Red on blue is a warm-advance / cool-recede pairing: the torso and head (story zones) come forward, the limbs sit back. The eye is steered by temperature alone."),
            ("THE MASK PROBLEM, SOLVED", "No visible face, so the eye-shapes were designed as graphic objects — enlarging and narrowing like a logo with moods. Expression without anatomy."),
            ("THE WEB-LINES", "Costume texture that doubles as construction lines — they explain the body's curvature the way a 3D wireframe would. Texture with a job."),
            ("READS AT ANY DISTANCE", "Full figure: red/blue masses. Mid-shot: spider emblem. Close-up: eye shapes. Three reading distances, three deliberate signals."),
        ],
        "apply": "Your palette page caps the {accent_name} accent under ten percent — Spider-Man is why that rule exists at all: hierarchy, not fireworks. Assign each of your four colours a reading distance, and let the accent own the close-up.",
    },
    {
        "character": "Naruto Uzumaki",
        "source": "Naruto · Masashi Kishimoto",
        "principle": "Costume colour as thesis statement",
        "blocks": [
            ("ORANGE, EXPLAINED", "The village shuns him; orange is the colour that refuses to be ignored. The costume argues with his circumstances — that argument IS the character."),
            ("SHAPE OVER TIME", "Spiky triangle hair (danger, energy) over a rounded jumpsuit (approachability): the contradiction of a threat who wants to be loved."),
            ("EVOLUTION WITH RECEIPTS", "Every costume change tracks an earned rank — same orange thesis, more discipline in the cut. Redesign as biography, never as reset."),
            ("THE HEADBAND SYSTEM", "One accessory carrying allegiance, plot state (scratched = rogue) and silhouette break at once. Accessories that multitask survive redesigns."),
        ],
        "apply": "Ask what {name}'s costume argues with. Your shadow is {shadow} — the costume can defy it (a Survivor who wears open, welcoming layers) or confess it (armour everywhere). Both are theses; pick one on purpose.",
    },
    {
        "character": "Violet Evergarden",
        "source": "Violet Evergarden · Kyoto Animation",
        "principle": "Costume is biography you can draw",
        "blocks": [
            ("THE GLOVES", "A former weapon learning to write letters — so the design stages its whole story at her hands: white gloves over metal prosthetics. The wound and the aspiration, same location."),
            ("UNIFORM AS REBIRTH", "The Doll uniform is deliberately soft — ribbons, pleats, a silhouette with no remaining edge — worn by a character who was all edge. Costume records the direction of change."),
            ("THE BROOCH", "One emerald accessory, priced in story (a gift bought with her first earnings, matching her eyes). Small, close-up scaled, unforgettable — the accessory rulebook in one object."),
            ("ACTING THROUGH RESTRAINT", "Her expressions barely move; the animation spends its budget on hands. Where a character emotes is a design decision, not an anatomy fact."),
        ],
        "apply": "Decide where {name} emotes. The blueprint gives you a default expression and a stress tell — choose the body part that betrays them (hands, jaw, shoulders) and give the workbook's expression sheet that bias.",
    },
]

# ── Design Like… spreads ─────────────────────────────────────────────
DESIGN_LIKE = [
    {
        "studio": "Studio Ghibli",
        "philosophy": "Character serves world; stillness is content.",
        "blocks": [
            ("MA — THE PAUSE", "Ghibli protects 'ma': beats where nothing happens so the audience can feel. Design translation — give your character one restful pose and one prop that only matters when they are still."),
            ("ORDINARY FIRST", "Ghibli heroes look like people before they look like heroes; wonder lands harder from a believable base. Keep one boring, functional garment in your design."),
            ("NATURE HAS AGENCY", "Environments act on characters — wind, rain, mud are co-stars. Your realm's weather should be visible somewhere on the costume."),
        ],
        "apply": "For your character: draw the waiting pose from the workbook FIRST, before any action pose. If the design is boring at rest, Ghibli would send it back.",
    },
    {
        "studio": "Spider-Verse",
        "philosophy": "Style is identity — every character keeps their native visual language.",
        "blocks": [
            ("ONE WORLD, MANY GRAMMARS", "Each Spider-person is rendered in their own idiom — anime cel, noir print, picture-book. The film proves styles can share a frame if each is disciplined internally."),
            ("FRAME-RATE AS CHARACTER", "Miles animates on twos while mentors move on ones — literally out of step until he masters his powers. Motion style is characterisation."),
            ("GRAPHIC HONESTY", "Halftones, chromatic offsets, hand-drawn effects — the film shows its materials. Let your linework admit it was drawn by a hand."),
        ],
        "apply": "Choose ONE stylistic signature for your sheet — a line quality, a texture, a printing flaw — and apply it with total consistency. One accent of style, like one accent of colour.",
    },
    {
        "studio": "Arcane",
        "philosophy": "Painterly surfaces over brutal clarity of shape.",
        "blocks": [
            ("PAINT ON STRUCTURE", "Arcane looks hand-painted, but under the brushwork the silhouettes are ruthless — every character passes the fill test before a single stroke lands."),
            ("TWO CITIES, TWO PALETTES", "Piltover gleams gold-and-blue; Zaun glows toxic green. Faction palette does half the storytelling before dialogue starts. Your Order and Realm are your two cities."),
            ("DAMAGE TELLS TIME", "Characters age in scars, hair changes and patched gear across acts. Design your character with one 'act two' variant in mind — what breaks, what gets repaired."),
        ],
        "apply": "Draw your turnaround clean, then produce one 'after the battle' pass: same silhouette, new damage. If the damage placement feels arbitrary, your costume logic needs work.",
    },
    {
        "studio": "Pixar",
        "philosophy": "Simplify until only the story remains.",
        "blocks": [
            ("SHAPE THESIS", "Every Pixar lead reduces to a sentence of geometry: Carl is a square (stubborn), Russell an egg (unformed), EVE an ellipse (perfect, sealed). Write your character's geometry sentence."),
            ("APPEAL ≠ PRETTY", "Appeal means the eye wants to keep looking. Asymmetry, imperfection and specificity generate appeal faster than beauty does."),
            ("RESEARCH OBSESSION", "Pixar sends artists to depths and deserts before designing a fish or a car. Your research field is this dossier — realm materials, guild tools, archetype acting notes."),
        ],
        "apply": "Write the geometry sentence for your character in the margin of the blueprint page — subject, dominant shape, contradiction. If you cannot write it, you are not ready to draw it.",
    },
]

# ── Industry breakdowns ──────────────────────────────────────────────
INDUSTRY = [
    {
        "title": "How an Anime Character Reaches the Screen",
        "intro": "The pipeline behind every anime character sheet — and why your workbook mirrors it.",
        "stages": [
            ("CONCEPT / MANGA SOURCE", "A designer or mangaka fixes the identity: silhouette, palette, signature break."),
            ("SETTEI — THE MODEL SHEET", "Turnarounds, expression sheets, hand studies at fixed head-counts — the exact sheets in your workbook. Hundreds of animators must draw the character identically; settei is the contract."),
            ("KEY ANIMATION", "Genga artists act the character in poses; the design's shape language dictates how they move."),
            ("COLOUR DESIGN", "A dedicated iro-shitei artist locks palette per lighting situation — day, dusk, battle."),
        ],
        "lesson": "Nothing in professional animation is drawn twice from imagination — it is drawn once with intent, then reproduced with discipline. Your turnaround sheet is you signing that contract with yourself.",
    },
    {
        "title": "How Pixar Builds a Character",
        "intro": "From research trip to render farm — the longest character pipeline in the industry.",
        "stages": [
            ("STORY FIRST", "No design exists until the character has a want, a flaw and an arc. Design begins as writing."),
            ("RESEARCH & SIMPLIFY", "Field research, then reduction: hundreds of sketches distilled to one geometry thesis."),
            ("SCULPT & TEST", "Maquettes and digital sculpts are lit, posed and 'acted' before approval — the fill test in three dimensions."),
            ("SIMULATION BUDGET", "Every costume element costs simulation time, so each must justify itself — the industrial version of 'every accessory is earned'."),
        ],
        "lesson": "Pixar's real secret is sequencing: psychology before geometry, geometry before costume, costume before polish. This dossier is arranged in exactly that order on purpose.",
    },
    {
        "title": "How Riot Designs a Champion",
        "intro": "Character design under the hardest constraint set in the business: readable at 1cm tall, in a crowd, in 0.2 seconds.",
        "stages": [
            ("THE FANTASY STATEMENT", "One sentence of promise — 'the blade that refuses to die' — approved before any art."),
            ("SILHOUETTE GATES", "Concepts are reviewed as black shapes at gameplay camera distance. Fail the gate, restart — rendering is not permitted to rescue a shape."),
            ("COLOUR FOR TEAMFIGHTS", "One dominant hue plus one accent, testable against thirty effects exploding at once. The 70/25/5 rule under live fire."),
            ("KIT COHERENCE", "The character's abilities must be legible from the design — a hook needs a visible hook. Form promises function."),
        ],
        "lesson": "Constraint is the best design teacher you can hire for free. Draw your character at 3cm tall as a final exam — whatever survives is the actual design.",
    },
]

# ── Behind the Giantverse Engine ─────────────────────────────────────
ENGINE_PIPELINE = [
    ("BIRTH DATA", "Name, day and month seed the syllable tables that mint your Birth Name — deterministic, so your name is a fact, not a roll."),
    ("IDENTITY", "Sixteen questions sampled from a 112-question bank, two per psychological dimension, so no two Hunts ask the same paper."),
    ("SIGNALS", "Every answer becomes a weighted signal across eight dimensions — values, fears, dreams, power, people, decisions, leadership, motivation."),
    ("ARCHETYPE", "Thirty-two archetypes score your signal profile; the leader must clear its own confidence threshold to claim you."),
    ("WHEEL POSITION", "Your archetype's seat fixes neighbours, guild-mates and your opposite — the cast chapter is computed from these adjacencies."),
    ("REALM & GUILD", "Archetype determines realm bias and guild; realm supplies materials and textures, guild supplies oath and reputation."),
    ("PSYCHOLOGY", "Dimension weights are re-projected as behavioural facets, stress behaviour and the shadow — your strength with the brakes removed."),
    ("SHAPE LANGUAGE", "Trait families map to classical shape theory: endurance and drive to triangles, order to squares, communion to circles."),
    ("PALETTE", "Realm materials set the 70/25 base; your Order's signal colour is reserved as the 5% accent."),
    ("BLUEPRINT", "Every recommendation on the design pages cites one of the layers above — nothing is arbitrary, everything is traceable."),
]

ENGINE_WHY = [
    ("WHY A QUESTION BANK?", "A fixed quiz produces fixed answers shared online within a week. Sampling from 112 questions keeps every Hunt personal and every dossier honest."),
    ("WHY CONFIDENCE, NOT CERTAINTY?", "The engine reports 82%, never 100% — because people are not lookup tables. The remainder is yours to overrule, and the retake exists for exactly that."),
    ("WHY A WHEEL AND NOT A LIST?", "Adjacency is information: growth is modelled as drift to a neighbour, rivalry as opposition across the circle. Geometry stores psychology."),
    ("WHY DOES THE SHADOW GET A PAGE?", "Design theory: villains and flaws generate more visual ideas than virtues. The shadow is your strength inverted — which makes it drawable."),
]

# ── The Exercise Ladder (premium workbook opener) ────────────────────
EXERCISE_LADDER = [
    ("1 · CIRCLES ONLY", "Draw your character using nothing but circles.", "Forces you to find the design's softness — even a triangle-lead character has circle moments, and now you know where they live."),
    ("2 · TRIANGLES ONLY", "Redraw the same pose using nothing but triangles.", "The opposite pressure. Between these two extremes, your actual shape mix reveals itself."),
    ("3 · STRIP THE GEAR", "Redraw with every accessory removed.", "If the character disappears without their props, the design is a costume rack. The body language must carry identity on its own."),
    ("4 · SILHOUETTE ONLY", "Fill the figure with solid black. No interior lines.", "The professional gate. If this fails, return to step one — nothing after this step can save a failed fill."),
    ("5 · FROM MEMORY", "Close the book. Draw the character without reference.", "Whatever you remembered is the design. Whatever you forgot was noise — consider deleting it."),
    ("6 · EXAGGERATE 150%", "Push every proportion past comfort: longer, sharper, heavier.", "Timid designs die in crowds. You can always retreat from too far; you cannot rescue too safe."),
    ("7 · SIMPLIFY TO TEN LINES", "Draw the character in ten strokes or fewer.", "The final compression. What survives ten lines is your character's true signature — protect it in every future drawing."),
]

# ── Design Sparks (rotating page-footer one-liners) ──────────────────
SPARKS = [
    "Heroes wear history.",
    "Every scar answers a question.",
    "Costume is biography.",
    "Every accessory should be earned.",
    "Silhouette before detail.",
    "Design emotion before beauty.",
    "Movement begins with shape.",
    "People remember contrast.",
    "The audience reads shape before colour.",
    "Draw the decision, not the drawing.",
    "A pose is personality under gravity.",
    "Damage is a receipt, not a texture.",
    "One accent, placed, beats five, scattered.",
    "The eye trusts asymmetry.",
    "Simplicity is what survives affection.",
    "A character who can wait can fight.",
    "Negative space is load-bearing.",
    "Style is a promise kept per panel.",
    "Detail is a spice, not a meal.",
    "The second read is where love starts.",
    "Draw ten cheap ideas before one dear one.",
    "Proportion is the first joke and the last law.",
    "An outline should gossip about its owner.",
    "Colour is temperature; temperature is intent.",
    "Nothing on the belt without a story in the bag.",
    "The fill test forgives nothing and lies never.",
    "Squares endure. Circles welcome. Triangles warn.",
    "Your character's silence should be drawable.",
    "Costume seams are the body's punctuation.",
    "What they refuse to wear is also design.",
    "Hair is shape first, strands never.",
    "Hands sell what faces oversell.",
    "The villain is the hero's habit, unsupervised.",
    "Redesign is biography, never reset.",
    "Draw the wound where the eye lands second.",
    "A silhouette is a signature you can shout.",
    "Value does the work; hue takes the credit.",
    "Every belt earns rent or moves out.",
    "The brow is the loudest muscle.",
    "Draw weight, and balance arrives free.",
    "Reference is a ladder, not a chair.",
    "Exaggeration is honesty at volume.",
    "The memorable is the removable, kept.",
    "Two shapes agree; three shapes argue.",
    "Give the eye a path or it leaves.",
    "A prop at rest tells the longest story.",
    "Design the tell before the smile.",
    "Consistency is what turns marks into style.",
    "The ground line is the first anatomy.",
    "Draw the childhood; the posture follows.",
    "An empty pocket is wasted lore.",
    "Big, medium, small — then stop.",
    "Contrast of shape beats contrast of colour.",
    "The back view is where honesty hides.",
    "Softness placed on strength reads as depth.",
    "One garment should be boring on purpose.",
    "Let the weather touch the costume.",
    "Speed lines start in the shoulders.",
    "A design is done when removal hurts.",
    "The mask is a face you get to design.",
    "Draw the promise the character made.",
    "Texture must pay for its noise.",
    "Every palette needs a bored colour.",
    "The first thumbnail is a throat-clearing.",
    "Act it for five seconds; draw it for an hour.",
    "Your line weight is your voice volume.",
    "Symmetry is a mask; break it to breathe.",
    "The icon survives the illustration.",
    "Feet placement is a personality test.",
    "A good rival shares your question.",
    "Shadow is strength with the brakes cut.",
    "Own one shape family; borrow the second.",
    "The eye reads warm first.",
    "A cape is a silhouette subscription.",
    "Design for the crowd shot.",
    "What breaks in act two is designed in act one.",
    "Charm is specificity, repeated.",
    "The sketch knows; the render obeys.",
    "Never let polish vote on ideas.",
    "A signature break makes fan art possible.",
    "Draw the job before the hero.",
    "Every uniform hides one act of rebellion.",
    "Age lives in posture before wrinkles.",
    "The palette is a cast; the accent is the lead.",
    "Read order: shape, colour, face, detail.",
    "The strongest line is the one you removed.",
    "Backstory you can't draw is trivia.",
    "Small accessory, close-up sized, story priced.",
    "Thumbnails are where courage is cheap.",
    "One curve against straights sings.",
    "If everything is sharp, nothing cuts.",
    "The turnaround is a contract with your hand.",
    "Villains simplify; heroes accumulate.",
    "Let the silhouette make the promise.",
    "Draw until the eraser gets suspicious.",
    "A team reads as a chord of shapes.",
    "Design the exhale, not just the strike.",
    "Familiar body, one impossible thing.",
    "The last detail added is the first to cut.",
    "Paper is cheap. Timidity is expensive.",
    "Finish. The finished ugly teaches; the perfect unfinished doesn't.",
]

# ── Designer commentary boxes (persona-independent frames) ───────────
# The generator inserts these onto existing pages; text may use persona
# placeholders.
COMMENTARY = {
    "traits": "WHY THIS MATTERS — Four traits is a designer's number: one per limb of the silhouette. When you reach the workbook, assign each trait a physical home — a stance, a garment, a prop, a scar — and the abstract becomes drawable.",
    "lore_craft": "WHY THIS MATTERS — {realm_name} culture keeps damage legible, so your costume carries visible repairs. Costume becomes biography: every seam is a sentence about a day the character survived.",
    "cast": "WHY THIS MATTERS — Ensemble design is contrast management. Eight briefs above, one rule beneath them all: no two silhouettes may agree. The cast exists to make YOUR outline unmistakable in the group shot.",
    "blueprint_shape": "WHY THIS MATTERS — {shape}s appear here because your two strongest traits sit in the {shape}-family of classical shape theory. When a recommendation and your instinct disagree, your instinct wins — but now it argues against a stated reason, which sharpens both.",
}

# ── The nine masterclass lessons (preserved from Dossier 1.0) ────────
MASTERCLASS = [
    ("What Character Design Actually Is", "Character design is decision-making made visible — not rendering skill.", [
        ("THE JOB", "A character design answers three questions at a glance: who is this, what do they want, and what will they do to get it. Every line either supports one of those answers or dilutes it."),
        ("READ ORDER", "Viewers read silhouette first, colour second, face third, details last. Budget your effort in exactly that order — a perfect eye on a mushy silhouette is wasted work."),
        ("THE ONE-SENTENCE TEST", "Before drawing, write your character in one sentence including a contradiction: 'a gentle giant terrified of breaking things.' Contradiction is what makes a design feel alive rather than assembled."),
        ("ITERATION", "Professionals draw ten cheap thumbnails before one expensive drawing. Quantity first, quality second — the good design is usually hiding around thumbnail seven."),
    ]),
    ("Anime Construction Basics", "Anime style is a construction method, not a shortcut.", [
        ("HEAD FIRST", "The head unit measures everything: standard anime bodies run 6–7.5 heads tall. Pick your head count and hold it on every sheet — inconsistency here is the most common beginner tell."),
        ("THE CRANIUM + JAW", "Build the head as a ball (cranium) plus a wedge (jaw). The eye-line sits lower than realism — roughly halfway or below — leaving the large forehead the style expects."),
        ("EYES AS DESIGN OBJECTS", "Anime eyes are designed shapes, not anatomy. Decide your character's eye shape (frame, iris size, highlight count) once, on the eye sheet, then treat it as a logo: reproduce, don't reinvent."),
        ("LINE ECONOMY", "The style's power is selective detail: dense information at face, hands and costume focal points; near-empty simplicity everywhere else. If everything is detailed, nothing is."),
    ]),
    ("Shape Language", "Circles feel friendly, squares feel reliable, triangles feel dangerous — audiences know this before they know they know it.", [
        ("THE THREE FAMILIES", "Circle: approachable, soft, trustworthy. Square: stable, strong, stubborn. Triangle: fast, sharp, threatening. Every memorable character leads with one family and seasons with a second."),
        ("WHERE IT LIVES", "Shape language operates at every scale — overall silhouette, costume blocks, hair masses, even eyebrow angles. Consistency across scales is what makes a design feel inevitable."),
        ("CONTRAST FOR CAST", "Give allies contrasting shape families so group shots read instantly. Your dossier's companion pages specify contrasts for exactly this reason."),
        ("BREAKING THE RULE", "A round-shaped villain or triangular healer is a deliberate, powerful choice — but only reads as deliberate if the rest of the design is disciplined."),
    ]),
    ("Silhouette", "If the design works filled with solid black, it works.", [
        ("THE FILL TEST", "Flood your character with black. Can you still tell who it is, what they carry, and what they're feeling? That's the whole test, and professionals run it on every pass."),
        ("POCKETS OF SKY", "Strong silhouettes trap negative space — the gap inside a bent elbow, between blade and hip. These 'pockets of sky' are what make an outline legible at thumbnail size."),
        ("THE BIG-MEDIUM-SMALL RULE", "Divide the silhouette into one big mass, one medium, one small. Equal-sized masses read as noise; the 60/30/10 rhythm reads as design."),
        ("SIGNATURE BREAK", "Give the outline one element that breaks its overall flow — a trailing sash, an asymmetric shoulder, your symbol worn large. That break is what fan artists will draw first."),
    ]),
    ("Costume Design", "Costume is biography you can draw.", [
        ("FUNCTION FIRST", "Every costume element should answer 'why do they wear this?' — climate, work, rank, memory. Your realm's lore pages list the materials; use them as your fabric store."),
        ("LAYER LOGIC", "Build in layers with a story: base layer (climate), work layer (calling), status layer (order/rank), personal layer (the keepsake). A costume with layer logic survives redesigns and spin-offs."),
        ("WEAR AND TEAR", "Decide where the costume is worn, patched or stained. Damage placement tells the audience how this body moves and what it has survived — cheaper than a backstory page."),
        ("THE 70/25/5 PALETTE", "Dominant colour 70%, secondary 25%, accent 5%. Your dossier palette page is pre-mixed to this ratio — the accent is your Order colour."),
    ]),
    ("Colour Theory for Characters", "Colour is emotional shorthand — spend it deliberately.", [
        ("VALUE BEFORE HUE", "Convert to greyscale: if the design muddies, no hue choice will save it. Aim for three clearly separated value zones before choosing a single colour."),
        ("TEMPERATURE TELLS", "Warm colours advance and invite; cool colours recede and compose. A cool character with one warm element (eyes, a scarf, a scar) directs attention exactly where you want it."),
        ("SATURATION DISCIPLINE", "Full saturation everywhere exhausts the eye. Keep large areas muted and let small areas sing — your 5% accent should be the most saturated note in the design."),
        ("COLOUR SCRIPTING", "Plan how the palette shifts with story mood: the same character at their darkest hour, desaturated; at triumph, accent blazing. One palette, scripted, beats five palettes."),
    ]),
    ("Expression Design", "A character who can only make one face is a statue.", [
        ("THE CORE SIX", "Master your character's joy, anger, sorrow, fear, surprise and disgust before inventing subtle blends. The expression sheet in your workbook is laid out for exactly these."),
        ("ASYMMETRY IS LIFE", "Real expressions are asymmetric — one brow leads, one mouth corner wins. Perfectly mirrored faces read as masks."),
        ("THE CHARACTER FILTER", "Run every emotion through personality: how does THIS character do anger — loud, cold, smiling? Your archetype's field notes (stress behaviour) are the acting reference."),
        ("EYEBROWS DO THE WORK", "In anime construction, brows and upper lids carry most of the emotional signal. When an expression isn't landing, fix the brows before touching anything else."),
    ]),
    ("Pose Design", "Pose is personality under gravity.", [
        ("LINE OF ACTION", "Every pose starts as a single curved line — the spine of the idea. Draw it first, then hang the body on it. Poses built limb-by-limb read stiff no matter how well rendered."),
        ("WEIGHT AND BALANCE", "Decide where the mass sits: a guardian plants weight through both heels; a scout floats it on the balls of the feet. Your blueprint's motion notes specify your character's default."),
        ("SILHOUETTE AGAIN", "Run the fill test on every pose. Clear poses keep limbs off the torso's mass and trap negative space. If elbows vanish into ribs, rotate the pose, don't render harder."),
        ("STORY POSES", "Beyond action: design a waiting pose, a losing pose, a lying pose. The quiet poses are where personality actually lives — and where judges look for it."),
    ]),
    ("Professional Workflow", "How working designers get from blank page to final sheet.", [
        ("THUMBNAILS (10+)", "Tiny, fast, fearless. No erasing, no faces, silhouette only. You are shopping for an idea, not making a drawing."),
        ("CONSTRUCTION PASS", "Take the winning thumbnail to full size in simple volumes — head unit, ribcage, pelvis, limb cylinders. Fix proportion here; it is ten times cheaper than fixing it in line."),
        ("DESIGN PASS", "Costume blocks, hair masses, props — still no detail. Run the fill test and the 70/25/5 palette in flats."),
        ("FINAL LINE & PRESENTATION", "Clean line weight (thicker outside, thinner inside), flat colour, minimal shading. Present on the turnaround sheet: front, side, back, same head count, same ground line. This is the format the Giant Hunt expects."),
    ]),
]

# ── Workbook sheets (preserved) ──────────────────────────────────────
# type: "figure" (head-unit ruler + ground line), "grid" (labelled cells)
WORKBOOK_SHEETS = [
    {"title": "Front View", "note": "Symmetry over the centre line; weight even through both feet.", "type": "figure", "caption": "FRONT VIEW"},
    {"title": "Side View", "note": "Same head count, same ground line. Check the ear sits behind the centre of the skull; spine curves in a soft S.", "type": "figure", "caption": "SIDE VIEW"},
    {"title": "Back View", "note": "The forgotten view judges love to check. Hair mass, costume back, and how the silhouette reads without a face.", "type": "figure", "caption": "BACK VIEW"},
    {"title": "Turnaround", "note": "All four angles on one sheet, features aligned across the guide rows. This is the Giant Hunt's expected presentation format.", "type": "grid", "cells": ["FRONT", "3/4", "SIDE", "BACK"], "cols": 4, "tall": True},
    {"title": "Head Construction Grid", "note": "Cranium ball + jaw wedge at three angles. Keep the eye line consistent — it's the anchor for everything else.", "type": "grid", "cells": ["FRONT", "SIDE", "3/4"], "cols": 3, "tall": True, "eyeline": True},
    {"title": "Eye Sheet", "note": "Design the eye once, like a logo: shape, iris size, highlight count. Then repeat until your hand knows it.", "type": "grid", "cells": ["", "", "", "", "", "", "", ""], "cols": 4},
    {"title": "Expression Sheet", "note": "The core six plus two signature blends. Brows first — they carry the signal.", "type": "grid", "cells": ["JOY", "ANGER", "SORROW", "FEAR", "SURPRISE", "DISGUST", "SIGNATURE 1", "SIGNATURE 2", "AT REST"], "cols": 3},
    {"title": "Hair Sheet", "note": "Hair as 2–3 large masses, not strands. Explore front, side and motion states.", "type": "grid", "cells": ["FRONT", "SIDE", "BACK", "WIND", "WET / DOWN", "ACTION"], "cols": 3},
    {"title": "Pose Sheet", "note": "Quiet poses: standing, waiting, thinking, losing. Line of action first — one curve, then the body.", "type": "grid", "cells": ["DEFAULT STANCE", "WAITING", "THINKING", "DEFEATED"], "cols": 2, "tall": True},
    {"title": "Action Pose", "note": "One full-sheet action pose. Push the line of action 20% further than feels safe — paper is cheap.", "type": "figure", "caption": "ACTION POSE"},
    {"title": "Hand Sheet", "note": "Mitten-block first, fingers second. Hands sell effort — practise the grips your weapon needs.", "type": "grid", "cells": ["OPEN", "FIST", "POINT", "GRIP TOOL", "GRIP WEAPON", "RELAXED", "PALM UP", "REACH", "PINCH", "THUMBS UP", "FLAT", "YOUR CHOICE"], "cols": 4},
    {"title": "Costume Sheet", "note": "Layer logic: base, work, status, personal. Call out materials from your realm's lore pages.", "type": "figure", "caption": "COSTUME STUDY"},
    {"title": "Weapon / Tool Sheet", "note": "Draw it as a used object: wear at the grip, maintenance marks, how it's carried when NOT in use.", "type": "grid", "cells": ["FULL VIEW", "GRIP DETAIL", "CARRIED / STOWED", "IN ACTION"], "cols": 2, "tall": True},
]
