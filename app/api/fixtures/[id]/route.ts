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

  try {
    const headers = {
      "x-apisports-key": apiKey,
    };

    const [fixtureResponse, eventsResponse, statisticsResponse, lineupsResponse] =
      await Promise.all([
        fetch(
          `https://v3.football.api-sports.io/fixtures?id=${params.id}`,
          { headers, cache: "no-store" }
        ),
        fetch(
          `https://v3.football.api-sports.io/fixtures/events?fixture=${params.id}`,
          { headers, cache: "no-store" }
        ),
        fetch(
          `https://v3.football.api-sports.io/fixtures/statistics?fixture=${params.id}`,
          { headers, cache: "no-store" }
        ),
        fetch(
          `https://v3.football.api-sports.io/fixtures/lineups?fixture=${params.id}`,
          { headers, cache: "no-store" }
        ),
      ]);

    const fixture = await fixtureResponse.json();
    const events = await eventsResponse.json();
    const statistics = await statisticsResponse.json();
    const lineups = await lineupsResponse.json();

    return NextResponse.json({
      fixture: fixture.response?.[0] || null,
      events: events.response || [],
      statistics: statistics.response || [],
      lineups: lineups.response || [],
    });
  } catch (error) {
    console.error("Failed to fetch fixture details:", error);

    return NextResponse.json(
      { error: "Failed to fetch fixture details" },
      { status: 500 }
    );
  }
}
