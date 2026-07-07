# The Archetype Wheel

The 32 archetypes are not 32 isolated boxes. They're a 32-point compass:
`src/engines/archetype/archetype-wheel.ts` arranges every archetype id
around a circle (`WHEEL_ORDER`). Position determines two relationships:

- **Allies** — the two immediate neighbors on the wheel. The archetypes a
  person naturally drifts toward as their answers evolve over time.
- **Opposite** — the archetype exactly 180° across the wheel (`i + 16`).
  Never an enemy — someone who answers the same central question
  differently. See `OPPOSITE_TENSIONS` for the shared question behind
  each of the 16 opposite pairs.

Every archetype also carries a **Shadow** (`ArchetypeProfile.shadow` in
`archetype-definitions.ts`): what its own defining strength becomes when
taken to an unchecked extreme. Not a flaw list — a warning label. The
Philosopher's wisdom curdles into paralysis; the Survivor's resilience
curdles into distrust and isolation.

## Why it matters in conversation

`src/engines/archetype/tension.engine.ts` watches the participant's
accumulated signals turn by turn. If their leading archetype's Opposite is
scoring almost as strongly as the leader itself, `detectTension()` surfaces
that pull to the system prompt (`[TENSION]` block in
`system-prompt.builder.ts`).

The counterpart does **not** switch archetypes mid-conversation. Instead it
may gently name the shift in the moment — "Usually you seek understanding
before acting, but just now you sound more like someone who's learned to
endure first" — without ever naming a score, a dimension, or the word
"archetype" itself. Whether it says anything at all is left to the model;
forcing the observation every time it's technically true would feel
mechanical rather than perceptive.

## The 16 Opposite pairs

| Archetype | Opposite | Central Question |
|---|---|---|
| Philosopher (Tetsugaku) | Survivor (Seizon) | Should we understand first, or endure first? |
| Democrat (Minshu) | Aristocrat (Kizoku) | Should power come from everyone, or from the exceptional? |
| Bureaucrat (Kanryo) | Reformer (Kaikaku) | Should we preserve the system, or change it? |
| Strategist (Senryaku) | Guardian (Mamori) | Should we win the conflict, or protect the people? |
| Inventor (Hatsumei) | Artisan (Shokunin) | Should we create the new, or perfect the existing? |
| Diplomat (Gaiko) | Navigator (Koro) | Should we build relationships, or seek new horizons? |
| Architect (Kenchiku) | Explorer (Tansa) | Should we build a home, or discover a new one? |
| Visionary (Riso) | Custodian (Hozon) | Should we imagine tomorrow, or preserve yesterday? |
| Technocrat (Gijutsu) | Healer (Iyashi) | Should we optimize the system, or tend to the person? |
| Judge (Sabaki) | Warden (Banri) | Should justice be weighed case by case, or upheld as an unbending line? |
| Sage (Kenja) | Scout (Teisatsu) | Should we wait for wisdom to settle, or act before understanding is complete? |
| Chancellor (Sosai) | Pathfinder (Kaitaku) | Should we hold the center steady, or abandon it for the frontier? |
| Oracle (Yogen) | Builder (Kensetsu) | Should we speak the pattern before it's proven, or build only what's already real? |
| Historian (Rekishi) | Storyteller (Monogatari) | Should we preserve what happened, or keep alive the story of who we are? |
| Messenger (Shisha) | Ranger (Yuei) | Should truth be carried urgently to those who need it, or found patiently by walking between worlds? |
| Farmer (Nogyo) | Craftsman (Takumi) | Should we control every detail until it's perfect, or trust a process we can't fully control? |

## Reference

- `archetype-wheel.ts` — `WHEEL_ORDER`, `getOppositeId`, `getAllyIds`,
  `getArchetypeRelations`, `OPPOSITE_TENSIONS`.
- `tension.engine.ts` — `detectTension()`, used live during conversation.
- `archetype-definitions.ts` — each archetype's `shadow` field.
- `ArchetypeJourneyPlayer.tsx` — surfaces Allies, Opposite, and Shadow in
  the final reveal card.
