"use client";

import { useTranslations } from "next-intl";
import type { RealmId } from "@/content/landing-atlas";

// Presentational tooltip for a hovered map region. Positioning is owned
// by InteractiveWorldMap; this only renders the lore fields. No
// archetype roster is shown — any archetype can be born in, or travel
// to, any land, so this stays about the place, not who lives there.
export function MapTooltip({
  realmId,
  open,
  id,
  style,
}: {
  realmId: RealmId;
  open: boolean;
  id: string;
  style: React.CSSProperties;
}) {
  const t = useTranslations("landing");

  return (
    <div id={id} role="tooltip" className="atlas-pop" data-open={open} style={style}>
      <div className="atlas-pop-title">{realmId}</div>
      <div className="atlas-pop-sub">{t(`map.regions.${realmId}.description`)}</div>
      <div className="atlas-pop-row">
        <span className="atlas-pop-value">{t(`map.regions.${realmId}.lore`)}</span>
      </div>
      <div className="atlas-pop-row">
        <span className="atlas-pop-label">{t("map.labels.climate")}</span>
        <span className="atlas-pop-value">{t(`map.regions.${realmId}.climate`)}</span>
      </div>
      <div className="atlas-pop-row">
        <span className="atlas-pop-label">{t("map.labels.culture")}</span>
        <span className="atlas-pop-value">{t(`map.regions.${realmId}.culture`)}</span>
      </div>
      <div className="atlas-pop-row">
        <span className="atlas-pop-label">{t("map.labels.landmarks")}</span>
        <span className="atlas-pop-value">{t(`map.regions.${realmId}.landmarks`)}</span>
      </div>
      <div className="atlas-pop-row">
        <span className="atlas-pop-label">{t("map.labels.realm")}</span>
        <span className="atlas-pop-value">
          {realmId} — {t(`lands.realms.${realmId}.epithet`)}
        </span>
      </div>
      <div className="atlas-pop-row">
        <span className="atlas-pop-label">{t("map.labels.symbols")}</span>
        <span className="atlas-pop-value">{t(`map.regions.${realmId}.symbols`)}</span>
      </div>
    </div>
  );
}
