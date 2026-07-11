"""Builds a full generate_dossier.py PERSONA dict from a live participant.

Input is a JSON payload (see PayloadKeys below) produced by the Next.js app
from the participant's actual Giantverse session — the SAME archetype,
realm, wheel-position and inspiration data that already powers the live
experience (ARCHETYPE_DEFINITIONS, REALMS, the wheel engine). This module's
only job is to turn that structured data into the narrative prose shape
generate_dossier.py expects, using templates rather than inventing
per-archetype bespoke lore — so it works for any of the 32 archetypes
without new authoring per participant.

The Giantverse identity itself (name, archetype, realm, traits) is never
computed here — it arrives already decided, from the existing DOB + name +
survey engine. This module only dresses that identity in book form.
"""
from realm_lore import REALM_LORE
from guild_lore import GUILD_LORE

# A small, deliberately conservative pool of already-well-known characters
# used for the "on screen" pages. Each is tagged with the themes its design
# is genuinely, uncontroversially built around — kept at the same safe,
# design-level (not deep-plot) confidence as the book's existing Master
# Study pages, never claiming anything not widely known about the source.
SCREEN_POOL = [
    ("Tanjiro Kamado", "Demon Slayer", ["kindness", "duty", "family", "gentleness", "protection"],
     "Armor built from softness, not hardness — a fighter whose design leads with warmth."),
    ("Totoro", "My Neighbor Totoro · Studio Ghibli", ["trust", "patience", "comfort", "calm", "healing"],
     "Pure circle shape language — the design commits so fully to softness that it reads as safe instantly."),
    ("Monkey D. Luffy", "One Piece", ["freedom", "loyalty", "ambition", "recklessness", "joy"],
     "A silhouette built around one unmissable promise — the hat that survives the fill test at any size."),
    ("Spider-Man", "Marvel", ["duality", "responsibility", "wit", "agility", "sacrifice"],
     "Colour does the acting the mask cannot — a two-value palette carrying the whole performance."),
    ("Naruto Uzumaki", "Naruto", ["defiance", "belonging", "energy", "resilience", "ambition"],
     "Costume as thesis statement — a colour that refuses to be ignored, worn by a character who refuses to be either."),
    ("Violet Evergarden", "Violet Evergarden · Kyoto Animation", ["transformation", "learning", "devotion", "repair", "growth"],
     "Costume as biography — the design stages its whole arc at the hands, gloves over what they used to be."),
    ("Levi Ackerman", "Attack on Titan", ["precision", "control", "efficiency", "discipline", "restraint"],
     "No wasted motion in the design — a compact silhouette and muted palette that argue for economy over spectacle."),
    ("Rock Lee", "Naruto", ["effort", "discipline", "sincerity", "perseverance", "humility"],
     "A body drawn to look like it has memorised effort — symmetry and coiled stillness standing in for raw talent."),
    ("Edward Elric", "Fullmetal Alchemist", ["sacrifice", "ambition", "stubbornness", "loyalty", "guilt"],
     "The automail is the wound made visible — a design element that is both loss and armour at once."),
    ("Roronoa Zoro", "One Piece", ["discipline", "loyalty", "ambition", "focus", "restraint"],
     "Three blades read as a single silhouette-breaking signature — discipline made instantly legible at a glance."),
    ("Killua Zoldyck", "Hunter x Hunter", ["freedom", "agility", "restraint", "loyalty", "independence"],
     "A light, quick silhouette built to imply speed even standing still — economy of line reads as economy of motion."),
    ("Thorfinn", "Vinland Saga", ["endurance", "transformation", "peace", "guilt", "purpose"],
     "The design's arc is drawn in stance alone — from coiled aggression to open-handed calm, no costume change required."),
    ("Sailor Moon", "Sailor Moon", ["protection", "hope", "leadership", "compassion", "courage"],
     "Ornament as armour — the design proves that softness and authority are not opposites."),
    ("L Lawliet", "Death Note", ["intellect", "eccentricity", "focus", "isolation", "precision"],
     "A silhouette that breaks every convention of 'hero posture' on purpose — the design argues that this mind doesn't need to stand up straight to win."),
]

