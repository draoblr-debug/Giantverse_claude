"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MAP_ZONES, WORLD_MAP_IMAGE } from "@/content/landing-atlas";
import { MapTooltip } from "./MapTooltip";

type ActiveState = { zoneIndex: number; pinned: boolean } | null;

// The Giantverse atlas map: detailed archipelago artwork where every
// continent carries the same four zone types (mountains, forest, port,
// and a civil/wastes heart). Hovering a zone lifts/glows it and floats
// a lore tooltip beside the cursor; tap pins the tooltip on touch
// devices; keyboard focus anchors it at the zone's center. Multiple
// zones across different continents share the same realm's tooltip
// content — any land can appear anywhere. Never navigates away.
export function InteractiveWorldMap() {
  const t = useTranslations("landing");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<ActiveState>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const tipId = useId();

  useEffect(() => {
    if (!active?.pinned) return;
    function onDocPointer(e: PointerEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setActive(null);
    }
    document.addEventListener("pointerdown", onDocPointer);
    return () => document.removeEventListener("pointerdown", onDocPointer);
  }, [active?.pinned]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActive(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Converts a zone's percentage position to container pixels (for
  // focus/tap anchoring).
  function anchorToPx(zone: { xPct: number; yPct: number }) {
    const el = wrapRef.current;
    if (!el) return { x: 0, y: 0 };
    return { x: (zone.xPct / 100) * el.clientWidth, y: (zone.yPct / 100) * el.clientHeight };
  }

  function handleMove(e: React.MouseEvent) {
    const el = wrapRef.current;
    if (!el || active?.pinned) return;
    const rect = el.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  // Tooltip sits beside the cursor (or the focused zone) and flips to
  // whichever side has room.
  const wrapW = wrapRef.current?.clientWidth ?? 0;
  const wrapH = wrapRef.current?.clientHeight ?? 0;
  const flipX = pos.x > wrapW / 2;
  const flipY = pos.y > wrapH / 2;
  const tipStyle: React.CSSProperties = {
    left: pos.x,
    top: pos.y,
    transform: `translate(${flipX ? "calc(-100% - 16px)" : "16px"}, ${flipY ? "calc(-100% - 12px)" : "12px"})`,
  };

  const activeZone = active ? MAP_ZONES[active.zoneIndex] : null;

  return (
    <div ref={wrapRef} className="atlas-map-wrap" onMouseMove={handleMove}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={WORLD_MAP_IMAGE} alt={t("map.heading")} className="atlas-map-img" />

      {MAP_ZONES.map((zone, zoneIndex) => {
        const isActive = active?.zoneIndex === zoneIndex;
        return (
          <button
            key={`${zone.continent}-${zone.id}`}
            type="button"
            className="atlas-map-hotspot"
            data-active={isActive}
            style={
              {
                left: `${zone.xPct}%`,
                top: `${zone.yPct}%`,
                width: `${zone.radiusPct * 2}%`,
              } as React.CSSProperties
            }
            aria-label={`${zone.continent} — ${t(`map.regions.${zone.id}.description`)}`}
            aria-expanded={isActive}
            aria-describedby={isActive ? tipId : undefined}
            onMouseEnter={() => {
              if (!active?.pinned) setActive({ zoneIndex, pinned: false });
            }}
            onMouseLeave={() => {
              if (!active?.pinned) setActive(null);
            }}
            onClick={() => {
              setPos(anchorToPx(zone));
              setActive((cur) => (cur?.zoneIndex === zoneIndex && cur.pinned ? null : { zoneIndex, pinned: true }));
            }}
            onFocus={() => {
              setPos(anchorToPx(zone));
              setActive({ zoneIndex, pinned: false });
            }}
            onBlur={() => {
              setActive((cur) => (cur?.pinned ? cur : null));
            }}
          >
            <span className="atlas-map-hotspot-ring" aria-hidden="true" />
          </button>
        );
      })}

      {activeZone && <MapTooltip realmId={activeZone.id} open id={tipId} style={tipStyle} />}
    </div>
  );
}
