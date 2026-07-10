import { ArchetypeCentroid } from '../math/classifier';

/**
 * Identifies the dimensions with the highest variance among the top K candidate archetypes.
 * Used to implement Information Gain and Entropy Minimization targeting.
 */
export function selectHighVarianceDimensions(
  topCandidates: ArchetypeCentroid[],
  totalDimensions: number = 48,
  numTargets: number = 2
): number[] {
  if (topCandidates.length === 0) {
    throw new Error('No candidates provided');
  }

  const variances: { index: number; variance: number }[] = [];

  for (let d = 0; d < totalDimensions; d++) {
    // Extract the values for dimension d across the top candidates
    const values = topCandidates.map(c => c.vector[d]);
    
    // Calculate mean
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    
    // Calculate variance
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    
    variances.push({ index: d, variance });
  }

  // Sort by variance descending
  variances.sort((a, b) => b.variance - a.variance);

  // Return the indices of the dimensions with highest variance
  return variances.slice(0, numTargets).map(v => v.index);
}
