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

type PlayerStat = {
  player: {
    name: string;
    photo: string;
  };
  statistics: {
    goals: {
      total: number | null;
      assists: number | null;
    };
  }[];
};

const FINISHED = ["FT", "AET", "PEN"];

export default function SectionPage() {
  const params = useParams();
  const section = params.section as string;

  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [players, setPlayers] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        if (section === "results") {
          const res = await fetch("/api/fixtures", {
            cache: "no-store",
          });

          if (!res.ok) {
            throw new Error("Failed to load results");
          }

          const data = await res.json();

          if (data.response) {
            setMatches(data.response);
          }
        }

        if (section === "standings") {
          const res = await fetch("/api/standings", {
            cache: "no-store",
          });

          if (!res.ok) {
            throw new Error("Failed to load standings");
          }

          const data = await res.json();

          if (data.response?.[0]?.league?.standings?.[0]) {
            setStandings(data.response[0].league.standings[0]);
          }
        }

        if (section === "stats") {
          const res = await fetch("/api/stats", {
            cache: "no-store",
          });

          if (!res.ok) {
            throw new Error("Failed to load statistics");
          }

          const data = await res.json();

          if (data.response) {
            setPlayers(data.response);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load data.");
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

          {!loading && error && (
            <p style={{ color: "#dc2626" }}>{error}</p>
          )}

          {!loading && !error && section === "results" && (
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

          {!loading && !error && section === "standings" && (
            <>
              <h2>Premier League</h2>

              {standings.length === 0 ? (
                <p style={{ color: "#6b7280" }}>
                  No standings available.
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

          {!loading && !error && section === "stats" && (
            <>
              <h2>Premier League Statistics</h2>

              {players.length === 0 ? (
                <p style={{ color: "#6b7280" }}>
                  No player statistics available.
                </p>
              ) : (
                <div>
                  {players.slice(0, 20).map((item, index) => {
                    const stats = item.statistics?.[0];
                    const goals = stats?.goals?.total ?? 0;
                    const assists = stats?.goals?.assists ?? 0;

                    return (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "15px",
                          padding: "14px 0",
                          borderTop: "1px solid #e5e7eb",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          {item.player.photo && (
                            <img
                              src={item.player.photo}
                              alt=""
                              width="40"
                              height="40"
                              style={{
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                          )}

                          <strong>{item.player.name}</strong>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "20px",
                            fontSize: "14px",
                          }}
                        >
                          <span>Goals: {goals}</span>
                          <span>Assists: {assists}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
