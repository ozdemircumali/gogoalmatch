"use client";

import { useEffect, useState } from "react";

export default function MatchPage({
  params,
}: {
  params: { id: string };
}) {
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatch() {
      try {
        const response = await fetch(`/api/fixtures/${params.id}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (data.response?.length) {
          setMatch(data.response[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadMatch();
  }, [params.id]);

  if (loading) {
    return (
      <main style={{ padding: 30, fontFamily: "Arial" }}>
        Loading match...
      </main>
    );
  }

  if (!match) {
    return (
      <main style={{ padding: 30, fontFamily: "Arial" }}>
        Match not found.
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f6f8",
        fontFamily: "Arial, sans-serif",
        color: "#111827",
      }}
    >
      <header
        style={{
          background: "#111827",
          padding: "18px 24px",
        }}
      >
        <a
          href="/"
          style={{
            color: "white",
            textDecoration: "none",
          }}
        >
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
          <img
            src={match.league.logo}
            alt=""
            width={55}
            height={55}
          />

          <p style={{ color: "#6b7280" }}>
            {match.league.country} · {match.league.name}
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 45,
              marginTop: 25,
            }}
          >
            <div>
              <img
                src={match.teams.home.logo}
                alt=""
                width={75}
                height={75}
              />

              <h2>{match.teams.home.name}</h2>
            </div>

            <div>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: "bold",
                }}
              >
                {match.goals.home ?? 0} -{" "}
                {match.goals.away ?? 0}
              </div>

              <div
                style={{
                  color: "#dc2626",
                  fontWeight: "bold",
                  marginTop: 8,
                }}
              >
                {match.fixture.status.elapsed
                  ? `${match.fixture.status.elapsed}'`
                  : match.fixture.status.short}
              </div>
            </div>

            <div>
              <img
                src={match.teams.away.logo}
                alt=""
                width={75}
                height={75}
              />

              <h2>{match.teams.away.name}</h2>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 25,
            marginTop: 20,
          }}
        >
          <h2>Match Information</h2>

          <p>
            <strong>Status:</strong>{" "}
            {match.fixture.status.long}
          </p>

          <p>
            <strong>Match ID:</strong>{" "}
            {match.fixture.id}
          </p>

          <p>
            <strong>Venue:</strong>{" "}
            {match.fixture.venue?.name || "Not available"}
          </p>

          <p>
            <strong>Referee:</strong>{" "}
            {match.fixture.referee || "Not available"}
          </p>
        </div>
      </section>
    </main>
  );
}
