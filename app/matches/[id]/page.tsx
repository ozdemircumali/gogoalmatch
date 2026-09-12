"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type MatchDetail = {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
    venue?: {
      name?: string | null;
      city?: string | null;
    };
    referee?: string | null;
  };
  league: {
    name: string;
    country: string;
    logo: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
  };
  events?: Array<{
    time: {
      elapsed: number;
      extra?: number;
    };
    team: {
      id: number;
      name: string;
    };
    player: {
      name: string;
    };
    assist?: {
      name: string;
    };
    type: string;
    detail: string;
  }>;
  statistics?: Array<{
    team: {
      id: number;
      name: string;
    };
    statistics: Array<{
      type: string;
      value: number | string | null;
    }>;
  }>;
  lineups?: Array<{
    team: {
      id: number;
      name: string;
    };
    formation: string;
    startXI: Array<{
      player: {
        id: number;
        name: string;
        number: number;
        pos: string;
      };
    }>;
    substitutes: Array<{
      player: {
        id: number;
        name: string;
        number: number;
        pos: string;
      };
    }>;
  }>;
};

const LIVE_STATUSES = ["1H", "2H", "HT", "ET", "BT", "P"];
const FINISHED_STATUSES = ["FT", "AET", "PEN"];

type SubTab = "SUMMARY" | "STATS" | "LINEUPS";

