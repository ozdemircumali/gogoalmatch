import VisualLineup from "@/components/VisualLineup";

interface MatchPageProps {
  params: {
    id: string;
  };
}

async function getMatchData(id: string) {
  try {
    const res = await fetch(
      `https://www.gogoalmatch.com/api/match-center/${id}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) return null;

    const data = await res.json();

    if (!data.success || !data.data) return null;

    return data.data;
  } catch {
    return null;
  }
}

export default async function MatchDetailPage({
  params,
}: MatchPageProps) {
  const data = await getMatchData(params.id);

  if (!data) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#07100c",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            background: "#0c1812",
            border: "1px solid #1b3024",
            padding: "40px",
            borderRadius: "16px",
            textAlign: "center",
            maxWidth: "450px",
            width: "100%",
          }}
        >
          <h1 style={{ marginTop: 0 }}>
            Match Not Found
          </h1>

          <p style={{ color: "#8fa097" }}>
            We couldn't load the match information.
          </p>

          <a
            href="/"
            style={{
              display: "inline-block",
              marginTop: "15px",
              background: "#55e58b",
              color: "#07100c",
              padding: "11px 20px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            Back to Matches
          </a>
        </div>
      </main>
    );
  }

  const {
    fixture,
    teams,
    goals,
    league,
    venue,
    referee,
    status,
    score,
    events,
    statistics,
    lineups,
    players,
  } = data;

  const isLive = [
    "1H",
    "2H",
    "HT",
    "ET",
    "BT",
    "P",
  ].includes(status?.short);

  const homeScore =
    goals?.home ??
    score?.goals?.home ??
    0;

  const awayScore =
    goals?.away ??
    score?.goals?.away ??
    0;

  // VisualLineup için mock / API verisi hazırlığı
  const homeLineupData = {
    name: teams?.home?.name || "Home Team",
    formation: lineups?.[0]?.formation || "4-2-3-1",
    logo: teams?.home?.logo,
    players: lineups?.[0]?.startXI?.map((item: any, i: number) => ({
      id: item.player?.id || i,
      number: item.player?.number || i + 1,
      name: item.player?.name || "Player",
      position: item.player?.pos || "MF",
      x: 20 + ((i % 4) * 20),
      y: 15 + Math.floor(i / 3) * 20,
    })) || [
      { id: 1, number: 1, name: "Muslera", position: "GK", x: 50, y: 10, rating: 7.2 },
      { id: 2, number: 23, name: "Ayhan", position: "DF", x: 15, y: 30, rating: 6.8 },
      { id: 3, number: 6, name: "Davinson", position: "DF", x: 38, y: 25, rating: 7.5 },
      { id: 4, number: 42, name: "Bardakcı", position: "DF", x: 62, y: 25, rating: 7.1 },
      { id: 5, number: 18, name: "Jakobs", position: "DF", x: 85, y: 30, rating: 6.9 },
      { id: 6, number: 34, name: "Torreira", position: "MF", x: 35, y: 55, rating: 7.8 },
      { id: 7, number: 8, name: "Sara", position: "MF", x: 65, y: 55, rating: 8.2 },
      { id: 8, number: 53, name: "Barış", position: "FW", x: 20, y: 75, rating: 7.0 },
      { id: 9, number: 10, name: "Mertens", position: "FW", x: 50, y: 72, rating: 7.6 },
      { id: 10, number: 11, name: "Yunus", position: "FW", x: 80, y: 75, rating: 7.4 },
      { id: 11, number: 9, name: "Icardi", position: "FW", x: 50, y: 90, rating: 8.5 },
    ]
  };

  const awayLineupData = {
    name: teams?.away?.name || "Away Team",
    formation: lineups?.[1]?.formation || "4-3-3",
    logo: teams?.away?.logo,
    players: lineups?.[1]?.startXI?.map((item: any, i: number) => ({
      id: item.player?.id || i + 100,
      number: item.player?.number || i + 1,
      name: item.player?.name || "Player",
      position: item.player?.pos || "MF",
      x: 20 + ((i % 4) * 20),
      y: 15 + Math.floor(i / 3) * 20,
    })) || [
      { id: 12, number: 40, name: "Livadovıć", position: "GK", x: 50, y: 90, rating: 6.7 },
      { id: 13, number: 16, name: "Müldür", position: "DF", x: 85, y: 70, rating: 6.5 },
      { id: 14, number: 50, name: "Becão", position: "DF", x: 62, y: 75, rating: 6.9 },
      { id: 15, number: 6, name: "Djiku", position: "DF", x: 38, y: 75, rating: 7.1 },
      { id: 16, number: 24, name: "Oosterwolde", position: "DF", x: 15, y: 70, rating: 6.8 },
      { id: 17, number: 34, name: "Amrabat", position: "MF", x: 50, y: 52, rating: 7.0 },
      { id: 18, number: 8, name: "Yandaş", position: "MF", x: 30, y: 40, rating: 6.4 },
      { id: 19, number: 53, name: "Szymański", position: "MF", x: 70, y: 40, rating: 7.2 },
      { id: 20, number: 10, name: "Tadić", position: "FW", x: 15, y: 20, rating: 7.3 },
      { id: 21, number: 19, name: "En-Nesyri", position: "FW", x: 50, y: 15, rating: 6.6 },
      { id: 22, number: 97, name: "Maximin", position: "FW", x: 85, y: 20, rating: 7.1 },
    ]
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #07100c;
          color: #ffffff;
          font-family: Arial, Helvetica, sans-serif;
        }

        a {
          color: inherit;
        }

        .topbar {
          height: 64px;
          background: #0b1711;
          border-bottom: 1px solid #1b3024;
          display: flex;
          align-items: center;
          padding: 0 24px;
        }

        .topbar-inner {
          width: 100%;
          max-width: 1200px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          color: #55e58b;
          text-decoration: none;
          font-size: 22px;
          font-weight: 900;
        }

        .back {
          color: #aebdb4;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
        }

        .back:hover {
          color: #55e58b;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 20px;
        }

        .league-card {
          background: #0c1812;
          border: 1px solid #1b3024;
          border-radius: 12px 12px 0 0;
          padding: 15px 20px;
          text-align: center;
        }

        .league-name {
          font-size: 16px;
          font-weight: 800;
        }

        .league-info {
          color: #71847a;
          font-size: 12px;
          margin-top: 5px;
        }

        .score-card {
          background: linear-gradient(
            135deg,
            #10271a,
            #0b1711
          );
          border: 1px solid #1b3024;
          border-top: 0;
          border-radius: 0 0 12px 12px;
          padding: 35px 20px;
        }

        .teams {
          display: grid;
          grid-template-columns: 1fr 180px 1fr;
          align-items: center;
          gap: 20px;
        }

        .team {
          text-align: center;
        }

        .team-logo {
          width: 85px;
          height: 85px;
          object-fit: contain;
        }

        .team-name {
          margin-top: 12px;
          font-size: 17px;
          font-weight: 800;
        }

        .score {
          text-align: center;
        }

        .score-number {
          font-size: 44px;
          font-weight: 900;
        }

        .status {
          display: inline-block;
          margin-top: 10px;
          padding: 5px 12px;
          border-radius: 20px;
          background: #27372d;
          color: #d9e5de;
          font-size: 11px;
          font-weight: 800;
        }

        .status.live {
          background: #55e58b;
          color: #07100c;
        }

        .tabs {
          display: flex;
          gap: 5px;
          overflow-x: auto;
          background: #0c1812;
          border: 1px solid #1b3024;
          margin-top: 15px;
          padding: 6px;
          border-radius: 10px;
        }

        .tab {
          padding: 10px 16px;
          border-radius: 7px;
          color: #9cacA3;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .tab.active {
          background: #173021;
          color: #55e58b;
        }

        .card {
          margin-top: 15px;
          background: #0c1812;
          border: 1px solid #1b3024;
          border-radius: 12px;
          padding: 20px;
        }

        .card h2 {
          margin: 0 0 18px;
          font-size: 16px;
        }

        .empty {
          color: #71847a;
          font-size: 13px;
        }

        .event {
          display: grid;
          grid-template-columns: 1fr 80px 1fr;
          align-items: center;
          min-height: 60px;
          border-bottom: 1px solid #17281e;
        }

        .event:last-child {
          border-bottom: 0;
        }

        .event-home {
          text-align: right;
          padding-right: 15px;
          font-size: 13px;
        }

        .event-away {
          text-align: left;
          padding-left: 15px;
          font-size: 13px;
        }

        .event-center {
          text-align: center;
        }

        .event-time {
          color: #71847a;
          font-size: 11px;
        }

        .event-icon {
          margin-top: 4px;
          font-size: 18px;
        }

        .stat-row {
          display: grid;
          grid-template-columns: 70px 1fr 70px;
          gap: 15px;
          align-items: center;
          margin-bottom: 14px;
        }

        .stat-value {
          font-size: 13px;
          font-weight: 800;
        }

        .stat-name {
          text-align: center;
          color: #91a098;
          font-size: 12px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .info {
          background: #09130e;
          border: 1px solid #17281e;
          border-radius: 8px;
          padding: 13px;
        }

        .info-label {
          color: #71847a;
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .info-value {
          font-size: 13px;
          font-weight: 700;
        }

        .lineup-team {
          margin-bottom: 20px;
        }

        .lineup-team:last-child {
          margin-bottom: 0;
        }

        .lineup-title {
          font-size: 14px;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .player {
          display: flex;
          justify-content: space-between;
          padding: 9px 0;
          border-bottom: 1px solid #17281e;
          font-size: 12px;
        }

        @media (max-width: 700px) {
          .container {
            padding: 10px;
          }

          .teams {
            grid-template-columns: 1fr 110px 1fr;
            gap: 8px;
          }

          .team-logo {
            width: 60px;
            height: 60px;
          }

          .team-name {
            font-size: 13px;
          }

          .score-number {
            font-size: 32px;
          }

          .info-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 450px) {
          .info-grid {
            grid-template-columns: 1fr;
          }

          .teams {
            grid-template-columns: 1fr 90px 1fr;
          }

          .team-name {
            font-size: 12px;
          }

          .score-number {
            font-size: 28px;
          }
        }
      `}</style>

      <header className="topbar">
        <div className="topbar-inner">
          <a href="/" className="logo">
            GoGoalMatch
          </a>

          <a href="/" className="back">
            ← Matches
          </a>
        </div>
      </header>

      <main className="container">

        <div className="league-card">
          <div className="league-name">
            {league?.name || "Football"}
          </div>

          <div className="league-info">
            {league?.country || ""}
            {venue?.name
              ? ` · ${venue.name}`
              : ""}
          </div>
        </div>

        <div className="score-card">
          <div className="teams">

            <div className="team">
              {teams?.home?.logo && (
                <img
                  className="team-logo"
                  src={teams.home.logo}
                  alt={teams.home.name}
                />
              )}

              <div className="team-name">
                {teams?.home?.name}
              </div>
            </div>

            <div className="score">
              <div className="score-number">
                {homeScore} - {awayScore}
              </div>

              <div
                className={`status ${
                  isLive ? "live" : ""
                }`}
              >
                {status?.elapsed != null
                  ? `${status.elapsed}'`
                  : status?.long || "Scheduled"}
              </div>
            </div>

            <div className="team">
              {teams?.away?.logo && (
                <img
                  className="team-logo"
                  src={teams.away.logo}
                  alt={teams.away.name}
                />
              )}

              <div className="team-name">
                {teams?.away?.name}
              </div>
            </div>

          </div>
        </div>

        <div className="tabs">
          <div className="tab active">Overview</div>
          <div className="tab">Events</div>
          <div className="tab">Statistics</div>
          <div className="tab">Lineups</div>
          <div className="tab">Players</div>
        </div>

        <section className="card">
          <h2>Match Events</h2>

          {!events || events.length === 0 ? (
            <div className="empty">
              No events available
            </div>
          ) : (
            events.map(
              (event: any, index: number) => {
                const isHome =
                  event.team?.id === teams?.home?.id;

                return (
                  <div
                    className="event"
                    key={index}
                  >
                    <div className="event-home">
                      {isHome &&
                        event.player?.name}
                    </div>

                    <div className="event-center">
                      <div className="event-time">
                        {event.time?.elapsed
                          ? `${event.time.elapsed}'`
                          : ""}
                      </div>

                      <div className="event-icon">
                        {getEventIcon(
                          event.type,
                          event.detail
                        )}
                      </div>
                    </div>

                    <div className="event-away">
                      {!isHome &&
                        event.player?.name}
                    </div>
                  </div>
                );
              }
            )
          )}
        </section>

        <section className="card">
          <h2>Statistics</h2>

          {!statistics ||
          statistics.length === 0 ? (
            <div className="empty">
              No statistics available
            </div>
          ) : (
            statistics.map(
              (teamStats: any, index: number) => (
                <div key={index}>
                  {teamStats.statistics?.map(
                    (
                      stat: any,
                      statIndex: number
                    ) => {
                      const value =
                        typeof stat.value ===
                        "string"
                          ? stat.value
                          : stat.value ?? "-";

                      return (
                        <div
                          className="stat-row"
                          key={statIndex}
                        >
                          <div className="stat-value">
                            {index === 0
                              ? value
                              : ""}
                          </div>

                          <div>
                            <div className="stat-name">
                              {stat.type}
                            </div>
                          </div>

                          <div
                            className="stat-value"
                            style={{
                              textAlign: "right",
                            }}
                          >
                            {index === 1
                              ? value
                              : ""}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )
            )
          )}
        </section>

        <section className="card">
          <h2>Match Information</h2>

          <div className="info-grid">

            <div className="info">
              <div className="info-label">
                Status
              </div>
              <div className="info-value">
                {status?.long || "-"}
              </div>
            </div>

            <div className="info">
              <div className="info-label">
                League
              </div>
              <div className="info-value">
                {league?.name || "-"}
              </div>
            </div>

            <div className="info">
              <div className="info-label">
                Country
              </div>
              <div className="info-value">
                {league?.country || "-"}
              </div>
            </div>

            <div className="info">
              <div className="info-label">
                Venue
              </div>
              <div className="info-value">
                {venue?.name || "-"}
              </div>
            </div>

            <div className="info">
              <div className="info-label">
                Referee
              </div>
              <div className="info-value">
                {referee || "-"}
              </div>
            </div>

            <div className="info">
              <div className="info-label">
                Match ID
              </div>
              <div className="info-value">
                {fixture?.id || params.id}
              </div>
            </div>

          </div>
        </section>

        {/* GÖRSEL SAHA KADRO BİLEŞENİ */}
        <section className="card">
          <h2>Visual Lineups</h2>
          <VisualLineup 
            homeTeam={homeLineupData} 
            awayTeam={awayLineupData} 
          />
        </section>

        <section className="card">
          <h2>Lineups List</h2>

          {!lineups ||
          lineups.length === 0 ? (
            <div className="empty">
              Lineups are not available yet.
            </div>
          ) : (
            lineups.map(
              (teamLineup: any, index: number) => (
                <div
                  className="lineup-team"
                  key={index}
                >
                  <div className="lineup-title">
                    {teamLineup.team?.name}
                  </div>

                  {teamLineup.startXI?.map(
                    (player: any, playerIndex: number) => (
                      <div
                        className="player"
                        key={playerIndex}
                      >
                        <span>
                          {player.player?.number ?? ""}
                          {" "}
                          {player.player?.name ?? "-"}
                        </span>

                        <span>
                          {player.player?.pos ?? ""}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )
            )
          )}
        </section>

        <section className="card">
          <h2>Players</h2>

          {!players ||
          players.length === 0 ? (
            <div className="empty">
              Player statistics are not available.
            </div>
          ) : (
            players.map(
              (teamPlayers: any, index: number) => (
                <div
                  className="lineup-team"
                  key={index}
                >
                  <div className="lineup-title">
                    {teamPlayers.team?.name}
                  </div>

                  {teamPlayers.players
                    ?.slice(0, 20)
                    .map(
                      (
                        playerData: any,
                        playerIndex: number
                      ) => (
                        <div
                          className="player"
                          key={playerIndex}
                        >
                          <span>
                            {playerData.player?.name ||
                              "-"}
                          </span>

                          <span>
                            {playerData.statistics?.[0]
                              ?.games?.minutes
                              ? `${playerData.statistics[0].games.minutes}'`
                              : ""}
                          </span>
                        </div>
                      )
                    )}
                </div>
              )
            )
          )}
        </section>

      </main>
    </>
  );
}

function getEventIcon(
  type: string,
  detail: string
) {
  if (type === "Goal") {
    return "⚽";
  }

  if (
    type === "Card" &&
    detail === "Yellow Card"
  ) {
    return "🟨";
  }

  if (
    type === "Card" &&
    detail === "Red Card"
  ) {
    return "🟥";
  }

  if (type === "subst") {
    return "↔";
  }

  if (type === "Var") {
    return "VAR";
  }

  return "•";
}
