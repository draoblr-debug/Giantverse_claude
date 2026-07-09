import { cosineSimilarity } from './vectors';

export interface ArchetypeCentroid {
  id: string;
  name: string;
  vector: number[];
}

export interface ClassificationResult {
  archetypeId: string;
  similarity: number;
  probability: number;
}

/**
 * Computes the Softmax probabilities from an array of logits (similarities).
 * P(k) = exp(S_k / T) / sum( exp(S_j / T) )
 */
export function softmax(logits: number[], temperature: number = 1.0): number[] {
  // Prevent overflow by subtracting max logit
  const maxLogit = Math.max(...logits);
  const expVals = logits.map(l => Math.exp((l - maxLogit) / temperature));
  const sumExp = expVals.reduce((a, b) => a + b, 0);
  return expVals.map(e => e / sumExp);
}

/**
 * Classifies a user vector against a set of archetype centroids.
 * Returns a sorted array of candidate archetypes with their similarities and probabilities.
 */
export function classify(
  userVector: number[],
  centroids: ArchetypeCentroid[],
  temperature: number = 1.0
): ClassificationResult[] {
  const similarities = centroids.map(c => cosineSimilarity(userVector, c.vector));
  const probabilities = softmax(similarities, temperature);

  const results: ClassificationResult[] = centroids.map((c, i) => ({
    archetypeId: c.id,
    similarity: similarities[i],
    probability: probabilities[i]
  }));

  // Sort descending by probability
  results.sort((a, b) => b.probability - a.probability);
  return results;
}
