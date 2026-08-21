import { google } from "googleapis";

export type SheetRow = { [key: string]: string };

export function getSheetsClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEET_ID_CONTENT;

  // Validate all required env vars
  if (!clientEmail) throw new Error("Missing GOOGLE_CLIENT_EMAIL env var");
  if (!privateKey) throw new Error("Missing GOOGLE_PRIVATE_KEY env var");
  if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEET_ID_CONTENT env var");

  // Sanitize private key: replace literal "\n" with real newlines and trim spaces
  privateKey = privateKey.replace(/\\n/g, "\n").trim();

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return google.sheets({ version: "v4", auth });
}

export async function fetchSheetData(
  tabName: string,
  range: string
): Promise<SheetRow[]> {
  const sheets = getSheetsClient();  
  const spreadsheetId = process.env.GOOGLE_SHEET_ID_CONTENT!;

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tabName}!${range}`,
    });

    const rows = res.data.values ?? [];
    if (rows.length === 0) return [];

    const headers = rows[0];
    const dataRows = rows.slice(1);

    return dataRows.map((row) => {
      const obj: SheetRow = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] || "";
      });
      return obj;
    });
  } catch (err: unknown) {
    console.error("Error fetching Google Sheet data:", err);
    throw err;
  }
}