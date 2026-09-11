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

  const headers = {
    "x-apisports-key": apiKey,
  };

  try {
    const [fixtureRes, eventsRes, statisticsRes, lineupsRes] =
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

    const fixture = await fixtureRes.json();
    const events = await eventsRes.json();
    const statistics = await statisticsRes.json();
    const lineups = await lineupsRes.json();

    return NextResponse.json({
      fixture: fixture.response?.[0] || null,
      events: events.response || [],
      statistics: statistics.response || [],
      lineups: lineups.response || [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch match details" },
      { status: 500 }
    );
  }
}
