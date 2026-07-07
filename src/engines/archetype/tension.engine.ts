import { scoreArchetypes } from "@/engines/archetype/archetype.engine";
import { getOppositeId, OPPOSITE_TENSIONS } from "@/engines/archetype/archetype-wheel";
import type { ArchetypeProfile } from "@/types/archetype.types";
import type { Signal } from "@/types/archetype.types";

export type Tension = {
  core: ArchetypeProfile;
  opposite: ArchetypeProfile;
  centralQuestion: string;
};

const TENSION_MARGIN = 0.15;

/**
 * Notices when the participant's accumulated signals are pulling almost as
 * hard toward their leading archetype's Opposite as toward the leader
 * itself — e.g. someone who reads as Philosopher suddenly answering like a
 * Survivor. This is a live-conversation signal, not a reassignment: the
 * counterpart can name the tension aloud without switching who it thinks
 * the participant is. See docs/ARCHETYPE_GUIDE.md.
 */
export function detectTension(signals: Signal[]): Tension | null {
  if (signals.length === 0) return null;

  const scores = scoreArchetypes(signals);
  const [top] = scores;
  if (!top || top.normalized <= 0) return null;

  const oppositeId = getOppositeId(top.archetype.id);
  const oppositeScore = scores.find((s) => s.archetype.id === oppositeId);
  if (!oppositeScore || oppositeScore.normalized <= 0) return null;

  if (top.normalized - oppositeScore.normalized > TENSION_MARGIN) return null;

  return {
    core: top.archetype,
    opposite: oppositeScore.archetype,
    centralQuestion: OPPOSITE_TENSIONS[top.archetype.id],
  };
}
