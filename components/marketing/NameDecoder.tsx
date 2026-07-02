"use client";

import { useState } from "react";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import {
  DOB_SYLLABLES,
  MONTH_SYLLABLES,
  MONTH_NAMES,
  LETTER_SYLLABLES,
} from "@/engines/naming/syllable-tables";
import type { ArchetypeProfile } from "@/types/archetype.types";

// ── Normalise for diacritic-insensitive archetype matching ──────────────────
function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/\p{Mn}/gu, "");
}

const ROMAJI_INDEX: Map<string, ArchetypeProfile> = new Map(
  Object.values(ARCHETYPE_DEFINITIONS).map((p) => [normalize(p.romajiName), p]),
);

// ── Reverse index: syllable value → list of keys ────────────────────────────
function reverseMap<K extends string | number>(
  record: Record<K, string>,
): Map<string, K[]> {
  const m = new Map<string, K[]>();
  for (const [k, v] of Object.entries(record) as [string, string][]) {
    const key = v.toLowerCase();
    if (!m.has(key)) m.set(key, []);
    m.get(key)!.push(k as K);
  }
  return m;
}

const DOB_REV = reverseMap(DOB_SYLLABLES as Record<string, string>);
const MONTH_REV = reverseMap(MONTH_SYLLABLES as Record<string, string>);
const LETTER_REV = reverseMap(LETTER_SYLLABLES);

// Syllables sorted longest-first so greedy parsing tries 3-char before 2-char
const DOB_VALS = [...new Set(Object.values(DOB_SYLLABLES))].sort((a, b) => b.length - a.length);
const MONTH_VALS = [...new Set(Object.values(MONTH_SYLLABLES))].sort((a, b) => b.length - a.length);

type BirthDecoding = { day: number; month: number; letter: string };

function decodeBirthName(name: string): BirthDecoding[] {
  const lower = name.toLowerCase();
  const results: BirthDecoding[] = [];

  for (const dobSyll of DOB_VALS) {
    const d = dobSyll.toLowerCase();
    if (!lower.startsWith(d)) continue;
    const rest1 = lower.slice(d.length);

    for (const mSyll of MONTH_VALS) {
      const m = mSyll.toLowerCase();
      if (!rest1.startsWith(m)) continue;
      const rest2 = rest1.slice(m.length);
      if (!rest2) continue;

      const letters = LETTER_REV.get(rest2);
      if (!letters) continue;

      const days = (DOB_REV.get(d) ?? []).map(Number);
      const months = (MONTH_REV.get(m) ?? []).map(Number);

      for (const day of days) {
        for (const month of months) {
          for (const letter of letters) {
            results.push({ day, month, letter });
          }
        }
      }
    }
  }

  return results;
}

// ── Component ────────────────────────────────────────────────────────────────
const ORDER_LABEL: Record<string, string> = {
  GIANT: "Order of Giants",
  HUNTER: "Order of Hunters",
};

export function NameDecoder() {
  const [input, setInput] = useState("");

  const trimmed = input.trim();
  const parts = trimmed.split(/\s+/);
  const surname = parts.length >= 2 ? parts[parts.length - 1] : "";
  const firstName = parts.length >= 2 ? parts.slice(0, -1).join(" ") : trimmed;

  const archetype = surname ? ROMAJI_INDEX.get(normalize(surname)) ?? null : null;
  const birthDecodings = firstName ? decodeBirthName(firstName) : [];

  const hasResult = archetype || birthDecodings.length > 0;

  return (
    <div className="w-full max-w-md">
      <p className="mb-3 text-xs uppercase tracking-widest opacity-40">Name Decoder</p>

      <input
        type="text"
        placeholder="Enter a Giantverse name (e.g. Toyoke Teisatsu)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
      />

      {trimmed && !hasResult && (
        <p className="mt-3 text-center text-xs opacity-40">
          No name recognised. Try a full legacy name like <em>Toyoke Teisatsu</em>.
        </p>
      )}

      {hasResult && (
        <div className="mt-4 flex flex-col gap-3">
          {/* ── Birth name section ─────────────────────────────────── */}
          {birthDecodings.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-xs uppercase tracking-widest opacity-40 mb-3">Birth Name · {firstName}</p>

              {birthDecodings.map(({ day, month, letter }, i) => (
                <div key={i} className={birthDecodings.length > 1 ? "mb-3 border-b border-zinc-200 pb-3 last:border-0 last:pb-0 dark:border-zinc-800" : ""}>
                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    <span className="rounded bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                      Day <strong>{day}</strong>
                    </span>
                    <span className="opacity-30">+</span>
                    <span className="rounded bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                      <strong>{MONTH_NAMES[month]}</strong>
                    </span>
                    <span className="opacity-30">+</span>
                    <span className="rounded bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                      First name starts with <strong>{letter}</strong>
                    </span>
                  </div>
                  <p className="mt-2 text-xs opacity-50">
                    {DOB_SYLLABLES[day]} + {MONTH_SYLLABLES[month]} + {LETTER_SYLLABLES[letter]} = {firstName}
                  </p>
                </div>
              ))}

              {birthDecodings.length > 1 && (
                <p className="mt-2 text-xs opacity-40 italic">
                  {birthDecodings.length} possible origins — this name could belong to more than one person.
                </p>
              )}
            </div>
          )}

          {/* ── Archetype / surname section ─────────────────────────── */}
          {archetype && (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-xs uppercase tracking-widest opacity-40 mb-3">Legacy Mantle · {surname}</p>

              <span className="inline-block rounded-full border border-current px-3 py-0.5 text-[10px] uppercase tracking-widest opacity-60">
                {ORDER_LABEL[archetype.order]}
              </span>

              <div className="mt-3">
                <p className="text-xs uppercase tracking-widest opacity-40">Archetype</p>
                <p className="mt-0.5 text-xl font-semibold">
                  {archetype.label}{" "}
                  <span className="text-sm font-normal opacity-50">({archetype.romajiName})</span>
                </p>
              </div>

              <p className="mt-2 text-sm leading-relaxed opacity-70">{archetype.description}</p>

              <p className="mt-3 border-l-2 border-zinc-300 pl-3 text-sm italic opacity-60 dark:border-zinc-700">
                &ldquo;{archetype.guidingPromise}&rdquo;
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {archetype.traits.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-zinc-300 px-2 py-0.5 text-[10px] uppercase tracking-wider dark:border-zinc-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
