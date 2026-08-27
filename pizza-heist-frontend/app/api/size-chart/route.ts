// server-side for fetching size chart from google sheet
import { fetchSheetData } from "@/app/lib/gsheet"; // server-side helper
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sizeChart = await fetchSheetData("SizeChart", "A1:K9");
    return NextResponse.json(sizeChart);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch size chart" },
      { status: 500 }
    );
  }
}