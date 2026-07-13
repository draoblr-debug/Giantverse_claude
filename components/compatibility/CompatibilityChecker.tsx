"use client";

// Compatibility Checker — an optional, standalone tool: enter two names
// and pick each person's Giantverse archetype from a dropdown, and get a
// deterministic Giant Hunt role for the pairing. The result depends only
// on the two archetypes' positions on the 32-point wheel (see
// compatibility.engine.ts) — same two archetypes always produce the same
// result, regardless of order. This never touches the Giantverse identity
// engine; it only reads names/archetypes that identity engine already
// produced.
//
// Archetype selection is a dropdown, not free text — with only 32 valid
// surnames and no tolerance for typos, letting people type it invited
// avoidable "not recognised" errors. The dropdown makes an invalid
// archetype selection structurally impossible.

import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import {
  computeCompatibility,
  type CompatibilityResult,
} from "@/engines/compatibility/compatibility.engine";
import { CompatibilityShareCard } from "./CompatibilityShareCard";

const ROLE_COLOR: Record<CompatibilityResult["role"], string> = {
  Ally: "#C9A24B",
  Mentor: "#7B8FA3",
  Romance: "#D97BA0",
  Rival: "#D98E3B",
  Villain: "#B4543F",
};

const ROLE_ICON: Record<CompatibilityResult["role"], string> = {
  Ally: "🤝",
  Mentor: "🧭",
  Romance: "💫",
  Rival: "⚔️",
  Villain: "◆",
};

const ARCHETYPE_OPTIONS = Object.values(ARCHETYPE_DEFINITIONS).sort((a, b) => a.label.localeCompare(b.label));

