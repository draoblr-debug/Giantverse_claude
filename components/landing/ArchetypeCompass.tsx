"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  QUADRANTS,
  COMPASS_ORDER,
  quadrantOf,
  wheelPoint,
  type HemisphereId,
  type QuadrantId,
} from "@/content/landing-atlas";
import { ArchetypeTooltip } from "./ArchetypeTooltip";
import { QuadrantTooltip } from "./QuadrantTooltip";

const SIZE = 760;
const C = SIZE / 2;
const R_OUTER = 330;
const R_NODES = 296;
const R_INNER = 240;

type Active =
  | { kind: "node"; id: string; position: number; pinned: boolean }
  | { kind: "quadrant"; id: QuadrantId; pinned: boolean }
  | { kind: "hemisphere"; id: HemisphereId; pinned: boolean }
  | null;

// Anchor points (SVG units) for the four quadrant labels and the four
// hemisphere labels around the ring. Quadrant corners: Northwest (Hunters,
// Active) = Venturers, Northeast (Giants, Active) = Forgers, Southeast
// (Giants, Passive) = Ascenders, Southwest (Hunters, Passive) = Havens —
// matches the COMPASS_ORDER blocks in landing-atlas.ts.
const QUADRANT_LABELS: Record<QuadrantId, { x: number; y: number }> = {
  venturers: { x: C - 249, y: C - 249 },
  forgers: { x: C + 249, y: C - 249 },
  ascenders: { x: C + 249, y: C + 249 },
  havens: { x: C - 249, y: C + 249 },
};
const HEMISPHERE_LABELS: Record<HemisphereId, { x: number; y: number }> = {
  north: { x: C, y: 30 },
  south: { x: C, y: SIZE - 22 },
  // "Giants"/"Hunters" render in Latin script in every locale (see
  // messages/*.json), so their width is stable — but 34px from the edge
  // clipped the "Hunters" label's left edge against the viewBox. 46px
  // keeps a safety margin without pulling the labels noticeably inward.
  east: { x: SIZE - 46, y: C },
  west: { x: 46, y: C },
};

