import { LLMProvider } from './base_provider';
import { GenerationContext } from '../types/generation';
import { buildQuestionPrompt, buildRepairPrompt } from '../prompts';
import { GoogleGenAI } from '@google/genai';

export class GeminiProvider implements LLMProvider {
  private ai: GoogleGenAI;
  private defaultModel = 'gemini-3.1-flash-lite';

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generate(context: GenerationContext, timeoutMs: number = 15000): Promise<{text: string, latency: number, prompt: string, usage?: { promptTokens: number; completionTokens: number; totalTokens: number }}> {
    const prompt = buildQuestionPrompt(context);
    const temperature = context.temperature ?? 0.7;
    const topP = context.topP ?? 0.9;
    const model = context.model || this.defaultModel;
    const result = await this.executeFetch(prompt, temperature, topP, timeoutMs, model);
    return { ...result, prompt };
  }

  async generateRaw(prompt: string, timeoutMs: number = 15000, model?: string): Promise<{text: string, latency: number, usage?: { promptTokens: number; completionTokens: number; totalTokens: number }}> {
    return this.executeFetch(prompt, 0.7, 0.9, timeoutMs, model || this.defaultModel);
  }

  async repair(invalidJson: string, error: string, timeoutMs: number = 15000, model?: string): Promise<{text: string, latency: number, usage?: { promptTokens: number; completionTokens: number; totalTokens: number }}> {
    const prompt = buildRepairPrompt(invalidJson, error);
    return this.executeFetch(prompt, 0.2, 0.9, timeoutMs, model || this.defaultModel);
  }

  private async executeFetch(prompt: string, temperature: number, topP: number, timeoutMs: number, model: string): Promise<{text: string, latency: number, usage?: { promptTokens: number; completionTokens: number; totalTokens: number }}> {
    const start = Date.now();
    
    // Convert gemini-3 thinking param if the user selected a gemini 3 model
    const extraConfig = model.includes('gemini-3') ? { thinkingLevel: 'minimal' } : {};

    const fetchPromise = this.ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature,
        topP,
        ...extraConfig
      }
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Generation timeout')), timeoutMs);
    });

    try {
      const response = await Promise.race([fetchPromise, timeoutPromise]) as any;
      const text = response.text || '';
      
      const usageMetadata = response.usageMetadata;
      const usage = usageMetadata ? {
        promptTokens: usageMetadata.promptTokenCount || 0,
        completionTokens: usageMetadata.candidatesTokenCount || 0,
        totalTokens: usageMetadata.totalTokenCount || 0
      } : undefined;
      
      return { text, latency: Date.now() - start, usage };
    } catch (err: any) {
      throw new Error(`Gemini API Error: ${err.message}`);
    }
  }

  async getAvailableModels(): Promise<{ name: string, displayName: string, inputTokenLimit: number, outputTokenLimit: number }[]> {
    try {
      const modelsIterator = await this.ai.models.list();
      const availableModels = [];
      for await (const m of modelsIterator) {
        // Filter to only generative models that support generateContent
        if (m.name && m.supportedActions?.includes('generateContent') && m.name.includes('models/gemini')) {
          availableModels.push({
            name: m.name.replace('models/', ''),
            displayName: m.displayName || m.name.replace('models/', ''),
            inputTokenLimit: m.inputTokenLimit || 0,
            outputTokenLimit: m.outputTokenLimit || 0
          });
        }
      }
      // Sort by recency/popularity heuristics
      return availableModels.sort((a, b) => b.name.localeCompare(a.name));
    } catch (err: any) {
      console.error('Failed to list Gemini models', err);
      return [];
    }
  }
}
