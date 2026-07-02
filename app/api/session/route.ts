import { NextRequest, NextResponse } from "next/server";
import { generateBirthName } from "@/engines/naming/birth-name.engine";
import { birthRitualSchema } from "@/lib/validators";

// Fixed leap year so day/month-only input (no birth year collected) can
// represent Feb 29 without throwing — only getDate()/getMonth() are read.
const REFERENCE_LEAP_YEAR = 2000;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = birthRitualSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const { firstName, day, month } = parsed.data;
  const birthName = generateBirthName(firstName, new Date(REFERENCE_LEAP_YEAR, month - 1, day));

  // TODO: persist Session via Prisma once DATABASE_URL is configured (Section 4).
  return NextResponse.json({
    sessionId: crypto.randomUUID(),
    firstName,
    day,
    month,
    birthName,
  });
}

export async function GET(_req: NextRequest) {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
