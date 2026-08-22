// server-side for fetching jersey options from google sheet
import { fetchSheetData } from "../../lib/gsheet"; // server-side helper
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const options = await fetchSheetData("JerseyOptions", "A1:F12");
    return NextResponse.json(options);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch jersey options" },
      { status: 500 }
    );
  }
}
