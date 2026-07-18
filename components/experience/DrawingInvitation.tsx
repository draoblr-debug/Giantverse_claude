"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSessionStore } from "@/stores/session.store";
import { useVisualStore } from "@/stores/visual.store";
import { useInviteStore } from "@/stores/invite.store";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import { drawCard } from "@/lib/card-generator";

// The Dossier is a static preview build (see components/dossier/DossierPreview.tsx)
// not yet ready for general users — hidden here without touching the route,
// generator, or the rest of the flow, so it can be switched back on later.
const SHOW_DOSSIER_CTA = false;

export function DrawingInvitation() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const { birthName, legacyName, archetypeLabel, archetype, order, guidingPromise, traits, firstName, scoreHistory, resetExperience } =
    useSessionStore();
  const visualMatches = useVisualStore((s) => s.matches);
  const visualTop = visualMatches?.[0] ?? null;
  const pendingInvite = useInviteStore((s) => s.pending);
  const clearPendingInvite = useInviteStore((s) => s.clearPending);

  async function handleInviteFriend() {
    if (!legacyName || typeof window === "undefined") return;
    const params = new URLSearchParams({ invite: legacyName });
    if (firstName) params.set("name", firstName);
    const url = `${window.location.origin}/compatibility?${params.toString()}`;
    const shareText = `I just became ${legacyName} in the Giantverse. Reveal your own Legacy Name and see how we match up:`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Giant Hunt Compatibility", text: shareText, url });
        return;
      } catch {
        // user cancelled the share sheet — fall through to clipboard copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      // clipboard unavailable — nothing more we can do without a fallback UI
    }
  }

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

            <p className="txt-thm-clr-6 line-ht-24 mxw-320 m-auto mt-3 mb-4 txt-center">
              Now there&apos;s only one thing I don&apos;t know — what do I look like? In my world, I can&apos;t see my own face. But you can. Would you draw me?
            </p>

            {SHOW_DOSSIER_CTA && (
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
            )}

            {pendingInvite && (
              <div className="txt-center mb-4">
                <button
                  type="button"
                  className="btn bdr-rds2"
                  onClick={() => router.push("/compatibility")}
                >
                  🤝 Check Compatibility with {pendingInvite.inviterName}
                </button>
              </div>
            )}

            <div className="txt-center mb-4">
              <button
                type="button"
                className="btn-outline bdr-rds2"
                onClick={handleInviteFriend}
              >
                {linkCopied ? "✓ Link Copied!" : "🔗 Share With a Friend to Reveal Your Giantverse Relationship"}
              </button>
              <p className="f-10 mt-2" style={{ color: "#6E695F" }}>
                They&apos;ll reveal their own Legacy Name, then land pre-matched against yours.
              </p>
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
                  clearPendingInvite();
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
