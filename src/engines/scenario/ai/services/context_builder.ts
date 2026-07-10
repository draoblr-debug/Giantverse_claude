import { GenerationContext } from '../types/generation';
import { selectHighVarianceDimensions, INDEX_TO_DIMENSION } from '@/engines/scenario/math';

export function buildContext(
  topCandidates: any[], 
  usedThemes: string[], 
  usedStructures: string[], 
  usedSignals: string[], 
  entropyState: number,
  recentScenarios: string[] = []
): GenerationContext {
  const signalIndices = selectHighVarianceDimensions(topCandidates, 48, 2);
  const needSignals = signalIndices.map(idx => INDEX_TO_DIMENSION[idx] || 'planning');
  
  return {
    needSignals,
    usedThemes,
    usedStructures,
    usedSignals,
    entropyState,
    recentScenarios
  };
}
