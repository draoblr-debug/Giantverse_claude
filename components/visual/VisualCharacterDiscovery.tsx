"use client";

// Visual Character Discovery — optional onboarding module.
//
// Flow: intro (privacy) → selfie/upload → analyzing → top-5 results →
// CTA into the EXISTING Giantverse ritual. The visual match is inspiration
// only; identity generation remains exclusively DOB + name + archetype.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useVisualStore } from "@/stores/visual.store";
import { computeVisualEmbedding } from "@/lib/visual/face-embedding.service";
import { matchCharacters } from "@/lib/visual/character-matcher";
import { CharacterResultCard } from "@/components/visual/CharacterResultCard";
import { DesignPrincipleCard } from "@/components/visual/DesignPrincipleCard";
import { ShareCard } from "@/components/visual/ShareCard";

type Stage = "intro" | "camera" | "preview" | "analyzing" | "results" | "error";

const PRIVACY_LINE = "Your photo is only used to generate visual similarity and is not stored.";

export function VisualCharacterDiscovery() {
  const router = useRouter();
  const { photoDataUrl, matches, setPhoto, clearPhoto, setMatches, reset } = useVisualStore();
  const [stage, setStage] = useState<Stage>(matches ? "results" : "intro");
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(true);

  useEffect(() => {
    async function checkCamera() {
      if (typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasVideoInput = devices.some(device => device.kind === "videoinput");
          setHasCamera(hasVideoInput);
        } catch (err) {
          setHasCamera(false);
        }
      } else {
        setHasCamera(false);
      }
    }
    checkCamera();
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  async function startCamera() {
    // Camera access requires a secure context. Mobile browsers only exempt
    // literal "localhost" — a LAN IP over plain HTTP (e.g. testing a phone
    // against a dev server) is treated as insecure and getUserMedia is
    // unavailable there, even though it works fine on desktop localhost.
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setError("Camera access needs a secure (https://) connection — this page is loaded over http://. Upload a photo instead, or open this page over HTTPS.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera access isn't supported in this browser — you can upload a photo instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 } }, audio: false,
      });
      streamRef.current = stream;
      setStage("camera");
      // attach after render
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      const message =
        name === "NotAllowedError" || name === "PermissionDeniedError"
          ? "Camera permission was declined — allow camera access in your browser settings, or upload a photo instead."
          : name === "NotFoundError" || name === "DevicesNotFoundError"
          ? "No camera was found on this device — you can upload a photo instead."
          : name === "NotReadableError" || name === "TrackStartError"
          ? "Your camera is already in use by another app — close it and try again, or upload a photo instead."
          : name === "OverconstrainedError"
          ? "Your camera doesn't support the requested settings — you can upload a photo instead."
          : "Couldn't access the camera — you can upload a photo instead.";
      setError(message);
    }
  }

  function captureFrame() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const c = document.createElement("canvas");
    const s = Math.min(video.videoWidth, video.videoHeight);
    c.width = 640; c.height = 640;
    const ctx = c.getContext("2d")!;
    // mirror to match the on-screen preview
    ctx.translate(640, 0); ctx.scale(-1, 1);
    ctx.drawImage(video, (video.videoWidth - s) / 2, (video.videoHeight - s) / 2, s, s, 0, 0, 640, 640);
    setPhoto(c.toDataURL("image/jpeg", 0.9));
    stopCamera();
    setStage("preview");
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setPhoto(String(reader.result)); setStage("preview"); };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function analyze() {
    if (!photoDataUrl) return;
    setStage("analyzing");
    try {
      // small pause so the stage reads; analysis itself is near-instant
      await new Promise((r) => setTimeout(r, 900));
      const embedding = await computeVisualEmbedding(photoDataUrl);
      const results = matchCharacters(embedding.axes, { count: 5 });
      setMatches(results);
      clearPhoto(); // pixels dropped the moment analysis completes
      setStage("results");
    } catch {
      setError("That image couldn't be analysed — try a clearer, front-facing photo.");
      setStage("error");
    }
  }

  const top = matches?.[0];

  return (
    <div className="legacy-container container2" style={{ minHeight: "100vh" }}>
      <div className="head-bdr"></div>
      <div className="container-fluid" style={{ paddingBottom: 48 }}>
        <div className="content" style={{ maxWidth: 640, margin: "0 auto", paddingTop: 40 }}>
          <p className="f-12 txt-center txt-thm-clr-50-2 txt-upp letter-spacing2 mb-1">Visual Character Discovery</p>
          <h1 className="txt-center h2 fw-600 mb-2" style={{ color: "#EFE9DA", fontFamily: "Georgia, serif" }}>
            {stage === "results" ? "Your Visual Character Matches" : "Who Do You Visually Resemble?"}
          </h1>

          <AnimatePresence mode="wait">
            {stage === "intro" && (
              <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="txt-center">
                <p className="mxw-385 m-auto txt-center f-14 txt-thm-clr-70-2 line-ht-20 mb-3">
                  Compare your visual appearance against a curated library of legendary character designs.
                  This finds the design language you <em>visually resemble</em> — it is not face recognition,
                  not personality prediction, and never touches your Giantverse identity.
                </p>
                <div className="flex m-auto" style={{ gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  {hasCamera && (
                    <button type="button" className="btn bdr-rds2" onClick={startCamera}>📷 Take Selfie</button>
                  )}
                  <button type="button" className="btn bdr-rds2" onClick={() => fileRef.current?.click()}>⬆ Upload Image</button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
                <p className="f-10 mt-3" style={{ color: "#6E695F" }}>{PRIVACY_LINE}</p>
                {error && <p className="f-12 mt-2" style={{ color: "#B4543F" }}>{error}</p>}
              </motion.div>
            )}

            {stage === "camera" && (
              <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="txt-center">
                <video
                  ref={videoRef} playsInline muted
                  className="m-auto mb-3"
                  style={{ width: "100%", maxWidth: 420, borderRadius: 10, transform: "scaleX(-1)", border: "1px solid #3a2f12" }}
                />
                <div className="flex m-auto" style={{ gap: 12, justifyContent: "center" }}>
                  <button type="button" className="btn bdr-rds2" onClick={captureFrame}>Capture</button>
                  <button type="button" className="btn bdr-rds2" onClick={() => { stopCamera(); setStage("intro"); }}
                    style={{ background: "transparent", color: "#8A8478", border: "1px solid #3a2f12" }}>Cancel</button>
                </div>
                <p className="f-10 mt-3" style={{ color: "#6E695F" }}>{PRIVACY_LINE}</p>
              </motion.div>
            )}

            {stage === "preview" && photoDataUrl && (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="txt-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoDataUrl} alt="Your photo (kept in memory only)" className="m-auto mb-3"
                  style={{ width: "100%", maxWidth: 320, borderRadius: 10, border: "1px solid #3a2f12" }} />
                <div className="flex m-auto" style={{ gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <button type="button" className="btn bdr-rds2" onClick={analyze}>Find My Visual Matches</button>
                  <button type="button" className="btn bdr-rds2" onClick={() => { clearPhoto(); setStage("intro"); }}
                    style={{ background: "transparent", color: "#8A8478", border: "1px solid #3a2f12" }}>🗑 Delete Photo</button>
                </div>
                <p className="f-10 mt-3" style={{ color: "#6E695F" }}>{PRIVACY_LINE}</p>
              </motion.div>
            )}

            {stage === "analyzing" && (
              <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="txt-center" style={{ paddingTop: 60, paddingBottom: 60 }}>
                <motion.div
                  className="m-auto mb-3"
                  style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid #C9A24B", borderTopColor: "transparent" }}
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
                <p className="f-12 txt-thm-clr-70-2">Measuring face geometry, hair silhouette, shape language…</p>
              </motion.div>
            )}

            {stage === "error" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="txt-center">
                <p className="f-12 mb-3" style={{ color: "#B4543F" }}>{error}</p>
                <button type="button" className="btn bdr-rds2" onClick={() => { reset(); setStage("intro"); }}>Try Again</button>
              </motion.div>
            )}

            {stage === "results" && matches && top && (
              <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <p className="f-12 txt-center txt-thm-clr-70-2 mb-3">
                  You <span style={{ color: "#C9A24B" }}>visually resemble</span> these character designs — top five, always.
                </p>

                {matches.map((m, i) => (
                  <CharacterResultCard key={m.character.id} match={m} rank={i + 1} expanded={i === 0} />
                ))}

                <div className="mt-4 mb-4">
                  <DesignPrincipleCard character={top.character} />
                </div>

                <div className="mb-4">
                  <ShareCard match={top} />
                </div>

                <div className="txt-center wht-cont p-4 rounded-md" style={{ border: "1px solid #3a2f12" }}>
                  <p className="f-12 txt-thm-clr-70-2 mb-1">
                    That was inspiration. Your <strong style={{ color: "#C9A24B" }}>original</strong> Giantverse identity is
                    generated from your name and date of birth — never from your face.
                  </p>
                  <button type="button" className="btn bdr-rds2 mt-2" onClick={() => router.push("/birth")}>
                    Create My Original Giantverse Identity
                  </button>
                </div>

                <p className="f-10 txt-center mt-3" style={{ color: "#6E695F" }}>
                  Your photo was analysed in your browser and has already been discarded. {PRIVACY_LINE}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="foot-bdr"></div>
    </div>
  );
}