SHAPE_FAMILIES = {
    "TRIANGLE": {
        "dims": ["POWER", "LEADERSHIP", "DECISIONS"],
        "shape_word": "triangle",
        "note": "Lead with triangles in costume blocking, props and hair masses; use the opposing shape family only for the shadow-self and villain variants.",
        "why_phrase": "directional, assertive traits are triangle-family in classical design theory",
    },
    "CIRCLE": {
        "dims": ["PEOPLE", "VALUES", "DREAMS"],
        "shape_word": "circle",
        "note": "Lead with circles and soft curves in costume blocking, props and hair masses; reserve hard angles for the shadow-self and villain variants.",
        "why_phrase": "warm, connective traits are circle-family in classical design theory",
    },
    "SQUARE": {
        "dims": ["FEARS", "MOTIVATION"],
        "shape_word": "square",
        "note": "Lead with squares and stable rectangles in costume blocking, props and hair masses; use the opposing shape family only for the shadow-self and villain variants.",
        "why_phrase": "grounded, protective traits are square-family in classical design theory",
    },
}


def _shape_family(weights: dict) -> dict:
    scores = {}
    for name, fam in SHAPE_FAMILIES.items():
        scores[name] = sum(weights.get(d, 0) for d in fam["dims"])
    best = max(scores, key=lambda k: scores[k])
    return {"key": best, **SHAPE_FAMILIES[best]}


def _pick_screen_examples(traits: list, description: str, n: int = 3) -> list:
    keywords = set(w.lower().strip(".,'-") for t in traits for w in t.split())
    keywords |= set(w.lower().strip(".,'-") for w in description.split())
    scored = []
    for name, source, tags, note in SCREEN_POOL:
        overlap = len(keywords & set(tags))
        scored.append((overlap, name, source, note))
    scored.sort(key=lambda r: r[0], reverse=True)
    picks = scored[:n]
    return [[name, source, note] for _, name, source, note in picks]


def _cast_entry(role: str, title: str, sub_profile: dict, sym: str, why: str, how: str, lesson: str) -> list:
    order_label = "Order of Giants" if sub_profile["order"] == "GIANT" else "Order of Hunters"
    sub = f"{sub_profile['label']} · {sub_profile['romaji_name']} · {order_label}"
    return [role, title, sub, sym, why, how, lesson]


def _lookup_realm(realm_id):
    return REALM_LORE.get(realm_id, REALM_LORE["Maruto"])


