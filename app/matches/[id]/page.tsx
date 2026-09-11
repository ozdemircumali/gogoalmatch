"use client";

import { useEffect, useState } from "react";

type Match = {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    name: string;
    country: string;
    logo: string;
  };
  teams: {
    home: {
      name: string;
      logo: string;
    };
    away: {
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
};

export default function MatchPage({
  params,
}: {
  params: { id: string };
}) {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatch() {
      try {
        const response = await fetch(`/api/fixtures/${params.id}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (data.response && data.response.length > 0) {
          setMatch(data.response[0]);
        }
      } catch (error) {
        console.error("Failed to load match:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMatch();
  }, [params.id]);

  if (loading) {
    return <main style={{ padding: "30px" }}>Loading match...</main>;
  }

  if (!match) {
    return <main style={{ padding: "30px" }}>Match not found.</main>;
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
          color: "white",
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
          ← Back to Live Matches
        </a>
      </header>

      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "30px 20px",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "30px",
            textAlign: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <img
            src={match.league.logo}
            alt=""
            width="50"
            height="50"
          />

          <p style={{ color: "#6b7280" }}>
            {match.league.country} · {match.league.name}
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "50px",
              marginTop: "30px",
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
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                }}
              >
                {match.goals.home ?? 0} - {match.goals.away ?? 0}
              </div>

              <div
                style={{
                  color: "#dc2626",
                  fontWeight: "bold",
                  marginTop: "8px",
                }}
              >
                {match.fixture.status.elapsed != null
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

          <hr
            style={{
              margin: "30px 0",
              border: 0,
              borderTop: "1px solid #e5e7eb",
            }}
          />

          <p>
            <strong>Status:</strong>{" "}
            {match.fixture.status.long}
          </p>

          <p>
            <strong>Match ID:</strong>{" "}
            {match.fixture.id}
          </p>
        </div>
      </section>
    </main>
  );
}
