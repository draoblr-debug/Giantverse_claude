import { describe, expect, it } from "vitest";
import { generateBirthName } from "@/engines/naming/birth-name.engine";
import {
  DOB_SYLLABLES,
  MONTH_SYLLABLES,
  LETTER_SYLLABLES,
} from "@/engines/naming/syllable-tables";

const LETTERS = Object.keys(LETTER_SYLLABLES);

describe("generateBirthName", () => {
  it("is deterministic for identical inputs", () => {
    const dob = new Date(2000, 9, 7); // 7 October
    expect(generateBirthName("Rajeev", dob)).toBe(generateBirthName("Rajeev", dob));
  });

  it("matches the spec's worked example: Rajeev, born 7th October", () => {
    // Day 7 → "Shi", Month Oct(10) → "Ka", Letter R → "Nu"
    expect(generateBirthName("Rajeev", new Date(2000, 9, 7))).toBe("Shikanu");
  });

  it("capitalises only the first character", () => {
    const name = generateBirthName("anita", new Date(2000, 0, 1));
    expect(name[0]).toBe(name[0].toUpperCase());
    expect(name.slice(1)).toBe(name.slice(1).toLowerCase());
  });

  it("is case-insensitive on the input first letter", () => {
    const dob = new Date(2000, 4, 12);
    expect(generateBirthName("rahul", dob)).toBe(generateBirthName("RAHUL", dob));
  });

  it("throws for a first name not starting with A–Z", () => {
    expect(() => generateBirthName("3lon", new Date(2000, 0, 1))).toThrow();
    expect(() => generateBirthName("", new Date(2000, 0, 1))).toThrow();
  });

  it("produces a non-empty alphabetic string for every day of every month, 1–31", () => {
    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= 31; day++) {
        const dob = new Date(2000, month - 1, day);
        // JS Date rolls invalid day-of-month forward (e.g. Feb 30 → Mar 2);
        // only exercise combinations the calendar actually allows.
        if (dob.getMonth() !== month - 1) continue;

        const name = generateBirthName("A", dob);
        expect(name).toMatch(/^[A-Za-z]+$/);
      }
    }
  });

  it("enumerates every calendar day × letter combination (2024 leap year) and matches concatenation of the three syllable tables", () => {
    let count = 0;
    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= 31; day++) {
        const dob = new Date(2024, month - 1, day);
        if (dob.getMonth() !== month - 1) continue; // skip invalid calendar days

        for (const letter of LETTERS) {
          const raw = `${DOB_SYLLABLES[day]}${MONTH_SYLLABLES[month]}${LETTER_SYLLABLES[letter]}`;
          const expected = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();

          expect(generateBirthName(`${letter}name`, dob)).toBe(expected);
          count++;
        }
      }
    }
    // 2024 has 366 days; every (day, letter) pair across the year is exercised.
    expect(count).toBe(366 * 26);
  });
});
