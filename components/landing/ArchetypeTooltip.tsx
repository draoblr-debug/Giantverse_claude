"use client";

import { useTranslations } from "next-intl";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import { getAllyIds, wheelPosition } from "@/engines/archetype/archetype-wheel";
import { hemisphereOf, quadrantOf } from "@/content/landing-atlas";

// Floating information card for one archetype on the compass. Kept to
// single-line fields so the card never becomes a wall of text.
export function ArchetypeTooltip({
  archetypeId,
  open,
  id,
  style,
}: {
  archetypeId: string;
  open: boolean;
  id: string;
  style: React.CSSProperties;
}) {
  const t = useTranslations("landing.compass");
  const def = ARCHETYPE_DEFINITIONS[archetypeId];
  const position = wheelPosition(archetypeId);
  const quadrant = quadrantOf(position);
  const hemisphere = hemisphereOf(position);
  const allies = getAllyIds(archetypeId)
    .map((allyId) => t(`archetypes.${allyId}.name`))
    .join(" · ");

  return (
    <div id={id} role="tooltip" className="atlas-pop" data-open={open} style={style}>
      <div className="atlas-pop-title">
        {t(`archetypes.${archetypeId}.name`)}{" "}
        <span style={{ color: "rgba(201,168,76,0.9)", fontSize: 13 }}>
          {def.romajiName} {def.japaneseName}
        </span>
      </div>
      <div className="atlas-pop-sub">
        {t(`quadrants.${quadrant.id}.name`)} · {t(`hemispheres.${hemisphere}.name`)}
      </div>
      <div className="atlas-pop-row">
        <span className="atlas-pop-label">{t("labels.motivation")}</span>
        <span className="atlas-pop-value">{t(`archetypes.${archetypeId}.motivation`)}</span>
      </div>
      <div className="atlas-pop-row">
        <span className="atlas-pop-label">{t("labels.strength")}</span>
        <span className="atlas-pop-value">{t(`archetypes.${archetypeId}.strength`)}</span>
      </div>
      <div className="atlas-pop-row">
        <span className="atlas-pop-label">{t("labels.blindSpot")}</span>
        <span className="atlas-pop-value">{t(`archetypes.${archetypeId}.blindSpot`)}</span>
      </div>
      <div className="atlas-pop-row">
        <span className="atlas-pop-label">{t("labels.allies")}</span>
        <span className="atlas-pop-value">{allies}</span>
      </div>
      <div className="atlas-pop-quote">“{t(`archetypes.${archetypeId}.quote`)}”</div>
    </div>
  );
}
