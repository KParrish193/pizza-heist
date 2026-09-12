import { NextResponse } from "next/server";
import { fetchTeamBySlug } from "@/app/lib/gsheet";

export async function POST(req: Request) {
  try {
    const { teamSlug, password } = await req.json();

    if (!teamSlug || !password) {
      return NextResponse.json(
        { error: "Missing team or password." },
        { status: 400 }
      );
    }

    const team = await fetchTeamBySlug(teamSlug);

    if (!team || !team.shopPassword) {
      return NextResponse.json(
        { error: "Shop authentication is not configured." },
        { status: 500 }
      );
    }

    if (password !== team.shopPassword) {
      return NextResponse.json(
        { error: "Incorrect password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set(`shop-auth-${teamSlug}`, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Shop authentication error:", error);

    return NextResponse.json(
      { error: "Unable to authenticate." },
      { status: 500 }
    );
  }
}