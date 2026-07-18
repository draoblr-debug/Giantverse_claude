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

import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import {
  computeCompatibility,
  findArchetypeByName,
  type CompatibilityResult,
} from "@/engines/compatibility/compatibility.engine";
import { useInviteStore } from "@/stores/invite.store";
import { useSessionStore } from "@/stores/session.store";
import { CompatibilityShareCard } from "./CompatibilityShareCard";

// Some share targets (notably how certain messaging apps merge the Web
// Share API's text and url fields before the link is opened) can corrupt
// the "name" param into a long run-on string. A real first name is short
// and plain — anything longer or sentence-shaped falls back to the Legacy
// Name instead of rendering garbage as the page's headline.
function sanitizeRealName(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 30 || /[.:\n]/.test(trimmed)) return undefined;
  return trimmed;
}

// Splits a full Legacy Name ("Teyuka Kanryō") into its Birth Name and
// archetype, so an invite link's inviter can be shown/locked as Side A.
function parseLegacyName(fullName: string): { birthName: string; archetypeId: string } | null {
  const archetype = findArchetypeByName(fullName);
  if (!archetype) return null;
  const tokens = fullName.trim().split(/\s+/);
  const birthName = tokens.slice(0, -1).join(" ") || tokens[0];
  return { birthName, archetypeId: archetype.id };
}

const ARCHETYPE_OPTIONS = Object.values(ARCHETYPE_DEFINITIONS).sort((a, b) => a.label.localeCompare(b.label));

