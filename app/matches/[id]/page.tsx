"use client";

import { useEffect, useState } from "react";

export default function MatchPage({
  params,
}: {
  params: { id: string };
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatch() {
      try {
        const [fixtureResponse, detailsResponse] = await Promise.all([
          fetch(`/api/fixtures/${params.id}`, { cache: "no-store" }),
          fetch(`/api/fixture-details/${params.id}`, { cache: "no-store" }),
        ]);

        const fixtureData = await fixtureResponse.json();
        const detailsData = await detailsResponse.json();

        setData({
          fixture: fixtureData.response?.[0] || null,
          events: detailsData.events || [],
          statistics: detailsData.statistics || [],
          lineups: detailsData.lineups || [],
        });
      } catch (error) {
        console.error("Failed to load match:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMatch();
  }, [params.id]);

  if (loading) {
    return <main style={{ padding: 20 }}>Loading match...</main>;
  }

  const match = data?.fixture;

  if (!match) {
    return (
      <main style={{ padding: 20 }}>
        <h2>Match not found</h2>
      </main>
    );
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>
        {match.teams.home.name} {match.goals.home ?? 0} -{" "}
        {match.goals.away ?? 0} {match.teams.away.name}
      </h1>

      <p>
        Status: {match.fixture.status?.long}
      </p>

      <h2>Match Events</h2>
      {data.events.length === 0 ? (
        <p>No events available.</p>
      ) : (
        data.events.map((event: any, index: number) => (
          <div key={index} style={{ marginBottom: 8 }}>
            {event.time?.elapsed}' —{" "}
            {event.team?.name} — {event.type} — {event.detail}
          </div>
        ))
      )}

      <h2>Statistics</h2>
      {data.statistics.length === 0 ? (
        <p>No statistics available.</p>
      ) : (
        data.statistics.map((team: any, index: number) => (
          <div key={index} style={{ marginBottom: 20 }}>
            <h3>{team.team?.name}</h3>
            {team.statistics?.map((stat: any, i: number) => (
              <div key={i}>
                {stat.type}: {stat.value ?? "-"}
              </div>
            ))}
          </div>
        ))
      )}

      <h2>Lineups</h2>
      {data.lineups.length === 0 ? (
        <p>No lineups available.</p>
      ) : (
        data.lineups.map((team: any, index: number) => (
          <div key={index} style={{ marginBottom: 20 }}>
            <h3>{team.team?.name}</h3>
            {team.startXI?.map((player: any, i: number) => (
              <div key={i}>
                {player.player?.name}
              </div>
            ))}
          </div>
        ))
      )}

      <h2>Match Information</h2>
      <p>League: {match.league?.name}</p>
      <p>Venue: {match.fixture?.venue?.name}</p>
      <p>Referee: {match.fixture?.referee || "-"}</p>
    </main>
  );
}
