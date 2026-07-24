"use client";

import type { CharacterMatch } from "@/types/visual.types";
import { AXIS_LABELS } from "@/types/visual.types";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";

// Monogram avatar — we bundle no copyrighted artwork, so each character is
// represented by an initial in a frame shaped by their shape-language.
export function CharacterMonogram({ name, shape, size = 56 }: { name: string; shape: string; size?: number }) {
  const initial = name.charAt(0).toUpperCase();
  const radius = /circle/i.test(shape) ? "50%" : /triangle/i.test(shape) ? "4px" : "10px";
  const rotate = /triangle/i.test(shape) ? "rotate(45deg)" : "none";
  return (
    <div
      style={{
        width: size, height: size, borderRadius: radius, transform: rotate,
        border: "1px solid #C9A24B", display: "flex", alignItems: "center",
        justifyContent: "center", flexShrink: 0, background: "rgba(201,162,75,0.08)",
      }}
    >
      <span className="serif" style={{ transform: rotate === "none" ? "none" : "rotate(-45deg)", color: "#C9A24B", fontSize: size * 0.42, fontFamily: "Georgia, serif" }}>
        {initial}
      </span>
    </div>
  );
}

export function CharacterResultCard({ match, rank, expanded = false }: { match: CharacterMatch; rank: number; expanded?: boolean }) {
  const c = match.character;
  return (
    <div
      className="w-full rounded-md p-4 mb-4"
      style={{ border: rank === 1 ? "1px solid #C9A24B" : "1px solid #3a2f12", background: rank === 1 ? "rgba(201,162,75,0.07)" : "rgba(255,255,255,0.02)" }}
    >
      <div className="flex items-center" style={{ gap: 14, rowGap: 6, flexWrap: "wrap" }}>
        <span className="f-14 fw-700" style={{ color: "#C9A24B", minWidth: 44, flexShrink: 0 }}>{match.similarity}%</span>
        <CharacterMonogram name={c.name} shape={c.shape_language} size={rank === 1 ? 56 : 40} />
        {/* minWidth: 0 lets this shrink inside the flex row instead of forcing
            siblings (the Top Match badge) to overlap when the name is long. */}
        <div className="flex-1 text-left" style={{ minWidth: 0 }}>
          <p className="mb-0 fw-600" style={{ color: "#E8E2D5", fontSize: rank === 1 ? 17 : 14 }}>{c.name}</p>
          <p className="f-10 mb-0" style={{ color: "#8A8478" }}>{c.series} · {c.collection}</p>
          {c.archetypeId && (
            <p className="f-10 mb-0" style={{ color: "#8A7FBF" }}>
              Archetype: {ARCHETYPE_DEFINITIONS[c.archetypeId]?.label ?? c.archetype}
            </p>
          )}
        </div>
        {rank === 1 && (
          <span className="f-10 txt-upp" style={{ color: "#C9A24B", letterSpacing: "0.15em", flexShrink: 0 }}>Top Match</span>
        )}
      </div>

      {expanded && (
        <div className="mt-4 pt-4 text-left" style={{ borderTop: "1px solid #2a2410" }}>
          <p className="f-10 txt-upp mb-2" style={{ color: "#C9A24B", letterSpacing: "0.15em" }}>Why you resemble this design</p>
          <ul className="mb-3" style={{ listStyle: "none", padding: 0 }}>
            {match.matchedAxes.map((axis) => (
              <li key={axis} className="f-12 mb-1" style={{ color: "#C9C3B6" }}>
                <span style={{ color: "#C9A24B" }}>✓</span> {AXIS_LABELS[axis]}
              </li>
            ))}
          </ul>
          <p className="f-10 mb-0" style={{ color: "#6E695F", fontStyle: "italic" }}>{c.copyright_notice}</p>
        </div>
      )}
    </div>
  );
}
