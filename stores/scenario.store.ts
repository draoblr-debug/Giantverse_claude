import { create } from 'zustand';

export interface QuestionOption {
  text: string;
  traits: string[];
}

export interface Question {
  id: string;
  scenario: string;
  options: QuestionOption[];
  theme: string;
  structure: string;
  _debug?: any;
}

export interface SessionMetadata {
  name: string;
  age: number;
  ageGroup: 'child' | 'teen' | 'adult';
}

interface ScenarioState {
  sessionMetadata: SessionMetadata | null;
  currentVector: number[];
  entropy: number;
  confidence: number;
  history: string[];
  usedThemes: string[];
  usedStructures: string[];
  usedSignals: string[];
  recentScenarios: string[];
  vectorHistory: number[][]; 
  isComplete: boolean;
  questionIndex: number;
  currentQuestion: Question | null;
  isGenerating: boolean;
  
  setSessionMetadata: (metadata: SessionMetadata) => void;
  setSession: (vector: number[], entropy: number, confidence: number, history: string[], themes: string[], structures: string[], signals: string[], scenarios: string[]) => void;
  setQuestion: (question: Question | null) => void;
  setGenerating: (isGenerating: boolean) => void;
  submitAnswerOptimistic: (option: QuestionOption | undefined, theme: string, structure: string, scenario: string) => void;
  setComplete: (vectorHistory: number[][]) => void;
  reset: () => void;
  
  startSession: (userMetadata: SessionMetadata) => Promise<void>;
  submitAnswer: (option: QuestionOption | undefined, customText: string, theme: string, structure: string, scenario: string, confidence: number, chatHistoryStr: string) => Promise<void>;
}

export const useScenarioStore = create<ScenarioState>((set) => ({
  sessionMetadata: null,
  currentVector: Array(48).fill(0),
  entropy: 100,
  confidence: 0,
  history: [],
  usedThemes: [],
  usedStructures: [],
  usedSignals: [],
  recentScenarios: [],
  vectorHistory: [],
  isComplete: false,
  questionIndex: 0,
  currentQuestion: null,
  isGenerating: false,

  setSessionMetadata: (metadata: SessionMetadata) => set({ sessionMetadata: metadata }),

  setSession: (
    vector: number[], 
    entropy: number, 
    confidence: number, 
    history: string[] = [],
    usedThemes: string[] = [],
    usedStructures: string[] = [],
    usedSignals: string[] = [],
    recentScenarios: string[] = []
  ) => set((state) => ({
    currentVector: vector,
    vectorHistory: [...state.vectorHistory, vector],
    entropy,
    confidence,
    history,
    usedThemes,
    usedStructures,
    usedSignals,
    recentScenarios,
    questionIndex: history.length
  })),
  
  setQuestion: (question) => set((state) => ({ 
    currentQuestion: question,
    questionIndex: state.questionIndex + 1,
    isGenerating: false
  })),

  setComplete: (vectorHistory: number[][]) => set({ isComplete: true, vectorHistory, isGenerating: false }),

  submitAnswerOptimistic: (option, currentTheme, currentStructure, currentScenario) => set((state) => {
    return {
      entropy: Math.max(0, state.entropy - 2.5), 
      history: currentTheme ? [...state.history, currentTheme] : state.history,
      usedThemes: currentTheme ? [...new Set([...state.usedThemes, currentTheme])] : state.usedThemes,
      usedStructures: currentStructure ? [...new Set([...state.usedStructures, currentStructure])] : state.usedStructures,
      usedSignals: option ? [...new Set([...state.usedSignals, ...option.traits])] : state.usedSignals,
      recentScenarios: currentScenario ? [...state.recentScenarios, currentScenario].slice(-10) : state.recentScenarios,
      currentQuestion: null,
      isGenerating: true
    };
  }),

  setGenerating: (isGenerating) => set({ isGenerating }),

  reset: () => set({
    currentVector: Array(48).fill(0),
    entropy: 100,
    confidence: 0,
    history: [],
    usedThemes: [],
    usedStructures: [],
    usedSignals: [],
    recentScenarios: [],
    vectorHistory: [],
    isComplete: false,
    questionIndex: 0,
    currentQuestion: null,
    isGenerating: false,
  }),

  startSession: async (userMetadata) => {
    set({ isGenerating: true });
    const state = useScenarioStore.getState();
    const res = await fetch('/api/scenario-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'start',
        payload: {
          userMetadata,
          currentVector: state.currentVector,
          entropy: state.entropy,
          history: state.history,
          usedThemes: state.usedThemes,
          usedStructures: state.usedStructures,
          usedSignals: state.usedSignals,
          recentScenarios: state.recentScenarios
        }
      })
    });
    const data = await res.json();
    set({
      sessionMetadata: userMetadata,
      currentQuestion: data.question,
      isGenerating: false
    });
  },

  submitAnswer: async (option, customText, currentTheme, currentStructure, currentScenario, confidence, chatHistoryStr) => {
    const state = useScenarioStore.getState();
    
    // Optimistic update
    set({
      entropy: Math.max(0, state.entropy - 2.5), 
      history: currentTheme ? [...state.history, currentTheme] : state.history,
      usedThemes: currentTheme ? [...new Set([...state.usedThemes, currentTheme])] : state.usedThemes,
      usedStructures: currentStructure ? [...new Set([...state.usedStructures, currentStructure])] : state.usedStructures,
      usedSignals: option ? [...new Set([...state.usedSignals, ...option.traits])] : state.usedSignals,
      recentScenarios: currentScenario ? [...state.recentScenarios, currentScenario].slice(-10) : state.recentScenarios,
      currentQuestion: null,
      isGenerating: true
    });

    const res = await fetch('/api/scenario-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'submit',
        payload: {
          questionId: state.currentQuestion?.id || 'unknown',
          questionText: state.currentQuestion?.scenario || '',
          answerPayload: {
            text: option?.text,
            customText,
            traits: option?.traits,
            confidence
          },
          history: state.history,
          currentVector: state.currentVector,
          usedThemes: state.usedThemes,
          usedStructures: state.usedStructures,
          usedSignals: state.usedSignals,
          recentScenarios: state.recentScenarios,
          chatHistory: chatHistoryStr,
          userMetadata: state.sessionMetadata
        }
      })
    });
    
    const data = await res.json();
    const { sessionState, question, isComplete } = data;
    
    set({
      currentVector: sessionState.currentVector,
      entropy: sessionState.entropy,
      confidence: sessionState.confidence,
      history: sessionState.history,
      usedSignals: sessionState.usedSignals,
      vectorHistory: [...state.vectorHistory, sessionState.currentVector],
      questionIndex: sessionState.history.length,
      currentQuestion: question,
      isComplete,
      isGenerating: false
    });
  }
}));
