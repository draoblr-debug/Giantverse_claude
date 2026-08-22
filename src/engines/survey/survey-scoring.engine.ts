import type { Signal } from "@/types/archetype.types";
import type { SurveyQuestion } from "./survey-questions";
import { SURVEY_QUESTIONS } from "./survey-questions";

export type SurveyAnswers = Record<string, number>; // questionId → 1-5 (likert) | 1=yes/0=no (yesno)

export function answersToSignals(
  answers: SurveyAnswers,
  questions: SurveyQuestion[] = SURVEY_QUESTIONS,
): Signal[] {
  const signals: Signal[] = [];

  questions.forEach((q, turnIndex) => {
    const raw = answers[q.id];
    if (raw === undefined) return;

    let confidence: number;
    let value: string;
    let responseSignal: number;

    if (q.type === "likert") {
      confidence = (raw - 1) / 4; // 1→0.0, 5→1.0 — kept for dimensionsCovered()/UI, unrelated to scoring now
      const labels = ["strongly disagree", "disagree", "neutral", "agree", "strongly agree"];
      value = labels[raw - 1] ?? "neutral";
      // GEOMETRIC DIMENSION MODEL response mapping: 1→-1.0 … 3→0.0 … 5→+1.0.
      responseSignal = (raw - 3) / 2;
    } else {
      confidence = raw === 1 ? 0.85 : 0.15;
      value = raw === 1 ? "yes" : "no";
      // Every yes/no question in the bank (survey-questions.ts) is phrased
      // as a directional statement the participant affirms or denies
      // ("Do you have a personal code you live by?", "Do people look to
      // you for answers?") rather than a neutral factual toggle — so YES
      // is unambiguously the dimension's positive direction and NO its
      // negative, per the spec's directional-statement branch.
      responseSignal = raw === 1 ? 1 : -1;
    }

    signals.push({ dimension: q.dimension, value, confidence, turnIndex, responseSignal });
  });

  return signals;
}
