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
    fetch(`/api/fixtures/${params.id}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <main style={{ padding: 30 }}>Loading match...</main>;
  }

  const match = data?.fixture;

  if (!match) {
    return <main style={{ padding: 30 }}>Match not found.</main>;
  }

  const events = data.events || [];
  const statistics = data.statistics || [];
  const lineups = data.lineups || [];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f6f8",
        fontFamily: "Arial, sans-serif",
        color: "#111827",
        paddingBottom: 40,
      }}
    >
      <header
        style={{
          background: "#111827",
          padding: "18px 24px",
        }}
      >
        <a href="/" style={{ color: "white", textDecoration: "none" }}>
          ← Live Matches
        </a>
      </header>

      <section
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "25px 20px",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 30,
            textAlign: "center",
          }}
        >
          <img src={match.league.logo} alt="" width="55" height="55" />

          <p style={{ color: "#6b7280" }}>
            {match.league.country} · {match.league.name}
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 40,
              marginTop: 25,
            }}
          >
            <div>
              <img
                src={match.teams.home.logo}
                alt=""
                width="70"
                height="70"
              />
              <h2>{match.teams.home.name}</h2>
            </div>

            <div>
              <div style={{ fontSize: 38, fontWeight: "bold" }}>
                {match.goals.home ?? 0} - {match.goals.away ?? 0}
              </div>

              <div style={{ color: "#dc2626", fontWeight: "bold" }}>
                {match.fixture.status.elapsed
                  ? `${match.fixture.status.elapsed}'`
                  : match.fixture.status.short}
              </div>
            </div>

            <div>
              <img
                src={match.teams.away.logo}
                alt=""
                width="70"
                height="70"
              />
              <h2>{match.teams.away.name}</h2>
            </div>
          </div>
        </div>

        <div style={box}>
          <h2>Match Events</h2>

          {events.length === 0 ? (
            <p>No events available.</p>
          ) : (
            events.map((event: any, index: number) => (
              <div key={index} style={row}>
                <strong>{event.time?.elapsed ?? ""}'</strong>
                {"  "}
                {event.team?.name || ""} —{" "}
                {event.player?.name || ""}
                {" — "}
                {event.detail || event.type}
              </div>
            ))
          )}
        </div>

        <div style={box}>
          <h2>Statistics</h2>

          {statistics.length === 0 ? (
            <p>No statistics available.</p>
          ) : (
            statistics.map((team: any, index: number) => (
              <div key={index} style={{ marginBottom: 25 }}>
                <h3>{team.team?.name}</h3>

                {team.statistics?.map((stat: any, i: number) => (
                  <div key={i} style={row}>
                    <span>{stat.type}</span>
                    <strong>{stat.value ?? "-"}</strong>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        <div style={box}>
          <h2>Lineups</h2>

          {lineups.length === 0 ? (
            <p>No lineup information available.</p>
          ) : (
            lineups.map((team: any, index: number) => (
              <div key={index} style={{ marginBottom: 25 }}>
                <h3>{team.team?.name}</h3>

                {team.startXI?.map((player: any, i: number) => (
                  <div key={i} style={row}>
                    {player.player?.number ?? ""} —{" "}
                    {player.player?.name ?? ""}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

const box = {
  background: "white",
  borderRadius: 12,
  padding: 25,
  marginTop: 20,
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 0",
  borderTop: "1px solid #e5e7eb",
};
