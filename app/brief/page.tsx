"use client";

// Standalone "redownload your brief" page — for anyone who already went
// through the ritual (in a previous session, on another day) and wants
// their Character Design Brief PDF again without repeating it. Reads
// whatever it can off a saved ID card image via OCR (src/lib/id-card-
// ocr.ts), then hands the participant an editable review form before
// calling the same /api/design-brief/generate route the reveal page uses.
//
// OCR of a small, stylized card is genuinely noisy — nothing extracted
// here is trusted blind. Every field is editable, and the archetype is a
// dropdown of all 32 rather than free text, so a misread can't silently
// produce a brief for the wrong archetype.

import { useRef, useState } from "react";
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
  const [invisibleIds, setInvisibleIds] = useState<string[]>([]);
  const [ocrNote, setOcrNote] = useState<string | null>(null);

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
      setInvisibleIds(extracted.invisibleArchetypeIds);
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

  function toggleInvisible(id: string) {
    setInvisibleIds((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 3) return cur;
      return [...cur, id];
    });
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

  return (
    <div className="legacy-container">
      <div className="head-bdr"></div>
      <div className="container-fluid">
        <div className="content">
          <p className="txt-thm-clr-50-2 txt-center txt-upp mb-0">Already Have a Giantverse Name?</p>
          <h1 className="h5 txt-center fw-700">Redownload Your Design Brief</h1>
          <p className="f-12 txt-center txt-thm-clr-70-2 line-ht-20 mb-4">
            Upload the ID card image you saved from your reveal, and we&rsquo;ll read what we can off it — you can
            review and correct everything before downloading.
          </p>

          {stage === "upload" && (
            <div className="mxw-450 m-auto wht-cont pse-3 mt-3 pb-3 txt-center">
              <button type="button" className="btn bdr-rds2" onClick={() => fileRef.current?.click()}>
                ⬆ Upload Your ID Card
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
                className="f-13 mb-3"
                style={{ width: "100%", padding: "10px 12px", background: "transparent", border: "1px solid #3a2f12", borderRadius: 6, color: "#EFE9DA" }}
              />

              <label className="f-10 txt-upp txt-thm-clr-50-2 mb-1" style={{ display: "block" }}>Birth Name</label>
              <input
                type="text"
                value={birthName}
                onChange={(e) => setBirthName(e.target.value)}
                className="f-13 mb-3"
                style={{ width: "100%", padding: "10px 12px", background: "transparent", border: "1px solid #3a2f12", borderRadius: 6, color: "#EFE9DA" }}
              />

              <label className="f-10 txt-upp txt-thm-clr-50-2 mb-1" style={{ display: "block" }}>Archetype</label>
              <select
                value={archetypeId}
                onChange={(e) => setArchetypeId(e.target.value)}
                className="f-13 mb-3"
                style={{ width: "100%", padding: "10px 12px", background: "transparent", border: "1px solid #3a2f12", borderRadius: 6, color: "#EFE9DA" }}
              >
                <option value="" style={{ color: "#000" }}>Select your archetype…</option>
                {ARCHETYPE_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id} style={{ color: "#000" }}>
                    {p.label} ({p.romajiName}) — Order of {p.order === "GIANT" ? "Giants" : "Hunters"}
                  </option>
                ))}
              </select>

              <label className="f-10 txt-upp txt-thm-clr-50-2 mb-1" style={{ display: "block" }}>
                Invisible Archetypes ({invisibleIds.length}/3)
              </label>
              <p className="f-10 mb-2" style={{ color: "#6E695F" }}>
                Your card&rsquo;s journey map only ever labels up to 2 of your 3 invisible archetypes — check/uncheck
                to correct.
              </p>
              <div className="mb-3" style={{ maxHeight: 180, overflowY: "auto", border: "1px solid #3a2f12", borderRadius: 6, padding: 8 }}>
                {ARCHETYPE_OPTIONS.filter((p) => p.id !== archetypeId).map((p) => (
                  <label key={p.id} className="f-12" style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", color: "#C9C3B6" }}>
                    <input
                      type="checkbox"
                      checked={invisibleIds.includes(p.id)}
                      disabled={!invisibleIds.includes(p.id) && invisibleIds.length >= 3}
                      onChange={() => toggleInvisible(p.id)}
                    />
                    {p.label} ({p.romajiName})
                  </label>
                ))}
              </div>

              <button
                type="button"
                className="btn bdr-rds2"
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
                onClick={() => { setStage("upload"); setError(null); }}
                disabled={stage === "downloading"}
              >
                Upload a Different Card
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
