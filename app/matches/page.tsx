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

const LIVE = ["1H", "2H", "HT", "ET", "BT", "P"];
const FINISHED = ["FT", "AET", "PEN"];

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/fixtures", {
          cache: "no-store",
        });

        const data = await res.json();

        if (data.response) {
          setMatches(data.response);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const upcoming = matches.filter(
    (m) =>
      !LIVE.includes(m.fixture.status.short) &&
      !FINISHED.includes(m.fixture.status.short)
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        color: "#111827",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          background: "#111827",
          color: "white",
          padding: "18px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <a
            href="/"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "24px",
              fontWeight: 800,
            }}
          >
            GoGoalMatch
          </a>

          <a
            href="/"
            style={{
              color: "white",
              textDecoration: "none",
            }}
          >
            ← Home
          </a>
        </div>
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
            borderRadius: "14px",
            padding: "24px",
          }}
        >
          <h1 style={{ marginTop: 0 }}>
            Today's Matches
          </h1>

          {loading && <p>Loading matches...</p>}

          {!loading && upcoming.length === 0 && (
            <p style={{ color: "#6b7280" }}>
              No upcoming matches today.
            </p>
          )}

          {upcoming.map((match) => (
            <a
              key={match.fixture.id}
              href={`/matches/${match.fixture.id}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "20px",
                alignItems: "center",
                padding: "18px 0",
                borderTop: "1px solid #e5e7eb",
                textDecoration: "none",
                color: "#111827",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginBottom: "10px",
                  }}
                >
                  {match.league.country} ·{" "}
                  {match.league.name}
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

                  <strong>
                    {match.teams.home.name}
                  </strong>
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

                  <strong>
                    {match.teams.away.name}
                  </strong>
                </div>
              </div>

              <div
                style={{
                  textAlign: "center",
                  minWidth: "80px",
                }}
              >
                <strong
                  style={{
                    fontSize: "16px",
                  }}
                >
                  {new Date(
                    match.fixture.date
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>

                <div
                  style={{
                    color: "#6b7280",
                    fontSize: "12px",
                    marginTop: "5px",
                  }}
                >
                  {match.fixture.status.long}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
