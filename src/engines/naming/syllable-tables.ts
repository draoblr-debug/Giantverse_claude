export const DOB_SYLLABLES: Record<number, string> = {
  1: "Ka", 2: "Ki", 3: "Ku", 4: "Ke", 5: "Ko",
  6: "Sa", 7: "Shi", 8: "Su", 9: "Se", 10: "So",
  11: "Ta", 12: "Chi", 13: "Tsu", 14: "Te", 15: "To",
  16: "Na", 17: "Ni", 18: "Nu", 19: "Ne", 20: "No",
  21: "Ha", 22: "Hi", 23: "Fu", 24: "He", 25: "Ho",
  26: "Ma", 27: "Mi", 28: "Mu", 29: "Me", 30: "Ra",
  31: "Ra", // same as 30 for months that have 31 days
};

export const MONTH_SYLLABLES: Record<number, string> = {
  1: "A",   // January
  2: "I",   // February
  3: "U",   // March
  4: "E",   // April
  5: "O",   // May
  6: "Ya",  // June
  7: "Yu",  // July
  8: "Yo",  // August
  9: "Ri",  // September
  10: "Ka", // October
  11: "Na", // November
  12: "Mi", // December
};

export const MONTH_NAMES: Record<number, string> = {
  1: "January", 2: "February", 3: "March", 4: "April",
  5: "May", 6: "June", 7: "July", 8: "August",
  9: "September", 10: "October", 11: "November", 12: "December",
};

export const LETTER_SYLLABLES: Record<string, string> = {
  A: "Ka", B: "Ki", C: "Ku", D: "Ke", E: "Ko",
  F: "Sa", G: "Shi", H: "Su", I: "Se", J: "So",
  K: "Ta", L: "Chi", M: "Tsu", N: "Te", O: "To",
  P: "Na", Q: "Ni", R: "Nu", S: "Ne", T: "No",
  U: "Ha", V: "Hi", W: "Fu", X: "He", Y: "Ho", Z: "Ra",
};
