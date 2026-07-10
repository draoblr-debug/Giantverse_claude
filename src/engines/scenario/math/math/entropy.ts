/**
 * Computes the Shannon Entropy (H) of a probability distribution.
 * H = - sum( P(i) * log2(P(i)) )
 */
export function calculateEntropy(probabilities: number[]): number {
  let entropy = 0;
  for (const p of probabilities) {
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }
  return entropy;
}

/**
 * Determines if the interview should terminate based on confidence and entropy thresholds.
 * @param confidence The probability of the Rank 1 (Dominant) archetype.
 * @param entropy The Shannon entropy of the distribution.
 * @param minQuestions Minimum questions required before convergence is allowed.
 * @param maxQuestions Maximum questions allowed.
 * @param currentQuestion Current question index (1-indexed).
 */
export function checkConvergence(
  confidence: number,
  entropy: number,
  currentQuestion: number,
  minQuestions: number = 18,
  maxQuestions: number = 24,
  confidenceThreshold: number = 0.85,
  entropyThreshold: number = 1.5
): { converged: boolean; reason?: string } {
  if (currentQuestion >= maxQuestions) {
    return { converged: true, reason: 'MAX_QUESTIONS_REACHED' };
  }
  if (currentQuestion >= minQuestions) {
    if (confidence >= confidenceThreshold) {
      return { converged: true, reason: 'CONFIDENCE_THRESHOLD_REACHED' };
    }
    if (entropy <= entropyThreshold) {
      return { converged: true, reason: 'ENTROPY_THRESHOLD_REACHED' };
    }
  }
  return { converged: false };
}
