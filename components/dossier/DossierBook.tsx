"use client";

// Magazine-style double-page-spread book viewer for the Giantverse Dossier.
// Page 1 (the cover) sits alone on the right, like a closed book — the
// left slot is empty until the reader turns past it. Renders real pdf.js
// pages for whichever pages are unlocked (the ~10% curiosity teaser, or
// all of them once paid) and a locked-page placeholder for the rest — so
// flipping through the whole book is always possible, but most pages read
// "🔒" until payment.
//
// Page turns are grabbed from the bottom corner — bottom-right to go
// forward, bottom-left to go back — like turning a physical page. The
// flipping leaf is split into three horizontal strips, each hinged at the
// same spine edge but animated with a different ease curve (bottom fastest,
// top slowest), so the bottom visibly leads and the turn reads as a
// corner-peel instead of a uniform rotation. Each strip has a real front
// face (its slice of the page) and a real back face (the same slice,
// mirrored and dimmed, standing in for the reverse of the sheet) — nothing
// blank flashes past mid-turn. Rendering is pre-fetched several spreads
// ahead so pages are already loaded by the time a turn reaches them.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  motion, AnimatePresence, useMotionValue, useTransform, useMotionTemplate, animate as fmAnimate,
} from "framer-motion";

type Spread = { left: number | null; right: number | null };
type FlipState = { dir: "next" | "prev"; img: string | null; locked: boolean; pageNum: number } | null;

const FLIP_DURATION = 0.9;
const PAGE_W = 220;
const PAGE_H = 311; // A4-ish ratio, ~1:1.414
const STRIP_COUNT = 3;
const STRIP_H = PAGE_H / STRIP_COUNT;
// Bottom strip flies fastest (fast start), top strip lags (slow start) —
// all three still start and end together, so the leaf never looks torn.
const STRIP_EASES: [number, number, number, number][] = [
  [0.7, 0, 0.9, 0.35],
  [0.62, 0.05, 0.38, 1],
  [0.12, 0.7, 0.3, 1],
];
const PREFETCH_RADIUS = 4;

