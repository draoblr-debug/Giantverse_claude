import { PROBE_ORDER } from "@/engines/prompt/probe-templates";
import type { Dimension, Signal } from "@/types/archetype.types";

const CONFIDENT_THRESHOLD = 0.6;

// Picks the next dimension to probe: prefers dimensions with no signal yet,
// then dimensions whose signal confidence is still below threshold, in fixed
// rotation order. Never repeats a dimension that's already confident, unless
// every dimension is. See Section 5 ("Probe Engine").
export function selectNextProbe(turnIndex: number, signals: Signal[]): Dimension {
  const byDimension = new Map(signals.map((s) => [s.dimension, s]));

  const unprobed = PROBE_ORDER.filter((d) => !byDimension.has(d));
  if (unprobed.length > 0) {
    return unprobed[turnIndex % unprobed.length];
  }

  const lowConfidence = PROBE_ORDER.filter(
    (d) => (byDimension.get(d)?.confidence ?? 0) < CONFIDENT_THRESHOLD,
  );
  if (lowConfidence.length > 0) {
    return lowConfidence[turnIndex % lowConfidence.length];
  }

  return PROBE_ORDER[turnIndex % PROBE_ORDER.length];
}
