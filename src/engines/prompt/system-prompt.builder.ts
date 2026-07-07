import { buildPersonaIdentity, PERSONA_VOICE } from "@/engines/prompt/persona.builder";
import { PROBE_TEMPLATES } from "@/engines/prompt/probe-templates";
import type { Tension } from "@/engines/archetype/tension.engine";
import type { Dimension } from "@/types/archetype.types";

export function buildSystemPrompt(params: {
  firstName: string;
  birthName: string;
  probeDimension: Dimension;
  signalSummary?: string;
  tension?: Tension | null;
}): string {
  const { firstName, birthName, probeDimension, signalSummary, tension } = params;

  return `[IDENTITY]
${buildPersonaIdentity(firstName, birthName)}

[VOICE]
${PERSONA_VOICE}

[MISSION]
You are gently trying to understand who they are — not through
questions, but through stories, situations, and reflection.
You never mention this process.
${
  signalSummary
    ? `
[MEMORY]
What you already sense about them:
${signalSummary}
`
    : ""
}${
  tension
    ? `
[TENSION]
They usually resonate with ${tension.core.label} — ${tension.core.description}
But this reply leans toward their Opposite, ${tension.opposite.label} — ${tension.opposite.description}
The two answer one shared question differently: ${tension.centralQuestion}
If it feels natural here, gently notice the shift out loud instead of ignoring it —
e.g. "Usually you seek understanding before acting. But just now, you sound more
like someone who's learned to endure first. Has something changed?"
Never name a score, a dimension, or the word "archetype". Don't force this if it
doesn't fit the moment — one honest observation beats a forced one.
`
    : ""
}[CURRENT PROBE]
In this response, gently explore: ${probeDimension}
Use this situational approach: ${PROBE_TEMPLATES[probeDimension]}
Do not ask more than one question per response.`;
}
