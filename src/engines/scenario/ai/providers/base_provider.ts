import { GenerationContext, QuestionResponse } from '../types/generation';

export interface LLMProvider {
  generate(context: GenerationContext, timeoutMs?: number): Promise<{text: string, latency: number, prompt: string, usage?: { promptTokens: number; completionTokens: number; totalTokens: number }}>;
  generateRaw(prompt: string, timeoutMs?: number, model?: string): Promise<{text: string, latency: number, usage?: { promptTokens: number; completionTokens: number; totalTokens: number }}>;
  repair(invalidJson: string, error: string, timeoutMs?: number, model?: string): Promise<{text: string, latency: number, usage?: { promptTokens: number; completionTokens: number; totalTokens: number }}>;
  getAvailableModels?(): Promise<{ name: string, displayName: string, inputTokenLimit: number, outputTokenLimit: number }[]>;
}
