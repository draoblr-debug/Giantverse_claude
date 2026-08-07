"use client";

// Standalone "redownload your brief" page — for anyone who already went
// through the ritual (in a previous session, on another day) and wants
// their Character Design Brief PDF again without repeating it. Two ways
// in: upload a saved ID card image and let OCR (src/lib/id-card-ocr.ts)
// read what it can off it, or skip straight to picking everything by
// hand. Either way lands on the same editable review form before calling
// the same /api/design-brief/generate route the reveal page uses.
//
// OCR of a small, stylized card is genuinely noisy — nothing extracted
// there is trusted blind. The archetype fields are dropdowns of all 32
// rather than free text (same pattern as CompatibilityChecker.tsx), so a
// misread — or a mistyped manual entry — can't silently produce a brief
// for the wrong archetype.

import { useRef, useState, type CSSProperties } from "react";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import { extractIdCardData } from "@/lib/id-card-ocr";

const ARCHETYPE_OPTIONS = Object.values(ARCHETYPE_DEFINITIONS).sort((a, b) => a.label.localeCompare(b.label));

type Stage = "upload" | "extracting" | "review" | "downloading";

export default function BriefLookupPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("upload");
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [legacyName, setLegacyName] = useState("");
  const [birthName, setBirthName] = useState("");
  const [archetypeId, setArchetypeId] = useState("");
  const [invisibleId1, setInvisibleId1] = useState("");
  const [invisibleId2, setInvisibleId2] = useState("");
  const [invisibleId3, setInvisibleId3] = useState("");
  const [ocrNote, setOcrNote] = useState<string | null>(null);

  const invisibleIds = [invisibleId1, invisibleId2, invisibleId3].filter(Boolean);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setStage("extracting");
    try {
      const extracted = await extractIdCardData(file, setProgressLabel);
      setLegacyName(extracted.legacyName);
      setBirthName(extracted.birthName);
      setArchetypeId(extracted.archetypeId ?? "");
      setInvisibleId1(extracted.invisibleArchetypeIds[0] ?? "");
      setInvisibleId2(extracted.invisibleArchetypeIds[1] ?? "");
      setInvisibleId3("");
      setOcrNote(
        extracted.archetypeId
          ? "Everything below was read off your card automatically — double-check it before downloading."
          : "Your card's archetype text couldn't be confidently read — please pick it from the list below.",
      );
      setStage("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that image.");
      setStage("upload");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleManualEntry() {
    setError(null);
    setOcrNote(null);
    setLegacyName("");
    setBirthName("");
    setArchetypeId("");
    setInvisibleId1("");
    setInvisibleId2("");
    setInvisibleId3("");
    setStage("review");
  }

  function handleStartOver() {
    setStage("upload");
    setError(null);
    setOcrNote(null);
  }

  async function handleDownload() {
    if (!legacyName.trim() || !archetypeId) {
      setError("Enter your legacy name and select your archetype first.");
      return;
    }
    const profile = ARCHETYPE_DEFINITIONS[archetypeId];
    if (!profile) {
      setError("Unrecognised archetype — please pick one from the list.");
      return;
    }

    setError(null);
    setStage("downloading");
    try {
      const res = await fetch("/api/design-brief/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthName: birthName.trim() || legacyName.trim(),
          legacyName: legacyName.trim(),
          archetypeId: profile.id,
          invisibleArchetypeIds: invisibleIds,
          order: profile.order,
          guidingPromise: profile.guidingPromise,
          scores: null,
          scoreHistory: null,
        }),
      });
      if (!res.ok) throw new Error("Could not build your design brief.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${legacyName.trim().replace(/[^a-z0-9]+/gi, "-")}-design-brief.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setStage("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStage("review");
    }
  }

  // Each invisible-archetype dropdown excludes the primary archetype and
  // whichever ids are already chosen in the OTHER two dropdowns — but never
  // its own current value, so re-rendering doesn't blank out a selection.
  function invisibleOptionsFor(ownValue: string) {
    const taken = new Set([archetypeId, invisibleId1, invisibleId2, invisibleId3].filter(Boolean));
    taken.delete(ownValue);
    return ARCHETYPE_OPTIONS.filter((p) => !taken.has(p.id));
  }

  return (
    <div className="legacy-container">
      <div className="head-bdr"></div>
      <div className="container-fluid">
        <div className="content">
          <p className="txt-thm-clr-50-2 txt-center txt-upp mb-0">Already Have a Giantverse Name?</p>
          <h1 className="h5 txt-center fw-700">Redownload Your Design Brief</h1>
          <p className="f-12 txt-center txt-thm-clr-70-2 line-ht-20 mb-4">
            Upload the ID card image you saved from your reveal and we&rsquo;ll read what we can off it, or pick your
            archetypes by hand below — either way, review and correct everything before downloading.
          </p>

          {stage === "upload" && (
            <div className="mxw-450 m-auto wht-cont pse-3 mt-3 pb-3 txt-center">
              <button type="button" className="btn bdr-rds2 me-2" onClick={() => fileRef.current?.click()}>
                ⬆ Upload Your ID Card
              </button>
              <button type="button" className="btn-outline bdr-rds2 mt-2" onClick={handleManualEntry}>
                ✎ Enter Manually
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
              <p className="f-10 mt-3" style={{ color: "#6E695F" }}>
                Reading happens in your browser — the image isn&rsquo;t uploaded anywhere.
              </p>
            </div>
          )}

          {stage === "extracting" && (
            <div className="txt-center" style={{ paddingTop: 40, paddingBottom: 40 }}>
              <div
                className="m-auto mb-3"
                style={{
                  width: 40, height: 40, borderRadius: "50%", border: "2px solid #C9A24B",
                  borderTopColor: "transparent", animation: "spin 1s linear infinite",
                }}
              />
              <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
              <p className="f-12 txt-thm-clr-70-2">{progressLabel || "Reading your card…"}</p>
            </div>
          )}

          {(stage === "review" || stage === "downloading") && (
            <div className="mxw-450 m-auto wht-cont pse-3 mt-3 pb-3">
              {ocrNote && <p className="f-12 mb-3" style={{ color: "#C9A24B" }}>{ocrNote}</p>}

              <label className="f-10 txt-upp txt-thm-clr-50-2 mb-1" style={{ display: "block" }}>Legacy Name</label>
              <input
                type="text"
                value={legacyName}
                onChange={(e) => setLegacyName(e.target.value)}
                placeholder="e.g. Rajeev the Aristocrat"
                className="f-13 mb-3"
                style={inputStyle}
              />

              <label className="f-10 txt-upp txt-thm-clr-50-2 mb-1" style={{ display: "block" }}>Birth Name</label>
              <input
                type="text"
                value={birthName}
                onChange={(e) => setBirthName(e.target.value)}
                placeholder="e.g. Rajeev"
                className="f-13 mb-3"
                style={inputStyle}
              />

              <label className="f-10 txt-upp txt-thm-clr-50-2 mb-1" style={{ display: "block" }}>
                Primary Archetype
              </label>
              <select
                value={archetypeId}
                onChange={(e) => setArchetypeId(e.target.value)}
                className="f-13 mb-3"
                style={inputStyle}
              >
                <option value="" style={{ color: "#000" }}>Select your archetype…</option>
                {ARCHETYPE_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id} style={{ color: "#000" }}>
                    {p.label} ({p.romajiName}) — Order of {p.order === "GIANT" ? "Giants" : "Hunters"}
                  </option>
                ))}
              </select>

              <label className="f-10 txt-upp txt-thm-clr-50-2 mb-1" style={{ display: "block" }}>
                Invisible Archetypes
              </label>
              <p className="f-10 mb-2" style={{ color: "#6E695F" }}>
                The three archetypes that moved beneath your answers — optional, up to three.
              </p>
              {[
                { value: invisibleId1, set: setInvisibleId1, label: "Invisible Archetype 1" },
                { value: invisibleId2, set: setInvisibleId2, label: "Invisible Archetype 2" },
                { value: invisibleId3, set: setInvisibleId3, label: "Invisible Archetype 3" },
              ].map((row, i) => (
                <select
                  key={row.label}
                  value={row.value}
                  onChange={(e) => row.set(e.target.value)}
                  className="f-13 mb-2"
                  style={inputStyle}
                  aria-label={row.label}
                >
                  <option value="" style={{ color: "#000" }}>{`— None (slot ${i + 1}) —`}</option>
                  {invisibleOptionsFor(row.value).map((p) => (
                    <option key={p.id} value={p.id} style={{ color: "#000" }}>
                      {p.label} ({p.romajiName})
                    </option>
                  ))}
                </select>
              ))}

              <button
                type="button"
                className="btn bdr-rds2 mt-2"
                style={{ width: "100%" }}
                onClick={handleDownload}
                disabled={stage === "downloading"}
              >
                {stage === "downloading" ? "Building Your Brief…" : "Download Design Brief"}
              </button>

              <button
                type="button"
                className="btn-outline bdr-rds2 mt-2"
                style={{ width: "100%" }}
                onClick={handleStartOver}
                disabled={stage === "downloading"}
              >
                Start Over
              </button>
            </div>
          )}

          {error && <p className="f-12 txt-center mt-3" style={{ color: "#B4543F" }}>{error}</p>}
        </div>
      </div>
      <div className="foot-bdr"></div>
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: "100%", padding: "10px 12px", background: "transparent",
  border: "1px solid #3a2f12", borderRadius: 6, color: "#EFE9DA",
};
