"use client";

import { useEffect, useState } from "react";

type Match = {
  fixture: {
    id: number;
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

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMatches() {
    try {
      const response = await fetch("/api/fixtures", {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.response) {
        setMatches(data.response);
      }
    } catch (error) {
      console.error("Failed to load matches:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches();

    const interval = setInterval(loadMatches, 30000);

    return () => clearInterval(interval);
  }, []);

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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "26px" }}>
          GoGoalMatch
        </h1>

        <nav
          style={{
            display: "flex",
            gap: "22px",
            flexWrap: "wrap",
          }}
        >
          <a href="/" style={{ color: "white", textDecoration: "none" }}>
            Live
          </a>
          <a
            href="/matches"
            style={{ color: "white", textDecoration: "none" }}
          >
            Matches
          </a>
          <a
            href="/results"
            style={{ color: "white", textDecoration: "none" }}
          >
            Results
          </a>
          <a
            href="/standings"
            style={{ color: "white", textDecoration: "none" }}
          >
            Standings
          </a>
          <a
            href="/stats"
            style={{ color: "white", textDecoration: "none" }}
          >
            Stats
          </a>
        </nav>
      </header>

      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "30px 20px",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>LIVE MATCHES</h2>

          {loading && <p>Loading live matches...</p>}

          {!loading && matches.length === 0 && (
            <p>There are no live matches right now.</p>
          )}

          {matches.map((match) => (
            <div
              key={match.fixture.id}
              style={{
                borderTop: "1px solid #e5e7eb",
                padding: "18px 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    marginBottom: "10px",
                  }}
                >
                  {match.league.country} · {match.league.name}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "8px",
                  }}
                >
                  <img
                    src={match.teams.home.logo}
                    alt=""
                    width="28"
                    height="28"
                  />
                  <strong>{match.teams.home.name}</strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <img
                    src={match.teams.away.logo}
                    alt=""
                    width="28"
                    height="28"
                  />
                  <strong>{match.teams.away.name}</strong>
                </div>
              </div>

              <div
                style={{
                  minWidth: "70px",
                  textAlign: "center",
                }}
              >
                <strong style={{ fontSize: "24px" }}>
                  {match.goals.home ?? 0} - {match.goals.away ?? 0}
                </strong>

                <br />

                <span
                  style={{
                    color: "#dc2626",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  {match.fixture.status.elapsed != null
                    ? `${match.fixture.status.elapsed}'`
                    : match.fixture.status.short}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
