import { LRUCache } from 'lru-cache';
import { QuestionResponse, GenerationContext } from '../types/generation';

export class QuestionCache {
  private cache: LRUCache<string, QuestionResponse>;

  constructor(maxSize: number = 1000) {
    this.cache = new LRUCache({ max: maxSize });
  }

  generateKey(context: GenerationContext): string {
    const signals = [...context.needSignals].sort().join('-');
    const themes = context.usedThemes.join(',');
    const structures = context.usedStructures.join(',');
    return `${signals}|${themes}|${structures}`;
  }

  get(context: GenerationContext): QuestionResponse | undefined {
    return this.cache.get(this.generateKey(context));
  }

  set(context: GenerationContext, question: QuestionResponse): void {
    this.cache.set(this.generateKey(context), question);
  }
}