export function CompatibilityChecker() {
  const [birthNameA, setBirthNameA] = useState("");
  const [archetypeIdA, setArchetypeIdA] = useState("");
  const [birthNameB, setBirthNameB] = useState("");
  const [archetypeIdB, setArchetypeIdB] = useState("");
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const archetypeA = useMemo(() => ARCHETYPE_DEFINITIONS[archetypeIdA] ?? null, [archetypeIdA]);
  const archetypeB = useMemo(() => ARCHETYPE_DEFINITIONS[archetypeIdB] ?? null, [archetypeIdB]);

  function handleCheck(e: FormEvent) {
    e.preventDefault();
    if (!archetypeA || !archetypeB) return; // dropdowns are required; shouldn't happen
    const fullNameA = `${birthNameA.trim()} ${archetypeA.romajiName}`.trim();
    const fullNameB = `${birthNameB.trim()} ${archetypeB.romajiName}`.trim();
    const outcome = computeCompatibility(fullNameA, fullNameB);
    if ("error" in outcome) {
      setError(outcome.error);
      setResult(null);
      return;
    }
    setError(null);
    setResult(outcome);
  }

  function handleReset() {
    setResult(null);
    setError(null);
  }

  return (
    <div className="legacy-container container2" style={{ minHeight: "100vh" }}>
      <div className="head-bdr"></div>
      <div className="container-fluid" style={{ paddingBottom: 48 }}>
        <div className="content" style={{ maxWidth: 560, margin: "0 auto", paddingTop: 40 }}>
          <p className="f-12 txt-center txt-thm-clr-50-2 txt-upp letter-spacing2 mb-1">Giant Hunt Compatibility</p>
          <h1 className="txt-center h2 fw-600 mb-2" style={{ color: "#EFE9DA", fontFamily: "Georgia, serif" }}>
            Compatibility Checker
          </h1>
          <p className="mxw-450 m-auto txt-center f-13 txt-thm-clr-70-2 line-ht-20 mb-5">
            Enter two names and pick each Giantverse archetype to see which of the five Giant Hunt roles the wheel
            casts between them — Ally, Mentor, Romance, Rival, or Villain. Always the same result for the same pair.
          </p>

          {!result && (
            <form onSubmit={handleCheck}>
              <label className="f-10 txt-upp letter-spacing2" style={{ color: "#8A8478" }}>Your Name</label>
              <input
                type="text"
                value={birthNameA}
                onChange={(e) => setBirthNameA(e.target.value)}
                placeholder="e.g. Teyuka"
                className="f-14"
                style={inputStyle}
                required
              />

              <label className="f-10 txt-upp letter-spacing2 mt-3" style={{ color: "#8A8478", display: "block" }}>Your Archetype</label>
              <select
                value={archetypeIdA}
                onChange={(e) => setArchetypeIdA(e.target.value)}
                className="f-14"
                style={inputStyle}
                required
              >
                <option value="" disabled>Select your archetype…</option>
                {ARCHETYPE_OPTIONS.map((a) => (
                  <option key={a.id} value={a.id}>{a.label} ({a.romajiName})</option>
                ))}
              </select>

              <label className="f-10 txt-upp letter-spacing2 mt-4" style={{ color: "#8A8478", display: "block" }}>Your Friend&apos;s Name</label>
              <input
                type="text"
                value={birthNameB}
                onChange={(e) => setBirthNameB(e.target.value)}
                placeholder="e.g. Ananya"
                className="f-14"
                style={inputStyle}
                required
              />

              <label className="f-10 txt-upp letter-spacing2 mt-3" style={{ color: "#8A8478", display: "block" }}>Your Friend&apos;s Archetype</label>
              <select
                value={archetypeIdB}
                onChange={(e) => setArchetypeIdB(e.target.value)}
                className="f-14"
                style={inputStyle}
                required
              >
                <option value="" disabled>Select their archetype…</option>
                {ARCHETYPE_OPTIONS.map((a) => (
                  <option key={a.id} value={a.id}>{a.label} ({a.romajiName})</option>
                ))}
              </select>

              {error && <p className="f-12 mt-3" style={{ color: "#B4543F" }}>{error}</p>}

              <div className="txt-center mt-5">
                <button type="submit" className="btn bdr-rds2">Check Compatibility</button>
              </div>
              <p className="f-10 txt-center mt-3" style={{ color: "#6E695F" }}>
                Not sure of an archetype? It's the Surname half of a Giantverse Legacy Name — e.g. "Kanryō" in
                "Teyuka Kanryō".
              </p>
            </form>
          )}

          {result && (
            <div className="txt-center">
              <div
                className="wht-cont p-4 mb-4"
                style={{ border: `1px solid ${ROLE_COLOR[result.role]}` }}
              >
                <p className="f-12 txt-thm-clr-70-2 mb-1">
                  {result.archetypeA.label} ({result.archetypeA.romajiName}) <span style={{ color: "#6E695F" }}>×</span>{" "}
                  {result.archetypeB.label} ({result.archetypeB.romajiName})
                </p>

                <p style={{ fontSize: 40, margin: "12px 0 4px" }}>{ROLE_ICON[result.role]}</p>
                <h2 className="serif" style={{ color: ROLE_COLOR[result.role], fontFamily: "Georgia, serif", fontSize: 34, margin: 0 }}>
                  {result.role}
                </h2>
                <p className="f-14 fw-700 mt-1" style={{ color: "#EFE9DA" }}>
                  {result.percentage}% — {result.descriptor} {result.role}
                </p>

                {result.mentor && result.mentee && (
                  <p className="f-12 mt-2" style={{ color: ROLE_COLOR[result.role] }}>
                    {result.mentor.name} is the Mentor · {result.mentee.name} is the Mentee
                  </p>
                )}

                <p className="f-13 txt-thm-clr-70-2 line-ht-20 mt-3 mxw-385 m-auto">{result.tagline}</p>
              </div>

              <div className="mb-4">
                <CompatibilityShareCard result={result} />
              </div>

              <button type="button" className="btn-outline bdr-rds2" onClick={handleReset}>
                Check Another Pair
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="foot-bdr"></div>
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: "100%", padding: "12px 14px", background: "transparent",
  border: "1px solid #3a2f12", borderRadius: 6, color: "#EFE9DA", marginTop: 6, marginBottom: 4,
};
