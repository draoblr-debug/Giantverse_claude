import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { dossierGenerateSchema } from "@/lib/validators";
import { buildPersonaPayload } from "@/engines/dossier/persona-payload";

const execFileAsync = promisify(execFile);

const DOSSIER_TOOL_DIR = path.join(process.cwd(), "tools", "dossier");
const GENERATE_SCRIPT = path.join(DOSSIER_TOOL_DIR, "generate_dossier.py");
const GENERATE_TIMEOUT_MS = 120_000;

// Full "Dossier 2.0" premium collector's-edition PDF, personalized live
// from the participant's already-decided Giantverse identity (name +
// archetype from DOB/name/survey — never from anything new here). Renders
// via the existing Python/WeasyPrint book generator, invoked as a
// subprocess with argument arrays only (no shell interpolation of
// request data) and a bounded timeout.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = dossierGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }
  const { realName, birthName, legacyName, archetypeId, order, guidingPromise, scores } = parsed.data;

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
    });
  } catch {
    return NextResponse.json({ error: "Unrecognised archetype." }, { status: 400 });
  }

  const workDir = await mkdtemp(path.join(tmpdir(), "giantverse-dossier-"));
  const personaPath = path.join(workDir, "persona.json");
  const pdfPath = path.join(workDir, "dossier.pdf");

  await writeFile(personaPath, JSON.stringify(payload), "utf-8");

  try {
    const { stdout } = await execFileAsync(
      "python3",
      [GENERATE_SCRIPT, "--persona-json", personaPath, "--out", pdfPath],
      {
        cwd: DOSSIER_TOOL_DIR,
        timeout: GENERATE_TIMEOUT_MS,
        env: { ...process.env, DYLD_FALLBACK_LIBRARY_PATH: "/opt/homebrew/lib" },
        maxBuffer: 10 * 1024 * 1024,
      },
    );

    // The script prints a "MANIFEST:{...}" line with total page count and
    // which pages are chapter-opening quote pages — used by the preview UI
    // to pick real teaser pages instead of guessing fixed page numbers.
    const manifestLine = stdout.split("\n").find((l) => l.startsWith("MANIFEST:"));
    let pageCount = "";
    let quotePages = "";
    if (manifestLine) {
      try {
        const manifest = JSON.parse(manifestLine.slice("MANIFEST:".length));
        pageCount = String(manifest.pages ?? "");
        quotePages = Array.isArray(manifest.quote_pages) ? manifest.quote_pages.join(",") : "";
      } catch {
        // Missing manifest just means the preview falls back to page 1 only.
      }
    }

    const pdf = await readFile(pdfPath);
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${legacyName.replace(/[^a-z0-9]+/gi, "-")}-dossier.pdf"`,
        "Cache-Control": "no-store",
        "X-Dossier-Pages": pageCount,
        "X-Dossier-Quote-Pages": quotePages,
      },
    });
  } catch (err) {
    console.error("dossier generation failed:", err);
    return NextResponse.json({ error: "Dossier generation failed." }, { status: 500 });
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
