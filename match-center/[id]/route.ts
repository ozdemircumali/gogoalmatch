import { NextResponse } from "next/server";

const BASE_URL = "https://v3.football.api-sports.io";

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

  async function api(endpoint: string) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `API Football error: ${response.status}`
      );
    }

    const data = await response.json();

    return {
      response: data.response ?? [],
      results: data.results ?? 0,
      errors: data.errors ?? {},
    };
  }

  try {
    const [
      fixture,
      events,
      statistics,
      lineups,
      players,
    ] = await Promise.all([
      api(`/fixtures?id=${fixtureId}`),
      api(`/fixtures/events?fixture=${fixtureId}`),
      api(`/fixtures/statistics?fixture=${fixtureId}`),
      api(`/fixtures/lineups?fixture=${fixtureId}`),
      api(`/fixtures/players?fixture=${fixtureId}`),
    ]);

    if (!fixture.response.length) {
      return NextResponse.json(
        {
          error: "Fixture not found",
          fixtureId,
        },
        { status: 404 }
      );
    }

    const match = fixture.response[0];

    return NextResponse.json({
      success: true,

      match,

      fixture: match,

      teams: {
        home: match.teams?.home ?? null,
        away: match.teams?.away ?? null,
      },

      league: match.league ?? null,

      venue: match.fixture?.venue ?? null,

      referee: match.fixture?.referee ?? null,

      status: match.fixture?.status ?? null,

      score: match.goals ?? null,

      halftime: match.score?.halftime ?? null,

      fulltime: match.score?.fulltime ?? null,

      extratime: match.score?.extratime ?? null,

      penalty: match.score?.penalty ?? null,

      events: events.response,

      statistics: statistics.response,

      lineups: lineups.response,

      players: players.response,

      meta: {
        fixtureId: Number(fixtureId),
        eventsCount: events.results,
        statisticsCount: statistics.results,
        lineupsCount: lineups.results,
        playersCount: players.results,
      },
    });
  } catch (error) {
    console.error("MATCH CENTER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load match center data",
      },
      { status: 500 }
    );
  }
}
