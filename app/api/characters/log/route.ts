import { NextRequest, NextResponse } from "next/server";
import { characterLogSchema } from "@/lib/validators";

// Classroom roster logging — relays every generated character to a Google
// Sheet via a Google Apps Script Web App deployed on the sheet itself (see
// tools/sheets-logger/character-log.gs for the script + deploy steps). No
// GCP project or service account needed: the Apps Script deployment URL is
// the only secret, held server-side in GOOGLE_SHEETS_WEBHOOK_URL — it never
// ships to the browser, since the client only ever calls this route.
//
// A logging sink being unset or down must never break the caller's actual
// task (the brief the participant just downloaded already succeeded by the
// time this fires) — every path here returns 200.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = characterLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("GOOGLE_SHEETS_WEBHOOK_URL not set — skipping character log.");
    return NextResponse.json({ logged: false }, { status: 200 });
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...parsed.data, loggedAt: new Date().toISOString() }),
    });
    if (!res.ok) throw new Error(`Apps Script webhook responded ${res.status}`);
    return NextResponse.json({ logged: true }, { status: 200 });
  } catch (err) {
    console.error("character log to Google Sheets failed:", err);
    return NextResponse.json({ logged: false }, { status: 200 });
  }
}
