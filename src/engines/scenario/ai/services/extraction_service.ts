import { LLMProvider } from '../providers/base_provider';
import { buildExtractionPrompt, buildRepairPrompt } from '../prompts';
import { z } from 'zod';

const ExtractionSchema = z.object({
  traits: z.array(z.string()).min(1).max(3)
});

export class ExtractionService {
  constructor(private provider: LLMProvider) {}

  async extractTraits(question: string, customAnswer: string): Promise<string[]> {
    const prompt = buildExtractionPrompt(question, customAnswer);
    let attempts = 0;
    const maxRetries = 2;
    let currentError = '';
    let jsonString = '';

    while (attempts <= maxRetries) {
      try {
        if (attempts === 0) {
          const res = await this.provider.generateRaw(prompt);
          jsonString = res.text;
        } else {
          const res = await this.provider.repair(jsonString, currentError);
          jsonString = res.text;
        }

        // Strip markdown if the LLM leaked it despite instructions
        jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonString);
        const validated = ExtractionSchema.parse(parsed);

        return validated.traits;

      } catch (err: any) {
        currentError = err.message || 'Validation failed';
        attempts++;
      }
    }

    // Fallback: if all fails, return a neutral fallback or empty
    return [];
  }
}
