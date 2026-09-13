// app/api/fixtures/[id]/route.ts

import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;

    // Match ID kontrolü
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

    const headers = {
      "x-apisports-key": apiKey,
    };

    /*
     * 1. MAÇ
     * /fixtures?id=...
     *
     * Bu endpoint:
     * - fixture
     * - league
     * - teams
     * - goals
     * - score
     * - events
     * bilgilerini sağlar.
     */
    const fixtureResponse = await fetch(
      `https://v3.football.api-sports.io/fixtures?id=${matchId}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    const fixtureData = await fixtureResponse.json();

    console.log(
      `Fixture ${matchId} API response:`,
      fixtureData.errors || "no errors"
    );

    // API HTTP hatası
    if (!fixtureResponse.ok) {
      console.error("API-Football fixture error:", fixtureData);

      return NextResponse.json(
        {
          error: "API-Football request failed",
          details: fixtureData,
        },
        { status: fixtureResponse.status }
      );
    }

    // API 200 döndürüp errors alanında hata verebilir
    if (
      fixtureData.errors &&
      typeof fixtureData.errors === "object" &&
      Object.keys(fixtureData.errors).length > 0
    ) {
      console.error("API-Football errors:", fixtureData.errors);

      return NextResponse.json(
        {
          error: "API-Football returned an error",
          details: fixtureData.errors,
          response: [],
        },
        { status: 502 }
      );
    }

    // Maç bulunamadı
    if (!fixtureData.response || fixtureData.response.length === 0) {
      console.error(`Fixture ${matchId} was not found`);

      return NextResponse.json(
        {
          error: "Match not found",
          response: [],
        },
        { status: 404 }
      );
    }

    const match = fixtureData.response[0];

    /*
     * 2. İSTATİSTİKLER
     *
     * Ayrı endpoint.
     * İstatistik alınamazsa maçın tamamını bozmayacağız.
     */
    let statistics: any[] = [];

    try {
      const statisticsResponse = await fetch(
        `https://v3.football.api-sports.io/fixtures/statistics?fixture=${matchId}`,
        {
          method: "GET",
          headers,
          cache: "no-store",
        }
      );

      const statisticsData = await statisticsResponse.json();

      if (
        statisticsResponse.ok &&
        Array.isArray(statisticsData.response)
      ) {
        statistics = statisticsData.response;
      } else {
        console.warn(
          `Statistics unavailable for fixture ${matchId}:`,
          statisticsData.errors || statisticsData
        );
      }
    } catch (error) {
      console.warn(
        `Statistics request failed for fixture ${matchId}:`,
        error
      );
    }

    /*
     * 3. LINEUPS
     *
     * Ayrı endpoint.
     * Alınamazsa yine maç detayını göstermeye devam edeceğiz.
     */
    let lineups: any[] = [];

    try {
      const lineupsResponse = await fetch(
        `https://v3.football.api-sports.io/fixtures/lineups?fixture=${matchId}`,
        {
          method: "GET",
          headers,
          cache: "no-store",
        }
      );

      const lineupsData = await lineupsResponse.json();

      if (lineupsResponse.ok && Array.isArray(lineupsData.response)) {
        lineups = lineupsData.response;
      } else {
        console.warn(
          `Lineups unavailable for fixture ${matchId}:`,
          lineupsData.errors || lineupsData
        );
      }
    } catch (error) {
      console.warn(
        `Lineups request failed for fixture ${matchId}:`,
        error
      );
    }

    /*
     * 4. DETAIL PAGE'E TEK FORMATTA DÖN
     *
     * Mevcut MatchDetailPage'in beklediği:
     *
     * {
     *   response: [
     *     {
     *       fixture,
     *       league,
     *       teams,
     *       goals,
     *       score,
     *       events,
     *       statistics,
     *       lineups
     *     }
     *   ]
     * }
     */
    const completeMatch = {
      ...match,
      statistics,
      lineups,
    };

    return NextResponse.json(
      {
        response: [completeMatch],
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Fixture detail fetch error:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
