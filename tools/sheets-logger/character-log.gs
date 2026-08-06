/**
 * Giantverse classroom roster logger.
 *
 * SETUP
 * 1. Create (or open) the Google Sheet you want as the class roster.
 * 2. Extensions > Apps Script. Delete any boilerplate code and paste this
 *    file's contents in.
 * 3. Deploy > New deployment > select type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    Deploy, then copy the "Web app URL" it gives you (ends in /exec).
 * 4. Set that URL as GOOGLE_SHEETS_WEBHOOK_URL in the Next.js app's
 *    environment (.env.local for local dev, or your host's env config).
 *    The app's own /api/characters/log route is the only thing that calls
 *    this URL — never the browser directly.
 * 5. Re-run "Deploy > Manage deployments" and bump the version any time you
 *    edit this script — Apps Script doesn't auto-update a live /exec URL.
 *
 * Appends one row per generated character to the sheet's first tab,
 * writing the header row on the very first call.
 */

const HEADERS = [
  "Logged At", "Birth Name", "Legacy Name", "Archetype", "Romaji", "Order",
  "Guiding Promise", "Invisible Archetypes", "Source",
];

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }

  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.loggedAt || new Date().toISOString(),
    data.birthName || "",
    data.legacyName || "",
    data.archetypeLabel || "",
    data.romajiName || "",
    data.order || "",
    data.guidingPromise || "",
    (data.invisibleArchetypeLabels || []).join(", "),
    data.source || "",
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
