"use client";

// Dossier Preview + paywall — shown after identity generation. Presents
// the participant's own 111-page "Dossier 2.0" book as a flip-through
// double-page-spread magazine (see DossierBook): a curiosity-driving ~10%
// of pages (cover, contents, chapter-opening legendary quotes) are fully
// visible, the rest show a locked page you can still flip past. Paying
// (currently a mock gateway, see lib/payment/gateway) unlocks every page
// for in-browser reading and download.
//
// LIVE, PER-PARTICIPANT GENERATION: POSTs the participant's already-decided
// Giantverse identity (name, archetype, realm, traits — this component
// never computes any of that itself) to /api/dossier/generate, which
// assembles the PDF entirely in Node (src/engines/dossier/pdf-assembler.ts)
// from pre-built pieces — no Python/WeasyPrint at request time, so this
// runs on Vercel's serverless functions.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session.store";
import { usePaymentStore } from "@/stores/payment.store";
import { useVisualStore } from "@/stores/visual.store";
import { PaymentModal } from "./PaymentModal";
import { DossierBook } from "./DossierBook";
import type { PDFDocumentProxy } from "pdfjs-dist";

type Stage = "loading" | "ready" | "error";
const PREVIEW_FRACTION = 0.1;

export function DossierPreview() {
  const router = useRouter();
  const session = useSessionStore((s) => s);
  const legacyName = session.legacyName;
  const visualMatches = useVisualStore((s) => s.matches);
  const unlocked = usePaymentStore((s) => s.status === "unlocked");

  const [stage, setStage] = useState<Stage>("loading");
  const [error, setError] = useState<string | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [previewPages, setPreviewPages] = useState<number[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const startedRef = useRef(false);
  const pdfDocPromiseRef = useRef<Promise<PDFDocumentProxy> | null>(null);

  const load = useCallback(async () => {
    setStage("loading");
    setError(null);
    try {
      const res = await fetch("/api/dossier/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          realName: session.firstName,
          birthName: session.birthName,
          legacyName: session.legacyName,
          archetypeId: session.archetype,
          order: session.order,
          guidingPromise: session.guidingPromise,
          scores: session.scores,
          scoreHistory: session.scoreHistory,
          visualMatches: visualMatches?.length
            ? visualMatches.map((m) => ({
                name: m.character.name,
                series: m.character.series,
                designer: m.character.designer,
                studio: m.character.studio,
                franchise: m.character.franchise,
                similarity: m.similarity,
                description: m.character.description,
                shapeLanguage: m.character.shape_language,
                communicates: m.character.design_breakdown.communicates,
                through: m.character.design_breakdown.through,
                creatorLinks: m.character.creatorLinks,
              }))
            : undefined,
        }),
      });
      if (!res.ok) throw new Error("generate failed");

      const pages = Number(res.headers.get("X-Dossier-Pages") ?? 0);
      const quotePagesHeader = res.headers.get("X-Dossier-Quote-Pages") ?? "";
      const quotePages = quotePagesHeader ? quotePagesHeader.split(",").map(Number) : [];

      const buf = new Uint8Array(await res.arrayBuffer());
      const cap = Math.max(3, Math.round(pages * PREVIEW_FRACTION));
      const candidates = Array.from(new Set([1, 3, 5, ...quotePages])).sort((a, b) => a - b);

      setPdfBytes(buf);
      setTotalPages(pages);
      setPreviewPages(candidates.slice(0, cap));
      setStage("ready");
    } catch {
      setError("Your dossier couldn't be loaded — please try again.");
      setStage("error");
    }
  }, [session, visualMatches]);

  useEffect(() => {
    if (!legacyName) { router.replace("/birth"); return; }
    if (startedRef.current) return;
    startedRef.current = true;
    load();
  }, [legacyName, router, load]);

  // Lazily loads the pdf.js document exactly once, the first time anything
  // asks for it — whichever fires first, DossierBook's own render-request
  // effect or anything here.
  const getDoc = useCallback((): Promise<PDFDocumentProxy> | null => {
    if (!pdfBytes) return null;
    if (!pdfDocPromiseRef.current) {
      pdfDocPromiseRef.current = (async () => {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        return pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise;
      })();
    }
    return pdfDocPromiseRef.current;
  }, [pdfBytes]);

  const renderPage = useCallback(async (pageNum: number): Promise<string | null> => {
    const docPromise = getDoc();
    if (!docPromise) return null;
    const doc = await docPromise;
    const page = await doc.getPage(pageNum);
    // Scaled up for the edge-to-edge reader (DossierBook now displays pages
    // at up to ~560px wide, on retina screens up to 2-3x that in device
    // pixels) — render high enough that body text stays crisp at that size
    // instead of upscaled from a thumbnail-sized canvas.
    const viewport = page.getViewport({ scale: 2.4 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    return canvas.toDataURL("image/jpeg", 0.92);
  }, [getDoc]);

  const previewSet = useMemo(() => new Set(previewPages), [previewPages]);
  const isPageUnlocked = useCallback(
    (pageNum: number) => unlocked || previewSet.has(pageNum),
    [unlocked, previewSet],
  );

  function handleDownload() {
    if (!pdfBytes) return;
    const url = URL.createObjectURL(new Blob([pdfBytes.slice()], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(legacyName || "giantverse").replace(/[^a-z0-9]+/gi, "-")}-dossier.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleOpenNewTab() {
    if (!pdfBytes) return;
    const url = URL.createObjectURL(new Blob([pdfBytes.slice()], { type: "application/pdf" }));
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (!legacyName) return null;

  return (
    <div className="legacy-container container2" style={{ minHeight: "100vh" }}>
      <div className="head-bdr"></div>
      {/* .container-fluid's own stylesheet rule caps it at 550px (app/legacy-ui.css) —
          fine for the rest of the narrow, mobile-first ritual flow, but the dossier
          reader needs real room to be readable, so it's overridden inline here only. */}
      <div className="container-fluid" style={{ paddingBottom: 48, maxWidth: 1280 }}>
        <div className="content" style={{ maxWidth: 1240, margin: "0 auto", paddingTop: 40, paddingLeft: 16, paddingRight: 16 }}>
          <p className="f-12 txt-center txt-thm-clr-50-2 txt-upp letter-spacing2 mb-1">Giantverse Dossier</p>
          <h1 className="txt-center h2 fw-600 mb-2" style={{ color: "#EFE9DA", fontFamily: "Georgia, serif" }}>
            The Character Genesis Dossier
          </h1>
          <p className="mxw-450 m-auto txt-center f-13 txt-thm-clr-70-2 line-ht-20 mb-4">
            A 111-page premium collector's-edition book, personalized to {legacyName} — legendary-creator master
            studies, a full character-design blueprint, and a personalized Hero Journey. Flip through it below —
            locked pages open the way in.
          </p>

          {stage === "loading" && (
            <div className="txt-center" style={{ paddingTop: 60, paddingBottom: 60 }}>
              <div
                className="m-auto mb-3"
                style={{
                  width: 48, height: 48, borderRadius: "50%", border: "2px solid #C9A24B",
                  borderTopColor: "transparent", animation: "spin 1s linear infinite",
                }}
              />
              <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
              <p className="f-12 txt-thm-clr-70-2">Opening the dossier…</p>
            </div>
          )}

          {stage === "error" && (
            <div className="txt-center">
              <p className="f-12 mb-3" style={{ color: "#B4543F" }}>{error}</p>
              <button type="button" className="btn bdr-rds2" onClick={load}>Try Again</button>
            </div>
          )}

          {stage === "ready" && (
            <>
              <div className="mb-4">
                <DossierBook
                  totalPages={totalPages}
                  isPageUnlocked={isPageUnlocked}
                  renderPage={renderPage}
                  onLockedClick={() => setShowPayment(true)}
                />
              </div>

              {!unlocked ? (
                <div className="txt-center wht-cont p-4" style={{ border: "1px solid #3a2f12" }}>
                  <p className="f-12 txt-thm-clr-70-2 mb-1">
                    You're seeing {previewPages.length} of {totalPages} pages for free — the master studies, the full
                    character design blueprint, the Hero Journey and the drawing workbook are still locked.
                  </p>
                  <button type="button" className="btn bdr-rds2 mt-2" onClick={() => setShowPayment(true)}>
                    Register to Giant Hunt at ₹999 to unlock the full Dossier
                  </button>
                </div>
              ) : (
                <div className="txt-center wht-cont p-4" style={{ border: "1px solid #C9A24B" }}>
                  <p className="f-12" style={{ color: "#C9A24B" }}>✓ Full dossier unlocked — flip through every page above</p>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
                    <button type="button" className="btn bdr-rds2" onClick={handleDownload}>⬇ Download PDF</button>
                    <button type="button" className="btn-outline bdr-rds2" onClick={handleOpenNewTab}>Open in New Tab</button>
                    <button type="button" className="btn-outline bdr-rds2" onClick={() => router.push("/design-studio")}>
                      Open Design Studio →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <div className="foot-bdr"></div>

      {showPayment && (
        <PaymentModal onClose={() => setShowPayment(false)} onUnlocked={() => setShowPayment(false)} />
      )}
    </div>
  );
}