export function CompatibilityChecker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pending = useInviteStore((s) => s.pending);
  const setPending = useInviteStore((s) => s.setPending);
  const clearPending = useInviteStore((s) => s.clearPending);
  const ownLegacyName = useSessionStore((s) => s.legacyName);

  const [birthNameA, setBirthNameA] = useState("");
  const [archetypeIdA, setArchetypeIdA] = useState("");
  const [birthNameB, setBirthNameB] = useState("");
  const [archetypeIdB, setArchetypeIdB] = useState("");
  const [realNameA, setRealNameA] = useState("");
  const [realNameB, setRealNameB] = useState("");
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualEntry, setManualEntry] = useState(false);

  // Arrived via a friend's invite link (?invite=<Legacy Name>&name=<Real Name>)
  // — capture it into the invite store so it survives the friend's own
  // /birth -> /reveal journey. This only syncs an external system (the URL)
  // into the invite store, never local component state, so it's a
  // legitimate effect.
  useEffect(() => {
    const invite = searchParams.get("invite");
    if (!invite || pending) return;
    const decoded = decodeURIComponent(invite);
    const archetype = findArchetypeByName(decoded);
    if (!archetype) return;
    const realName = searchParams.get("name");
    setPending({
      inviterName: decoded,
      inviterArchetypeLabel: archetype.label,
      inviterRealName: realName ? sanitizeRealName(decodeURIComponent(realName)) : undefined,
    });
  }, [searchParams, pending, setPending]);

  const archetypeA = useMemo(() => ARCHETYPE_DEFINITIONS[archetypeIdA] ?? null, [archetypeIdA]);
  const archetypeB = useMemo(() => ARCHETYPE_DEFINITIONS[archetypeIdB] ?? null, [archetypeIdB]);
  const lockSideA = !!pending && !ownLegacyName;

  // Side A is derived straight from the invite while locked, rather than
  // copied into birthNameA/archetypeIdA state via an effect.
  const invitedParsed = useMemo(() => (pending ? parseLegacyName(pending.inviterName) : null), [pending]);
  const effectiveBirthNameA = lockSideA && invitedParsed ? invitedParsed.birthName : birthNameA;
  const effectiveArchetypeA = lockSideA && invitedParsed ? ARCHETYPE_DEFINITIONS[invitedParsed.archetypeId] ?? null : archetypeA;

  // Auto-resolve: the invited friend already has their own Legacy Name
  // (they arrived here from /ending after completing their own ritual) —
  // derive the result straight from the invite + session, skipping the form
  // entirely, instead of pushing it into state from an effect.
  const autoResult = useMemo(() => {
    if (!pending || !ownLegacyName) return null;
    const outcome = computeCompatibility(pending.inviterName, ownLegacyName);
    return "error" in outcome ? null : outcome;
  }, [pending, ownLegacyName]);
  const displayResult = result ?? autoResult;
  const showInviteBanner = !!pending && !displayResult && !manualEntry;
  // Older invite links (shared before real names were carried in the URL)
  // only have the Legacy Name — fall back to that so they still render.
  const inviterDisplayName = pending?.inviterRealName || pending?.inviterName;

  function handleCheck(e: FormEvent) {
    e.preventDefault();
    if (!effectiveArchetypeA || !archetypeB) return; // dropdowns are required; shouldn't happen
    const fullNameA = `${effectiveBirthNameA.trim()} ${effectiveArchetypeA.romajiName}`.trim();
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
    setManualEntry(false);
    clearPending();
    setBirthNameA("");
    setArchetypeIdA("");
    setRealNameA("");
    setRealNameB("");
  }

  return (
    <div className="legacy-container container2" style={{ minHeight: "100vh" }}>
      <div className="head-bdr"></div>
      <div className="container-fluid" style={{ paddingBottom: 48 }}>
        <div className="content" style={{ maxWidth: 560, margin: "0 auto", paddingTop: 40 }}>
          {showInviteBanner ? (
            <div className="txt-center mb-5">
              <p className="f-10 txt-thm-clr-6 txt-upp letter-spacing2 mb-1">You&apos;ve Been Invited</p>
              <h1 className="h2 fw-600 mb-3" style={{ color: "#EFE9DA", fontFamily: "Georgia, serif" }}>
                {inviterDisplayName}{" "}wants to know your Giantverse connection
              </h1>
              <p className="mxw-450 m-auto f-13 txt-thm-clr-70-2 line-ht-20 mb-4">
                Already have a Giantverse identity? Enter it below to check instantly. New here? Take the short
                survey to create one — it&apos;s fun!
              </p>
              <button type="button" className="btn bdr-rds2 me-2" onClick={() => router.push("/birth")}>
                Take the Survey
              </button>
              <button type="button" className="btn-outline bdr-rds2 mt-2" onClick={() => setManualEntry(true)}>
                I Already Have a Giantverse Identity
              </button>
            </div>
          ) : (
            <div className="mb-4">
              <p className="f-12 txt-center txt-thm-clr-50-2 txt-upp letter-spacing2">Giant Hunt Compatibility</p>
            </div>
          )}

          {!displayResult && (!pending || manualEntry || ownLegacyName) && (
            <form onSubmit={handleCheck}>
              <label className="f-10 txt-upp letter-spacing2" style={{ color: "#8A8478" }}>
                {lockSideA ? "Your Friend's Name" : "Your Name"}
              </label>
              <input
                type="text"
                value={effectiveBirthNameA}
                onChange={(e) => setBirthNameA(e.target.value)}
                placeholder="e.g. Teyuka"
                className="f-14"
                style={inputStyle}
                required
                readOnly={lockSideA}
                disabled={lockSideA}
              />

              <label className="f-10 txt-upp letter-spacing2 mt-3" style={{ color: "#8A8478", display: "block" }}>
                {lockSideA ? "Your Friend's Real Name" : "Your Real Name"}
              </label>
              <input
                type="text"
                value={lockSideA ? (pending?.inviterRealName || realNameA) : realNameA}
                onChange={(e) => setRealNameA(e.target.value)}
                placeholder="e.g. John"
                className="f-14"
                style={inputStyle}
                readOnly={lockSideA && !!pending?.inviterRealName}
                disabled={lockSideA && !!pending?.inviterRealName}
              />

              <label className="f-10 txt-upp letter-spacing2 mt-3" style={{ color: "#8A8478", display: "block" }}>
                {lockSideA ? "Your Friend's Archetype" : "Your Archetype"}
              </label>
              <select
                value={lockSideA ? (effectiveArchetypeA?.id ?? "") : archetypeIdA}
                onChange={(e) => setArchetypeIdA(e.target.value)}
                className="f-14"
                style={inputStyle}
                required
                disabled={lockSideA}
              >
                <option value="" disabled>Select your archetype…</option>
                {ARCHETYPE_OPTIONS.map((a) => (
                  <option key={a.id} value={a.id}>{a.label} ({a.romajiName})</option>
                ))}
              </select>
              {lockSideA && (
                <p className="f-10 mt-1" style={{ color: "#6E695F" }}>Locked to your inviter — enter your own details below.</p>
              )}

              <label className="f-10 txt-upp letter-spacing2 mt-4" style={{ color: "#8A8478", display: "block" }}>
                {lockSideA ? "Your Name" : "Your Friend's Name"}
              </label>
              <input
                type="text"
                value={birthNameB}
                onChange={(e) => setBirthNameB(e.target.value)}
                placeholder="e.g. Ananya"
                className="f-14"
                style={inputStyle}
                required
              />

              <label className="f-10 txt-upp letter-spacing2 mt-3" style={{ color: "#8A8478", display: "block" }}>
                {lockSideA ? "Your Real Name" : "Your Friend's Real Name"}
              </label>
              <input
                type="text"
                value={realNameB}
                onChange={(e) => setRealNameB(e.target.value)}
                placeholder="e.g. Jane"
                className="f-14"
                style={inputStyle}
              />

              <label className="f-10 txt-upp letter-spacing2 mt-3" style={{ color: "#8A8478", display: "block" }}>
                {lockSideA ? "Your Archetype" : "Your Friend's Archetype"}
              </label>
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

          {displayResult && (
            <div className="txt-center">
              <div className="mb-4">
                <CompatibilityShareCard result={displayResult} invitedByRealName={pending?.inviterRealName} />
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
