// ClusterManager — ported from Lens-Hunt-anime's ClusterManager.kt.
//
// Narrows the character-matching candidate pool to the design cluster the
// user's own measured axes best fit, before ranking by similarity. Without
// this, matching draws from the full 182-character pool every time, which
// (combined with no diversity penalty) is what let a handful of "average"
// characters dominate results regardless of the input photo.

import type { VisualAxes } from "@/types/visual.types";

export const CLUSTER_A = "Cluster A - Clean & Stoic";
export const CLUSTER_B = "Cluster B - Sharp & Cool";
export const CLUSTER_C = "Cluster C - Mature & Structured";
export const CLUSTER_D = "Cluster D - Highly Stylized";
export const CLUSTER_E = "Cluster E - Non Human / Fantasy";

export const ALL_CLUSTERS = [CLUSTER_A, CLUSTER_B, CLUSTER_C, CLUSTER_D, CLUSTER_E];

export function determineUserCluster(axes: VisualAxes): { cluster: string; confidence: number } {
  const scoreA = (axes.angularity + axes.symmetry + axes.expressionNeutrality + axes.jawSharpness) / 4;
  const scoreB = ((axes.angularity + axes.symmetry + (1 - axes.eyeNarrowness) + axes.jawSharpness) / 4) * 0.9;
  const scoreC = ((1 - axes.faceLength) + axes.jawSharpness + (1 - axes.eyeNarrowness) + axes.contrast) / 4;
  const scoreD = ((1 - axes.faceLength) + (1 - axes.angularity) + (1 - axes.eyeNarrowness) + axes.warmth) / 4;
  const scoreE = ((axes.contrast + axes.browWeight + (1 - axes.expressionNeutrality)) / 3) * 0.8;

  const scores: [string, number][] = [
    [CLUSTER_A, scoreA],
    [CLUSTER_B, scoreB],
    [CLUSTER_C, scoreC],
    [CLUSTER_D, scoreD],
    [CLUSTER_E, scoreE],
  ];
  const sorted = scores.sort((a, b) => b[1] - a[1]);
  const [primaryKey, primaryVal] = sorted[0];
  const [, secondaryVal] = sorted[1];

  const total = primaryVal + secondaryVal;
  const confidence = total > 0 ? primaryVal / total : 0.5;
  const adjustedConfidence = Math.min(99, Math.max(50, confidence * 100)) / 100;

  return { cluster: primaryKey, confidence: adjustedConfidence };
}

export function getNearestClusters(primaryCluster: string): string[] {
  const index = ALL_CLUSTERS.indexOf(primaryCluster);
  if (index === -1) return [];
  const nearest: string[] = [];
  if (index > 0) nearest.push(ALL_CLUSTERS[index - 1]);
  if (index < ALL_CLUSTERS.length - 1) nearest.push(ALL_CLUSTERS[index + 1]);
  return nearest;
}
