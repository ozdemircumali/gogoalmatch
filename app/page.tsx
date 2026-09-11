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

const LIVE_STATUSES = [
  "1H",
  "2H",
  "HT",
  "ET",
  "BT",
  "P",
];

const FINISHED_STATUSES = [
  "FT",
  "AET",
  "PEN",
];

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
        background: "#f3f4f6",
        color: "#111827",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#111827",
          color: "white",
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

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "28px 20px 50px",
        }}
      >
        {loading ? (
          <div
            style={{
              background: "white",
              padding: "50px",
              borderRadius: "14px",
              textAlign: "center",
            }}
          >
            Loading matches...
          </div>
        ) : (
          <>
            {/* LIVE */}
            <MatchSection
              title="LIVE MATCHES"
              subtitle="Matches currently being played"
              matches={liveMatches}
              type="live"
              emptyText="There are no live matches right now."
            />

            {/* UPCOMING */}
            <MatchSection
              title="TODAY'S MATCHES"
              subtitle="Upcoming matches today"
              matches={upcomingMatches}
              type="upcoming"
              emptyText="There are no upcoming matches."
            />

            {/* RESULTS */}
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
          background: "white",
          borderTop: "1px solid #e5e7eb",
          padding: "25px 20px",
          textAlign: "center",
          color: "#6b7280",
          fontSize: "12px",
        }}
      >
        © {new Date().getFullYear()} GoGoalMatch
      </footer>
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
  return (
    <section style={{ marginBottom: "35px" }}>
      <div
        style={{
          marginBottom: "14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {type === "live" && (
          <span
            style={{
              width: "10px",
              height: "10px",
              background: "#ef4444",
              borderRadius: "50%",
              display: "inline-block",
            }}
          />
        )}

        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: 800,
            }}
          >
            {title}
          </h2>

          <div
            style={{
              marginTop: "3px",
              color: "#6b7280",
              fontSize: "12px",
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>

      {matches.length === 0 ? (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "22px",
            color: "#6b7280",
            fontSize: "14px",
            border: "1px solid #e5e7eb",
          }}
        >
          {emptyText}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {matches.map((match) => (
            <MatchCard
              key={match.fixture.id}
              match={match}
              type={type}
            />
          ))}
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
      style={{
        display: "block",
        background: "white",
        color: "#111827",
        textDecoration: "none",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
      }}
    >
      {/* LEAGUE */}
      <div
        style={{
          background: "#f9fafb",
          padding: "10px 15px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {match.league.logo && (
          <img
            src={match.league.logo}
            alt=""
            width="22"
            height="22"
            style={{ objectFit: "contain" }}
          />
        )}

        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
            }}
          >
            {match.league.name}
          </div>

          <div
            style={{
              fontSize: "10px",
              color: "#6b7280",
            }}
          >
            {match.league.country}
          </div>
        </div>

        {type === "live" && (
          <span
            style={{
              marginLeft: "auto",
              background: "#fee2e2",
              color: "#dc2626",
              padding: "4px 8px",
              borderRadius: "20px",
              fontSize: "10px",
              fontWeight: 800,
            }}
          >
            LIVE
          </span>
        )}
      </div>

      {/* TEAMS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 80px 1fr",
          alignItems: "center",
          padding: "17px 15px",
          gap: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "9px",
            textAlign: "right",
          }}
        >
          <strong style={{ fontSize: "14px" }}>
            {match.teams.home.name}
          </strong>

          <img
            src={match.teams.home.logo}
            alt=""
            width="34"
            height="34"
            style={{ objectFit: "contain" }}
          />
        </div>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "21px",
              fontWeight: 900,
            }}
          >
            {type === "upcoming"
              ? "vs"
              : `${match.goals.home ?? 0} - ${
                  match.goals.away ?? 0
                }`}
          </div>

          <div
            style={{
              marginTop: "4px",
              fontSize: "11px",
              fontWeight: 700,
              color:
                type === "live"
                  ? "#dc2626"
                  : "#6b7280",
            }}
          >
            {statusText}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
          }}
        >
          <img
            src={match.teams.away.logo}
            alt=""
            width="34"
            height="34"
            style={{ objectFit: "contain" }}
          />

          <strong style={{ fontSize: "14px" }}>
            {match.teams.away.name}
          </strong>
        </div>
      </div>
    </a>
  );
}
