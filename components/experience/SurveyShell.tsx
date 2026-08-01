"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useSessionStore } from "@/stores/session.store";
import { getQuestionBank, selectSurveyQuestions } from "@/engines/survey/survey-selection.engine";
import { answersToSignals, type SurveyAnswers } from "@/engines/survey/survey-scoring.engine";
import type { Signal } from "@/types/archetype.types";
import { useAssessmentStore } from "@/stores/assessment.store";

export function SurveyShell() {
  const router = useRouter();
  const { sessionId, birthName, firstName } = useSessionStore();
  const setResult = useAssessmentStore((state) => state.setResult);
  const t = useTranslations("survey");
  const tCommon = useTranslations("common");
  const likertLabels = t.raw("likert") as string[];
  const locale = useLocale();

  // Bumped on "Retake the Survey" so the question sample reshuffles
  // instead of drawing the identical set again.
  const [retake, setRetake] = useState(0);

  // Each session draws its own balanced 16-question survey from the
  // 112-question bank, seeded by the session so it's stable across
  // re-renders but unique per participant. The seed excludes locale so
  // the same questions (by id) are picked regardless of display language;
  // only the bank passed in determines which language's text is shown.
  const questions = useMemo(
    () =>
      selectSurveyQuestions(
        `${sessionId ?? birthName ?? "giantverse"}-${retake}`,
        2,
        getQuestionBank(locale),
      ),
    [sessionId, birthName, retake, locale],
  );

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const answeredStep = useRef(-1); // guards double-clicks within one step

  useEffect(() => {
    if (!birthName) router.replace("/birth");
  }, [birthName, router]);

  if (!birthName) return null;

  const question = questions[step];
  if (!question && !submitting) return null;
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
      setResult({ source: "survey", signals });
      router.push("/reveal");
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon("somethingWentWrong"));
      setSubmitting(false);
      answeredStep.current = -1; // allow retrying the last question
    }
  }

  function handleRetake() {
    setAnswers({});
    setStep(0);
    setError(null);
    answeredStep.current = -1;
    setRetake((r) => r + 1); // reshuffles the question sample
  }

  async function handleBypass() {
    setSubmitting(true);
    try {
      const mockAnswers: SurveyAnswers = {};
      questions.forEach((q) => {
        mockAnswers[q.id] = q.type === "yesno" ? 1 : 3; // Answer Yes or Neutral
      });
      const signals = answersToSignals(mockAnswers, questions);
      setResult({ source: "survey", signals });
      router.push("/reveal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bypass failed.");
      setSubmitting(false);
    }
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
                    <p className="f-12 mb-0 txt-center">{t("crystallising")}</p>
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
                  <div className="survey-cont relative">
                    <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                      <button 
                        onClick={handleBypass}
                        className="px-3 py-1 text-xs uppercase tracking-widest text-white bg-white/10 hover:bg-white/20 border border-white/30 rounded cursor-pointer transition-colors"
                        title="Auto-fill and bypass survey"
                      >
                        [Fast-Forward Survey]
                      </button>
                    </div>
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
                                {([1, 0] as const).map((value) => (
                                  <button
                                    key={value}
                                    type="button"
                                    className="btn-outline mse-2"
                                    onClick={() => handleAnswer(value)}
                                  >
                                    {value === 1 ? t("yes") : t("no")}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="btn-group2">
                                {likertLabels.map((label, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    className="btn-indicator"
                                    onClick={() => handleAnswer(i + 1)}
                                  >
                                    <span className="indicator"></span>
                                    <span>{label}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                            {step === 0 && (
                              <p className="f-12 line-ht-15 txt-thm-clr-50-2 txt-center mt-4 mb-0">
                                {t("answerHonestly", { firstName: firstName ?? "" })}
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
