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
        background:
          "radial-gradient(circle at top, #20252b 0%, #0d0f11 45%, #070809 100%)",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(8, 10, 11, 0.96)",
          borderBottom: "1px solid #2a2e32",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <a
            href="/"
            style={{
              color: "#ffffff",
              textDecoration: "none",
              fontSize: "25px",
              fontWeight: 900,
              letterSpacing: "-0.7px",
            }}
          >
            GoGoalMatch
          </a>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {[
              ["Home", "/"],
              ["Live", "/"],
              ["Matches", "/matches"],
              ["Results", "/results"],
              ["Standings", "/standings"],
              ["Stats", "/stats"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                style={{
                  color: label === "Matches" ? "#ffffff" : "#9da3a8",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: label === "Matches" ? 800 : 600,
                  padding: "9px 11px",
                  borderRadius: "8px",
                  background:
                    label === "Matches"
                      ? "#252a2f"
                      : "transparent",
                }}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "28px 20px 60px",
        }}
      >
        <div
          style={{
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#8f979e",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              fontWeight: 800,
              marginBottom: "7px",
            }}
          >
            Football
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              lineHeight: 1.1,
              fontWeight: 900,
              letterSpacing: "-1px",
            }}
          >
            Today&apos;s Matches
          </h1>

          <p
            style={{
              margin: "9px 0 0",
              color: "#92999f",
              fontSize: "14px",
            }}
          >
            Upcoming football matches from around the world
          </p>
        </div>

        <div
          style={{
            background: "rgba(18, 21, 24, 0.96)",
            border: "1px solid #292e33",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #292e33",
              background: "#171a1d",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontWeight: 900,
                fontSize: "15px",
              }}
            >
              MATCHES
            </div>

            <div
              style={{
                color: "#858d94",
                fontSize: "12px",
              }}
            >
              {upcoming.length} upcoming
            </div>
          </div>

          {loading && (
            <div
              style={{
                padding: "45px 20px",
                textAlign: "center",
                color: "#92999f",
              }}
            >
              Loading matches...
            </div>
          )}

          {!loading && upcoming.length === 0 && (
            <div
              style={{
                padding: "50px 20px",
                textAlign: "center",
                color: "#858d94",
              }}
            >
              No upcoming matches today.
            </div>
          )}

          {!loading &&
            upcoming.map((match) => (
              <a
                key={match.fixture.id}
                href={`/matches/${match.fixture.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) 100px",
                  gap: "18px",
                  alignItems: "center",
                  padding: "18px 20px",
                  borderBottom: "1px solid #292e33",
                  textDecoration: "none",
                  color: "#ffffff",
                  transition: "background 0.15s ease",
                }}
              >
                <div
                  style={{
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "13px",
                      color: "#858d94",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    {match.league.logo && (
                      <img
                        src={match.league.logo}
                        alt=""
                        width="18"
                        height="18"
                        style={{
                          objectFit: "contain",
                        }}
                      />
                    )}

                    <span>
                      {match.league.country} · {match.league.name}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "11px",
                      marginBottom: "9px",
                    }}
                  >
                    <img
                      src={match.teams.home.logo}
                      alt=""
                      width="30"
                      height="30"
                      style={{
                        objectFit: "contain",
                        flexShrink: 0,
                      }}
                    />

                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 800,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {match.teams.home.name}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "11px",
                    }}
                  >
                    <img
                      src={match.teams.away.logo}
                      alt=""
                      width="30"
                      height="30"
                      style={{
                        objectFit: "contain",
                        flexShrink: 0,
                      }}
                    />

                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 800,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {match.teams.away.name}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    textAlign: "center",
                    borderLeft: "1px solid #292e33",
                    paddingLeft: "15px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 900,
                      marginBottom: "6px",
                    }}
                  >
                    {new Date(
                      match.fixture.date
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  <div
                    style={{
                      color: "#858d94",
                      fontSize: "10px",
                      fontWeight: 700,
                      lineHeight: 1.3,
                    }}
                  >
                    {match.fixture.status.long}
                  </div>
                </div>
              </a>
            ))}
        </div>
      </section>

      <style jsx>{`
        a:hover {
          background: #20252a !important;
        }

        @media (max-width: 700px) {
          header nav {
            display: none !important;
          }

          section {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          h1 {
            font-size: 27px !important;
          }
        }

        @media (max-width: 480px) {
          a {
            grid-template-columns: minmax(0, 1fr) 82px !important;
            gap: 10px !important;
            padding: 16px 13px !important;
          }

          a img {
            width: 26px !important;
            height: 26px !important;
          }
        }
      `}</style>
    </main>
  );
}
