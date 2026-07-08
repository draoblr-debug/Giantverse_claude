"use client";

import { useEffect, useRef, useState } from "react";
import { renderJourneyMap, type TurnSnapshot } from "@/lib/journey-renderer";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import { REALMS } from "@/engines/realms";
import { computeConvergence } from "@/engines/archetype/convergence";
import { getArchetypeRelations } from "@/engines/archetype/archetype-wheel";
import type { Signal } from "@/types/archetype.types";

type Props = {
  signals: Signal[];
  scoreHistory: TurnSnapshot[];
  finalArchetypeId: string;
  scoreMap: Record<string, number>;
  size?: number;
};

const STEP_MS = 650;

export function ArchetypeJourneyPlayer({ signals, scoreHistory, finalArchetypeId, scoreMap, size = 480 }: Props) {
  const total = scoreHistory.length;
  const [step, setStep] = useState(total); // 0 = Start, total = Final
  const [playing, setPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const finalArchetype = ARCHETYPE_DEFINITIONS[finalArchetypeId];
  const realm = finalArchetype?.realmBias ? REALMS[finalArchetype.realmBias] : null;
  const convergence = computeConvergence(signals, scoreMap, finalArchetypeId);
  const relations = finalArchetype ? getArchetypeRelations(finalArchetypeId) : null;

  // Draw whenever the visible step changes. At "Final" the map docks on
  // the winning archetype; at any earlier step it shows the tentative
  // leader so far, without pretending the journey is already decided.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const visibleTurns = scoreHistory.slice(0, step);
    const glyph = renderJourneyMap(visibleTurns, {
      finalArchetypeId: step === total ? finalArchetypeId : undefined,
      size,
      transparent: false,
      background: "#0B111C",
      labelMode: "all",
      detail: "full",
    });
    canvas.width = glyph.width;
    canvas.height = glyph.height;
    canvas.getContext("2d")?.drawImage(glyph, 0, 0);
  }, [step, scoreHistory, finalArchetypeId, size, total]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function play() {
    if (timerRef.current) clearInterval(timerRef.current);
    setPlaying(true);
    setStep(0);
    let i = 0;
    timerRef.current = setInterval(() => {
      i += 1;
      setStep(i);
      if (i >= total) {
        if (timerRef.current) clearInterval(timerRef.current);
        setPlaying(false);
      }
    }, STEP_MS);
  }

  function goToStep(i: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    setPlaying(false);
    setStep(i);
  }

  const stepButtons = [
    { label: "Start", index: 0 },
    ...scoreHistory.map((_, i) => ({ label: `Q${i + 1}`, index: i + 1 })),
  ];

  return (
    <>
      <h6 className="f-18 txt-thm-clr-2 font-type2 txt-center mt-3">16 questions. One name.</h6>
      <div className="mb-3 txt-center">
        <button
          type="button"
          onClick={play}
          disabled={playing}
          className="btn-outline-sm me-2"
        >
          &#9655; Play
        </button>
        <button
          type="button"
          onClick={play}
          className="btn-outline-sm"
        >
          &#8634; Replay
        </button>
      </div>

      <div className="survey-answers-cont mb-3 p-relative m-auto" style={{ maxWidth: "600px" }}>
        <canvas ref={canvasRef} className="w-full" style={{ borderRadius: "8px" }} />
      </div>

      <div className="survey-button-cont txt-center mt-4">
        {stepButtons.map(({ label, index }) => {
          const isActive = step === index || (step === total && index === total);
          return (
            <button
              key={label}
              type="button"
              onClick={() => goToStep(index)}
              className={isActive ? "btn-outline-sm2 question-btn active" : "btn-outline-sm2 question-btn"}
            >
              {label === "Start" ? "0 Start" : label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => goToStep(total)}
          className={step === total ? "btn-outline-sm2 question-btn active" : "btn-outline-sm2 question-btn"}
        >
          + Final
        </button>
      </div>

      {step === total && finalArchetype && (
        <div className="wht-cont pse-3 pb-3 mt-4 text-left m-auto" style={{ maxWidth: "700px" }}>
          <p className="txt-thm-clr-2 line-ht-20 mb-2">
            You are the <span className="fw-700">{finalArchetype.label}</span> &middot; {finalArchetype.romajiName}
            {realm && (
              <>
                {" "}— of {realm.name}
              </>
            )}
            .
          </p>
          {convergence && (
            <>
              <p className="txt-thm-clr-70-2 line-ht-20 mb-2">
                But your path also carries {convergence.secondary.label} within it.
              </p>
              <div className="alert-warning mb-3">
                <p className="alert-title f-10 fw-700 txt-upp">Final Convergence Reasoning</p>
                <p className="f-12 line-ht-20 txt-thm-clr-70-2 mb-0">{convergence.reasoning}</p>
              </div>
            </>
          )}

          {relations && (
            <>
              <div className="mt-3">
                <p className="f-10 fw-700 txt-upp txt-thm-clr-50-2 mb-1">Allies</p>
                <p className="f-12 line-ht-20 txt-thm-clr-70-2 mb-2">
                  {relations.allies[0].label} and {relations.allies[1].label} — the archetypes you naturally drift toward as you grow.
                </p>
              </div>

              <div className="mt-3">
                <p className="f-10 fw-700 txt-upp txt-thm-clr-50-2 mb-1">Opposite</p>
                <p className="f-12 line-ht-20 txt-thm-clr-70-2 mb-2">
                  <span className="fw-700">{relations.opposite.label}</span> answers the same question you do, differently: <span className="fst-italic">{relations.centralQuestion}</span>
                </p>
              </div>

              <div className="alert-warning mt-3" style={{ borderLeftColor: "#dc3545", backgroundColor: "rgba(220, 53, 69, 0.05)" }}>
                <p className="alert-title f-10 fw-700 txt-upp" style={{ color: "#dc3545" }}>Shadow — {finalArchetype.shadow.trait}</p>
                <p className="f-12 line-ht-20 txt-thm-clr-70-2 mb-0">{finalArchetype.shadow.description}</p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
