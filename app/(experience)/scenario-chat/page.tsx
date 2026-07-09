"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session.store";
import { useScenarioStore } from "@/stores/scenario.store";
import { useAssessmentStore } from "@/stores/assessment.store";
import type { QuestionOption } from "@/stores/scenario.store";

import { MessagesContainer, type ChatMessage } from "@/components/chat/MessagesContainer/MessagesContainer";
import { Composer } from "@/components/chat/Composer/Composer";
import { SuggestionsSheet } from "@/components/chat/SuggestionsSheet/SuggestionsSheet";
import type { Signal } from "@/types/archetype.types";

export default function ScenarioChatPage() {
  const router = useRouter();
  const { birthName, firstName, birthDay, birthMonth } = useSessionStore();
  const setResult = useAssessmentStore((state) => state.setResult);
  
  const { 
    startSession, 
    submitAnswer,
    submitAnswerOptimistic,
    isComplete, 
    usedSignals, 
    questionIndex,
    currentQuestion,
    isGenerating,
    reset,
    sessionMetadata
  } = useScenarioStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [composerText, setComposerText] = useState('');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(0);

  const initRef = useRef(false);

  useEffect(() => {
    if (!birthName) {
      router.replace("/choose");
      return;
    }

    if (!initRef.current) {
      initRef.current = true;
      reset();
      
      let age = 30; // default
      if (birthDay && birthMonth) {
        age = 25; // approximated
      }
      
      const userMetadata = {
        name: firstName || 'Seeker',
        age,
        ageGroup: 'adult' as const
      };
      
      startSession(userMetadata);
    }
  }, [birthName, firstName, birthDay, birthMonth, router, reset, startSession]);

  // Sync currentQuestion to chat messages
  useEffect(() => {
    if (currentQuestion) {
      setMessages((prev) => {
        if (prev.some(m => m.id === currentQuestion.id)) return prev;
        
        return [...prev, {
          id: currentQuestion.id,
          role: 'assistant',
          text: currentQuestion.scenario
        }];
      });
    }
  }, [currentQuestion]);

  // Completion logic
  useEffect(() => {
    if (isComplete && usedSignals.length > 0) {
      const signals: Signal[] = usedSignals.map((dimension, idx) => ({
        dimension,
        value: 1, // Positive signal
        confidence: 0.8,
        turnIndex: idx
      }));

      setResult({ source: "chat", signals });
      router.push("/reveal");
    }
  }, [isComplete, usedSignals, setResult, router]);

  const handleTextSubmit = async () => {
    if (!composerText.trim() || isGenerating) return;
    
    const userText = composerText.trim();
    
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userText
    }]);

    setComposerText('');
    setIsSuggestionsOpen(false);

    await processSubmit(undefined, userText, 1.0);
  };

  const handleSuggestionSubmit = async () => {
    if (selectedOptionIdx === null || isGenerating || !currentQuestion) return;
    
    const selectedOption = currentQuestion.options[selectedOptionIdx];
    
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user',
      text: selectedOption.text
    }]);

    setIsSuggestionsOpen(false);
    setSelectedOptionIdx(null);
    setSliderValue(0);

    await processSubmit(selectedOption, '', sliderValue);
  };

  const processSubmit = async (selectedOption: QuestionOption | undefined, customText: string, confidence: number) => {
    if (!currentQuestion) return;
    
    await submitAnswer(
      selectedOption,
      customText,
      currentQuestion.theme,
      currentQuestion.structure,
      currentQuestion.scenario,
      confidence
    );
  };

  if (!birthName) return null;

  return (
    <div className="min-h-screen w-full bg-[#0B111C] text-white flex flex-col relative">
      <div className="flex-1 w-full flex flex-col">
        
        {/* Header Equivalent */}
        <div className="text-center py-4 border-b border-white/10 mb-4">
          <p className="txt-thm-clr-50-2 txt-upp mb-0 f-12">The Oracle</p>
          <div className="progress-bar mt-2 mx-auto" style={{ width: "200px" }}>
            <div
              style={{ width: `${(questionIndex / 10) * 100}%`, backgroundColor: "var(--thm-clr-1)", height: "2px", transition: "width 0.3s" }}
            ></div>
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col items-center relative pb-40">
          <div className="w-full max-w-5xl flex-1 px-4">
            <MessagesContainer 
              messages={messages} 
              isGenerating={isGenerating} 
            />
          </div>
        </div>

        <SuggestionsSheet
          isOpen={isSuggestionsOpen}
          onClose={() => setIsSuggestionsOpen(false)}
          options={currentQuestion?.options || []}
          selectedOptionIndex={selectedOptionIdx}
          onSelectOption={(idx) => setSelectedOptionIdx(idx)}
          sliderValue={sliderValue}
          onSliderChange={setSliderValue}
          onSubmit={handleSuggestionSubmit}
          disabled={isGenerating}
        />
        
        <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-[#0B111C] via-[#0B111C] to-transparent pt-10 pb-6 px-4 z-50">
          <div className="max-w-5xl mx-auto">
            <Composer
              value={composerText}
              onChange={setComposerText}
              onSubmit={handleTextSubmit}
              onOpenSuggestions={() => setIsSuggestionsOpen(true)}
              disabled={isGenerating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
