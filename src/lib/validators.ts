import { z } from "zod";

// Feb allows 29 so leap-day birthdays remain valid even without a birth year.
const DAYS_IN_MONTH: Record<number, number> = {
  1: 31, 2: 29, 3: 31, 4: 30, 5: 31, 6: 30,
  7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31,
};

export const birthRitualSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "Enter your first name.")
      .max(50, "Keep it under 50 characters.")
      .regex(/^[A-Za-z][A-Za-z'-]*$/, "Use letters only, starting with A–Z."),
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

export const dossierGenerateSchema = z.object({
  realName: z.string().trim().max(50).optional().default(""),
  birthName: z.string().trim().min(1).max(50),
  legacyName: z.string().trim().min(1).max(80),
  archetypeId: z.string().trim().min(1).max(40),
  order: z.enum(["GIANT", "HUNTER"]),
  guidingPromise: z.string().trim().min(1).max(300),
  scores: z.record(z.string(), z.number()).nullable().optional(),
});
