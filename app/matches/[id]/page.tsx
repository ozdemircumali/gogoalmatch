interface MatchPageProps {
  params: {
    id: string;
  };
}

async function getMatchData(id: string) {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?id=${id}`,
      {
        headers: {
          "x-apisports-key": apiKey,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    if (!data.response || data.response.length === 0) {
      return null;
    }

    return data.response[0];
  } catch {
    return null;
  }
}

export default async function MatchDetailPage({
  params,
}: MatchPageProps) {
  const match = await getMatchData(params.id);

  if (!match) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "16px",
            textAlign: "center",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <h1
            style={{
              margin: "0 0 10px",
              fontSize: "24px",
            }}
          >
            Match Not Found
          </h1>

          <p
            style={{
              color: "#6b7280",
              marginBottom: "20px",
            }}
          >
            We couldn't load the match information.
          </p>

          <a
            href="/"
            style={{
              display: "inline-block",
              background: "#111827",
              color: "white",
              padding: "10px 18px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Back to Live Matches
          </a>
        </div>
      </main>
    );
  }

  const { fixture, teams, goals, league } = match;

  const isLive =
    fixture.status.short === "1H" ||
    fixture.status.short === "2H" ||
    fixture.status.short === "HT" ||
    fixture.status.short === "ET" ||
    fixture.status.short === "P";

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
            maxWidth: "1000px",
            margin: "0 auto",
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <a
            href="/"
            style={{
              color: "white",
              textDecoration: "none",
              fontWeight: 800,
              fontSize: "22px",
            }}
          >
            GoGoalMatch
          </a>

          <a
            href="/"
            style={{
              color: "#d1d5db",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            ← Live Matches
          </a>
        </div>
      </header>

      <section
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "25px 20px 50px",
        }}
      >
        {/* LEAGUE */}
        <div
          style={{
            background: "white",
            borderRadius: "14px 14px 0 0",
            padding: "18px 20px",
            borderBottom: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "17px",
              fontWeight: 800,
            }}
          >
            {league?.name}
          </div>

          <div
            style={{
              color: "#6b7280",
              fontSize: "13px",
              marginTop: "5px",
            }}
          >
            {league?.country}
            {fixture.venue?.name
              ? ` · ${fixture.venue.name}`
              : ""}
          </div>
        </div>

        {/* SCOREBOARD */}
        <div
          style={{
            background: "#111827",
            color: "white",
            padding: "35px 20px",
            borderRadius: "0 0 14px 14px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              gap: "20px",
            }}
          >
            {/* HOME */}
            <div
              style={{
                textAlign: "center",
              }}
            >
              <img
                src={teams.home.logo}
                alt={teams.home.name}
                width="75"
                height="75"
                style={{
                  objectFit: "contain",
                  marginBottom: "12px",
                }}
              />

              <div
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                }}
              >
                {teams.home.name}
              </div>
            </div>

            {/* SCORE */}
            <div
              style={{
                textAlign: "center",
                minWidth: "110px",
              }}
            >
              <div
                style={{
                  fontSize: "42px",
                  fontWeight: 900,
                  letterSpacing: "2px",
                }}
              >
                {goals.home ?? 0} - {goals.away ?? 0}
              </div>

              <div
                style={{
                  display: "inline-block",
                  marginTop: "10px",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  background: isLive ? "#dc2626" : "#374151",
                  fontSize: "12px",
                  fontWeight: 800,
                }}
              >
                {fixture.status.elapsed != null
                  ? `${fixture.status.elapsed}'`
                  : fixture.status.long}
              </div>
            </div>

            {/* AWAY */}
            <div
              style={{
                textAlign: "center",
              }}
            >
              <img
                src={teams.away.logo}
                alt={teams.away.name}
                width="75"
                height="75"
                style={{
                  objectFit: "contain",
                  marginBottom: "12px",
                }}
              />

              <div
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                }}
              >
                {teams.away.name}
              </div>
            </div>
          </div>
        </div>

        {/* MATCH INFO */}
        <div
          style={{
            marginTop: "18px",
            background: "white",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              margin: "0 0 18px",
              fontSize: "18px",
            }}
          >
            Match Information
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "15px",
            }}
          >
            <Info
              label="Status"
              value={fixture.status.long}
            />

            <Info
              label="League"
              value={league?.name || "-"}
            />

            <Info
              label="Country"
              value={league?.country || "-"}
            />

            <Info
              label="Venue"
              value={fixture.venue?.name || "-"}
            />
          </div>
        </div>

        {/* NEXT FEATURES */}
        <div
          style={{
            marginTop: "18px",
            background: "white",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              margin: "0 0 15px",
              fontSize: "18px",
            }}
          >
            Match Details
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "10px",
            }}
          >
            <Feature title="Statistics" />
            <Feature title="Lineups" />
            <Feature title="Events" />
            <Feature title="Head to Head" />
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#f9fafb",
        borderRadius: "10px",
        padding: "14px",
      }}
    >
      <div
        style={{
          color: "#6b7280",
          fontSize: "11px",
          marginBottom: "5px",
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "14px",
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Feature({ title }: { title: string }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "15px",
        textAlign: "center",
        color: "#374151",
        fontWeight: 700,
        fontSize: "13px",
      }}
    >
      {title}
    </div>
  );
}
