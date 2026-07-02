import { GoogleGenAI, Type } from "@google/genai";
import type { ChatMessage } from "@/types/conversation.types";

const MODEL = "gemini-2.5-flash";
const EXTRACTION_MODEL = "gemini-2.5-flash-lite"; // cheap/fast, per Section 5

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export async function streamCounterpartReply(params: {
  systemInstruction: string;
  history: ChatMessage[];
}): Promise<AsyncIterable<{ text?: string }>> {
  const { systemInstruction, history } = params;

  return getClient().models.generateContentStream({
    model: MODEL,
    contents: history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    config: { systemInstruction },
  });
}

export type RawSignalExtraction = {
  found: boolean;
  value: string;
  confidence: number;
};

// Secondary, cheap-model call per Section 5 ("Memory Engine"): pulls a single
// dimensional signal out of the participant's latest message.
export async function extractSignal(params: {
  dimension: string;
  probeQuestion: string;
  userMessage: string;
}): Promise<RawSignalExtraction> {
  const { dimension, probeQuestion, userMessage } = params;

  const response = await getClient().models.generateContent({
    model: EXTRACTION_MODEL,
    contents: `The participant was asked, in a situational/narrative way: "${probeQuestion}"
This question is designed to surface their ${dimension}.

Their reply was:
"""
${userMessage}
"""

Extract what this reveals about their ${dimension}, if anything. If the reply
is too short, evasive, or off-topic to reveal anything meaningful, set
found=false.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          found: { type: Type.BOOLEAN },
          value: {
            type: Type.STRING,
            description: `One sentence, plain language, describing what was revealed about their ${dimension}.`,
          },
          confidence: {
            type: Type.NUMBER,
            description: "0.0–1.0, how clearly the reply reveals this dimension.",
          },
        },
        required: ["found", "value", "confidence"],
      },
    },
  });

  const text = response.text;
  if (!text) return { found: false, value: "", confidence: 0 };

  try {
    return JSON.parse(text) as RawSignalExtraction;
  } catch {
    return { found: false, value: "", confidence: 0 };
  }
}
