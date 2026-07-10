import { LLMProvider } from '../providers/base_provider';
import { FallbackService } from './fallback_service';
import { QuestionCache } from '../cache/question_cache';
import { GenerationContext, QuestionResponse } from '../types/generation';
import { QuestionSchema } from '../schemas/question_schema';

export class QuestionService {
  constructor(
    private provider: LLMProvider,
    private fallbackService: FallbackService,
    private cache: QuestionCache
  ) {}

  async getQuestion(context: GenerationContext): Promise<QuestionResponse> {
    // Bypass cache completely to ensure unique questions per user
    // const cached = this.cache.get(context);
    // if (cached) return cached;

    let attempts = 0;
    const maxRetries = 2;
    let currentError = '';
    let jsonString = '';
    let lastPrompt = '';
    let totalLatency = 0;
    let lastUsage: { promptTokens: number; completionTokens: number; totalTokens: number } | undefined;

    while (attempts <= maxRetries) {
      try {
        if (attempts === 0) {
          const res = await this.provider.generate(context);
          jsonString = res.text;
          lastPrompt = res.prompt;
          totalLatency += res.latency;
          lastUsage = res.usage;
        } else {
          const res = await this.provider.repair(jsonString, currentError, 15000, context.model);
          jsonString = res.text;
          totalLatency += res.latency;
          lastUsage = res.usage;
        }

        // Strip markdown if the LLM leaked it despite instructions
        jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonString);
        if (!parsed.id) {
          parsed.id = Math.random().toString(36).substring(2, 15);
        }
        const validated = QuestionSchema.parse(parsed);

        this.cache.set(context, validated);
        
        return {
          ...validated,
          _debug: {
            prompt: lastPrompt,
            rawResponse: jsonString,
            latencyMs: totalLatency,
            cacheHit: false,
            fallbackUsed: false,
            temperature: context.temperature ?? 0.7,
            topP: context.topP ?? 0.9,
            provider: 'Gemini',
            version: context.model || 'gemini-2.5-flash-lite',
            validatorErrors: [],
            usage: lastUsage
          }
        };

      } catch (err: any) {
        currentError = err.message || 'Validation failed';
        attempts++;
      }
    }

    // Fallback immediately on max retries
    const fallback = await this.fallbackService.getFallback(context.needSignals);
    return {
      ...fallback,
      _debug: {
        prompt: lastPrompt || 'PROMPT_FAILED_TO_GENERATE_OR_NETWORK_ERROR',
        rawResponse: jsonString || 'NO_RESPONSE_RECEIVED',
        latencyMs: totalLatency,
        cacheHit: false,
        fallbackUsed: true,
        temperature: context.temperature ?? 0,
        topP: context.topP ?? 0,
        provider: 'Fallback',
        version: '1.0',
        validatorErrors: currentError ? [currentError] : ['Max retries reached without a successful parse']
      }
    };
  }

  async getAvailableModels(): Promise<{ name: string, displayName: string, inputTokenLimit: number, outputTokenLimit: number }[]> {
    if (this.provider.getAvailableModels) {
      return this.provider.getAvailableModels();
    }
    return [];
  }
}
