import { QuestionResponse } from '../types/generation';

const MOCK_FALLBACK: QuestionResponse = {
  id: 'fb-001',
  scenario: 'A plan collapses unexpectedly. What instinct appears first?',
  theme: 'failure',
  structure: 'loss',
  difficulty: 2,
  options: [
    { text: 'I redesign the plan.', traits: ['planning'] },
    { text: 'I search for new opportunities.', traits: ['adaptability', 'curiosity'] },
    { text: 'I seek perspective from others.', traits: ['collaboration'] },
    { text: 'I pause before deciding.', traits: ['reflection'] }
  ]
};

export class FallbackService {
  private fallbacks = new Map<string, QuestionResponse>();

  constructor() {
    this.preload();
  }

  private preload() {
    // In production, this loads from Postgres
    this.fallbacks.set('planning', MOCK_FALLBACK);
  }

  getFallback(needSignals: string[]): QuestionResponse {
    const fallback = this.fallbacks.get(needSignals[0]);
    if (fallback) return fallback;
    return MOCK_FALLBACK; // Ultimate safety net
  }
}
