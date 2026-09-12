// app/api/fixtures/[id]/route.ts
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;

    if (!matchId || !/^\d+$/.test(matchId)) {
      return NextResponse.json(
        { error: "Invalid match ID" },
        { status: 400 }
      );
    }

    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      console.error("API_FOOTBALL_KEY is missing");
      return NextResponse.json(
        { error: "API key is not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?id=${matchId}`,
      {
        method: "GET",
        headers: {
          "x-apisports-key": apiKey,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("API-Football error:", data);

      return NextResponse.json(
        {
          error: "API-Football request failed",
          details: data,
        },
        { status: response.status }
      );
    }

    if (!data.response || data.response.length === 0) {
      return NextResponse.json(
        { error: "Match not found", response: [] },
        { status: 200 }
      );
    }

    // Detail page'in beklediği format:
    // { response: [match] }
    return NextResponse.json({
      response: data.response,
    });
  } catch (error) {
    console.error("Fixture detail fetch error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
