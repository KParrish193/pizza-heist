// server-side for fetching size chart from google sheet
import { fetchSheetData } from "@/app/lib/gsheet"; // server-side helper
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sizeChart = await fetchSheetData("SizeChart", "A1:K9");
    const instructionData = await fetchSheetData("SizeChart", "A15:A19");
    
    const measuringInstructions = [];
    for (let i = 0; i < instructionData.length; i += 2) {
      const label = instructionData[i]?.["Measuring Instructions"];
      const description = instructionData[i + 1]?.["Measuring Instructions"];

      if (label && description) {
        measuringInstructions.push({
          label,
          description,
        });
      }
    }

    return NextResponse.json({
      sizeChart,
      measuringInstructions,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch size chart" },
      { status: 500 }
    );
  }
}