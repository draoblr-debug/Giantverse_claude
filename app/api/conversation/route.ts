import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { receive } from "@/engines/conversation/conversation.engine";
import { canReveal } from "@/engines/archetype/confidence.engine";
import { toTextStream } from "@/services/ai/stream.service";

const DIMENSIONS = [
  "VALUES",
  "FEARS",
  "DREAMS",
  "POWER",
  "PEOPLE",
  "DECISIONS",
  "LEADERSHIP",
  "MOTIVATION",
] as const;

const signalSchema = z.object({
  dimension: z.enum(DIMENSIONS),
  value: z.string(),
  confidence: z.number().min(0).max(1),
  turnIndex: z.number().int().nonnegative(),
});

const conversationRequestSchema = z.object({
  firstName: z.string().min(1),
  birthName: z.string().min(1),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
  message: z.string().min(1),
  signals: z.array(signalSchema).default([]),
  lastProbeDimension: z.enum(DIMENSIONS).nullable().default(null),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = conversationRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const { firstName, birthName, history, message, signals, lastProbeDimension } = parsed.data;

  try {
    const result = await receive({
      firstName,
      birthName,
      history,
      message,
      signals,
      lastProbeDimension,
    });

    return new Response(toTextStream(result.stream), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Probe-Dimension": result.probeDimension,
        "X-Signals": Buffer.from(JSON.stringify(result.signals)).toString("base64"),
        "X-Turn-Count": String(result.turnIndex),
        "X-Can-Reveal": String(canReveal(result.signals, result.turnIndex)),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong." },
      { status: 502 },
    );
  }
}
