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
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?id=${params.id}`,
      {
        headers: {
          "x-apisports-key": apiKey,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch fixture details" },
      { status: 500 }
    );
  }
}
