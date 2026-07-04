"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSessionStore } from "@/stores/session.store";
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
    <div
      className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8"
      style={{ background: "#0a0a0a", minHeight: "100vh" }}
    >
      {/* Off-screen full-res canvas for download */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 20 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Scaled display canvas */}
        <canvas ref={displayCanvasRef} style={{ borderRadius: 6, maxWidth: "100%" }} />

        {ready && (
          <div className="flex flex-col items-center gap-3">
            {/* Resonant Constellation: Realm + Inspiration Graph */}
            {(realm || inspiration.personalities.length > 0 || inspiration.book || inspiration.film) && (
              <div
                className="flex w-full max-w-md flex-col items-center gap-4 rounded-md px-6 py-5 text-center"
                style={{ border: "1px solid #3a2f12", background: "#000506" }}
              >
                {realm && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: "#7A6128" }}>
                      Realm Resonance
                    </p>
                    <p className="mt-1 text-sm" style={{ color: "#C9A84C" }}>
                      {realm.name} <span style={{ color: "#7A6128" }}>({realm.japanese})</span> — {realm.tagline}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "#C9A84C" }}>
                    Resonant Constellation
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "#7A6128" }}>
                    Not who you are — but echoes worth sitting with.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-8">
                  {inspiration.personalities.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: "#7A6128" }}>
                        Kindred Spirits
                      </p>
                      <p className="mt-1 text-xs" style={{ color: "#C9A84C" }}>
                        {inspiration.personalities.join(" · ")}
                      </p>
                    </div>
                  )}
                  {inspiration.book && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: "#7A6128" }}>
                        A Book to Explore
                      </p>
                      <p className="mt-1 text-xs" style={{ color: "#C9A84C" }}>{inspiration.book}</p>
                    </div>
                  )}
                  {inspiration.film && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: "#7A6128" }}>
                        A Film to Watch
                      </p>
                      <p className="mt-1 text-xs" style={{ color: "#C9A84C" }}>{inspiration.film}</p>
                    </div>
                  )}
                </div>

                {bridgeEntities.length > 0 && secondProfile && (
                  <p
                    className="border-t pt-3 text-[11px] italic leading-relaxed"
                    style={{ color: "#7A6128", borderColor: "#3a2f12" }}
                  >
                    Your answers also echoed the{" "}
                    <strong style={{ color: "#C9A84C" }}>{secondProfile.label}</strong> — you share{" "}
                    {bridgeEntities[0].entity} with that path, among others.
                  </p>
                )}
              </div>
            )}

            <p className="max-w-xs text-center text-sm leading-relaxed" style={{ color: "#7A6128" }}>
              Now there&apos;s only one thing I don&apos;t know — what do I look like?
              In my world, I can&apos;t see my own face. But you can.
              Would you draw me?
            </p>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                style={{
                  background: "#C9A84C", color: "#0a0a0a",
                  border: "none", borderRadius: 6,
                  padding: "10px 24px", fontWeight: "bold",
                  fontSize: 13, cursor: downloading ? "wait" : "pointer",
                  letterSpacing: "0.05em",
                }}
              >
                {downloading ? "Saving…" : "⬇ Save & Share"}
              </button>

              <button
                type="button"
                onClick={() => { resetExperience(); router.push("/birth"); }}
                style={{
                  background: "transparent", color: "#7A6128",
                  border: "1px solid #7A6128", borderRadius: 6,
                  padding: "10px 20px", fontSize: 13, cursor: "pointer",
                }}
              >
                Begin Again
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {!ready && (
        <div style={{ color: "#7A6128", fontSize: 13 }}>Crystallising your identity…</div>
      )}
    </div>
  );
}
