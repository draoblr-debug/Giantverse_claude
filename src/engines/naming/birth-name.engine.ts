import { DOB_SYLLABLES, MONTH_SYLLABLES, LETTER_SYLLABLES } from "./syllable-tables";

export function generateBirthName(firstName: string, dateOfBirth: Date): string {
  const day = dateOfBirth.getDate(); // 1–31
  const month = dateOfBirth.getMonth() + 1; // 1–12
  const letter = firstName[0]?.toUpperCase();

  if (!letter || !(letter in LETTER_SYLLABLES)) {
    throw new Error(`generateBirthName: firstName must start with A–Z, got "${firstName}"`);
  }

  const s1 = DOB_SYLLABLES[day];
  const s2 = MONTH_SYLLABLES[month];
  const s3 = LETTER_SYLLABLES[letter];

  const raw = `${s1}${s2}${s3}`;
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}
