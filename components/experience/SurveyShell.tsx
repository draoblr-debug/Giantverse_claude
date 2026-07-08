"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useSessionStore } from "@/stores/session.store";
import { selectSurveyQuestions } from "@/engines/survey/survey-selection.engine";
import { answersToSignals, type SurveyAnswers } from "@/engines/survey/survey-scoring.engine";
import { buildScoreHistory } from "@/engines/archetype/journey-history";
import type { TurnSnapshot } from "@/lib/journey-renderer";
import { ArchetypeJourneyPlayer } from "@/components/experience/ArchetypeJourneyPlayer";
import type { Signal } from "@/types/archetype.types";

const LIKERT_LABELS = ["Strongly\nDisagree", "Disagree", "Neutral", "Agree", "Strongly\nAgree"];

type RevealedResult = {
  legacyName: string;
  archetype: {
    id: string;
    label: string;
    romajiName: string;
    order: "GIANT" | "HUNTER";
    description: string;
    guidingPromise: string;
    traits: [string, string, string, string];
    traitDescriptions: [string, string, string, string];
  };
  signals: Signal[];
  scoreMap: Record<string, number>;
  scoreHistory: TurnSnapshot[];
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

      setRevealed({ legacyName, archetype, signals, scoreMap, scoreHistory: buildScoreHistory(signals) });
      setSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
      answeredStep.current = -1; // allow retrying the last question
    }
  }

  function handleConfirm() {
    if (!revealed) return;
    const { legacyName, archetype, scoreMap, scoreHistory } = revealed;
    acceptLegacyName(legacyName, archetype.id, archetype.order, archetype.label, archetype.guidingPromise, archetype.traits, scoreMap, scoreHistory);
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
      <div className="legacy-container">
        <div className="head-bdr"></div>
        <div className="global-loader">
          <table width="100%" cellPadding="0" cellSpacing="0" border={0}>
            <tbody>
              <tr>
                <td>
                  <div className="gl-cont">
                    <div className="gl-cirle"></div>
                    <p className="f-12 mb-0 txt-center">Crystallising your name...</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="foot-bdr"></div>
      </div>
    );
  }

  if (revealed) {
    const { archetype } = revealed;
    return (
      <div className="legacy-container">
        <div className="head-bdr"></div>
        <div className="container-fluid">
          <table width="100%" cellPadding="0" cellSpacing="0" border={0}>
            <tbody>
              <tr>
                <td>
                  <div className="content">
                    <p className="txt-thm-clr-50-2 txt-center txt-upp mb-0">Based on your answers, your Legacy Name is</p>
                    <h1 className="h5 txt-center fw-700">{revealed.legacyName}</h1>
                    <p className="txt-thm-clr-50-2 txt-center mb-4">
                      {archetype.label} ({archetype.romajiName}) &middot; Order of {archetype.order === "GIANT" ? "Giant" : "Hunter"}
                    </p>
                    
                    <ArchetypeJourneyPlayer
                      signals={revealed.signals}
                      scoreHistory={revealed.scoreHistory}
                      finalArchetypeId={archetype.id}
                      scoreMap={revealed.scoreMap}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="container-fluid mxw-900">
          <div className="content">
            <div className="mxw-450 m-auto wht-cont pse-3 mt-4 pb-3">
              <p className="txt-thm-clr-70-2 line-ht-20 mb-2">{archetype.description}</p>
              <p className="txt-thm-clr-70-2 fst-italic line-ht-20 mb-2">&ldquo;{archetype.guidingPromise}&rdquo;</p>
              <div className="grid-list">
                <div className="row float-none">
                  {archetype.traits.map((trait, i) => (
                    <div className="col-4" key={trait}>
                      <p className="f-12 txt-upp mb-0 txt-thm-clr-70-2">{trait}</p>
                      <p className="f-12 txt-thm-clr-50-2">{archetype.traitDescriptions[i]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="txt-center mt-4 mb-4">
              <button type="button" className="btn pse-3 bdr-rds2 me-2" onClick={handleConfirm}>This Is Me</button>
              <button type="button" className="btn-outline pse-3 bdr-rds2" onClick={handleRetake}>Retake the Survey</button>
            </div>
            <p className="mxw-300 m-auto f-12 txt-thm-clr-50-2 txt-center mb-4">
              Not feeling it? Retake the survey with a fresh set of questions.
            </p>
          </div>
        </div>
        <div className="foot-bdr"></div>
      </div>
    );
  }

  return (
    <div className="legacy-container">
      <div className="head-bdr"></div>
      <div className="container-fluid">
        <table width="100%" cellPadding="0" cellSpacing="0" border={0}>
          <tbody>
            <tr>
              <td>
                <div className="content">
                  <div className="logo m-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/Images/thegianthunt.png" alt="The Giant Hunt" title="The Giant Hunt" />
                  </div>
                  <div className="g-logo5 m-auto mb-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/Images/g-img2.png" alt="Giantverse" title="Giantverse" />
                    <div className="g-logo6 m-auto">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/Images/g-img3.png" alt="Giantverse" title="Giantverse" />
                    </div>
                  </div>
                  <div className="survey-cont">
                    <div className="progress-bar">
                      <motion.div
                        style={{ width: `${progress * 100}%` }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.3 }}
                      ></motion.div>
                    </div>
                    <p className="f-12 txt-thm-clr-50-2 txt-rt">{step + 1} / {total}</p>
                    <div className="survey-wrapper p-relative" style={{ minHeight: "350px" }}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={step}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.35 }}
                          className="w-full"
                        >
                          <div className="question-answer-cont active !transition-none">
                            <h1 className="f-16 line-ht-24 txt-center mt-3 mb-4">{question.text}</h1>
                            {question.type === "yesno" ? (
                              <div className="btn-group">
                                {(["Yes", "No"] as const).map((label) => (
                                  <button
                                    key={label}
                                    type="button"
                                    className="btn-outline mse-2"
                                    onClick={() => handleAnswer(label === "Yes" ? 1 : 0)}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="btn-group2">
                                {LIKERT_LABELS.map((label, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    className="btn-indicator"
                                    onClick={() => handleAnswer(i + 1)}
                                  >
                                    <span className="indicator"></span>
                                    <span>{label.replace("\n", " ")}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                            {step === 0 && (
                              <p className="f-12 line-ht-15 txt-thm-clr-50-2 txt-center mt-4 mb-0">
                                {firstName}, answer honestly — there are no right answers.
                              </p>
                            )}
                            {error && <p className="f-12 line-ht-15 txt-center mt-4 mb-0 text-red-500">{error}</p>}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="foot-bdr"></div>
    </div>
  );
}
