/**
 * Computes the Euclidean distance between two vectors.
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must be of the same length');
  }
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
}

/**
 * Computes the dot product of two vectors.
 */
export function dotProduct(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must be of the same length');
  }
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

/**
 * Computes the magnitude (L2 norm) of a vector.
 */
export function magnitude(a: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * a[i];
  }
  return Math.sqrt(sum);
}

/**
 * Computes the cosine similarity between two vectors.
 * Handles the edge case of zero-magnitude vectors gracefully.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) {
    return 0;
  }
  return dotProduct(a, b) / (magA * magB);
}

/**
 * Clamps a vector's dimensions to the [-1.0, 1.0] hypercube bounds.
 */
export function normalizeBounds(vector: number[]): number[] {
  return vector.map(val => Math.max(-1.0, Math.min(1.0, val)));
}

/**
 * Updates a user's trajectory vector given dimensional weights and a scalar multiplier.
 * baseDelta is typically 0.20, multiplier from agreement slider is typically in [-1.0, 1.0].
 */
export function updateVector(
  current: number[],
  targetDimensions: { index: number; weight: number }[],
  multiplier: number,
  baseDelta: number = 0.20
): number[] {
  const updated = [...current];
  for (const { index, weight } of targetDimensions) {
    updated[index] += weight * baseDelta * multiplier;
  }
  return normalizeBounds(updated);
}
