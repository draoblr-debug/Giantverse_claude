"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { REALM_META, type RealmId } from "@/content/landing-atlas";

// One of the Five Lands. The card shows only icon + name + one-liner;
// the deeper lore (landscape, philosophy, energy, identity) is
// progressive-disclosure: hover on desktop, tap on touch, focus for
// keyboard. Escape or tapping elsewhere closes it. No archetype list is
// shown here — any archetype can be born in, or travel to, any land.
export function RealmCard({ realmId }: { realmId: RealmId }) {
  const t = useTranslations("landing.lands");
  const meta = REALM_META[realmId];
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const popId = useId();

  useEffect(() => {
    if (!open) return;
    function onDocPointer(e: PointerEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onDocPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDocPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={cardRef}
      className="atlas-realm-card"
      style={{ "--realm-accent": meta.accent } as React.CSSProperties}
      data-open={open}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-describedby={open ? popId : undefined}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      // Open only — a tap fires focus (which opens) before click, so a
      // toggle here would immediately close it again. Closing is handled
      // by tap-outside, blur, and Escape.
      onClick={() => setOpen(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen((v) => !v);
        }
      }}
    >
      <div className="atlas-realm-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          {meta.iconPaths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </svg>
      </div>
      <div className="atlas-realm-name">{realmId}</div>
      <div className="atlas-realm-epithet">{t(`realms.${realmId}.epithet`)}</div>
      <div className="atlas-realm-oneline">{t(`realms.${realmId}.oneLine`)}</div>

      <div id={popId} role="tooltip" className="atlas-pop" data-open={open}>
        <div className="atlas-pop-title">{realmId}</div>
        <div className="atlas-pop-sub">{t(`realms.${realmId}.epithet`)}</div>
        <div className="atlas-pop-row">
          <span className="atlas-pop-label">{t("labels.landscape")}</span>
          <span className="atlas-pop-value">{t(`realms.${realmId}.landscape`)}</span>
        </div>
        <div className="atlas-pop-row">
          <span className="atlas-pop-label">{t("labels.philosophy")}</span>
          <span className="atlas-pop-value">{t(`realms.${realmId}.philosophy`)}</span>
        </div>
        <div className="atlas-pop-row">
          <span className="atlas-pop-label">{t("labels.energy")}</span>
          <span className="atlas-pop-value">{t(`realms.${realmId}.energy`)}</span>
        </div>
        <div className="atlas-pop-row">
          <span className="atlas-pop-label">{t("labels.identity")}</span>
          <span className="atlas-pop-value">{t(`realms.${realmId}.identity`)}</span>
        </div>
      </div>
    </div>
  );
}
