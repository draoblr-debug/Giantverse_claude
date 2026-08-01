"use client";

// Generic ring tooltip used for both quadrant and hemisphere labels on
// the compass — a title, an optional engraved symbol, and one modular
// explanation line. Positioning is owned by ArchetypeCompass.
export function QuadrantTooltip({
  title,
  symbol,
  accent,
  description,
  open,
  id,
  style,
}: {
  title: string;
  symbol?: string;
  accent?: string;
  description: string;
  open: boolean;
  id: string;
  style: React.CSSProperties;
}) {
  return (
    <div id={id} role="tooltip" className="atlas-pop" data-open={open} style={style}>
      <div className="atlas-pop-title">
        {symbol ? <span style={{ color: accent, marginRight: 8 }}>{symbol}</span> : null}
        {title}
      </div>
      <div className="atlas-pop-row">
        <span className="atlas-pop-value">{description}</span>
      </div>
    </div>
  );
}
