import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "API_FOOTBALL_KEY is not configured" },
      { status: 500 }
    );
  }

  const today = new Date().toISOString().split("T")[0];

  try {
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${today}`,
      {
        headers: {
          "x-apisports-key": apiKey,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `API request failed: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch football data" },
      { status: 500 }
    );
  }
}