// The 32-archetype compass. Starts visually clean — outer ring, quadrant
// names, hemisphere labels — and reveals everything else on interaction:
// hovering a label explains the region, hovering a node opens that
// archetype's card. Tap pins on touch; Escape or tapping away closes.
export function ArchetypeCompass() {
  const t = useTranslations("landing.compass");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Active>(null);
  const tipId = useId();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActive(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!active?.pinned) return;
    function onDocPointer(e: PointerEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setActive(null);
    }
    document.addEventListener("pointerdown", onDocPointer);
    return () => document.removeEventListener("pointerdown", onDocPointer);
  }, [active?.pinned]);

  // Tooltip position: anchored at the active element, flipped toward
  // the compass center so it always lands inside the container.
  function tooltipStyle(anchor: { x: number; y: number }): React.CSSProperties {
    const scale = (wrapRef.current?.clientWidth ?? SIZE) / SIZE;
    const px = anchor.x * scale;
    const py = anchor.y * scale;
    const flipX = anchor.x > C;
    const flipY = anchor.y > C;
    return {
      left: px,
      top: py,
      transform: `translate(${flipX ? "calc(-100% - 14px)" : "14px"}, ${flipY ? "calc(-100% - 10px)" : "10px"})`,
    };
  }

  function ringHandlers(next: Exclude<Active, null>) {
    return {
      onMouseEnter: () => {
        setActive((cur) => (cur?.pinned ? cur : next));
      },
      onMouseLeave: () => {
        setActive((cur) => (cur?.pinned ? cur : null));
      },
      onFocus: () => setActive(next),
      onBlur: () => setActive((cur) => (cur?.pinned ? cur : null)),
      onClick: () => {
        setActive((cur) =>
          cur && cur.kind === next.kind && cur.id === next.id && cur.pinned
            ? null
            : { ...next, pinned: true },
        );
      },
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setActive((cur) =>
            cur && cur.kind === next.kind && cur.id === next.id && cur.pinned
              ? null
              : { ...next, pinned: true },
          );
        }
      },
    };
  }

  const quadrantArcs: Record<QuadrantId, string> = {
    venturers: `M${C - R_OUTER},${C} A${R_OUTER},${R_OUTER} 0 0 1 ${C},${C - R_OUTER}`,
    forgers: `M${C},${C - R_OUTER} A${R_OUTER},${R_OUTER} 0 0 1 ${C + R_OUTER},${C}`,
    ascenders: `M${C + R_OUTER},${C} A${R_OUTER},${R_OUTER} 0 0 1 ${C},${C + R_OUTER}`,
    havens: `M${C},${C + R_OUTER} A${R_OUTER},${R_OUTER} 0 0 1 ${C - R_OUTER},${C}`,
  };

  return (
    <div ref={wrapRef} className="atlas-compass-wrap">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="group" aria-label={t("heading")}>
        {/* Rings */}
        <circle cx={C} cy={C} r={R_OUTER} fill="none" stroke="rgba(237,237,237,0.14)" />
        <circle cx={C} cy={C} r={R_INNER} fill="none" stroke="rgba(237,237,237,0.07)" />

        {/* Quadrant color arcs + separators */}
        {QUADRANTS.map((q) => (
          <path
            key={q.id}
            d={quadrantArcs[q.id]}
            fill="none"
            stroke={q.color}
            strokeOpacity={active?.kind === "quadrant" && active.id === q.id ? 0.85 : 0.3}
            strokeWidth={2.5}
            style={{ transition: "stroke-opacity 220ms ease" }}
          />
        ))}
        {[0, 90, 180, 270].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = C + R_INNER * Math.cos(rad);
          const y1 = C - R_INNER * Math.sin(rad);
          const x2 = C + R_OUTER * Math.cos(rad);
          const y2 = C - R_OUTER * Math.sin(rad);
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(237,237,237,0.1)" />;
        })}

        {/* Center mark */}
        <g className="atlas-map-deco">
          <circle cx={C} cy={C} r={4} fill="rgba(201,168,76,0.7)" />
          <path
            d={`M${C},${C - 26} L${C + 6},${C - 6} L${C + 26},${C} L${C + 6},${C + 6} L${C},${C + 26} L${C - 6},${C + 6} L${C - 26},${C} L${C - 6},${C - 6} Z`}
            fill="none"
            stroke="rgba(201,168,76,0.4)"
          />
          <text className="atlas-compass-center" x={C} y={C + 48} textAnchor="middle">
            {t("center")}
          </text>
        </g>

        {/* Hemisphere labels */}
        {(Object.keys(HEMISPHERE_LABELS) as HemisphereId[]).map((h) => {
          const p = HEMISPHERE_LABELS[h];
          const isActive = active?.kind === "hemisphere" && active.id === h;
          return (
            <g
              key={h}
              className="atlas-ring-label"
              data-active={isActive}
              role="button"
              tabIndex={0}
              aria-label={t(`hemispheres.${h}.name`)}
              aria-expanded={isActive}
              aria-describedby={isActive ? tipId : undefined}
              {...ringHandlers({ kind: "hemisphere", id: h, pinned: false })}
            >
              <text x={p.x} y={p.y} textAnchor="middle">
                {t(`hemispheres.${h}.name`)}
              </text>
            </g>
          );
        })}

        {/* Quadrant labels */}
        {QUADRANTS.map((q) => {
          const p = QUADRANT_LABELS[q.id];
          const isActive = active?.kind === "quadrant" && active.id === q.id;
          return (
            <g
              key={q.id}
              className="atlas-ring-label"
              data-active={isActive}
              role="button"
              tabIndex={0}
              aria-label={t(`quadrants.${q.id}.name`)}
              aria-expanded={isActive}
              aria-describedby={isActive ? tipId : undefined}
              {...ringHandlers({ kind: "quadrant", id: q.id, pinned: false })}
            >
              <text x={p.x} y={p.y - 10} textAnchor="middle" fill={q.color} fontSize={15}>
                {q.symbol}
              </text>
              <text x={p.x} y={p.y + 12} textAnchor="middle">
                {t(`quadrants.${q.id}.name`)}
              </text>
            </g>
          );
        })}

        {/* 32 archetype nodes */}
        {COMPASS_ORDER.map((archetypeId, position) => {
          const point = wheelPoint(position, R_NODES, C, C);
          const quadrant = quadrantOf(position);
          const isActive = active?.kind === "node" && active.id === archetypeId;
          return (
            <g
              key={archetypeId}
              className="atlas-node"
              data-active={isActive}
              role="button"
              tabIndex={0}
              aria-label={t(`archetypes.${archetypeId}.name`)}
              aria-expanded={isActive}
              aria-describedby={isActive ? tipId : undefined}
              {...ringHandlers({ kind: "node", id: archetypeId, position, pinned: false })}
            >
              <circle
                className="atlas-node-halo"
                cx={point.x}
                cy={point.y}
                r={14}
                fill="none"
                stroke={quadrant.color}
                strokeOpacity={0.55}
              />
              <circle
                className="atlas-node-dot"
                cx={point.x}
                cy={point.y}
                r={6}
                fill={quadrant.color}
              />
              <circle cx={point.x} cy={point.y} r={17} fill="transparent" />
            </g>
          );
        })}
      </svg>

      {active?.kind === "node" && (
        <ArchetypeTooltip
          archetypeId={active.id}
          open
          id={tipId}
          style={tooltipStyle(wheelPoint(active.position, R_NODES, C, C))}
        />
      )}
      {active?.kind === "quadrant" && (
        <QuadrantTooltip
          title={t(`quadrants.${active.id}.name`)}
          symbol={QUADRANTS.find((q) => q.id === active.id)?.symbol}
          accent={QUADRANTS.find((q) => q.id === active.id)?.color}
          description={t(`quadrants.${active.id}.description`)}
          open
          id={tipId}
          style={tooltipStyle(QUADRANT_LABELS[active.id])}
        />
      )}
      {active?.kind === "hemisphere" && (
        <QuadrantTooltip
          title={t(`hemispheres.${active.id}.name`)}
          description={t(`hemispheres.${active.id}.description`)}
          open
          id={tipId}
          style={tooltipStyle(HEMISPHERE_LABELS[active.id])}
        />
      )}
    </div>
  );
}
