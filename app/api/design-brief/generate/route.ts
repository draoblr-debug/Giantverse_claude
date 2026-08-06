import { NextRequest, NextResponse } from "next/server";
import { designBriefGenerateSchema } from "@/lib/validators";
import { buildPersonaPayload } from "@/engines/dossier/persona-payload";
import { assembleDesignBriefPdf } from "@/engines/brief/design-brief-assembler";

// The free, single-click "Character Design Brief" — a ≤5-page PDF offered
// directly on the reveal page, before the participant even confirms their
// identity. Distinct from /api/dossier/generate's paid 111-page book: no
// payment gate, no visual matches, no pre-built static pages — assembled
// fresh in Node from src/engines/brief/design-brief-assembler.ts.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = designBriefGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }
  const { birthName, legacyName, archetypeId, invisibleArchetypeIds, order, guidingPromise, scores, scoreHistory } = parsed.data;

  let payload: ReturnType<typeof buildPersonaPayload>;
  try {
    payload = buildPersonaPayload({
      realName: "",
      birthName,
      legacyName,
      archetypeId,
      order,
      guidingPromise,
      scores: scores ?? null,
      visualMatches: null,
      scoreHistory: scoreHistory ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Unrecognised archetype." }, { status: 400 });
  }

  try {
    const bytes = await assembleDesignBriefPdf(payload, invisibleArchetypeIds);
    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${legacyName.replace(/[^a-z0-9]+/gi, "-")}-design-brief.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("design brief generation failed:", err);
    return NextResponse.json({ error: "Brief generation failed." }, { status: 500 });
  }
}
