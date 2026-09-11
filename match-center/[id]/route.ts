import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "API_FOOTBALL_KEY is not configured" },
      { status: 500 }
    );
  }

  const fixtureId = params.id;

  if (!fixtureId || !/^\d+$/.test(fixtureId)) {
    return NextResponse.json(
      { error: "Invalid fixture ID" },
      { status: 400 }
    );
  }

  const headers = {
    "x-apisports-key": apiKey,
  };

  const baseUrl = "https://v3.football.api-sports.io";

  async function fetchApi(endpoint: string) {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    return data.response ?? [];
  }

  try {
    const [fixture, events, statistics, lineups] = await Promise.all([
      fetchApi(`/fixtures?id=${fixtureId}`),
      fetchApi(`/fixtures/events?fixture=${fixtureId}`),
      fetchApi(`/fixtures/statistics?fixture=${fixtureId}`),
      fetchApi(`/fixtures/lineups?fixture=${fixtureId}`),
    ]);

    if (!fixture.length) {
      return NextResponse.json(
        { error: "Fixture not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      fixture: fixture[0],
      events,
      statistics,
      lineups,
    });
  } catch (error) {
    console.error("Match center API error:", error);

    return NextResponse.json(
      { error: "Failed to load match data" },
      { status: 500 }
    );
  }
}
