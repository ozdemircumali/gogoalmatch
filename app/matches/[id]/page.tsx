interface MatchPageProps {
  params: {
    id: string;
  };
}

async function getMatchData(id: string) {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) return null;

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

    if (!res.ok) return null;

    const data = await res.json();

    if (!data.response || data.response.length === 0) return null;

    return data.response[0];
  } catch {
    return null;
  }
}

async function getMatchEvents(id: string) {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) return [];

  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures/events?fixture=${id}`,
      {
        headers: {
          "x-apisports-key": apiKey,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) return [];

    const data = await res.json();

    return data.response || [];
  } catch {
    return [];
  }
}

async function getMatchStatistics(id: string) {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) return [];

  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures/statistics?fixture=${id}`,
      {
        headers: {
          "x-apisports-key": apiKey,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) return [];

    const data = await res.json();

    return data.response || [];
  } catch {
    return [];
  }
}

export default async function MatchDetailPage({
  params,
}: MatchPageProps) {
  const match = await getMatchData(params.id);
  const events = await getMatchEvents(params.id);
  const statistics = await getMatchStatistics(params.id);

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
          }}
        >
          <h1>Match Not Found</h1>
          <p style={{ color: "#6b7280" }}>
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
            Back to Matches
          </a>
        </div>
      </main>
    );
  }

  const { fixture, teams, goals, league } = match;

  const isLive = [
    "1H",
    "2H",
    "HT",
    "ET",
    "BT",
    "P",
  ].includes(fixture.status.short);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        color: "#111827",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
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
            justifyContent: "space-between",
            alignItems: "center",
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
            }}
          >
            ← Matches
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
        <div
          style={{
            background: "white",
            borderRadius: "14px 14px 0 0",
            padding: "18px 20px",
            textAlign: "center",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div style={{ fontSize: "17px", fontWeight: 800 }}>
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
            <div style={{ textAlign: "center" }}>
              <img
                src={teams.home.logo}
                alt={teams.home.name}
                width="75"
                height="75"
                style={{ objectFit: "contain" }}
              />

              <div
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                  marginTop: "10px",
                }}
              >
                {teams.home.name}
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "42px",
                  fontWeight: 900,
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

            <div style={{ textAlign: "center" }}>
              <img
                src={teams.away.logo}
                alt={teams.away.name}
                width="75"
                height="75"
                style={{ objectFit: "contain" }}
              />

              <div
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                  marginTop: "10px",
                }}
              >
                {teams.away.name}
              </div>
            </div>
          </div>
        </div>

        {/* EVENTS */}

        <div
          style={{
            marginTop: "18px",
            background: "white",
            borderRadius: "14px",
            padding: "20px",
          }}
        >
          <h2 style={{ margin: "0 0 20px" }}>
            Match Events
          </h2>

          {events.length === 0 ? (
            <p style={{ color: "#6b7280" }}>
              No events available
            </p>
          ) : (
            events.map((event: any, index: number) => {
              const isHome =
                event.team?.id === teams.home.id;

              return (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 70px 1fr",
                    alignItems: "center",
                    padding: "14px 0",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <div style={{ textAlign: "right" }}>
                    {isHome && (
                      <strong>
                        {event.player?.name || "-"}
                      </strong>
                    )}
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                      }}
                    >
                      {event.time?.elapsed}'
                    </div>

                    <div style={{ fontSize: "20px" }}>
                      {getEventIcon(
                        event.type,
                        event.detail
                      )}
                    </div>
                  </div>

                  <div>
                    {!isHome && (
                      <strong>
                        {event.player?.name || "-"}
                      </strong>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* STATISTICS */}

        <div
          style={{
            marginTop: "18px",
            background: "white",
            borderRadius: "14px",
            padding: "20px",
          }}
        >
          <h2 style={{ margin: "0 0 20px" }}>
            Statistics
          </h2>

          {statistics.length === 0 ? (
            <p style={{ color: "#6b7280" }}>
              No statistics available
            </p>
          ) : (
            statistics.map((teamStats: any, index: number) => (
              <div
                key={index}
                style={{
                  marginBottom: "25px",
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    marginBottom: "12px",
                  }}
                >
                  {teamStats.team?.name}
                </div>

                {teamStats.statistics?.map(
                  (stat: any, statIndex: number) => (
                    <div
                      key={statIndex}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "9px 0",
                        borderBottom:
                          "1px solid #e5e7eb",
                      }}
                    >
                      <span
                        style={{
                          color: "#374151",
                          fontSize: "14px",
                        }}
                      >
                        {stat.type}
                      </span>

                      <strong>
                        {stat.value ?? "-"}
                      </strong>
                    </div>
                  )
                )}
              </div>
            ))
          )}
        </div>

        {/* MATCH INFORMATION */}

        <div
          style={{
            marginTop: "18px",
            background: "white",
            borderRadius: "14px",
            padding: "20px",
          }}
        >
          <h2 style={{ margin: "0 0 18px" }}>
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

        {/* NEXT */}

        <div
          style={{
            marginTop: "18px",
            background: "white",
            borderRadius: "14px",
            padding: "20px",
          }}
        >
          <h2 style={{ margin: "0 0 15px" }}>
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
            <Feature title="Lineups" />
            <Feature title="Head to Head" />
          </div>
        </div>
      </section>
    </main>
  );
}

function getEventIcon(type: string, detail: string) {
  if (type === "Goal") return "⚽";
  if (type === "Card" && detail === "Yellow Card") return "🟨";
  if (type === "Card" && detail === "Red Card") return "🟥";
  if (type === "subst") return "🔄";
  if (type === "Var") return "VAR";

  return "•";
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
