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
    const shareText = `Check your Giantverse connection with ${firstName || legacyName}:`;
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 20 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[1000px] flex flex-col items-center"
      >
        <div className="poster-cont ptb-6 mxw-900 m-auto">
          {/* Full-resolution canvas, CSS-scaled for display so the browser's
              high-quality downscaler renders it (avoids the blur/aliasing a
              manual low-res canvas-to-canvas resize produced). Full-res
              pixels are still used for the PNG download below. */}
          <canvas ref={canvasRef} className="w-full" style={{ borderRadius: 6, maxWidth: "100%" }} />
        </div>

        {ready && (
          <>
            <div className="flex gap-6 justify-end mb-4 items-center w-full mxw-900 m-auto" style={{ paddingRight: '50px', marginTop: '-4px' }}>
              {/* Facebook Share */}
              <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fthegianthunt.com" target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className="text-[#C9A24B] hover:opacity-80 transition-opacity">
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              
              {/* Instagram (No direct web share, usually copy link or open profile. We will open Gianthunt profile or a hashtag) */}
              <a href="https://instagram.com/thegianthunt" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[#C9A24B] hover:opacity-80 transition-opacity">
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>

              {/* X / Twitter Share */}
              <a href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fthegianthunt.com&text=Discover%20your%20Giantverse%20Legacy%20Name!" target="_blank" rel="noopener noreferrer" aria-label="Share on X" className="text-[#C9A24B] hover:opacity-80 transition-opacity">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
              </a>

              {/* WhatsApp Share */}
              <a href="https://api.whatsapp.com/send?text=Discover%20your%20Giantverse%20Legacy%20Name!%20https%3A%2F%2Fthegianthunt.com" target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className="text-[#C9A24B] hover:opacity-80 transition-opacity">
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </a>
            </div>
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
              <a
                href="https://thegianthunt.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline bdr-rds2"
                style={{ display: 'inline-block', textDecoration: 'none' }}
              >
                🔗 Join The Gianthunt
              </a>
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
