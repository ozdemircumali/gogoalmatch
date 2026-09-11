import { NextResponse } from "next/server";

const API_BASE = "https://v3.football.api-sports.io";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const apiKey = process.env.API_FOOTBALL_KEY;
  const id = context.params.id;

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "API_FOOTBALL_KEY is not configured",
      },
      { status: 500 }
    );
  }

  if (!/^\d+$/.test(id)) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid match ID",
      },
      { status: 400 }
    );
  }

  const headers = {
    "x-apisports-key": apiKey,
  };

  async function getData(path: string) {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `API-Football returned ${response.status} for ${path}`
      );
    }

    const json = await response.json();

    return json?.response ?? [];
  }

  try {
    const [fixtureResponse, events, statistics, lineups, players] =
      await Promise.all([
        getData(`/fixtures?id=${id}`),
        getData(`/fixtures/events?fixture=${id}`),
        getData(`/fixtures/statistics?fixture=${id}`),
        getData(`/fixtures/lineups?fixture=${id}`),
        getData(`/fixtures/players?fixture=${id}`),
      ]);

    if (!fixtureResponse.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Match not found",
        },
        { status: 404 }
      );
    }

    const fixture = fixtureResponse[0];

    return NextResponse.json({
      success: true,

      data: {
        fixture,
        match: fixture,

        teams: {
          home: fixture.teams?.home ?? null,
          away: fixture.teams?.away ?? null,
        },

        league: fixture.league ?? null,

        venue: fixture.fixture?.venue ?? null,

        referee: fixture.fixture?.referee ?? null,

        status: fixture.fixture?.status ?? null,

        score: {
          goals: fixture.goals ?? null,
          halftime: fixture.score?.halftime ?? null,
          fulltime: fixture.score?.fulltime ?? null,
          extratime: fixture.score?.extratime ?? null,
          penalty: fixture.score?.penalty ?? null,
        },

        events,
        statistics,
        lineups,
        players,
      },

      meta: {
        matchId: Number(id),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("GoGoalMatch match center error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load match data",
      },
      { status: 500 }
    );
  }
}
