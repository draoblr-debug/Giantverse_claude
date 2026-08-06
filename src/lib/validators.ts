import { z } from "zod";

// Feb allows 29 so leap-day birthdays remain valid even without a birth year.
const DAYS_IN_MONTH: Record<number, number> = {
  1: 31, 2: 29, 3: 31, 4: 30, 5: 31, 6: 30,
  7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31,
};

// \p{L} (Unicode letter) plus \p{M} (combining marks — vowel signs,
// virama/pulli, anusvara, etc.) rather than A-Z, so names typed in Tamil,
// Kannada, Devanagari, or Telugu script validate correctly. \p{M} matters
// as much as \p{L} here: those scripts spell almost every name using
// combining marks attached to a base letter (e.g. "சங்கர்" ends in a bare
// virama), so allowing only \p{L} would still reject nearly every real
// name in those scripts.
const FIRST_NAME_PATTERN = /^\p{L}[\p{L}\p{M}'-]*$/u;

export const birthRitualSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "Enter your first name.")
      .max(50, "Keep it under 50 characters.")
      .regex(FIRST_NAME_PATTERN, "Use letters only, starting with a letter."),
    day: z.coerce.number().int().min(1, "Enter a valid day.").max(31, "Enter a valid day."),
    month: z.coerce.number().int().min(1, "Select a month.").max(12, "Select a month."),
  })
  .refine((data) => data.day <= DAYS_IN_MONTH[data.month], {
    message: "That day doesn't exist in the selected month.",
    path: ["day"],
  });

// Input: raw form values (day/month arrive as strings before coercion).
// Output: parsed values after zod coerces them to numbers.
export type BirthRitualFormInput = z.input<typeof birthRitualSchema>;
export type BirthRitualFormValues = z.output<typeof birthRitualSchema>;

// Client-side schema with locale-aware messages — takes the translated
// strings from the "birth.errors" message namespace so the live inline
// validation the user actually sees respects their selected language.
// The server route keeps the English schema above for its own (rarely
// user-visible) safety-net validation.
export function createLocalizedBirthRitualSchema(t: {
  firstNameRequired: string;
  firstNameTooLong: string;
  firstNameLettersOnly: string;
  dayInvalid: string;
  monthInvalid: string;
  dayMonthMismatch: string;
}) {
  return z
    .object({
      firstName: z
        .string()
        .trim()
        .min(1, t.firstNameRequired)
        .max(50, t.firstNameTooLong)
        .regex(FIRST_NAME_PATTERN, t.firstNameLettersOnly),
      day: z.coerce.number().int().min(1, t.dayInvalid).max(31, t.dayInvalid),
      month: z.coerce.number().int().min(1, t.monthInvalid).max(12, t.monthInvalid),
    })
    .refine((data) => data.day <= DAYS_IN_MONTH[data.month], {
      message: t.dayMonthMismatch,
      path: ["day"],
    });
}

const visualMatchInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  series: z.string().trim().min(1).max(120),
  designer: z.string().trim().min(1).max(120),
  studio: z.string().trim().min(1).max(120),
  franchise: z.string().trim().min(1).max(120),
  similarity: z.number().min(0).max(100),
  description: z.string().trim().max(500),
  shapeLanguage: z.string().trim().max(200),
  communicates: z.array(z.string().trim().max(60)).max(10),
  through: z.array(z.string().trim().max(120)).max(10),
  creatorLinks: z
    .object({
      youtube: z.string().url().optional(),
      imdb: z.string().url().optional(),
      articles: z.array(z.object({ label: z.string().max(160), url: z.string().url() })).max(5).optional(),
    })
    .optional(),
});

const turnSnapshotSchema = z.object({
  category: z.string().trim().max(80),
  scores: z.record(z.string(), z.number()).refine((s) => Object.keys(s).length <= 40, {
    message: "too many archetype scores in one turn snapshot",
  }),
});

export const dossierGenerateSchema = z.object({
  realName: z.string().trim().max(50).optional().default(""),
  birthName: z.string().trim().min(1).max(50),
  legacyName: z.string().trim().min(1).max(80),
  archetypeId: z.string().trim().min(1).max(40),
  order: z.enum(["GIANT", "HUNTER"]),
  guidingPromise: z.string().trim().min(1).max(300),
  scores: z.record(z.string(), z.number()).nullable().optional(),
  // Top-5 visual-discovery matches, when the participant went through that
  // path — rendered as individual pages in the dossier (see build_visual_
  // matches() in generate_dossier.py). Absent for name+DOB/survey-only runs.
  visualMatches: z.array(visualMatchInputSchema).max(5).optional(),
  // Per-turn score snapshots — powers the Archetype Journey Map page.
  // Absent for identities from a path that never recorded turn history.
  scoreHistory: z.array(turnSnapshotSchema).max(40).nullable().optional(),
});

// The free, single-click "Character Design Brief" — a ≤5-page PDF offered
// directly on the reveal page, distinct from the paid 111-page Dossier
// above. invisibleArchetypeIds is computed client-side by the reveal page
// (same selection reveal/page.tsx already does for its own "Invisible
// Archetypes" panel) and passed through rather than re-derived here, so
// there's exactly one place that decides which 3 archetypes those are.
export const designBriefGenerateSchema = z.object({
  birthName: z.string().trim().min(1).max(50),
  legacyName: z.string().trim().min(1).max(80),
  archetypeId: z.string().trim().min(1).max(40),
  invisibleArchetypeIds: z.array(z.string().trim().min(1).max(40)).max(3),
  order: z.enum(["GIANT", "HUNTER"]),
  guidingPromise: z.string().trim().min(1).max(300),
  scores: z.record(z.string(), z.number()).nullable().optional(),
  scoreHistory: z.array(turnSnapshotSchema).max(40).nullable().optional(),
});

// Classroom roster logging — fired once a Character Design Brief download
// actually succeeds (see reveal/page.tsx), forwarded server-side to a
// Google Sheets Apps Script webhook (tools/sheets-logger/character-log.gs).
// Deliberately thin: just enough to identify who made what, not the full
// identity payload the brief/dossier routes need.
export const characterLogSchema = z.object({
  birthName: z.string().trim().min(1).max(50),
  legacyName: z.string().trim().min(1).max(80),
  archetypeId: z.string().trim().min(1).max(40),
  archetypeLabel: z.string().trim().min(1).max(80),
  romajiName: z.string().trim().min(1).max(80),
  order: z.enum(["GIANT", "HUNTER"]),
  guidingPromise: z.string().trim().min(1).max(300),
  invisibleArchetypeLabels: z.array(z.string().trim().max(80)).max(3).optional(),
  source: z.enum(["survey", "chat", "visual"]),
});
