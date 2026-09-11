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
        background: "#f3f4f6",
        color: "#111827",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#111827",
          color: "white",
          borderBottom: "1px solid #1f2937",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "18px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "26px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              GoGoalMatch
            </div>

            <div
              style={{
                color: "#9ca3af",
                fontSize: "12px",
                marginTop: "3px",
              }}
            >
              Live Football Scores
            </div>
          </div>

          <nav
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="/"
              style={{
                color: "#22c55e",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              LIVE
            </a>

            <a
              href="/matches"
              style={{
                color: "#d1d5db",
                textDecoration: "none",
              }}
            >
              Matches
            </a>

            <a
              href="/results"
              style={{
                color: "#d1d5db",
                textDecoration: "none",
              }}
            >
              Results
            </a>

            <a
              href="/standings"
              style={{
                color: "#d1d5db",
                textDecoration: "none",
              }}
            >
              Standings
            </a>

            <a
              href="/stats"
              style={{
                color: "#d1d5db",
                textDecoration: "none",
              }}
            >
              Stats
            </a>
          </nav>
        </div>
      </header>

      {/* PAGE */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "28px 20px 50px",
        }}
      >
        {/* TITLE */}
        <div
          style={{
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#ef4444",
                display: "inline-block",
              }}
            />

            <h1
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: 800,
              }}
            >
              Live Matches
            </h1>
          </div>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Live football scores and match updates
          </p>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              padding: "50px 20px",
              textAlign: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              Loading matches...
            </div>

            <div
              style={{
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Please wait
            </div>
          </div>
        ) : matches.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              padding: "55px 20px",
              textAlign: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                fontWeight: 800,
                marginBottom: "8px",
              }}
            >
              No Live Matches
            </div>

            <div
              style={{
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              There are no live football matches right now.
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {matches.map((match) => (
              <a
                key={match.fixture.id}
                href={`/matches/${match.fixture.id}`}
                style={{
                  display: "block",
                  background: "white",
                  borderRadius: "14px",
                  padding: "0",
                  textDecoration: "none",
                  color: "#111827",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                }}
              >
                {/* LEAGUE */}
                <div
                  style={{
                    padding: "12px 16px",
                    background: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  {match.league.logo && (
                    <img
                      src={match.league.logo}
                      alt=""
                      width="24"
                      height="24"
                      style={{
                        objectFit: "contain",
                      }}
                    />
                  )}

                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 800,
                      }}
                    >
                      {match.league.name}
                    </div>

                    <div
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        marginTop: "2px",
                      }}
                    >
                      {match.league.country}
                    </div>
                  </div>

                  <div
                    style={{
                      marginLeft: "auto",
                      background: "#fee2e2",
                      color: "#dc2626",
                      borderRadius: "20px",
                      padding: "5px 9px",
                      fontSize: "11px",
                      fontWeight: 800,
                    }}
                  >
                    LIVE
                  </div>
                </div>

                {/* MATCH */}
                <div
                  style={{
                    padding: "18px 16px",
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    alignItems: "center",
                    gap: "15px",
                  }}
                >
                  {/* HOME */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      justifyContent: "flex-end",
                      textAlign: "right",
                    }}
                  >
                    <strong
                      style={{
                        fontSize: "15px",
                      }}
                    >
                      {match.teams.home.name}
                    </strong>

                    <img
                      src={match.teams.home.logo}
                      alt=""
                      width="38"
                      height="38"
                      style={{
                        objectFit: "contain",
                      }}
                    />
                  </div>

                  {/* SCORE */}
                  <div
                    style={{
                      minWidth: "75px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "25px",
                        fontWeight: 900,
                        letterSpacing: "1px",
                      }}
                    >
                      {match.goals.home ?? 0}
                      {" - "}
                      {match.goals.away ?? 0}
                    </div>

                    <div
                      style={{
                        marginTop: "5px",
                        color: "#dc2626",
                        fontSize: "13px",
                        fontWeight: 800,
                      }}
                    >
                      {match.fixture.status.elapsed != null
                        ? `${match.fixture.status.elapsed}'`
                        : match.fixture.status.short}
                    </div>
                  </div>

                  {/* AWAY */}
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
                      width="38"
                      height="38"
                      style={{
                        objectFit: "contain",
                      }}
                    />

                    <strong
                      style={{
                        fontSize: "15px",
                      }}
                    >
                      {match.teams.away.name}
                    </strong>
                  </div>
                </div>

                {/* FOOTER */}
                <div
                  style={{
                    borderTop: "1px solid #f0f0f0",
                    padding: "9px 16px",
                    textAlign: "center",
                    color: "#6b7280",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  Click for match details
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid #e5e7eb",
          background: "white",
          padding: "25px 20px",
          textAlign: "center",
          color: "#6b7280",
          fontSize: "12px",
        }}
      >
        © {new Date().getFullYear()} GoGoalMatch. Live Football Scores.
      </footer>
    </main>
  );
}
