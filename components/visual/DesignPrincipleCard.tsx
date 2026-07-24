"use client";

import type { CharacterEntry } from "@/types/visual.types";

// Educational breakdown of WHY the matched design works — teaches design
// principles from the character's published design. Never analyses the
// user's personality.
export function DesignPrincipleCard({ character }: { character: CharacterEntry }) {
  return (
    <div className="w-full rounded-md p-5 text-left" style={{ border: "1px solid #3a2f12", background: "#000506" }}>
      <p className="f-10 txt-upp mb-1" style={{ color: "#C9A24B", letterSpacing: "0.2em" }}>
        Character Design Breakdown
      </p>
      <p className="f-14 fw-600 mb-1" style={{ color: "#E8E2D5" }}>
        Why {character.designer} designed {character.name.split(" ")[0]} this way
      </p>
      <p className="f-12 mb-3" style={{ color: "#8A8478", lineHeight: 1.6 }}>{character.description}</p>

      <div className="row float-none">
        <div className="col-3" style={{ minWidth: "45%" }}>
          <p className="f-10 txt-upp mb-1" style={{ color: "#8A8478", letterSpacing: "0.12em" }}>
            {character.name.split(" ")[0]} communicates
          </p>
          {character.design_breakdown.communicates.map((c) => (
            <p key={c} className="f-12 mb-1" style={{ color: "#C9A24B" }}>{c}</p>
          ))}
        </div>
        <div className="col-3" style={{ minWidth: "50%" }}>
          <p className="f-10 txt-upp mb-1" style={{ color: "#8A8478", letterSpacing: "0.12em" }}>through</p>
          {character.design_breakdown.through.map((t) => (
            <p key={t} className="f-12 mb-1" style={{ color: "#C9C3B6" }}>• {t}</p>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-3" style={{ borderTop: "1px solid #2a2410" }}>
        <div className="flex" style={{ gap: 24, flexWrap: "wrap" }}>
          <div>
            <p className="f-10 txt-upp mb-0" style={{ color: "#8A8478" }}>Shape language</p>
            <p className="f-12 mb-0" style={{ color: "#C9C3B6" }}>{character.shape_language}</p>
          </div>
          <div>
            <p className="f-10 txt-upp mb-0" style={{ color: "#8A8478" }}>Silhouette</p>
            <p className="f-12 mb-0" style={{ color: "#C9C3B6" }}>{character.silhouette}</p>
          </div>
          {character.primary_colors.length > 0 && (
            <div>
              <p className="f-10 txt-upp mb-0" style={{ color: "#8A8478" }}>Palette</p>
              <div className="flex" style={{ gap: 6, marginTop: 4 }}>
                {character.primary_colors.map((hex) => (
                  <span key={hex} title={hex} style={{ width: 18, height: 18, borderRadius: 3, background: hex, border: "1px solid rgba(255,255,255,0.15)", display: "inline-block" }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="f-10 mt-3 mb-0" style={{ color: "#6E695F", fontStyle: "italic" }}>
        These are design principles from published character art — a lesson in craft, not a reading of you.
      </p>
    </div>
  );
}
