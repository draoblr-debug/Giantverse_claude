import { NextRequest, NextResponse } from "next/server";
import { dossierGenerateSchema } from "@/lib/validators";
import { buildPersonaPayload } from "@/engines/dossier/persona-payload";
import { assembleDossierPdf } from "@/engines/dossier/pdf-assembler";

// Full "Dossier 2.0" premium collector's-edition PDF, personalized live
// from the participant's already-decided Giantverse identity (name +
// archetype from DOB/name/survey — never from anything new here). Assembled
// entirely in Node from pre-built pieces (see pdf-assembler.ts) — no Python
// subprocess, so this runs on Vercel's serverless functions.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = dossierGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }
  const { realName, birthName, legacyName, archetypeId, order, guidingPromise, scores, visualMatches } = parsed.data;

  let payload: ReturnType<typeof buildPersonaPayload>;
  try {
    payload = buildPersonaPayload({
      realName,
      birthName,
      legacyName,
      archetypeId,
      order,
      guidingPromise,
      scores: scores ?? null,
      visualMatches: visualMatches ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Unrecognised archetype." }, { status: 400 });
  }

  try {
    const { bytes, pages, quotePages } = await assembleDossierPdf(payload);
    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${legacyName.replace(/[^a-z0-9]+/gi, "-")}-dossier.pdf"`,
        "Cache-Control": "no-store",
        "X-Dossier-Pages": String(pages),
        "X-Dossier-Quote-Pages": quotePages.join(","),
      },
    });
  } catch (err) {
    console.error("dossier generation failed:", err);
    return NextResponse.json({ error: "Dossier generation failed." }, { status: 500 });
  }
}