export function DossierBook({
  totalPages,
  isPageUnlocked,
  renderPage,
  onLockedClick,
}: {
  totalPages: number;
  isPageUnlocked: (pageNum: number) => boolean;
  renderPage: (pageNum: number) => Promise<string | null>;
  onLockedClick: () => void;
}) {
  const [perSpread, setPerSpread] = useState(2);
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [thumbs, setThumbs] = useState<Record<number, string>>({});
  const [flip, setFlip] = useState<FlipState>(null);
  const requestedRef = useRef<Set<number>>(new Set());
  const stripRotations = [useMotionValue(0), useMotionValue(0), useMotionValue(0)];

  useEffect(() => {
    function update() {
      setPerSpread(window.innerWidth < 720 ? 1 : 2);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const spreads = useMemo(() => {
    const s: Spread[] = [];
    if (totalPages <= 0) return s;
    if (perSpread === 2) {
      s.push({ left: null, right: 1 }); // cover alone on the right — a closed book
      for (let p = 2; p <= totalPages; p += 2) {
        s.push({ left: p, right: p + 1 <= totalPages ? p + 1 : null });
      }
    } else {
      for (let p = 1; p <= totalPages; p++) s.push({ left: null, right: p });
    }
    return s;
  }, [totalPages, perSpread]);

  const idx = Math.min(spreadIndex, Math.max(0, spreads.length - 1));
  const currentSpread = spreads[idx] ?? { left: null, right: null };

  const ensureRendered = useCallback(
    (pageNum: number) => {
      if (requestedRef.current.has(pageNum) || !isPageUnlocked(pageNum)) return;
      requestedRef.current.add(pageNum);
      renderPage(pageNum)
        .then((src) => {
          if (!src) { requestedRef.current.delete(pageNum); return; } // allow retry
          setThumbs((prev) => ({ ...prev, [pageNum]: src }));
        })
        .catch(() => { requestedRef.current.delete(pageNum); });
    },
    [isPageUnlocked, renderPage],
  );

  const prefetchAround = useCallback(
    (center: number) => {
      const toLoad = new Set<number>();
      for (let i = center - PREFETCH_RADIUS; i <= center + PREFETCH_RADIUS; i++) {
        const sp = spreads[i];
        if (sp?.left) toLoad.add(sp.left);
        if (sp?.right) toLoad.add(sp.right);
      }
      toLoad.forEach(ensureRendered);
    },
    [spreads, ensureRendered],
  );

  // Wide rolling preload window, so pages several turns ahead are already
  // rendered — a turn should never reveal a "rendering…" placeholder.
  useEffect(() => { prefetchAround(idx); }, [idx, prefetchAround]);

  function go(direction: "next" | "prev") {
    if (flip) return;
    const targetIdx = direction === "next" ? idx + 1 : idx - 1;
    if (targetIdx < 0 || targetIdx >= spreads.length) return;

    // Preload immediately (don't wait for the post-render effect) so the
    // target content has the full flip duration — and then some — to load.
    prefetchAround(targetIdx);

    const outgoingPage = direction === "next" ? currentSpread.right : currentSpread.left;
    const locked = outgoingPage ? !isPageUnlocked(outgoingPage) : false;
    const img = outgoingPage && !locked ? thumbs[outgoingPage] ?? null : null;

    setFlip({ dir: direction, img, locked, pageNum: outgoingPage ?? 0 });
    setSpreadIndex(targetIdx);
    const target = direction === "next" ? -180 : 180;
    stripRotations.forEach((mv) => mv.set(0));
    Promise.all(
      stripRotations.map((mv, i) =>
        fmAnimate(mv, target, { duration: FLIP_DURATION, ease: STRIP_EASES[i] })
      ),
    ).then(() => setFlip(null));
  }

  function PageFace({ pageNum, tilt }: { pageNum: number | null; tilt: number }) {
    if (!pageNum) return <div style={{ ...pageStyle, transform: `rotateY(${tilt}deg)` }} />;
    const locked = !isPageUnlocked(pageNum);
    if (locked) {
      return (
        <div
          style={{ ...pageStyle, ...lockedPageStyle, transform: `rotateY(${tilt}deg)` }}
          onClick={onLockedClick}
          role="button"
          tabIndex={0}
        >
          <span style={{ fontSize: 26 }}>🔒</span>
          <span style={{ fontSize: 10, color: "#8A8478", marginTop: 8, letterSpacing: 1 }}>PAGE {pageNum}</span>
          <span style={{ fontSize: 9, color: "#C9A24B", marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>
            Tap to unlock
          </span>
        </div>
      );
    }
    const src = thumbs[pageNum];
    return (
      <div style={{ ...pageStyle, transform: `rotateY(${tilt}deg)` }}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={`Dossier page ${pageNum}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 10, color: "#6E695F" }}>rendering…</span>
        )}
      </div>
    );
  }

  if (totalPages <= 0) return null;

  const label = perSpread === 2
    ? currentSpread.left && currentSpread.right
      ? `Pages ${currentSpread.left}–${currentSpread.right} of ${totalPages}`
      : `Page ${currentSpread.left ?? currentSpread.right} of ${totalPages}`
    : `Page ${currentSpread.right} of ${totalPages}`;

  const canPrev = idx > 0;
  const canNext = idx < spreads.length - 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", justifyContent: "center" }}>
        <button
          type="button"
          onClick={() => go("prev")}
          disabled={!canPrev}
          aria-label="Previous page"
          style={navBtnStyle(!canPrev)}
        >
          ‹
        </button>

        <div
          style={{
            position: "relative", display: "flex", perspective: 3000, perspectiveOrigin: "50% 50%",
            boxShadow: "0 24px 70px rgba(0,0,0,0.55)", borderRadius: 4,
          }}
        >
          {perSpread === 2 && <div style={spineShadowStyle} />}
          {perSpread === 2 && <PageFace pageNum={currentSpread.left} tilt={1.5} />}
          <PageFace pageNum={currentSpread.right} tilt={perSpread === 2 ? -1.5 : 0} />

          <AnimatePresence>
            {flip && (
              <FlipLeaf flip={flip} perSpread={perSpread} rotations={stripRotations} onLockedClick={onLockedClick} />
            )}
          </AnimatePresence>

          {/* Corner grab zones — bottom-right turns forward, bottom-left turns back,
              like pinching the corner of a physical page. */}
          {canNext && (
            <div
              onClick={() => go("next")}
              role="button"
              tabIndex={0}
              aria-label="Turn page forward from bottom-right corner"
              style={{ ...cornerZoneStyle, right: 0, bottom: 0, cursor: "pointer" }}
            >
              <div style={cornerFoldStyle("right")} />
            </div>
          )}
          {canPrev && (
            <div
              onClick={() => go("prev")}
              role="button"
              tabIndex={0}
              aria-label="Turn page back from bottom-left corner"
              style={{ ...cornerZoneStyle, left: 0, bottom: 0, cursor: "pointer" }}
            >
              <div style={cornerFoldStyle("left")} />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => go("next")}
          disabled={!canNext}
          aria-label="Next page"
          style={navBtnStyle(!canNext)}
        >
          ›
        </button>
      </div>

      <p style={{ fontSize: 11, color: "#6E695F", letterSpacing: 1 }}>{label}</p>
    </div>
  );
}

function LockedSliceContent() {
  return (
    <div style={{ ...lockedPageStyle, width: "100%", height: PAGE_H, display: "flex" }}>
      <span style={{ fontSize: 26 }}>🔒</span>
      <span style={{ fontSize: 10, color: "#8A8478", marginTop: 8, letterSpacing: 1 }}>LOCKED</span>
    </div>
  );
}

function FlipLeaf({
  flip,
  perSpread,
  rotations,
  onLockedClick,
}: {
  flip: NonNullable<FlipState>;
  perSpread: number;
  rotations: ReturnType<typeof useMotionValue<number>>[];
  onLockedClick: () => void;
}) {
  const hinge = flip.dir === "next" ? "left" : "right";
  const leftPos = flip.dir === "next" ? (perSpread === 2 ? "50%" : 0) : 0;
  const width = perSpread === 2 ? "50%" : "100%";

  // Shadow/light cues track the MIDDLE strip's live rotation (a
  // representative proxy for the whole leaf), via useTransform — so they
  // follow the actual instantaneous angle every frame, not a fixed timeline.
  const midRotate = rotations[1];
  const progress = useTransform(midRotate, (v) => Math.min(Math.abs(v) / 180, 1));
  const bump = useTransform(progress, (p) => Math.sin(p * Math.PI));
  const liftBlur = useTransform(bump, (b) => 10 + b * 46);
  const liftAlpha = useTransform(bump, (b) => 0.18 + b * 0.42);
  const boxShadow = useMotionTemplate`0 0 ${liftBlur}px rgba(0,0,0,${liftAlpha})`;
  const shadeOpacity = useTransform(bump, (b) => b * 0.6);
  const glossOpacity = useTransform(bump, (b) => b * 0.35);

  return (
    <motion.div
      key="flip-leaf"
      exit={{ opacity: 0 }}
      style={{
        position: "absolute", top: 0, bottom: 0, left: leftPos, width,
        display: "flex", flexDirection: "column",
        boxShadow, borderRadius: hinge === "left" ? "0 2px 2px 0" : "2px 0 0 2px",
      }}
    >
      {[0, 1, 2].map((i) => (
        <FlipStrip
          key={i}
          index={i}
          hinge={hinge}
          rotate={rotations[i]}
          content={
            flip.locked
              ? <LockedSliceContent />
              : flip.img
                ? // eslint-disable-next-line @next/next/no-img-element
                  <img src={flip.img} alt="" style={{ position: "absolute", top: -i * STRIP_H, left: 0, width: "100%", height: PAGE_H, objectFit: "cover" }} />
                : null
          }
          locked={flip.locked}
          onLockedClick={onLockedClick}
        />
      ))}
      <motion.div style={{ ...directionalShadeStyle, opacity: shadeOpacity }} />
      <motion.div style={{ ...glossStyle, opacity: glossOpacity }} />
    </motion.div>
  );
}

function FlipStrip({
  index,
  hinge,
  rotate,
  content,
  locked,
  onLockedClick,
}: {
  index: number;
  hinge: "left" | "right";
  rotate: ReturnType<typeof useMotionValue<number>>;
  content: ReactNode;
  locked: boolean;
  onLockedClick: () => void;
}) {
  const origin = hinge === "left" ? "left center" : "right center";
  return (
    <div style={{ height: STRIP_H, width: "100%", position: "relative", overflow: "hidden" }}>
      <motion.div
        style={{
          position: "absolute", inset: 0, transformStyle: "preserve-3d",
          transformOrigin: origin, rotateY: rotate,
        }}
      >
        {/* front — this strip's slice of the outgoing page */}
        <div
          style={{ ...leafFaceStyle, backfaceVisibility: "hidden" }}
          onClick={locked ? onLockedClick : undefined}
        >
          {content}
        </div>
        {/* back — the same slice, mirrored and dimmed, standing in for the reverse of the sheet */}
        <div style={{ ...leafFaceStyle, backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "#171310" }}>
          <div style={{ position: "absolute", inset: 0, transform: "scaleX(-1)", opacity: 0.4, filter: "brightness(0.55) saturate(0.7)" }}>
            {content}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const pageStyle: CSSProperties = {
  width: PAGE_W, height: PAGE_H,
  background: "#12100E",
  border: "1px solid #3a2f12",
  display: "flex", alignItems: "center", justifyContent: "center",
  overflow: "hidden",
  transformStyle: "preserve-3d",
};

const leafFaceStyle: CSSProperties = {
  position: "absolute", inset: 0,
  background: "#1A1611",
  overflow: "hidden",
};

const lockedPageStyle: CSSProperties = {
  flexDirection: "column",
  background: "repeating-linear-gradient(135deg, #17130E, #17130E 10px, #1B160F 10px, #1B160F 20px)",
  cursor: "pointer",
  alignItems: "center", justifyContent: "center",
};

const spineShadowStyle: CSSProperties = {
  position: "absolute", left: "50%", top: 0, bottom: 0, width: 20, marginLeft: -10,
  background: "linear-gradient(90deg, rgba(0,0,0,0.4), rgba(0,0,0,0) 50%, rgba(0,0,0,0.4))",
  pointerEvents: "none", zIndex: 3,
};

const directionalShadeStyle: CSSProperties = {
  position: "absolute", inset: 0,
  background: "linear-gradient(90deg, rgba(0,0,0,0.7), transparent 55%)",
  pointerEvents: "none",
};

const glossStyle: CSSProperties = {
  position: "absolute", inset: 0,
  background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.5) 48%, transparent 62%)",
  mixBlendMode: "overlay",
  pointerEvents: "none",
};

const cornerZoneStyle: CSSProperties = {
  position: "absolute", width: 46, height: 46, zIndex: 4,
};

function cornerFoldStyle(side: "left" | "right"): CSSProperties {
  return {
    position: "absolute", width: "100%", height: "100%",
    background: side === "right"
      ? "linear-gradient(135deg, transparent 55%, rgba(201,162,75,0.35) 56%, rgba(201,162,75,0.15) 100%)"
      : "linear-gradient(225deg, transparent 55%, rgba(201,162,75,0.35) 56%, rgba(201,162,75,0.15) 100%)",
    clipPath: side === "right"
      ? "polygon(100% 100%, 100% 30%, 30% 100%)"
      : "polygon(0 100%, 0 30%, 70% 100%)",
  };
}

function navBtnStyle(disabled: boolean): CSSProperties {
  return {
    width: 36, height: 36, borderRadius: "50%", border: "1px solid #3a2f12",
    background: "transparent", color: disabled ? "#3a2f12" : "#C9A24B",
    fontSize: 18, cursor: disabled ? "default" : "pointer", flexShrink: 0,
  };
}
