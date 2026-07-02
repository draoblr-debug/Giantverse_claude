import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { scoreArchetypes } from "@/engines/archetype/archetype.engine";

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

const archetypeRequestSchema = z.object({
  signals: z.array(
    z.object({
      dimension: z.enum(DIMENSIONS),
      value: z.string(),
      confidence: z.number().min(0).max(1),
      turnIndex: z.number().int().nonnegative(),
    }),
  ),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = archetypeRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const scores = scoreArchetypes(parsed.data.signals);
  const [top] = scores;

  if (!top) {
    return NextResponse.json({ error: "No signals to evaluate." }, { status: 400 });
  }

  return NextResponse.json({
    topArchetype: {
      id: top.archetype.id,
      label: top.archetype.label,
      romajiName: top.archetype.romajiName,
      order: top.archetype.order,
      normalized: top.normalized,
    },
    scores: scores.map((s) => ({ id: s.archetype.id, normalized: s.normalized })),
  });
}
