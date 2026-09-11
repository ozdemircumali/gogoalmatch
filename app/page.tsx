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

const LIVE_STATUSES = ["1H", "2H", "HT", "ET", "BT", "P"];
const FINISHED_STATUSES = ["FT", "AET", "PEN"];

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMatches() {
    try {
      const response = await fetch("/api/fixtures", {
        cache: "no-store",
      });

      const data = await response.json();

      if (Array.isArray(data.response)) {
        setMatches(data.response);
      } else {
        setMatches([]);
      }
    } catch (error) {
      console.error("Failed to load matches:", error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches();

    const interval = setInterval(loadMatches, 30000);

    return () => clearInterval(interval);
  }, []);

  const liveMatches = matches.filter((match) =>
    LIVE_STATUSES.includes(match.fixture.status.short)
  );

  const finishedMatches = matches.filter((match) =>
    FINISHED_STATUSES.includes(match.fixture.status.short)
  );

  const upcomingMatches = matches.filter(
    (match) =>
      !LIVE_STATUSES.includes(match.fixture.status.short) &&
      !FINISHED_STATUSES.includes(match.fixture.status.short)
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #060a13 0%, #0a0f1c 40%, #0b1120 100%)",
        color: "#e5e7eb",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(8, 12, 22, 0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(34, 197, 94, 0.15)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "18px",
                color: "#04170c",
                boxShadow: "0 0 18px rgba(34, 197, 94, 0.35)",
                flexShrink: 0,
              }}
            >
              G
            </div>

            <div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                GoGoal
                <span style={{ color: "#22c55e" }}>Match</span>
              </div>

              <div
                style={{
                  color: "#64748b",
                  fontSize: "11px",
                  marginTop: "4px",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Live Football Scores
              </div>
            </div>
          </div>

          <nav
            style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <a href="/" className="ggm-nav-link ggm-nav-link-active">
              <span className="ggm-live-dot" />
              LIVE
            </a>

            <a href="/matches" className="ggm-nav-link">
              Matches
            </a>

            <a href="/results" className="ggm-nav-link">
              Results
            </a>

            <a href="/standings" className="ggm-nav-link">
              Standings
            </a>

            <a href="/stats" className="ggm-nav-link">
              Stats
            </a>
          </nav>
        </div>
      </header>

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "28px 20px 60px",
        }}
      >
        {loading ? (
          <div
            style={{
              background: "#0f1626",
              border: "1px solid #1e293b",
              padding: "60px 20px",
              borderRadius: "16px",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Loading matches...
          </div>
        ) : (
          <>
            <MatchSection
              title="LIVE MATCHES"
              subtitle="Matches currently being played"
              matches={liveMatches}
              type="live"
              emptyText="There are no live matches right now."
            />

            <MatchSection
              title="TODAY'S MATCHES"
              subtitle="Upcoming matches today"
              matches={upcomingMatches}
              type="upcoming"
              emptyText="There are no upcoming matches."
            />

            <MatchSection
              title="RESULTS"
              subtitle="Finished matches today"
              matches={finishedMatches}
              type="finished"
              emptyText="There are no finished matches yet."
            />
          </>
        )}
      </section>

      <footer
        style={{
          borderTop: "1px solid #1e293b",
          padding: "28px 20px",
          textAlign: "center",
          color: "#475569",
          fontSize: "12px",
        }}
      >
        © {new Date().getFullYear()} GoGoalMatch — All match data provided
        for informational purposes.
      </footer>

      <style jsx global>{`
        .ggm-nav-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #94a3b8;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.02em;
          padding: 8px 14px;
          border-radius: 20px;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .ggm-nav-link:hover {
          color: #e5e7eb;
          background: rgba(148, 163, 184, 0.08);
        }

        .ggm-nav-link-active {
          color: #22c55e;
          background: rgba(34, 197, 94, 0.12);
        }

        .ggm-nav-link-active:hover {
          color: #22c55e;
          background: rgba(34, 197, 94, 0.18);
        }

        .ggm-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          display: inline-block;
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6);
          animation: ggm-pulse 1.6s infinite;
        }

        @keyframes ggm-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.55);
          }

          70% {
            box-shadow: 0 0 0 7px rgba(34, 197, 94, 0);
          }

          100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
        }

        .ggm-card {
          transition:
            transform 0.15s ease,
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }

        .ggm-card:hover {
          transform: translateY(-2px);
          border-color: rgba(34, 197, 94, 0.4) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        }

        .ggm-league-header {
          transition: background 0.15s ease;
        }

        .ggm-league-header:hover {
          background: rgba(34, 197, 94, 0.06) !important;
        }

        @media (max-width: 640px) {
          .ggm-team-name {
            font-size: 12px !important;
          }

          .ggm-team-logo {
            width: 26px !important;
            height: 26px !important;
          }

          .ggm-score {
            font-size: 18px !important;
          }
        }
      `}</style>
    </main>
  );
}

function MatchSection({
  title,
  subtitle,
  matches,
  type,
  emptyText,
}: {
  title: string;
  subtitle: string;
  matches: Match[];
  type: "live" | "upcoming" | "finished";
  emptyText: string;
}) {
  const groupedMatches = matches.reduce<Record<string, Match[]>>(
    (groups, match) => {
      const leagueKey = `${match.league.country}||${match.league.name}`;

      if (!groups[leagueKey]) {
        groups[leagueKey] = [];
      }

      groups[leagueKey].push(match);

      return groups;
    },
    {}
  );

  const leagues = Object.entries(groupedMatches);

  return (
    <section style={{ marginBottom: "42px" }}>
      <div
        style={{
          marginBottom: "18px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: "4px",
            height: "36px",
            borderRadius: "4px",
            background:
              type === "live"
                ? "#ef4444"
                : type === "upcoming"
                  ? "#22c55e"
                  : "#64748b",
            flexShrink: 0,
          }}
        />

        <div style={{ flex: 1 }}>
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 800,
              letterSpacing: "0.02em",
              color: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {type === "live" && <span className="ggm-live-dot" />}
            {title}
          </h2>

          <div
            style={{
              marginTop: "3px",
              color: "#64748b",
              fontSize: "12px",
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            background: "#0f1626",
            border: "1px solid #1e293b",
            color: "#94a3b8",
            fontSize: "11px",
            fontWeight: 700,
            padding: "4px 12px",
            borderRadius: "20px",
          }}
        >
          {matches.length} {matches.length === 1 ? "match" : "matches"}
        </div>
      </div>

      {matches.length === 0 ? (
        <div
          style={{
            background: "#0f1626",
            borderRadius: "14px",
            padding: "24px",
            color: "#64748b",
            fontSize: "13px",
            border: "1px solid #1e293b",
          }}
        >
          {emptyText}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {leagues.map(([leagueKey, leagueMatches]) => {
            const firstMatch = leagueMatches[0];

            return (
              <div key={leagueKey}>
                <div
                  className="ggm-league-header"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "#0b1220",
                    border: "1px solid #1e293b",
                    borderBottom: "none",
                    borderRadius: "12px 12px 0 0",
                    padding: "10px 14px",
                  }}
                >
                  {firstMatch.league.logo && (
                    <img
                      src={firstMatch.league.logo}
                      alt=""
                      width="22"
                      height="22"
                      style={{ objectFit: "contain", flexShrink: 0 }}
                    />
                  )}

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        color: "#f1f5f9",
                        fontSize: "13px",
                        fontWeight: 800,
                      }}
                    >
                      {firstMatch.league.name}
                    </div>

                    <div
                      style={{
                        color: "#64748b",
                        fontSize: "10px",
                        marginTop: "2px",
                      }}
                    >
                      {firstMatch.league.country}
                    </div>
                  </div>

                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "10px",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {leagueMatches.length}{" "}
                    {leagueMatches.length === 1 ? "match" : "matches"}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "10px",
                    padding: "10px",
                    background: "rgba(15, 22, 38, 0.55)",
                    border: "1px solid #1e293b",
                    borderRadius: "0 0 12px 12px",
                  }}
                >
                  {leagueMatches.map((match) => (
                    <MatchCard
                      key={match.fixture.id}
                      match={match}
                      type={type}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MatchCard({
  match,
  type,
}: {
  match: Match;
  type: "live" | "upcoming" | "finished";
}) {
  const statusText =
    type === "live"
      ? match.fixture.status.elapsed != null
        ? `${match.fixture.status.elapsed}'`
        : match.fixture.status.short
      : type === "finished"
        ? "FT"
        : match.fixture.status.short;

  return (
    <a
      href={`/matches/${match.fixture.id}`}
      className="ggm-card"
      style={{
        display: "block",
        background: "#0f1626",
        color: "#e5e7eb",
        textDecoration: "none",
        borderRadius: "12px",
        border: "1px solid #1e293b",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          padding: "8px 12px",
          borderBottom: "1px solid #1e293b",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            color: "#64748b",
            fontWeight: 600,
            flex: 1,
          }}
        >
          Match Center
        </div>

        {type === "live" && (
          <span
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              color: "#f87171",
              padding: "3px 8px",
              borderRadius: "20px",
              fontSize: "9px",
              fontWeight: 800,
              letterSpacing: "0.04em",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "#ef4444",
              }}
            />
            LIVE
          </span>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 74px 1fr",
          alignItems: "center",
          padding: "14px 12px",
          gap: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "8px",
            textAlign: "right",
            minWidth: 0,
          }}
        >
          <strong
            className="ggm-team-name"
            style={{
              fontSize: "13px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {match.teams.home.name}
          </strong>

          <img
            src={match.teams.home.logo}
            alt=""
            width="30"
            height="30"
            className="ggm-team-logo"
            style={{ objectFit: "contain", flexShrink: 0 }}
          />
        </div>

        <div style={{ textAlign: "center" }}>
          <div
            className="ggm-score"
            style={{
              fontSize: "20px",
              fontWeight: 900,
              color: type === "upcoming" ? "#64748b" : "#f8fafc",
              letterSpacing: "-0.02em",
            }}
          >
            {type === "upcoming"
              ? "vs"
              : `${match.goals.home ?? 0} - ${match.goals.away ?? 0}`}
          </div>

          <div
            style={{
              marginTop: "4px",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.03em",
              color:
                type === "live"
                  ? "#ef4444"
                  : type === "finished"
                    ? "#64748b"
                    : "#22c55e",
            }}
          >
            {statusText}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: 0,
          }}
        >
          <img
            src={match.teams.away.logo}
            alt=""
            width="30"
            height="30"
            className="ggm-team-logo"
            style={{ objectFit: "contain", flexShrink: 0 }}
          />

          <strong
            className="ggm-team-name"
            style={{
              fontSize: "13px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {match.teams.away.name}
          </strong>
        </div>
      </div>
    </a>
  );
}