def build_persona(payload: dict) -> dict:
    """payload keys: real_name, birth_name, legacy_name, gv_id, order,
    primary (ArchetypeProfile-shaped dict, snake_case), secondary (same
    shape), secondary_pct, confidence, wheel (order32_labels, you_idx,
    neighbour_idxs, opposite_idx, guild_idxs, central_question, growth,
    neighbours_text, compatible_text, opposite_text), realm_id."""
    primary = payload["primary"]
    secondary = payload["secondary"]
    wheel = payload["wheel"]
    realm = _lookup_realm(payload.get("realm_id"))
    guild = GUILD_LORE.get(primary["guild"], GUILD_LORE["Guild of Survivors"])

    order_full = "Giants" if payload["order"] == "GIANT" else "Hunters"
    order_short = "GIANTS" if payload["order"] == "GIANT" else "HUNTERS"

    traits = [[t, d] for t, d in zip(primary["traits"], primary["trait_descriptions"])]

    shape = _shape_family(primary["weights"])
    accent_name = f"{realm['symbol'].split(' ')[-1]} Signal" if payload["order"] == "HUNTER" else f"{realm['symbol'].split(' ')[-1]} Seal"
    palette = [row[:] for row in realm["palette"]]
    palette[-1][0] = accent_name  # rename the accent chip to this identity's accent

    screen_examples = _pick_screen_examples(primary["traits"], primary["description"])
    screen_lines = [
        [name, source, f"{note} Study how {primary['label'].lower()}-type design choices show up here: {tag_hint(primary, name)}"]
        for name, source, note in screen_examples
    ]

    self_trait0 = primary["traits"][0]
    growth = wheel["growth"]  # {"label","romaji_name","traits","description", ...}
    other_ally = wheel["other_ally"]
    quarter = wheel["quarter"]
    opposite = wheel["opposite"]
    guildmate = wheel.get("guildmate")

    cast = [
        _cast_entry(
            "THE HERO", f"The {growth['label']} You Are Becoming", growth,
            f"THE {growth['traits'][0].upper()}",
            f"Your scores already lean toward the {growth['label']} — the wheel's natural next step from {primary['label']}.",
            "They act where you deliberate, and deliberate where you act; travelling together, each of you covers the other's blind quarter.",
            f"{growth['traits'][0]} is where {self_trait0.lower()} goes next — not a departure from it.",
        ),
        _cast_entry(
            "THE HEROINE", f"The {quarter['label']} of the Crossing Path", quarter,
            f"THE {quarter['traits'][0].upper()}",
            "A quarter-turn across the wheel: close enough to understand you, far enough to surprise you.",
            f"Where your instinct says “{primary['trait_descriptions'][0]}”, theirs says “{quarter['trait_descriptions'][0]}” — and the story lives in the negotiation.",
            f"{quarter['traits'][0]} — the strength you respect most because it costs you the most to practise.",
        ),
        _cast_entry(
            "THE MENTOR", f"The Elder {guildmate['label']} of the {primary['guild']}" if guildmate else f"The Elder of the {primary['guild']}",
            guildmate or growth, f"THE {(guildmate or growth)['traits'][0].upper()}",
            f"Your own Guild, seen further down the path — proof your Calling can be answered a different way.",
            "They will not correct your path; they will show you the map of theirs and let the difference teach.",
            f"“{(guildmate or growth)['guiding_promise']}” — a promise you were never asked to make, kept by someone who shares your hall.",
        ),
        _cast_entry(
            "THE RIVAL", f"The {opposite['label']} Across the Wheel", opposite,
            f"THE {opposite['traits'][0].upper()}",
            f"You answer the same question differently: {wheel['central_question']}",
            "Every plan you make, they counter — not from malice, but from a whole life of the other answer. Beating them requires understanding them.",
            "The day you can argue their answer at full strength is the day your own answer becomes earned instead of inherited.",
        ),
        _cast_entry(
            "THE ALLY", f"The {other_ally['label']} at Your Shoulder", other_ally,
            f"THE {other_ally['traits'][0].upper()}",
            "Your other wheel-neighbour — near enough to trust on sight, different enough to be useful.",
            "No speeches, no ceremony: they simply appear where you need a second pair of hands, already working.",
            f"{other_ally['traits'][0]} — offered so casually you'll almost miss that it's a discipline.",
        ),
        [
            "THE MONSTER", f"The Beast of {primary['shadow_trait']}", "A figure beyond the wheel", "◆",
            f"Every archetype's shadow, loosed into the world, takes a shape. Yours is {primary['shadow_trait'].lower()}, made vast, made hungry.",
            f"{primary['shadow_description']} As a creature, it does this to whole villages at a time.",
            "It cannot be slain by your strength — your strength is what feeds it. It is starved by the thing you find hardest.",
        ],
        _cast_entry(
            "THE VILLAIN", f"The Fallen {opposite['label']}", opposite, f"THE {opposite['shadow_trait'].upper()}",
            "Not your opposite — your opposite's shadow, with an army and a grievance.",
            f"{opposite['shadow_description']} They believe, sincerely, that this is the only answer left to the question you both carry.",
            "They are what your Rival becomes without you — which means your Rival is what they could have been with you.",
        ),
        [
            "THE SHADOW SELF", f"The {primary['label']}, Unchecked",
            f"{primary['label']} · {primary['romaji_name']} · {order_full}", f"THE {realm['symbol'].upper()}",
            f"{primary['shadow_trait']}: your own signature strength, {self_trait0.lower()}, taken to the extreme where it stops serving anyone.",
            primary["shadow_description"],
            "The shadow is not defeated once. It is out-practised daily — usually by borrowing one habit from your Opposite.",
        ],
    ]

    team = [
        [growth["romaji_name"].upper(), growth["label"], f"Momentum — the {growth['label']} converts your {self_trait0.lower()} into motion."],
        [guildmate["romaji_name"].upper() if guildmate else growth["romaji_name"].upper(),
         guildmate["label"] if guildmate else growth["label"],
         "Perspective — a fellow member of your Guild, fluent in your Calling's craft." if guildmate else "Perspective — someone who has already paid for the lessons you're about to buy."],
        [quarter["romaji_name"].upper(), quarter["label"], f"Depth — the quarter-turn companion, fluent in what you find hardest."],
    ]

    journey = [
        ["Why You Were Chosen",
         f"{payload['legacy_name']} was not chosen for being flawless. The Order of {order_full} marked them because, "
         f"of everyone in {realm['realm_name']}, they alone answered the old question the way a {primary['label']} must — "
         f"{primary['description']} The Giant Hunt does not summon the strongest. It summons the necessary."],
        ["The Quest",
         f"To carry {realm['symbol'].lower()} across all five realms and prove that “{payload['guiding_promise']}” is not "
         f"a motto but a method — sealing their name, {payload['birth_name']} become {payload['legacy_name']}, into the record of the Hunt."],
        ["The Greatest Fear",
         f"Not death, and not defeat — {primary['shadow_trait'].lower()}. {primary['shadow_description']} {payload['legacy_name']} has seen "
         f"this happen to greater {primary['label']}s, and lies awake knowing the difference between them was never talent."],
        ["The Hidden Strength",
         f"Beneath the {primary['label']} runs a quieter current of the {growth['label']}: {growth['traits'][0].lower()}, surfacing "
         f"exactly when the primary path fails. Enemies who prepare for a {primary['label']} are never prepared for that."],
        ["The Greatest Trial",
         f"The Hunt will force the question the wheel has always asked of them — and their answer will pull them toward the "
         f"{growth['label']}'s path or harden them against it. The trial is not the Giant. The trial is choosing, at full cost, "
         f"in front of everyone, what a {primary['label']} is for."],
        ["The Transformation",
         f"They enter the Hunt a {primary['label']} and leave something the wheel has no single name for: a {primary['label']} "
         f"who has learned the {growth['label']}'s craft without surrendering their own {self_trait0.lower()}. The shadow of "
         f"{primary['shadow_trait'].lower()} does not vanish — it is finally, daily, out-practised."],
        ["The Final Destiny",
         f"A place among the {order_full}' honoured names — the {primary['label']} whose path becomes a route others can walk, "
         f"whose {self_trait0.lower()} outlives the Hunt that demanded it."],
    ]

    wound_page = {
        "title": "Writing the Wound",
        "intro": "Your record already contains the raw material — read it as a psychologist, then draw it as a designer.",
        "blocks": [
            ["THE WOUND", f"Every {primary['label']} design starts from what was survived. Your realm supplies it: "
                          f"{realm['realm_name']}, {realm['realm_tagline'][0].lower()}{realm['realm_tagline'][1:]} "
                          f"Decide the ONE event your character measures all others against — you never have to draw the event, only its receipts."],
            ["THE COMPENSATION", f"{primary['shadow_trait']} is the shadow — which means the design should visibly over-express "
                                 f"{self_trait0.lower()}: give it a physical tell the audience can spot before the character speaks a word."],
            ["THE SOFT CONTRADICTION", f"Give the design one element that argues with the wound — something kept, repaired, or worn "
                                       f"openly against the character's better judgement, echoing {realm['symbol'].lower()}. The contradiction is where the audience falls in love."],
            ["THE BODY REMEMBERS", f"Posture is the wound made visible. Write three physical habits that reveal "
                                   f"{primary['shadow_trait'].lower()} before the story does; draw two of them."],
        ],
    }

    facets_source = payload.get("facets")
    facets = facets_source if facets_source else [
        ["Leadership", int(min(95, 30 + primary["weights"].get("LEADERSHIP", 0) * 25))],
        ["Creativity", int(min(95, 35 + primary["weights"].get("DREAMS", 0) * 22))],
        ["Discipline", int(min(95, 30 + primary["weights"].get("DECISIONS", 0) * 25))],
        ["Communication", int(min(95, 30 + primary["weights"].get("PEOPLE", 0) * 22))],
        ["Decision Making", int(min(95, 28 + primary["weights"].get("POWER", 0) * 22))],
    ]

    field_notes = [
        ["STRESS BEHAVIOUR", f"Under pressure, leans hardest on {self_trait0.lower()} — the same trait that defines them at their best, "
                             f"pushed until it starts to cost something. Recovery comes through naming the cost out loud."],
        ["LEARNING STYLE", f"Learns fastest through {primary['traits'][1].lower()} in low-stakes repetition, before any public test."],
        ["DECISION MAKING", f"The {primary['label']} decides through {self_trait0.lower()} first and {primary['traits'][-1].lower()} last — "
                            f"reversing that order is the most common self-reported regret of this archetype."],
    ]

    growth_note = f"{growth['label']} ({growth['romaji_name']}) — the wheel-neighbour your scores already lean toward. Growth in the Giantverse is a drift, not a leap."

    persona = {
        "real_name": payload["real_name"],
        "birth_name": payload["birth_name"],
        "legacy_name": payload["legacy_name"],
        "gv_id": payload["gv_id"],
        "order": f"Order of {order_full}",
        "order_short": order_short,
        "motto": payload["guiding_promise"],
        "archetype": primary["label"],
        "archetype_jp": primary["romaji_name"],
        "archetype_kanji": primary["japanese_name"],
        "archetype_desc": primary["description"],
        "confidence": payload.get("confidence", 78),
        "secondary": secondary["label"],
        "secondary_jp": secondary["romaji_name"],
        "secondary_pct": payload.get("secondary_pct", 50),
        "growth_note": growth_note,
        "shadow_name": primary["shadow_trait"],
        "shadow_desc": primary["shadow_description"],
        "realm_name": realm["realm_name"],
        "realm_jp": realm["realm_jp"],
        "realm_desc": payload.get("realm_description", realm.get("realm_tagline", "")),
        "guild": primary["guild"],
        "guild_tagline": guild["guild_tagline"],
        "symbol": realm["symbol"],
        "symbol_meaning": realm["symbol_meaning"],
        "traits": traits,
        "facets": facets,
        "field_notes": field_notes,
        "wheel": {
            "position_note": f"Position {wheel['you_idx'] + 1} of 32 — the {primary['label']} ({primary['romaji_name']}).",
            "neighbours": f"{growth['label']} ({growth['romaji_name']}) · {other_ally['label']} ({other_ally['romaji_name']}) — the directions of natural drift as your answers evolve.",
            "compatible": wheel.get("compatible_text", f"{quarter['label']} · members of the {primary['guild']}."),
            "opposite": f"{opposite['label']} ({opposite['romaji_name']}) — not an enemy: the other answer to your shared question.",
            "question": wheel["central_question"],
            "growth": f"Toward the {growth['label']} — the neighbour your scores already lean into.",
            "order32": wheel["order32_labels"],
            "you_idx": wheel["you_idx"],
            "neighbour_idxs": wheel["neighbour_idxs"],
            "guild_idxs": wheel["guild_idxs"],
            "opposite_idx": wheel["opposite_idx"],
        },
        "lore_realm": realm["lore_realm"],
        "lore_craft": realm["lore_craft"],
        "lore_legend": realm["lore_legend"],
        "lore_guild": guild["lore_guild"],
        "lore_guild2": guild["lore_guild2"],
        "lore_story": {
            "title": f"The Record of the {primary['label']}s",
            "sub": f"The story every {primary['label']} is measured against.",
            "body": f"Long before {payload['legacy_name']} took the name, the {primary['guild']} kept a record of every "
                    f"{primary['label']} who answered the call the same way: {primary['description']} The record is not a "
                    f"list of victories — it is a list of the moment each of them chose, at cost, what a {primary['label']} is for.",
            "cultural": f"{primary['label']}s greet each other by naming the trait they're proudest of that week — a small, "
                        f"specific honesty the Guild considers more truthful than a formal title.",
            "closing": f"One day, the record-keepers will tell a story like this about {payload['legacy_name']}. The pages "
                       f"that follow — the Hero Journey — are its first draft.",
        },
        "cast": cast,
        "team": team,
        "journey": journey,
        "blueprint": {
            "shape": shape["key"],
            "shape_word": shape["shape_word"],
            "shape_note": shape["note"],
            "shape_why": f"{primary['traits'][0]} and {primary['traits'][1]} are {shape['shape_word']}-family traits in classical design theory — {shape['why_phrase']}.",
            "build": "Proportions and stance follow the archetype's Order: Giants read grounded and vertical, Hunters read agile and directional. Built to be drawn mid-action, not standing at parade rest.",
            "silhouette": f"A silhouette that leads with {shape['shape_word']}s — let {primary['traits'][0].lower()} and "
                          f"{primary['traits'][1].lower()} be visible in the outline before any detail is added.",
            "palette": palette,
            "palette_note": f"{realm['realm_name']} materials with the {accent_name} accent. Keep the accent under ten percent of the design — it should be findable, not loud.",
            "print_note": "Print note — these values are screen hexes; when working in markers or paint, match by eye against the printed chips above rather than the numbers.",
            "head": [
                ["FACE & EYES", f"Let the eyes carry {self_trait0.lower()} — the archetype's defining trait should be legible in the default expression, not just the costume."],
                ["HAIR", f"Shape family follows the {shape['shape_word']} — {'sharp, directional masses' if shape['key']=='TRIANGLE' else ('soft, rounded masses' if shape['key']=='CIRCLE' else 'blocked, even masses')}, kept simple enough to read at thumbnail size."],
                ["PERSONALITY EXPRESSION", f"Default expression carries {self_trait0.lower()}; the 'tell' — the micro-expression under stress — should hint at {primary['shadow_trait'].lower()} without stating it."],
            ],
            "head_note": "A character's shadow belongs in the acting long before it enters the plot.",
            "wardrobe": [
                ["COSTUME", f"Base layers in {realm['realm_name']} materials (see palette), cut in {shape['shape_word']}-family blocks; one field layer carrying the {primary['guild']} insignia at chest or shoulder."],
                ["ACCESSORIES", f"A worn, personal token referencing “{realm['symbol']}” — small enough for close-ups, distinctive enough for merchandise."],
                ["WEAPON / TOOL", f"Whatever best expresses {self_trait0.lower()} in use — function first, ornament second."],
                ["TEXTURES", f"Let the surface show the Order: {'ceremonial finish and clean seams' if payload['order']=='GIANT' else 'travel wear and field repairs'}, consistent with how a {primary['label']} actually lives."],
            ],
            "motion": [
                ["MOTION STYLE", f"{'Grounded holds, deliberate transitions' if shape['key']!='TRIANGLE' else 'Fast in-betweens, sharp stops'}; anticipation poses should express {self_trait0.lower()} kinetically, not just visually."],
                ["WHY", "Animation and pose sheets should express the archetype's defining trait physically, not just through costume or face."],
            ],
            "motion_note": "When you reach the pose sheets in the workbook, act these notes out physically before drawing them — five seconds of standing the way your character stands teaches more than an hour of reference-hunting.",
            "accent_name": accent_name,
        },
        "screen_examples": screen_lines,
        "screen_synthesis": f"These {primary['label'].lower()}-adjacent designs share one thing: none of them lead with the "
                            f"literal trait name. {primary['traits'][0]} is never drawn as a label — it's drawn as a choice about "
                            f"silhouette, palette, or posture that the audience feels before they can name it. That's the brief for your own design too.",
        "wound_page": wound_page,
    }
    return persona


def tag_hint(primary: dict, character_name: str) -> str:
    return f"the same instinct that defines {primary['label']} shows up as a specific, drawable design choice, not a label stated out loud."
