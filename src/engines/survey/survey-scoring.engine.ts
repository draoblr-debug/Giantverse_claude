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

    if (q.type === "likert") {
      confidence = (raw - 1) / 4; // 1→0.0, 5→1.0
      const labels = ["strongly disagree", "disagree", "neutral", "agree", "strongly agree"];
      value = labels[raw - 1] ?? "neutral";
    } else {
      confidence = raw === 1 ? 0.85 : 0.15;
      value = raw === 1 ? "yes" : "no";
    }

    signals.push({ dimension: q.dimension, value, confidence, turnIndex });
  });

  return signals;
}
