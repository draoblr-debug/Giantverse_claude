import type { Dimension } from "@/types/archetype.types";
import type { SurveyQuestion } from "./survey-questions";
import { QUESTION_BANK } from "./survey-question-bank";

const DIMENSIONS: Dimension[] = [
  "VALUES", "FEARS", "DREAMS", "POWER",
  "PEOPLE", "DECISIONS", "LEADERSHIP", "MOTIVATION",
];

// xmur3 string hash → mulberry32 PRNG. Deterministic for a given seed, so
// a participant's question set is stable across re-renders and reloads
// within a session, but differs between sessions.
function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rand: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Samples a balanced survey from the question bank: `perDimension`
 * questions from each of the 8 dimensions (default 2 → a 16-question
 * survey), then shuffles the presentation order so dimensions don't
 * appear in predictable blocks.
 */
export function selectSurveyQuestions(seed: string, perDimension = 2): SurveyQuestion[] {
  const rand = mulberry32(hashSeed(seed));

  const picked = DIMENSIONS.flatMap((dimension) => {
    const pool = QUESTION_BANK.filter((q) => q.dimension === dimension);
    return shuffle(pool, rand).slice(0, perDimension);
  });

  return shuffle(picked, rand);
}
