import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildLegacyName } from "@/engines/naming/legacy-name.engine";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";

const legacyNameRequestSchema = z.object({
  birthName: z.string().min(1),
  archetypeId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = legacyNameRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const { birthName, archetypeId } = parsed.data;

  if (!(archetypeId in ARCHETYPE_DEFINITIONS)) {
    return NextResponse.json({ error: `Unknown archetype "${archetypeId}".` }, { status: 400 });
  }

  const archetype = ARCHETYPE_DEFINITIONS[archetypeId];
  return NextResponse.json({
    legacyName: buildLegacyName(birthName, archetypeId),
    archetype: {
      id: archetype.id,
      label: archetype.label,
      romajiName: archetype.romajiName,
      order: archetype.order,
      guidingPromise: archetype.guidingPromise,
      traits: archetype.traits,
    },
  });
}
