import { NextResponse } from 'next/server';
import { QuestionService, GeminiProvider, FallbackService, QuestionCache, ExtractionService } from '@/engines/scenario/ai';
import { updateVector, calculateEntropy, classify, archetypes, BehaviorDimensions, SIGNAL_WEIGHTS, INDEX_TO_DIMENSION } from '@/engines/scenario/math';

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY || 'dummy'; // Using dummy for fallback if not set but required by provider
const aiProvider = new GeminiProvider(geminiApiKey);
const fallbackService = new FallbackService();
const questionCache = new QuestionCache();
const questionService = new QuestionService(aiProvider, fallbackService, questionCache);
const extractionService = new ExtractionService(aiProvider);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (action === 'start') {
      const { userMetadata, currentVector, entropy, history, usedThemes, usedStructures, usedSignals, recentScenarios } = payload;
      
      const question = await generateNextQuestion(currentVector, entropy, history, usedThemes, usedStructures, usedSignals, recentScenarios, '', userMetadata);
      
      return NextResponse.json({ question });
    }

    if (action === 'submit') {
      const { 
        questionId, questionText, answerPayload, history, currentVector, 
        usedThemes, usedStructures, usedSignals, recentScenarios, chatHistory, userMetadata 
      } = payload;

      let activeTraits: string[] = [];
      
      if (answerPayload.customText) {
        activeTraits = await extractionService.extractTraits(questionText, answerPayload.customText);
      } else if (answerPayload.traits) {
        activeTraits = answerPayload.traits;
      }

      // Build dimensional weight updates
      const targetDimensions: { index: number; weight: number }[] = [];
      for (const trait of activeTraits) {
        const idx = BehaviorDimensions[trait as keyof typeof BehaviorDimensions];
        if (idx !== undefined) {
          const baseWeight = (SIGNAL_WEIGHTS as any)[trait] || 0.3;
          targetDimensions.push({ index: idx, weight: baseWeight });
        }
      }

      // Temperature to slow down convergence (target Q: 10)
      const questionCount = history.length + 1;
      const targetQ = 10;
      const startT = 2.0;
      const endT = 0.05;
      const progress = Math.min(1.0, (questionCount - 1) / Math.max(1, targetQ - 1));
      const temperature = startT - (progress * (startT - endT));

      const newVector = updateVector(currentVector, targetDimensions, answerPayload.confidence, 1.0);
      const classification = classify(newVector, archetypes, temperature);
      const probabilities = classification.map(c => c.probability);
      const newEntropy = calculateEntropy(probabilities);
      const newConfidence = classification.length > 0 ? classification[0].probability * 100 : 0;
      
      const newHistory = [...history, questionId];
      const newUsedSignals = [...new Set([...usedSignals, ...activeTraits])];

      if (newHistory.length >= 10) {
        return NextResponse.json({
          sessionState: { currentVector: newVector, entropy: newEntropy, confidence: newConfidence, history: newHistory, usedSignals: newUsedSignals },
          question: null,
          isComplete: true
        });
      }

      const nextQuestion = await generateNextQuestion(
        newVector, newEntropy, newHistory, usedThemes, usedStructures, newUsedSignals, recentScenarios, chatHistory, userMetadata
      );

      return NextResponse.json({
        sessionState: { currentVector: newVector, entropy: newEntropy, confidence: newConfidence, history: newHistory, usedSignals: newUsedSignals },
        question: nextQuestion,
        isComplete: false
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Scenario Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function generateNextQuestion(vector: number[], entropy: number, history: string[], usedThemes: string[], usedStructures: string[], usedSignals: string[], recentScenarios: string[], chatHistory: string, userMetadata: any) {
  let targetDimensionIndex = 0;
  let minMag = Infinity;
  for(let i=0; i<48; i++) {
    if(Math.abs(vector[i]) < minMag) {
      minMag = Math.abs(vector[i]);
      targetDimensionIndex = i;
    }
  }
  
  const targetSignal = INDEX_TO_DIMENSION[targetDimensionIndex] || 'planning';

  let userState = '';
  const topTraits = vector
    .map((val, idx) => ({ name: INDEX_TO_DIMENSION[idx], val }))
    .filter(t => t.val > 0.05)
    .sort((a, b) => b.val - a.val)
    .slice(0, 5);
    
  if (topTraits.length > 0) {
    userState = topTraits.map(t => `- ${t.name}: ${Math.round(t.val * 100)}% relative strength`).join('\n');
  }

  const aiQuestion = await questionService.getQuestion({
    needSignals: [targetSignal],
    usedThemes: usedThemes,
    usedStructures: usedStructures,
    usedSignals: usedSignals,
    entropyState: entropy,
    recentScenarios: recentScenarios,
    userState: userState,
    chatHistory: chatHistory,
    name: userMetadata?.name,
    age: userMetadata?.age,
    ageGroup: userMetadata?.ageGroup,
  });

  return {
    id: aiQuestion.id,
    scenario: aiQuestion.scenario,
    theme: aiQuestion.theme,
    structure: aiQuestion.structure,
    options: aiQuestion.options,
    _debug: aiQuestion._debug
  };
}
