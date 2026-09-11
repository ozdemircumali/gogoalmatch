"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Match = {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
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

type Standing = {
  rank: number;
  team: {
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  form: string;
};

const LIVE = ["1H", "2H", "HT", "ET", "BT", "P"];
const FINISHED = ["FT", "AET", "PEN"];

export default function SectionPage() {
  const params = useParams();
  const section = params.section as string;

  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        if (section === "results") {
          const res = await fetch("/api/fixtures", {
            cache: "no-store",
          });

          const data = await res.json();

          if (data.response) {
            setMatches(data.response);
          }
        }

        if (section === "standings") {
          const res = await fetch(
            "https://v3.football.api-sports.io/standings?league=39&season=2026"
          );

          const data = await res.json();

          if (data.response?.[0]?.league?.standings?.[0]) {
            setStandings(data.response[0].league.standings[0]);
          }
        }

        if (section === "stats") {
          const res = await fetch(
            "https://v3.football.api-sports.io/players/topscorers?league=39&season=2026"
          );

          const data = await res.json();

          if (data.response) {
            console.log("Top scorers:", data.response);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [section]);

  const title =
    section === "results"
      ? "Results"
      : section === "standings"
      ? "Standings"
      : section === "stats"
      ? "Statistics"
      : "GoGoalMatch";

  const finishedMatches = matches.filter((match) =>
    FINISHED.includes(match.fixture.status.short)
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
          <h1 style={{ marginTop: 0 }}>{title}</h1>

          {loading && <p>Loading...</p>}

          {!loading && section === "results" && (
            <>
              {finishedMatches.length === 0 ? (
                <p style={{ color: "#6b7280" }}>
                  No finished matches today.
                </p>
              ) : (
                finishedMatches.map((match) => (
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
                        textAlign: "center",
                        minWidth: "70px",
                        fontSize: "20px",
                        fontWeight: 800,
                      }}
                    >
                      {match.goals.home} - {match.goals.away}
                    </div>
                  </a>
                ))
              )}
            </>
          )}

          {!loading && section === "standings" && (
            <>
              <h2>Premier League</h2>

              {standings.length === 0 ? (
                <p style={{ color: "#6b7280" }}>
                  Standings are currently unavailable.
                </p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          textAlign: "left",
                          borderBottom: "2px solid #e5e7eb",
                        }}
                      >
                        <th style={{ padding: "12px 8px" }}>#</th>
                        <th style={{ padding: "12px 8px" }}>Team</th>
                        <th style={{ padding: "12px 8px" }}>Pts</th>
                        <th style={{ padding: "12px 8px" }}>GD</th>
                        <th style={{ padding: "12px 8px" }}>Form</th>
                      </tr>
                    </thead>

                    <tbody>
                      {standings.map((team) => (
                        <tr
                          key={team.rank}
                          style={{
                            borderBottom: "1px solid #e5e7eb",
                          }}
                        >
                          <td style={{ padding: "12px 8px" }}>
                            {team.rank}
                          </td>

                          <td
                            style={{
                              padding: "12px 8px",
                              fontWeight: 700,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <img
                                src={team.team.logo}
                                alt=""
                                width="28"
                                height="28"
                              />
                              {team.team.name}
                            </div>
                          </td>

                          <td
                            style={{
                              padding: "12px 8px",
                              fontWeight: 800,
                            }}
                          >
                            {team.points}
                          </td>

                          <td style={{ padding: "12px 8px" }}>
                            {team.goalsDiff}
                          </td>

                          <td style={{ padding: "12px 8px" }}>
                            {team.form || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {!loading && section === "stats" && (
            <div>
              <h2>Football Statistics</h2>

              <p style={{ color: "#6b7280" }}>
                Top scorers and detailed player statistics will appear here.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                  marginTop: "20px",
                }}
              >
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <h3>Top Scorers</h3>
                  <p>Premier League</p>
                </div>

                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <h3>Top Assists</h3>
                  <p>Player statistics</p>
                </div>

                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <h3>Cards</h3>
                  <p>Yellow and red cards</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
