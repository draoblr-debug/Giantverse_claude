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
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex w-full max-w-[520px] flex-col gap-1 text-left">
        <h3 className="text-lg font-serif">{total} questions. One name.</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={play}
            disabled={playing}
            className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium uppercase tracking-wide disabled:opacity-40 dark:border-zinc-700"
          >
            ▷ Play
          </button>
          <button
            type="button"
            onClick={play}
            className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium uppercase tracking-wide dark:border-zinc-700"
          >
            ↺ Replay
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="h-auto w-full max-w-[520px] rounded-lg" />

      <div className="flex flex-wrap justify-center gap-1.5">
        {stepButtons.map(({ label, index }) => (
          <button
            key={label}
            type="button"
            onClick={() => goToStep(index)}
            className={`rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors ${
              step === index
                ? "border-amber-400 bg-amber-400 text-zinc-900"
                : "border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            {label === "Start" ? "○ Start" : label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => goToStep(total)}
          className={`rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors ${
            step === total
              ? "border-amber-400 bg-amber-400 text-zinc-900"
              : "border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
          }`}
        >
          + Final
        </button>
      </div>

      {step === total && finalArchetype && (
        <div className="flex w-full max-w-[520px] flex-col gap-3 rounded-lg border border-zinc-200 p-4 text-left dark:border-zinc-800">
          <p className="text-sm leading-relaxed">
            You are the <strong>{finalArchetype.label}</strong> &middot; {finalArchetype.romajiName}
            {realm && (
              <>
                {" "}
                — of <span className="opacity-80">{realm.name}</span>
              </>
            )}
            .
          </p>
          {convergence && (
            <>
              <p className="text-sm opacity-60">
                But your path also carries <strong>{convergence.secondary.label}</strong> within it.
              </p>
              <div className="rounded-md border border-amber-400/30 bg-amber-400/5 p-3">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-amber-500">
                  Final Convergence Reasoning
                </p>
                <p className="text-xs leading-relaxed opacity-70">{convergence.reasoning}</p>
              </div>
            </>
          )}

          {relations && (
            <div className="flex flex-col gap-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Allies
                </p>
                <p className="text-xs leading-relaxed opacity-70">
                  {relations.allies[0].label} and {relations.allies[1].label} — the archetypes you naturally drift
                  toward as you grow.
                </p>
              </div>

              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Opposite
                </p>
                <p className="text-xs leading-relaxed opacity-70">
                  <strong>{relations.opposite.label}</strong> answers the same question you do, differently:{" "}
                  <em>{relations.centralQuestion}</em>
                </p>
              </div>

              <div className="rounded-md border border-red-400/30 bg-red-400/5 p-3">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-red-500">
                  Shadow — {finalArchetype.shadow.trait}
                </p>
                <p className="text-xs leading-relaxed opacity-70">{finalArchetype.shadow.description}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
