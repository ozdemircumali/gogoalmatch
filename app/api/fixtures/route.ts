import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "API_FOOTBALL_KEY is not configured" },
      { status: 500 }
    );
  }

  // New York tarihini kullanıyoruz.
  // UTC tarihi kullanmak, akşam saatlerinde yanlış günün maçlarını getirebilir.
  const now = new Date();

  const newYorkDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  try {
    const url =
      `https://v3.football.api-sports.io/fixtures` +
      `?date=${newYorkDate}` +
      `&timezone=America/New_York`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-apisports-key": apiKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `API request failed: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.errors && Object.keys(data.errors).length > 0) {
      return NextResponse.json(
        {
          error: "API-Football returned an error",
          details: data.errors,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Fixtures API error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch football data",
      },
      { status: 500 }
    );
  }
}
