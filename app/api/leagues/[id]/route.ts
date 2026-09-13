import { NextResponse } from "next";

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

  const leagueId = params.id;

  if (!leagueId || !/^\d+$/.test(leagueId)) {
    return NextResponse.json(
      { error: "Invalid league ID" },
      { status: 400 }
    );
  }

  const currentYear = new Date().getFullYear();

  try {
    const baseUrl = "https://v3.football.api-sports.io";

    const headers = {
      "x-apisports-key": apiKey,
    };

    const [leagueResponse, standingsResponse, fixturesResponse] =
      await Promise.all([
        fetch(
          `${baseUrl}/leagues?id=${leagueId}&season=${currentYear}`,
          {
            headers,
            cache: "no-store",
          }
        ),

        fetch(
          `${baseUrl}/standings?league=${leagueId}&season=${currentYear}`,
          {
            headers,
            cache: "no-store",
          }
        ),

        fetch(
          `${baseUrl}/fixtures?league=${leagueId}&season=${currentYear}&timezone=America/New_York`,
          {
            headers,
            cache: "no-store",
          }
        ),
      ]);

    if (
      !leagueResponse.ok ||
      !standingsResponse.ok ||
      !fixturesResponse.ok
    ) {
      return NextResponse.json(
        { error: "Failed to fetch league data" },
        { status: 502 }
      );
    }

    const [leagueData, standingsData, fixturesData] =
      await Promise.all([
        leagueResponse.json(),
        standingsResponse.json(),
        fixturesResponse.json(),
      ]);

    if (
      (leagueData.errors &&
        Object.keys(leagueData.errors).length > 0) ||
      (standingsData.errors &&
        Object.keys(standingsData.errors).length > 0) ||
      (fixturesData.errors &&
        Object.keys(fixturesData.errors).length > 0)
    ) {
      return NextResponse.json(
        {
          error: "API-Football returned an error",
          details: {
            league: leagueData.errors,
            standings: standingsData.errors,
            fixtures: fixturesData.errors,
          },
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      league: leagueData.response?.[0] || null,
      standings: standingsData.response?.[0]?.league?.standings?.[0] || [],
      fixtures: fixturesData.response || [],
    });
  } catch (error) {
    console.error("League API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch league data" },
      { status: 500 }
    );
  }
}
