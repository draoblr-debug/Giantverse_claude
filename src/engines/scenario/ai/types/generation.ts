export interface GenerationContext {
  needSignals: string[];
  usedThemes: string[];
  usedStructures: string[];
  usedSignals: string[];
  entropyState: number;
  recentScenarios?: string[];
  userState?: string;
  
  // Conversational Context
  chatHistory?: string;
  name?: string;
  age?: number;
  ageGroup?: string;
  
  // Prompt Lab Overrides
  temperature?: number;
  topP?: number;
  signalCap?: number;
  optionCount?: number;
  disableThemeMemory?: boolean;
  disableStructureMemory?: boolean;
  extraRules?: string;
  model?: string;
}

export interface QuestionOption {
  text: string;
  traits: string[];
}

export interface QuestionResponse {
  id: string;
  scenario: string;
  options: QuestionOption[];
  theme: string;
  structure: string;
  difficulty: number;
  
  _debug?: {
    prompt: string;
    rawResponse: string;
    latencyMs: number;
    cacheHit: boolean;
    fallbackUsed: boolean;
    temperature: number;
    topP: number;
    provider: string;
    version: string;
    validatorErrors?: string[];
    usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  };
}

export interface GenerationMetrics {
  provider: string;
  latency: number;
  attempts: number;
  repaired: boolean;
  fallback: boolean;
  cacheHit: boolean;
}