export default function MatchDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SubTab>("SUMMARY");

  async function loadMatchDetail() {
    if (!id) return;

    try {
      const response = await fetch(`/api/fixtures/${id}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.response && data.response.length > 0) {
        setMatch(data.response[0]);
      } else {
        setMatch(null);
      }
    } catch (error) {
      console.error("Failed to load match detail:", error);
      setMatch(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatchDetail();

    const interval = setInterval(loadMatchDetail, 30000);

    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <main className="page">
        <div className="loadingScreen">
          <div className="loadingCard">
            <div className="loadingLogo">G</div>
            <div className="loadingText">Loading match details...</div>
          </div>
        </div>

        <PageStyles />
      </main>
    );
  }

  if (!match) {
    return (
      <main className="page">
        <div className="loadingScreen">
          <div className="errorCard">
            <div className="errorIcon">!</div>

            <h1>Match Not Found</h1>

            <p>
              The match information could not be found or is no longer
              available.
            </p>

            <Link href="/" className="primaryButton">
              Back to Matches
            </Link>
          </div>
        </div>

        <PageStyles />
      </main>
    );
  }

  const status = match.fixture.status.short;

  const isLive = LIVE_STATUSES.includes(status);
  const isFinished = FINISHED_STATUSES.includes(status);

  const matchTime = new Date(match.fixture.date).toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );

  const statusText = isLive
    ? match.fixture.status.elapsed != null
      ? `${match.fixture.status.elapsed}'`
      : status
    : isFinished
      ? "Full Time"
      : matchTime;

  const halftimeScore =
    match.score?.halftime?.home != null &&
    match.score?.halftime?.away != null
      ? `${match.score.halftime.home} - ${match.score.halftime.away}`
      : null;

  return (
    <main className="page">
      <header className="topbar">
        <div className="headerInner">
          <Link href="/" className="brandLink">
            <div className="brandMark">G</div>

            <div>
              <div className="brandName">
                GoGoal<span>Match</span>
              </div>

              <div className="brandSubtitle">
                Live Scores, Results & Statistics
              </div>
            </div>
          </Link>

          <Link href="/" className="backButton">
            <span>←</span>
            <span>Matches</span>
          </Link>
        </div>
      </header>

      <div className="content">
        <div className="breadcrumb">
          <Link href="/">Matches</Link>
          <span>/</span>
          <span>{match.league.name}</span>
        </div>

        <section className="matchHero">
          <div className="heroTop">
            <div className="leagueInfo">
              {match.league.logo && (
                <img
                  src={match.league.logo}
                  alt=""
                  className="leagueLogo"
                />
              )}

              <div>
                <div className="leagueName">
                  {match.league.name}
                </div>

                <div className="leagueCountry">
                  {match.league.country}
                </div>
              </div>
            </div>

            {isLive && (
              <div className="liveIndicator">
                <span className="liveDot" />
                LIVE
              </div>
            )}

            {isFinished && (
              <div className="finishedIndicator">FULL TIME</div>
            )}
          </div>

          <div className="teamsArea">
            <div className="teamBlock">
              <div className="teamLogoWrap">
                <img
                  src={match.teams.home.logo}
                  alt={match.teams.home.name}
                  className="largeTeamLogo"
                />
              </div>

              <div
                className={`teamNameLarge ${
                  match.teams.home.winner ? "winner" : ""
                }`}
              >
                {match.teams.home.name}
              </div>

              <div className="teamLabel">HOME</div>
            </div>

            <div className="scoreBlock">
              {isLive || isFinished ? (
                <>
                  <div className="mainScore">
                    <span>{match.goals.home ?? 0}</span>
                    <span className="scoreDash">-</span>
                    <span>{match.goals.away ?? 0}</span>
                  </div>

                  <div
                    className={`matchStatus ${
                      isLive ? "liveStatus" : ""
                    }`}
                  >
                    {statusText}
                  </div>

                  {halftimeScore && (
                    <div className="halftime">
                      HT {halftimeScore}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="upcomingLabel">KICK-OFF</div>

                  <div className="kickoffTime">{matchTime}</div>

                  <div className="matchDate">
                    {new Date(match.fixture.date).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="teamBlock">
              <div className="teamLogoWrap">
                <img
                  src={match.teams.away.logo}
                  alt={match.teams.away.name}
                  className="largeTeamLogo"
                />
              </div>

              <div
                className={`teamNameLarge ${
                  match.teams.away.winner ? "winner" : ""
                }`}
              >
                {match.teams.away.name}
              </div>

              <div className="teamLabel">AWAY</div>
            </div>
          </div>
        </section>

        <section className="infoGrid">
          <InfoItem
            label="DATE"
            value={new Date(match.fixture.date).toLocaleDateString(
              "en-US",
              {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            )}
          />

          <InfoItem label="KICK-OFF" value={matchTime} />

          <InfoItem
            label="VENUE"
            value={
              match.fixture.venue?.name
                ? match.fixture.venue.name
                : "Not available"
            }
            secondary={match.fixture.venue?.city || undefined}
          />

          <InfoItem
            label="REFEREE"
            value={match.fixture.referee || "Not available"}
          />
        </section>

        <div className="tabs">
          <TabButton
            active={activeTab === "SUMMARY"}
            onClick={() => setActiveTab("SUMMARY")}
          >
            Summary
          </TabButton>

          <TabButton
            active={activeTab === "STATS"}
            onClick={() => setActiveTab("STATS")}
          >
            Statistics
          </TabButton>

          <TabButton
            active={activeTab === "LINEUPS"}
            onClick={() => setActiveTab("LINEUPS")}
          >
            Lineups
          </TabButton>
        </div>

        <section className="panel">
          {activeTab === "SUMMARY" && (
            <MatchSummary
              events={match.events || []}
              homeId={match.teams.home.id}
            />
          )}

          {activeTab === "STATS" && (
            <MatchStatistics
              statistics={match.statistics || []}
              homeTeam={match.teams.home.name}
              awayTeam={match.teams.away.name}
            />
          )}

          {activeTab === "LINEUPS" && (
            <MatchLineups
              lineups={match.lineups || []}
              homeId={match.teams.home.id}
            />
          )}
        </section>
      </div>

      <PageStyles />
    </main>
  );
}

function InfoItem({
  label,
  value,
  secondary,
}: {
  label: string;
  value: string;
  secondary?: string;
}) {
  return (
    <div className="infoItem">
      <div className="infoLabel">{label}</div>
      <div className="infoValue">{value}</div>
      {secondary && <div className="infoSecondary">{secondary}</div>}
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tabButton ${active ? "active" : ""}`}
    >
      {children}
    </button>
  );
}

function MatchSummary({
  events,
  homeId,
}: {
  events: MatchDetail["events"];
  homeId: number;
}) {
  if (!events || events.length === 0) {
    return (
      <div className="emptyState">
        <div className="emptyStateIcon">⚽</div>
        <h3>No match events</h3>
        <p>Match events will appear here when available.</p>
      </div>
    );
  }

  const sortedEvents = [...events].sort(
    (a, b) => a.time.elapsed - b.time.elapsed
  );

  return (
    <div>
      <div className="panelHeading">
        <div>
          <h2>Match Events</h2>
          <p>Goals, cards and substitutions</p>
        </div>

        <div className="eventCount">{events.length}</div>
      </div>

      <div className="eventsList">
        {sortedEvents.map((event, index) => {
          const isHome = event.team.id === homeId;
          const type = event.type.toLowerCase();
          const detail = event.detail.toLowerCase();

          const isGoal = type === "goal";
          const isCard = type === "card";
          const isSubstitution = type === "subst";

          let icon = "•";

          if (isGoal) {
            icon = "⚽";
          } else if (isCard) {
            icon = detail.includes("red") ? "🟥" : "🟨";
          } else if (isSubstitution) {
            icon = "↔";
          }

          const minute = event.time.extra
            ? `${event.time.elapsed}+${event.time.extra}'`
            : `${event.time.elapsed}'`;

          return (
            <div
              key={index}
              className={`eventRow ${isHome ? "homeEvent" : "awayEvent"}`}
            >
              {isHome ? (
                <>
                  <div className="eventMinute">{minute}</div>

                  <div className="eventContent">
                    <div className="eventIcon">{icon}</div>

                    <div>
                      <div className="eventPlayer">
                        {event.player?.name || event.detail}
                      </div>

                      {event.assist?.name && (
                        <div className="eventAssist">
                          Assist: {event.assist.name}
                        </div>
                      )}

                      {!isGoal &&
                        !isCard &&
                        !isSubstitution && (
                          <div className="eventAssist">
                            {event.detail}
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="eventTeam">{event.team.name}</div>
                </>
              ) : (
                <>
                  <div className="eventTeam awayTeam">
                    {event.team.name}
                  </div>

                  <div className="eventContent awayContent">
                    <div>
                      <div className="eventPlayer">
                        {event.player?.name || event.detail}
                      </div>

                      {event.assist?.name && (
                        <div className="eventAssist">
                          Assist: {event.assist.name}
                        </div>
                      )}

                      {!isGoal &&
                        !isCard &&
                        !isSubstitution && (
                          <div className="eventAssist">
                            {event.detail}
                          </div>
                        )}
                    </div>

                    <div className="eventIcon">{icon}</div>
                  </div>

                  <div className="eventMinute">{minute}</div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MatchStatistics({
  statistics,
  homeTeam,
  awayTeam,
}: {
  statistics: MatchDetail["statistics"];
  homeTeam: string;
  awayTeam: string;
}) {
  if (!statistics || statistics.length < 2) {
    return (
      <div className="emptyState">
        <div className="emptyStateIcon">%</div>
        <h3>Statistics unavailable</h3>
        <p>Statistics for this match are not available yet.</p>
      </div>
    );
  }

  const homeStats = statistics[0].statistics;
  const awayStats = statistics[1].statistics;

  return (
    <div>
      <div className="panelHeading">
        <div>
          <h2>Match Statistics</h2>
          <p>Team performance comparison</p>
        </div>
      </div>

      <div className="statsTeams">
        <div>{homeTeam}</div>
        <div className="vsLabel">VS</div>
        <div>{awayTeam}</div>
      </div>

      <div className="statsList">
        {homeStats.map((item, index) => {
          const awayItem = awayStats.find(
            (stat) => stat.type === item.type
          );

          const homeValue = getNumericValue(item.value);
          const awayValue = getNumericValue(awayItem?.value);

          const total = homeValue + awayValue;
          const homePercent =
            total > 0 ? (homeValue / total) * 100 : 50;

          return (
            <div className="statRow" key={`${item.type}-${index}`}>
              <div className="statValues">
                <span className="homeStatValue">
                  {item.value ?? "0"}
                </span>

                <span className="statName">
                  {formatStatName(item.type)}
                </span>

                <span className="awayStatValue">
                  {awayItem?.value ?? "0"}
                </span>
              </div>

              <div className="statBar">
                <div
                  className="statHomeBar"
                  style={{ width: `${homePercent}%` }}
                />

                <div
                  className="statAwayBar"
                  style={{ width: `${100 - homePercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getNumericValue(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = parseFloat(value.replace("%", ""));
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function formatStatName(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

function MatchLineups({
  lineups,
  homeId,
}: {
  lineups: MatchDetail["lineups"];
  homeId: number;
}) {
  if (!lineups || lineups.length === 0) {
    return (
      <div className="emptyState">
        <div className="emptyStateIcon">XI</div>
        <h3>Lineups unavailable</h3>
        <p>Starting lineups have not been published yet.</p>
      </div>
    );
  }

  const homeLineup =
    lineups.find((lineup) => lineup.team.id === homeId) || lineups[0];

  const awayLineup =
    lineups.find((lineup) => lineup.team.id !== homeId) || lineups[1];

  return (
    <div>
      <div className="panelHeading">
        <div>
          <h2>Starting Lineups</h2>
          <p>Starting XI and formations</p>
        </div>
      </div>

      <div className="lineupsGrid">
        <TeamLineupBox
          title="Home"
          lineup={homeLineup}
        />

        <TeamLineupBox
          title="Away"
          lineup={awayLineup}
        />
      </div>
    </div>
  );
}

function TeamLineupBox({
  title,
  lineup,
}: {
  title: string;
  lineup: MatchDetail["lineups"] extends Array<infer T> ? T | undefined : never;
}) {
  if (!lineup) {
    return (
      <div className="lineupBox">
        <div className="lineupEmpty">Lineup unavailable</div>
      </div>
    );
  }

  return (
    <div className="lineupBox">
      <div className="lineupHeader">
        <div>
          <div className="lineupTitle">{title}</div>
          <div className="lineupTeam">{lineup.team.name}</div>
        </div>

        <div className="formation">{lineup.formation || "—"}</div>
      </div>

      <div className="playersTitle">Starting XI</div>

      <div className="playersList">
        {lineup.startXI?.map((item, index) => (
          <div className="playerRow" key={index}>
            <div className="playerNumber">
              {item.player.number}
            </div>

            <div className="playerName">
              {item.player.name}
            </div>

            <div className="playerPosition">
              {item.player.pos}
            </div>
          </div>
        ))}
      </div>

      {lineup.substitutes?.length > 0 && (
        <>
          <div className="playersTitle substitutesTitle">
            Substitutes
          </div>

          <div className="playersList">
            {lineup.substitutes.map((item, index) => (
              <div className="playerRow substituteRow" key={index}>
                <div className="playerNumber">
                  {item.player.number}
                </div>

                <div className="playerName">
                  {item.player.name}
                </div>

                <div className="playerPosition">
                  {item.player.pos}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PageStyles() {
  return (
    <style jsx global>{`
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: #f6f6f6;
        color: #171717;
        font-family:
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          Roboto,
          Helvetica,
          Arial,
          sans-serif;
      }

      button,
      input {
        font-family: inherit;
      }

      .page {
        min-height: 100vh;
        background:
          linear-gradient(
            180deg,
            #fff7ed 0px,
            #ffffff 260px,
            #f6f6f6 600px
          );
      }

      .topbar {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(255, 255, 255, 0.96);
        backdrop-filter: blur(14px);
        border-bottom: 1px solid #eeeeee;
      }

      .headerInner {
        max-width: 1150px;
        margin: auto;
        min-height: 74px;
        padding: 12px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
      }

      .brandLink {
        display: flex;
        align-items: center;
        gap: 11px;
        text-decoration: none;
        color: inherit;
      }

      .brandMark {
        width: 42px;
        height: 42px;
        border-radius: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f97316;
        color: white;
        font-size: 21px;
        font-weight: 900;
        box-shadow: 0 5px 15px rgba(249, 115, 22, 0.25);
      }

      .brandName {
        font-size: 22px;
        line-height: 1;
        font-weight: 900;
        letter-spacing: -0.6px;
      }

      .brandName span {
        color: #f97316;
      }

      .brandSubtitle {
        margin-top: 5px;
        font-size: 10px;
        color: #999999;
      }

      .backButton {
        display: flex;
        align-items: center;
        gap: 7px;
        text-decoration: none;
        color: #555555;
        background: white;
        border: 1px solid #dedede;
        border-radius: 10px;
        padding: 9px 13px;
        font-size: 12px;
        font-weight: 800;
        transition: 0.2s;
      }

      .backButton:hover {
        border-color: #f97316;
        color: #f97316;
      }

      .content {
        max-width: 950px;
        margin: auto;
        padding: 18px;
      }

      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #999999;
        font-size: 11px;
        margin-bottom: 13px;
      }

      .breadcrumb a {
        color: #f97316;
        text-decoration: none;
        font-weight: 800;
      }

      .matchHero {
        position: relative;
        background: white;
        border: 1px solid #e5e5e5;
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.045);
      }

      .matchHero::before {
        content: "";
        display: block;
        height: 4px;
        background: linear-gradient(
          90deg,
          #f97316,
          #fb923c,
          #f97316
        );
      }

      .heroTop {
        padding: 17px 20px 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
      }

      .leagueInfo {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .leagueLogo {
        width: 32px;
        height: 32px;
        object-fit: contain;
        flex: 0 0 32px;
      }

      .leagueName {
        font-size: 13px;
        font-weight: 900;
        color: #222
