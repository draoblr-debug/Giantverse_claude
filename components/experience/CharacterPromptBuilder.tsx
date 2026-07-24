"use client";

// CharacterPromptBuilder — ending-page module that assembles a structured
// JSON prompt for generating original character art, combining archetype
// lore, the participant's own measured facial geometry (if they used
// Visual Character Discovery), and their Order. See
// src/engines/prompt/character-image-prompt.builder.ts for the assembly
// logic; this component is presentation only.

import { useMemo, useState } from "react";
import { useSessionStore } from "@/stores/session.store";
import { useVisualStore } from "@/stores/visual.store";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import { buildCharacterImagePrompt } from "@/engines/prompt/character-image-prompt.builder";

export function CharacterPromptBuilder() {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState<"json" | "prompt" | null>(null);

  const { legacyName, archetypeLabel, archetype, order, guidingPromise, traits } = useSessionStore();
  const { axes, faceConfidence, matches } = useVisualStore();
  const visualTop = matches?.[0] ?? null;

  const prompt = useMemo(() => {
    if (!legacyName || !archetypeLabel || !archetype || !order || !guidingPromise || !traits) return null;
    return buildCharacterImagePrompt({
      legacyName,
      archetypeLabel,
      archetypeProfile: ARCHETYPE_DEFINITIONS[archetype],
      order,
      guidingPromise,
      traits,
      visualAxes: axes,
      faceConfidence,
      visualTop,
    });
  }, [legacyName, archetypeLabel, archetype, order, guidingPromise, traits, axes, faceConfidence, visualTop]);

  if (!prompt) return null;

  async function copy(text: string, which: "json" | "prompt") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // clipboard unavailable — nothing more we can do without a fallback UI
    }
  }

  const json = JSON.stringify(prompt, null, 2);

  return (
    <div className="wht-cont mxw-450 m-auto mb-4" style={{ border: "1px solid #3a2f12", borderRadius: 8, padding: 16 }}>
      <p className="f-10 mb-1 txt-thm-clr-6 txt-upp">🎨 AI Art Prompt</p>
      <p className="f-12 mb-2 txt-thm-clr-5 line-ht-20">
        A structured prompt for generating original concept art of {legacyName} — built from{" "}
        {prompt.facialFeatures ? "your archetype's lore and your own measured facial geometry" : "your archetype's lore"}.
        {prompt.styleReference && " Never a likeness of the character it draws design inspiration from."}
      </p>

      <div className="flex" style={{ gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="btn-outline bdr-rds2" onClick={() => setExpanded((e) => !e)}>
          {expanded ? "Hide JSON" : "Show JSON"}
        </button>
        <button type="button" className="btn-outline bdr-rds2" onClick={() => copy(prompt.prompt, "prompt")}>
          {copied === "prompt" ? "✓ Copied!" : "Copy Prompt Text"}
        </button>
        <button type="button" className="btn-outline bdr-rds2" onClick={() => copy(json, "json")}>
          {copied === "json" ? "✓ Copied!" : "Copy Full JSON"}
        </button>
      </div>

      {expanded && (
        <pre
          className="f-10 mt-3"
          style={{
            background: "#0E0D0B", color: "#C9C3B6", padding: 12, borderRadius: 6,
            border: "1px solid #2a2410", overflowX: "auto", maxHeight: 360, overflowY: "auto",
            whiteSpace: "pre", lineHeight: 1.5,
          }}
        >
          {json}
        </pre>
      )}
    </div>
  );
}
