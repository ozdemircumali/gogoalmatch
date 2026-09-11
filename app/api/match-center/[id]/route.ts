import { NextResponse } from "next/server";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(
  request: Request,
  { params }: Params
) {
  const apiKey = process.env.API_FOOTBALL_KEY;
  const fixtureId = params.id;

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "API_FOOTBALL_KEY is not configured",
      },
      { status: 500 }
    );
  }

  if (!fixtureId || !/^\d+$/.test(fixtureId)) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid fixture ID",
      },
      { status: 400 }
    );
  }

  const baseUrl = "https://v3.football.api-sports.io";

  const headers = {
    "x-apisports-key": apiKey,
  };

  async function fetchApi(endpoint: string) {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `API-Football request failed: ${response.status}`
      );
    }

    const data = await response.json();

    return data?.response ?? [];
  }

  try {
    const [
      fixtureData,
      events,
      statistics,
      lineups,
      players,
    ] = await Promise.all([
      fetchApi(`/fixtures?id=${fixtureId}`),
      fetchApi(`/fixtures/events?fixture=${fixtureId}`),
      fetchApi(`/fixtures/statistics?fixture=${fixtureId}`),
      fetchApi(`/fixtures/lineups?fixture=${fixtureId}`),
      fetchApi(`/fixtures/players?fixture=${fixtureId}`),
    ]);

    if (!fixtureData.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Match not found",
        },
        { status: 404 }
      );
    }

    const fixture = fixtureData[0];

    return NextResponse.json({
      success: true,

      match: fixture,
      fixture,

      teams: {
        home: fixture.teams?.home ?? null,
        away: fixture.teams?.away ?? null,
      },

      league: fixture.league ?? null,

      venue: fixture.fixture?.venue ?? null,

      referee: fixture.fixture?.referee ?? null,

      status: fixture.fixture?.status ?? null,

      score: fixture.goals ?? null,

      halftime: fixture.score?.halftime ?? null,

      fulltime: fixture.score?.fulltime ?? null,

      extratime: fixture.score?.extratime ?? null,

      penalty: fixture.score?.penalty ?? null,

      events,

      statistics,

      lineups,

      players,

      meta: {
        fixtureId: Number(fixtureId),
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Match center error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch match data",
      },
      { status: 500 }
    );
  }
}
