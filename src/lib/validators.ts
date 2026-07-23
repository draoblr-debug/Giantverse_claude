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

export const dossierGenerateSchema = z.object({
  realName: z.string().trim().max(50).optional().default(""),
  birthName: z.string().trim().min(1).max(50),
  legacyName: z.string().trim().min(1).max(80),
  archetypeId: z.string().trim().min(1).max(40),
  order: z.enum(["GIANT", "HUNTER"]),
  guidingPromise: z.string().trim().min(1).max(300),
  scores: z.record(z.string(), z.number()).nullable().optional(),
});
