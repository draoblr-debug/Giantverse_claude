"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useSessionStore } from "@/stores/session.store";
import { selectSurveyQuestions } from "@/engines/survey/survey-selection.engine";
import { answersToSignals, type SurveyAnswers } from "@/engines/survey/survey-scoring.engine";

const LIKERT_LABELS = ["Strongly\nDisagree", "Disagree", "Neutral", "Agree", "Strongly\nAgree"];

type RevealedResult = {
  legacyName: string;
  archetype: {
    id: string;
    label: string;
    romajiName: string;
    order: "GIANT" | "HUNTER";
    guidingPromise: string;
    traits: [string, string, string, string];
  };
  scoreMap: Record<string, number>;
};

export function SurveyShell() {
  const router = useRouter();
  const { sessionId, birthName, firstName, acceptLegacyName } = useSessionStore();

  // Bumped on "Retake the Survey" so the question sample reshuffles
  // instead of drawing the identical set again.
  const [retake, setRetake] = useState(0);

  // Each session draws its own balanced 16-question survey from the
  // 112-question bank, seeded by the session so it's stable across
  // re-renders but unique per participant.
  const questions = useMemo(
    () => selectSurveyQuestions(`${sessionId ?? birthName ?? "giantverse"}-${retake}`),
    [sessionId, birthName, retake],
  );

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<RevealedResult | null>(null);
  const answeredStep = useRef(-1); // guards double-clicks within one step

  useEffect(() => {
    if (!birthName) router.replace("/birth");
  }, [birthName, router]);

  if (!birthName) return null;

  const question = questions[step];
  if (!question && !submitting && !revealed) return null;
  const total = questions.length;
  const progress = step / total;

  async function handleAnswer(value: number) {
    if (answeredStep.current === step) return;
    answeredStep.current = step;
    const nextAnswers = { ...answers, [question.id]: value };
    setAnswers(nextAnswers);

    if (step < total - 1) {
      setStep((s) => s + 1);
      return;
    }

    // Last question answered — score and reveal
    setSubmitting(true);
    setError(null);

    try {
      const signals = answersToSignals(nextAnswers, questions);

      const archetypeRes = await fetch("/api/archetype", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signals }),
      });

      if (!archetypeRes.ok) throw new Error("Could not determine your archetype.");
      const { topArchetype, scores } = await archetypeRes.json();
      const scoreMap: Record<string, number> = Object.fromEntries(
        (scores as { id: string; normalized: number }[]).map((s) => [s.id, s.normalized]),
      );

      const legacyRes = await fetch("/api/legacy-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthName, archetypeId: topArchetype.id }),
      });

      if (!legacyRes.ok) throw new Error("Could not build your legacy name.");
      const { legacyName, archetype } = await legacyRes.json();

      setRevealed({ legacyName, archetype, scoreMap });
      setSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
      answeredStep.current = -1; // allow retrying the last question
    }
  }

  function handleConfirm() {
    if (!revealed) return;
    const { legacyName, archetype, scoreMap } = revealed;
    acceptLegacyName(legacyName, archetype.id, archetype.order, archetype.label, archetype.guidingPromise, archetype.traits, scoreMap);
    router.push("/ending");
  }

  function handleRetake() {
    setRevealed(null);
    setAnswers({});
    setStep(0);
    setError(null);
    answeredStep.current = -1;
    setRetake((r) => r + 1); // reshuffles the question sample
  }

  if (submitting) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <motion.div
          className="h-10 w-10 rounded-full border-2 border-current border-t-transparent opacity-40"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <p className="text-sm opacity-50">Crystallising your name…</p>
      </div>
    );
  }

  if (revealed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center"
      >
        <p className="text-sm tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          Based on your answers, your Legacy Name is
        </p>
        <h2 className="text-3xl font-semibold">{revealed.legacyName}</h2>
        <p className="text-sm opacity-50">
          {revealed.archetype.label} ({revealed.archetype.romajiName})
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            This Is Me
          </button>
          <button
            type="button"
            onClick={handleRetake}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
          >
            Retake the Survey
          </button>
        </div>
        <p className="mt-1 max-w-xs text-xs opacity-40">
          Not feeling it? Retake the survey with a fresh set of questions.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      {/* Progress bar */}
      <div className="mb-10 w-full max-w-lg">
        <div className="h-0.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
          <motion.div
            className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="mt-2 text-right text-xs opacity-30">
          {step + 1} / {total}
        </p>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
          className="flex w-full max-w-lg flex-col items-center gap-8 text-center"
        >
          <p className="text-xl font-medium leading-relaxed">{question.text}</p>

          {question.type === "yesno" ? (
            <div className="flex gap-4">
              {(["Yes", "No"] as const).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleAnswer(label === "Yes" ? 1 : 0)}
                  className="min-w-[96px] rounded-full border border-current px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-60"
                >
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex w-full items-end justify-between gap-2">
              {LIKERT_LABELS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAnswer(i + 1)}
                  className="group flex flex-col items-center gap-2"
                >
                  <span className="block h-8 w-8 rounded-full border border-current transition-colors group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900" />
                  <span className="max-w-[60px] text-center text-[10px] leading-tight opacity-50 whitespace-pre-line">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {error && <p className="mt-8 text-sm text-red-500">{error}</p>}

      {/* Greeting on first step */}
      {step === 0 && (
        <p className="mt-12 text-sm opacity-30">
          {firstName}, answer honestly — there are no right answers.
        </p>
      )}
    </div>
  );
}
