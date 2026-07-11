"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSessionStore } from "@/stores/session.store";
import { useVisualStore } from "@/stores/visual.store";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import { REALMS } from "@/engines/realms";
import { getInspirationHighlights, getBridgeEntities, getTopTwoArchetypes } from "@/engines/inspiration";
import { drawCard } from "@/lib/card-generator";

export function DrawingInvitation() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { birthName, legacyName, archetypeLabel, archetype, order, guidingPromise, traits, firstName, scores, scoreHistory, resetExperience } =
    useSessionStore();
  const visualMatches = useVisualStore((s) => s.matches);
  const visualTop = visualMatches?.[0] ?? null;

  // Resonant Constellation: this archetype's inspiration set, plus a
  // "bridge" — an entity shared with the second-highest scoring archetype,
  // when the participant resonated with two archetypes almost equally.
  const profileForConstellation = archetype ? ARCHETYPE_DEFINITIONS[archetype] : null;
  const realm = profileForConstellation?.realmBias ? REALMS[profileForConstellation.realmBias] : null;
  const inspiration = archetype ? getInspirationHighlights(archetype) : { personalities: [], book: null, film: null };
  const [, secondArchetypeId] = scores ? getTopTwoArchetypes(scores) : [null, null];
  const secondProfile =
    secondArchetypeId && secondArchetypeId !== archetype ? ARCHETYPE_DEFINITIONS[secondArchetypeId] : null;
  const bridgeEntities = archetype && secondProfile ? getBridgeEntities(archetype, secondProfile.id) : [];

  useEffect(() => {
    if (!legacyName) router.replace("/birth");
  }, [legacyName, router]);

  useEffect(() => {
    if (!legacyName || !birthName || !archetypeLabel || !archetype || !order || !guidingPromise || !traits) return;

    const profile = ARCHETYPE_DEFINITIONS[archetype];
    const traitDescriptions = profile?.traitDescriptions ?? ["", "", "", ""] as [string, string, string, string];
    const romaji = profile?.romajiName ?? archetype;
    const gvId = `GV-${String(Date.now()).slice(-6)}`;

    const canvas = canvasRef.current;
    if (!canvas) return;

    drawCard(canvas, {
      birthName,
      legacyName,
      archetypeId: archetype,
      archetypeLabel,
      archetypeRomaji: romaji,
      order,
      guidingPromise,
      traits,
      traitDescriptions,
      realName: firstName,
      gvId,
      scoreHistory: scoreHistory ?? undefined,
    }).then(() => {
      const display = displayCanvasRef.current;
      if (display) {
        const scale = Math.min(1, (window.innerWidth - 32) / canvas.width);
        display.width = Math.round(canvas.width * scale);
        display.height = Math.round(canvas.height * scale);
        const dCtx = display.getContext("2d");
        dCtx?.drawImage(canvas, 0, 0, display.width, display.height);
      }
      setReady(true);
    });
  }, [legacyName, birthName, archetypeLabel, archetype, order, guidingPromise, traits, firstName, scoreHistory]);

  if (!legacyName) return null;

  function handleDownload() {
    setDownloading(true);
    const canvas = canvasRef.current;
    if (!canvas) { setDownloading(false); return; }
    canvas.toBlob((blob) => {
      if (!blob) { setDownloading(false); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${legacyName?.replace(/\s+/g, "-").toLowerCase() ?? "giantverse"}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloading(false);
    }, "image/png");
  }

  return (
    <div className="legacy-container ending-cont w-full min-h-screen flex flex-col items-center justify-center py-10 px-4">
      {/* Off-screen full-res canvas for download */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 20 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[1000px] flex flex-col items-center"
      >
        <div className="poster-cont ptb-6 mxw-900 m-auto">
          {/* Scaled display canvas replacing the static Poster image */}
          <canvas ref={displayCanvasRef} className="w-full" style={{ borderRadius: 6, maxWidth: "100%" }} />
        </div>

        {ready && (
          <>
            {/* Visual Inspiration (optional): result of the Visual Character
                Discovery module, when the participant used it. Inspiration
                only — the identity above was generated exclusively from
                name + date of birth, never from the face. */}
            {visualTop && (
              <div className="wht-cont mxw-450 m-auto txt-center mb-3">
                <p className="f-10 mb-0 txt-thm-clr-6 txt-upp">Your Visual Inspiration</p>
                <p className="txt-thm-clr-5 line-ht-20 mb-0">
                  {visualTop.character.name}
                  <span className="txt-thm-clr-6"> · {visualTop.similarity}% visual similarity</span>
                </p>
                <p className="f-10 mb-0 txt-thm-clr-6 line-ht-15">
                  {visualTop.character.series} — {visualTop.character.shape_language}
                </p>
                <p className="f-10 mt-2 mb-0 txt-thm-clr-6 italic line-ht-15">
                  Now create a completely original character inspired by these design principles.
                </p>
              </div>
            )}

            {/* Resonant Constellation: Realm + Inspiration Graph */}
            {(realm || inspiration.personalities.length > 0 || inspiration.book || inspiration.film) && (
              <div className="wht-cont mxw-450 m-auto txt-center">
                {realm && (
                  <>
                    <p className="f-10 mb-0 txt-thm-clr-6 txt-upp">Realm Resonance</p>
                    <p className="txt-thm-clr-5 line-ht-20 mb-2">
                      {realm.name} <span className="txt-thm-clr-6 line-ht-20">({realm.japanese})</span> — {realm.tagline}
                    </p>
                  </>
                )}

                <p className="f-10 txt-thm-clr-5 txt-upp fw-700">Resonant Constellation</p>
                <p className="f-10 mb-0 txt-thm-clr-6 mb-2">Not who you are — but echoes worth sitting with.</p>
                
                <div className="row float-none">
                  {inspiration.personalities.length > 0 && (
                    <div className="col-4">
                      <p className="f-10 mb-0 txt-thm-clr-6 txt-upp">Kindred Spirits</p>
                      <p className="f-12 mb-0 txt-thm-clr-5 line-ht-15">{inspiration.personalities.join(" · ")}</p>
                    </div>
                  )}
                  {inspiration.book && (
                    <div className="col-2">
                      <p className="f-10 mb-0 txt-thm-clr-6 line-ht-15 txt-upp">A Book to Explore</p>
                      <p className="f-12 mb-0 txt-thm-clr-5 line-ht-15">{inspiration.book}</p>
                    </div>
                  )}
                  {inspiration.film && (
                    <div className="col-2">
                      <p className="f-10 mb-0 txt-thm-clr-6 txt-upp">A Film to Watch</p>
                      <p className="f-12 mb-0 txt-thm-clr-5 line-ht-15">{inspiration.film}</p>
                    </div>
                  )}
                </div>

                {bridgeEntities.length > 0 && secondProfile && (
                  <p className="border-t pt-3 mt-3 f-10 italic line-ht-15 txt-thm-clr-6" style={{ borderColor: "#3a2f12" }}>
                    Your answers also echoed the{" "}
                    <strong className="txt-thm-clr-5">{secondProfile.label}</strong> — you share{" "}
                    {bridgeEntities[0].entity} with that path, among others.
                  </p>
                )}
              </div>
            )}

            <p className="txt-thm-clr-6 line-ht-24 mxw-320 m-auto mt-3 mb-4 txt-center">
              Now there&apos;s only one thing I don&apos;t know — what do I look like? In my world, I can&apos;t see my own face. But you can. Would you draw me?
            </p>

            <div className="txt-center mb-4">
              <button
                type="button"
                className="btn bdr-rds2"
                style={{ background: "transparent", color: "#C9A24B", border: "1px solid #C9A24B" }}
                onClick={() => router.push("/dossier")}
              >
                📖 View My Giantverse Dossier
              </button>
            </div>

            <div className="txt-center mb-6">
              <button
                type="button"
                className="btn pse-3 fw-600 bdr-rds2 me-2"
                onClick={handleDownload}
                disabled={downloading}
                style={{ cursor: downloading ? "wait" : "pointer" }}
              >
                {downloading ? "Saving…" : "⬇ Save & Share"}
              </button>
              <button
                type="button"
                className="btn-outline pse-4 bdr-rds2"
                onClick={() => { 
                  resetExperience(); 
                  import("@/stores/assessment.store").then(m => m.useAssessmentStore.getState().clearResult());
                  import("@/stores/scenario.store").then(m => m.useScenarioStore.getState().reset());
                  router.push("/birth"); 
                }}
              >
                Begin Again
              </button>
            </div>
          </>
        )}
      </motion.div>

      {!ready && (
        <div className="txt-center txt-thm-clr-6 mt-4" style={{ fontSize: 13 }}>Crystallising your identity…</div>
      )}
    </div>
  );
}
