"use client";

import { useEffect, useState } from "react";

type Props = {
  params: {
    id: string;
  };
};

export default function MatchDetails({ params }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatch() {
      try {
        const response = await fetch(`/api/fixture-details/${params.id}`, {
          cache: "no-store",
        });

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadMatch();
  }, [params.id]);

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <p>Loading match...</p>
        </div>
      </main>
    );
  }

  const match = data?.fixture;

  if (!match) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <h2>Match not found</h2>
        </div>
      </main>
    );
  }

  const home = match.teams.home;
  const away = match.teams.away;

  const events = data?.events || [];
  const statistics = data?.statistics || [];
  const lineups = data?.lineups || [];

  const homeStats =
    statistics.find((team: any) => team.team?.id === home.id)?.statistics || [];

  const awayStats =
    statistics.find((team: any) => team.team?.id === away.id)?.statistics || [];

  function getStat(stats: any[], type: string) {
    return stats.find((item: any) => item.type === type)?.value ?? "-";
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>

        <a href="/" style={styles.back}>
          ← Back to Live Matches
        </a>

        {/* SCORE */}
        <section style={styles.card}>
          <div style={styles.league}>
            {match.league.country} · {match.league.name}
          </div>

          <div style={styles.teams}>

            <div style={styles.team}>
              <img src={home.logo} width="70" height="70" alt="" />
              <h2>{home.name}</h2>
            </div>

            <div style={styles.scoreBox}>
              <div style={styles.score}>
                {match.goals.home ?? 0} - {match.goals.away ?? 0}
              </div>

              <div style={styles.status}>
                {match.fixture.status.elapsed
                  ? `${match.fixture.status.elapsed}'`
                  : match.fixture.status.long}
              </div>
            </div>

            <div style={styles.team}>
              <img src={away.logo} width="70" height="70" alt="" />
              <h2>{away.name}</h2>
            </div>

          </div>
        </section>

        {/* EVENTS */}
        <section style={styles.card}>
          <h2>Match Events</h2>

          {events.length === 0 ? (
            <p style={styles.muted}>No events available.</p>
          ) : (
            events.map((event: any, index: number) => (
              <div key={index} style={styles.event}>

                <div style={styles.minute}>
                  {event.time?.elapsed}'
                </div>

                <div style={styles.eventTeam}>
                  {event.team?.name}
                </div>

                <div style={styles.eventType}>
                  <strong>{event.type}</strong>

                  {event.detail && (
                    <div>{event.detail}</div>
                  )}

                  {event.player?.name && (
                    <div>{event.player.name}</div>
                  )}

                  {event.assist?.name && (
                    <small>
                      Assist: {event.assist.name}
                    </small>
                  )}
                </div>

              </div>
            ))
          )}
        </section>

        {/* STATISTICS */}
        <section style={styles.card}>
          <h2>Match Statistics</h2>

          {statistics.length === 0 ? (
            <p style={styles.muted}>
              No statistics available.
            </p>
          ) : (
            <>

              <div style={styles.statHeader}>
                <strong>{home.name}</strong>
                <strong>Statistics</strong>
                <strong>{away.name}</strong>
              </div>

              {[
                "Ball Possession",
                "Total Shots",
                "Shots on Goal",
                "Shots off Goal",
                "Shots outsidebox",
                "Blocked Shots",
                "Corner Kicks",
                "Fouls",
                "Offsides",
                "Yellow Cards",
                "Red Cards",
                "Total passes",
                "Passes accurate",
                "Free Kicks",
              ].map((type) => (
                <div key={type} style={styles.statRow}>

                  <strong>
                    {getStat(homeStats, type)}
                  </strong>

                  <span>
                    {type}
                  </span>

                  <strong>
                    {getStat(awayStats, type)}
                  </strong>

                </div>
              ))}

            </>
          )}
        </section>

        {/* LINEUPS */}
        <section style={styles.card}>
          <h2>Lineups</h2>

          {lineups.length === 0 ? (
            <p style={styles.muted}>
              No lineups available.
            </p>
          ) : (
            <div style={styles.lineups}>

              {lineups.map((team: any, index: number) => (
                <div key={index} style={styles.lineupTeam}>

                  <h3>{team.team?.name}</h3>

                  <div style={styles.formation}>
                    Formation: {team.formation || "-"}
                  </div>

                  <h4>Starting XI</h4>

                  {team.startXI?.map(
                    (player: any, playerIndex: number) => (
                      <div
                        key={playerIndex}
                        style={styles.player}
                      >
                        <span>
                          #{player.player?.number}
                        </span>

                        <strong>
                          {player.player?.name}
                        </strong>

                        <span>
                          {player.player?.pos || ""}
                        </span>
                      </div>
                    )
                  )}

                  {team.substitutes?.length > 0 && (
                    <>
                      <h4>Substitutes</h4>

                      {team.substitutes.map(
                        (player: any, playerIndex: number) => (
                          <div
                            key={playerIndex}
                            style={styles.player}
                          >
                            <span>
                              #{player.player?.number}
                            </span>

                            <strong>
                              {player.player?.name}
                            </strong>

                            <span>
                              {player.player?.pos || ""}
                            </span>
                          </div>
                        )
                      )}
                    </>
                  )}

                </div>
              ))}

            </div>
          )}
        </section>

        {/* MATCH INFORMATION */}
        <section style={styles.card}>
          <h2>Match Information</h2>

          <div style={styles.infoGrid}>

            <div>
              <span>Status</span>
              <strong>
                {match.fixture.status.long}
              </strong>
            </div>

            <div>
              <span>Venue</span>
              <strong>
                {match.fixture.venue?.name || "-"}
              </strong>
            </div>

            <div>
              <span>City</span>
              <strong>
                {match.fixture.venue?.city || "-"}
              </strong>
            </div>

            <div>
              <span>Referee</span>
              <strong>
                {match.fixture.referee || "-"}
              </strong>
            </div>

            <div>
              <span>Match ID</span>
              <strong>
                {match.fixture.id}
              </strong>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#f5f6f8",
    fontFamily: "Arial, sans-serif",
    color: "#111827",
    padding: "30px 20px",
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },

  back: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "bold",
  },

  card: {
    background: "white",
    borderRadius: "14px",
    padding: "25px",
    marginTop: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },

  league: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: "25px",
  },

  teams: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "60px",
  },

  team: {
    textAlign: "center",
    width: "220px",
  },

  scoreBox: {
    textAlign: "center",
  },

  score: {
    fontSize: "42px",
    fontWeight: "bold",
  },

  status: {
    color: "#dc2626",
    fontWeight: "bold",
    marginTop: "8px",
  },

  muted: {
    color: "#6b7280",
  },

  event: {
    display: "grid",
    gridTemplateColumns: "60px 180px 1fr",
    gap: "15px",
    padding: "15px 0",
    borderTop: "1px solid #e5e7eb",
  },

  minute: {
    fontWeight: "bold",
  },

  eventTeam: {
    fontWeight: "bold",
  },

  eventType: {
    lineHeight: "1.5",
  },

  statHeader: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr 1fr",
    textAlign: "center",
    padding: "14px",
    background: "#f3f4f6",
    borderRadius: "8px",
  },

  statRow: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr 1fr",
    textAlign: "center",
    alignItems: "center",
    padding: "14px 8px",
    borderTop: "1px solid #e5e7eb",
  },

  lineups: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "25px",
  },

  lineupTeam: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "20px",
  },

  formation: {
    color: "#6b7280",
    marginBottom: "20px",
  },

  player: {
    display: "grid",
    gridTemplateColumns: "45px 1fr 40px",
    gap: "8px",
    padding: "9px 0",
    borderTop: "1px solid #eeeeee",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  },
};
