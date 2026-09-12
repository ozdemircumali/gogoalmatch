"use client";

import { useEffect, useState } from “react”;
import { useParams } from “next/navigation”;
import Link from “next/link”;

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

const LIVE_STATUSES = [“1H”, “2H”, “HT”, “ET”, “BT”, “P”];
const FINISHED_STATUSES = [“FT”, “AET”, “PEN”];

type Tab = “SUMMARY” | “STATS” | “LINEUPS” | “INFO”;

export default function MatchDetailPage() {
const params = useParams();
const id = params?.id;

const [match, setMatch] = useState<MatchDetail | null>(null);
const [loading, setLoading] = useState(true);
const [activeTab, setActiveTab] = useState(“SUMMARY”);

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
Loading match details…
    <PageStyles />
  </main>
);

}

if (!match) {
return (
⚽

      <h1>Match Not Found</h1>
      <p>
        The match could not be found or is no longer available.
      </p>
      <Link href="/" className="backButton">
        Back to Matches
      </Link>
    </div>
    <PageStyles />
  </main>
);

}

const status = match.fixture.status.short;

const isLive = LIVE_STATUSES.includes(status);
const isFinished = FINISHED_STATUSES.includes(status);

const statusLabel = isLive
? match.fixture.status.elapsed != null
? ${match.fixture.status.elapsed}'
: “LIVE”
: isFinished
? “FULL TIME”
: new Date(match.fixture.date).toLocaleTimeString(“en-US”, {
hour: “numeric”,
minute: “2-digit”,
});

const matchDate = new Date(match.fixture.date).toLocaleDateString(“en-US”, {
weekday: “long”,
month: “long”,
day: “numeric”,
year: “numeric”,
});

return (
  <header className="detailHeader">
    <div className="headerInner">
      <Link href="/" className="backLink">
        <span className="backArrow">←</span>
        <span>All Matches</span>
      </Link>
      <Link href="/" className="detailBrand">
        <span className="brandMark">G</span>
        <span>
          GoGoal<span>Match</span>
        </span>
      </Link>
    </div>
  </header>
  <div className="detailContainer">
    <section className="matchHero">
      <div className="heroTop">
        <div className="leagueInfo">
          {match.league.logo && (
            <img
              src={match.league.logo}
              alt=""
              className="heroLeagueLogo"
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
          <div className="liveStatus">
            <span className="liveDot" />
            LIVE
          </div>
        )}
        {isFinished && (
          <div className="finishedStatus">
            FULL TIME
          </div>
        )}
        {!isLive && !isFinished && (
          <div className="upcomingStatus">
            UPCOMING
          </div>
        )}
      </div>
      <div className="teamsArea">
        <div className="teamSide">
          <div className="teamLogoBox">
            <img
              src={match.teams.home.logo}
              alt={match.teams.home.name}
            />
          </div>
          <h2>{match.teams.home.name}</h2>
          <span className="teamLabel">HOME</span>
        </div>
        <div className="scoreArea">
          {!isLive && !isFinished ? (
            <>
              <div className="upcomingTime">
                {statusLabel}
              </div>
              <div className="dateText">
                {matchDate}
              </div>
            </>
          ) : (
            <>
              <div className="mainScore">
                <span>{match.goals.home ?? 0}</span>
                <b>-</b>
                <span>{match.goals.away ?? 0}</span>
              </div>
              <div
                className={`scoreStatus ${
                  isLive ? "scoreLive" : ""
                }`}
              >
                {statusLabel}
              </div>
              {match.score.halftime.home != null && (
                <div className="halfTime">
                  HT&nbsp;&nbsp;
                  {match.score.halftime.home} -{" "}
                  {match.score.halftime.away}
                </div>
              )}
            </>
          )}
        </div>
        <div className="teamSide">
          <div className="teamLogoBox">
            <img
              src={match.teams.away.logo}
              alt={match.teams.away.name}
            />
          </div>
          <h2>{match.teams.away.name}</h2>
          <span className="teamLabel">AWAY</span>
        </div>
      </div>
      <div className="heroFooter">
        <div>
          <span className="footerLabel">DATE</span>
          <strong>{matchDate}</strong>
        </div>
        <div>
          <span className="footerLabel">STATUS</span>
          <strong>{match.fixture.status.long}</strong>
        </div>
        {match.fixture.venue?.name && (
          <div>
            <span className="footerLabel">VENUE</span>
            <strong>
              {match.fixture.venue.name}
              {match.fixture.venue.city
                ? `, ${match.fixture.venue.city}`
                : ""}
            </strong>
          </div>
        )}
      </div>
    </section>
    <nav className="tabs">
      <TabButton
        active={activeTab === "SUMMARY"}
        onClick={() => setActiveTab("SUMMARY")}
        icon="◉"
      >
        Summary
      </TabButton>
      <TabButton
        active={activeTab === "STATS"}
        onClick={() => setActiveTab("STATS")}
        icon="▥"
      >
        Statistics
      </TabButton>
      <TabButton
        active={activeTab === "LINEUPS"}
        onClick={() => setActiveTab("LINEUPS")}
        icon="♙"
      >
        Lineups
      </TabButton>
      <TabButton
        active={activeTab === "INFO"}
        onClick={() => setActiveTab("INFO")}
        icon="ⓘ"
      >
        Match Info
      </TabButton>
    </nav>
    <section className="contentCard">
      {activeTab === "SUMMARY" && (
        <MatchSummary
          events={match.events || []}
          homeId={match.teams.home.id}
        />
      )}
      {activeTab === "STATS" && (
        <MatchStatistics
          statistics={match.statistics || []}
          homeName={match.teams.home.name}
          awayName={match.teams.away.name}
        />
      )}
      {activeTab === "LINEUPS" && (
        <MatchLineups
          lineups={match.lineups || []}
          homeId={match.teams.home.id}
        />
      )}
      {activeTab === "INFO" && (
        <MatchInfo
          match={match}
          matchDate={matchDate}
        />
      )}
    </section>
  </div>
</main>

);
}

function TabButton({
active,
children,
icon,
onClick,
}: {
active: boolean;
children: React.ReactNode;
icon: string;
onClick: () => void;
}) {
return (
<button
onClick={onClick}
className={tabButton ${active ? "active" : ""}}
>
{icon}
{children}
);
}

function MatchSummary({
events,
homeId,
}: {
events: MatchDetail[“events”];
homeId: number;
}) {
if (!events || events.length === 0) {
return (
);
}

const sortedEvents = […events].sort(
(a, b) => a.time.elapsed - b.time.elapsed
);

return (
  <div className="timeline">
    {sortedEvents.map((event, index) => {
      const isHome = event.team.id === homeId;
      const type = event.type.toLowerCase();
      const detail = event.detail.toLowerCase();
      const isGoal = type === "goal";
      const isCard = type === "card";
      const isSubstitution =
        type === "subst" || type === "substitution";
      let eventIcon = "•";
      if (isGoal) eventIcon = "⚽";
      else if (isCard) {
        eventIcon = detail.includes("red") ? "🟥" : "🟨";
      } else if (isSubstitution) {
        eventIcon = "↕";
      }
      return (
        <div
          key={`${event.time.elapsed}-${index}`}
          className={`eventRow ${
            isHome ? "homeEvent" : "awayEvent"
          }`}
        >
          <div className="eventMinute">
            {event.time.elapsed}
            {event.time.extra ? `+${event.time.extra}` : ""}'
          </div>
          <div className="eventLine">
            <div className="eventDot">
              {eventIcon}
            </div>
          </div>
          <div className="eventContent">
            <div className="eventPlayer">
              {event.player.name}
            </div>
            <div className="eventDetail">
              {event.detail}
            </div>
            {event.assist?.name && (
              <div className="eventAssist">
                Assist: {event.assist.name}
              </div>
            )}
            <div className="eventTeam">
              {event.team.name}
            </div>
          </div>
        </div>
      );
    })}
  </div>
</div>

);
}

function MatchStatistics({
statistics,
homeName,
awayName,
}: {
statistics: MatchDetail[“statistics”];
homeName: string;
awayName: string;
}) {
if (!statistics || statistics.length < 2) {
return (
);
}

const homeStats = statistics[0]?.statistics || [];
const awayStats = statistics[1]?.statistics || [];

return (
  <div className="statsTeams">
    <span>{homeName}</span>
    <span>VS</span>
    <span>{awayName}</span>
  </div>
  <div className="statsList">
    {homeStats.map((item, index) => {
      const awayItem = awayStats[index];
      const homeNumeric =
        typeof item.value === "number"
          ? item.value
          : Number.parseFloat(String(item.value ?? 0)) || 0;
      const awayNumeric =
        typeof awayItem?.value === "number"
          ? awayItem.value
          : Number.parseFloat(
              String(awayItem?.value ?? 0)
            ) || 0;
      const total = homeNumeric + awayNumeric;
      const homePercent =
        total > 0 ? (homeNumeric / total) * 100 : 50;
      return (
        <div className="statItem" key={item.type}>
          <div className="statValues">
            <span className="homeValue">
              {item.value ?? "0"}
            </span>
            <span className="statName">
              {formatStatName(item.type)}
            </span>
            <span className="awayValue">
              {awayItem?.value ?? "0"}
            </span>
          </div>
          <div className="statBar">
            <div
              className="statHome"
              style={{ width: `${homePercent}%` }}
            />
            <div
              className="statAway"
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

function MatchLineups({
lineups,
homeId,
}: {
lineups: MatchDetail[“lineups”];
homeId: number;
}) {
if (!lineups || lineups.length === 0) {
return (
);
}

const homeLineup =
lineups.find((lineup) => lineup.team.id === homeId) ||
lineups[0];

const awayLineup =
lineups.find((lineup) => lineup.team.id !== homeId) ||
lineups[1];

return (
  <div className="lineupsGrid">
    <TeamLineupBox
      lineup={homeLineup}
      side="home"
    />
    <TeamLineupBox
      lineup={awayLineup}
      side="away"
    />
  </div>
</div>

);
}

function TeamLineupBox({
lineup,
side,
}: {
lineup: MatchDetail[“lineups”][number] | undefined;
side: “home” | “away”;
}) {
if (!lineup) {
return (
);
}

return (
{lineup.team.name}
      <div className="lineupLabel">
        {side === "home" ? "HOME" : "AWAY"}
      </div>
    </div>
    {lineup.formation && (
      <div className="formation">
        {lineup.formation}
      </div>
    )}
  </div>
  <div className="playerList">
    {lineup.startXI?.map((item, index) => (
      <div
        className="playerRow"
        key={`${item.player.id}-${index}`}
      >
        <span className="playerNumber">
          {item.player.number}
        </span>
        <div className="playerInfo">
          <span className="playerName">
            {item.player.name}
          </span>
          <span className="playerPosition">
            {item.player.pos}
          </span>
        </div>
      </div>
    ))}
  </div>
  {lineup.substitutes?.length > 0 && (
    <details className="substitutes">
      <summary>
        Substitutes
        <span>{lineup.substitutes.length}</span>
      </summary>
      <div className="substituteList">
        {lineup.substitutes.map((item, index) => (
          <div
            className="substituteRow"
            key={`${item.player.id}-${index}`}
          >
            <span className="playerNumber">
              {item.player.number}
            </span>
            <span>{item.player.name}</span>
            <small>{item.player.pos}</small>
          </div>
        ))}
      </div>
    </details>
  )}
</div>

);
}

function MatchInfo({
match,
matchDate,
}: {
match: MatchDetail;
matchDate: string;
}) {
return (
  <div className="infoGrid">
    <InfoItem
      label="Competition"
      value={match.league.name}
    />
    <InfoItem
      label="Country"
      value={match.league.country}
    />
    <InfoItem
      label="Date"
      value={matchDate}
    />
    <InfoItem
      label="Kick-off"
      value={new Date(
        match.fixture.date
      ).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })}
    />
    <InfoItem
      label="Status"
      value={match.fixture.status.long}
    />
    <InfoItem
      label="Referee"
      value={match.fixture.referee || "Not available"}
    />
    <InfoItem
      label="Stadium"
      value={match.fixture.venue?.name || "Not available"}
    />
    <InfoItem
      label="City"
      value={match.fixture.venue?.city || "Not available"}
    />
  </div>
</div>

);
}

function InfoItem({
label,
value,
}: {
label: string;
value: string;
}) {
return (
{label}
{value}
);
}

function SectionTitle({
title,
subtitle,
}: {
title: string;
subtitle: string;
}) {
return (
{title}
{subtitle}
);
}

function EmptyState({
icon,
title,
text,
}: {
icon: string;
title: string;
text: string;
}) {
return (
{icon}
{title}
{text}
);
}

function formatStatName(name: string) {
return name
.replace(/([a-z])([A-Z])/g, “$1 $2”)
.replace(/_/g, “ “);
}

function PageStyles() {
return (
{`
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
  .detailPage {
    min-height: 100vh;
    background:
      linear-gradient(
        180deg,
        #fff7ed 0px,
        #ffffff 300px,
        #f6f6f6 700px
      );
    padding-bottom: 50px;
  }
  .detailHeader {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid #e8e8e8;
  }
  .headerInner {
    max-width: 1050px;
    margin: 0 auto;
    min-height: 64px;
    padding: 0 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }
  .backLink {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    text-decoration: none;
    font-size: 12px;
    font-weight: 800;
    transition: 0.2s;
  }
  .backLink:hover {
    color: #f97316;
  }
  .backArrow {
    font-size: 19px;
    line-height: 1;
  }
  .detailBrand {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #171717;
    text-decoration: none;
    font-size: 16px;
    font-weight: 900;
  }
  .detailBrand span span {
    color: #f97316;
  }
  .brandMark {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f97316;
    color: white;
    border-radius: 9px;
    font-weight: 900;
    box-shadow: 0 4px 10px rgba(249, 115, 22, 0.25);
  }
  .detailContainer {
    width: min(1050px, calc(100% - 30px));
    margin: 0 auto;
    padding-top: 22px;
  }
  .matchHero {
    position: relative;
    overflow: hidden;
    background: #ffffff;
    border: 1px solid #e5e5e5;
    border-radius: 20px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
  }
  .matchHero::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(
      90deg,
      #f97316,
      #fb923c,
      #f97316
    );
  }
  .heroTop {
    min-height: 68px;
    padding: 18px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    border-bottom: 1px solid #eeeeee;
  }
  .leagueInfo {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .heroLeagueLogo {
    width: 35px;
    height: 35px;
    object-fit: contain;
    flex: 0 0 35px;
  }
  .leagueName {
    font-size: 14px;
    font-weight: 900;
    color: #202020;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .leagueCountry {
    margin-top: 2px;
    font-size: 11px;
    color: #999;
  }
  .liveStatus,
  .finishedStatus,
  .upcomingStatus {
    flex: 0 0 auto;
    border-radius: 999px;
    padding: 7px 12px;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.8px;
  }
  .liveStatus {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #ea580c;
    background: #fff1e7;
    border: 1px solid #fed7aa;
  }
  .liveDot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #f97316;
    box-shadow: 0 0 0 4px #ffedd5;
    animation: livePulse 1.5s infinite;
  }
  .finishedStatus {
    color: #555;
    background: #f4f4f4;
    border: 1px solid #e2e2e2;
  }
  .upcomingStatus {
    color: #2563eb;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
  }
  .teamsArea {
    display: grid;
    grid-template-columns: 1fr 180px 1fr;
    align-items: center;
    gap: 20px;
    padding: 35px 35px 32px;
  }
  .teamSide {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-width: 0;
  }
  .teamLogoBox {
    width: 105px;
    height: 105px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
  }
  .teamLogoBox img {
    width: 88px;
    height: 88px;
    max-width: 88px;
    max-height: 88px;
    object-fit: contain;
  }
  .teamSide h2 {
    margin: 0;
    max-width: 260px;
    font-size: 18px;
    line-height: 1.25;
    font-weight: 900;
    color: #171717;
  }
  .teamLabel {
    margin-top: 6px;
    color: #aaa;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 1.2px;
  }
  .scoreArea {
    text-align: center;
  }
  .mainScore {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 13px;
    color: #171717;
    font-size: 48px;
    line-height: 1;
    font-weight: 950;
    letter-spacing: -2px;
  }
  .mainScore b {
    color: #c9c9c9;
    font-size: 28px;
    font-weight: 700;
  }
  .scoreStatus {
    margin-top: 9px;
    color: #777;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .scoreLive {
    color: #f97316;
    animation: liveText 1.5s infinite;
  }
  .halfTime {
    margin-top: 8px;
    color: #999;
    font-size: 10px;
    font-weight: 700;
  }
  .upcomingTime {
    display: inline-block;
    color: #f97316;
    background: #fff7ed;
    border: 1px solid #fed7aa;
    border-radius: 12px;
    padding: 10px 15px;
    font-size: 21px;
    font-weight: 950;
    letter-spacing: 0.5px;
  }
  .dateText {
    margin-top: 9px;
    color: #999;
    font-size: 10px;
    font-weight: 700;
  }
  .heroFooter {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border-top: 1px solid #eeeeee;
    background: #fafafa;
  }
  .heroFooter > div {
    min-width: 0;
    padding: 13px 15px;
    text-align: center;
    border-right: 1px solid #eeeeee;
  }
  .heroFooter > div:last-child {
    border-right: none;
  }
  .footerLabel {
    display: block;
    margin-bottom: 4px;
    color: #aaa;
    font-size: 8px;
    font-weight: 900;
    letter-spacing: 1px;
  }
  .heroFooter strong {
    display: block;
    color: #444;
    font-size: 11px;
    font-weight: 800;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tabs {
    display: flex;
    gap: 7px;
    margin-top: 18px;
    padding-bottom: 2px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs::-webkit-scrollbar {
    display: none;
  }
  .tabButton {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 7px;
    border: 1px solid #e1e1e1;
    background: #ffffff;
    color: #777;
    border-radius: 11px;
    padding: 11px 15px;
    font-size: 11px;
    font-weight: 900;
    cursor: pointer;
    transition: 0.2s;
  }
  .tabButton:hover {
    border-color: #f97316;
    color: #f97316;
  }
  .tabButton.active {
    background: #f97316;
    color: white;
    border-color: #f97316;
    box-shadow: 0 5px 14px rgba(249, 115, 22, 0.2);
  }
  .contentCard {
    margin-top: 10px;
    min-height: 330px;
    padding: 24px;
    background: #ffffff;
    border: 1px solid #e5e5e5;
    border-radius: 18px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.035);
  }
  .sectionTitle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 17px;
    margin-bottom: 8px;
    border-bottom: 1px solid #eeeeee;
  }
  .sectionTitle h3 {
    margin: 0;
    color: #171717;
    font-size: 16px;
    font-weight: 950;
  }
  .sectionTitle p {
    margin: 4px 0 0;
    color: #999;
    font-size: 10px;
  }
  .timeline {
    position: relative;
    padding: 8px 0;
  }
  .eventRow {
    display: grid;
    grid-template-columns: 55px 28px minmax(0, 1fr);
    min-height: 66px;
    align-items: start;
  }
  .eventRow.awayEvent {
    grid-template-columns: minmax(0, 1fr) 28px 55px;
  }
  .eventRow.awayEvent .eventContent {
    grid-column: 1;
    grid-row: 1;
    text-align: right;
  }
  .eventRow.awayEvent .eventLine {
    grid-column: 2;
    grid-row: 1;
  }
  .eventRow.awayEvent .eventMinute {
    grid-column: 3;
    grid-row: 1;
  }
  .eventMinute {
    display: flex;
    justify-content: center;
    padding-top: 4px;
    color: #f97316;
    font-size: 10px;
    font-weight: 900;
  }
  .eventLine {
    position: relative;
    display: flex;
    justify-content: center;
    height: 100%;
    border-left: 1px solid #e7e7e7;
  }
  .eventDot {
    position: absolute;
    top: 1px;
    left: 50%;
    transform: translateX(-50%);
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #eeeeee;
    border-radius: 50%;
    background: #ffffff;
    font-size: 13px;
    z-index: 2;
  }
  .eventContent {
    margin: 0 12px;
    padding: 2px 0 12px;
  }
  .eventPlayer {
    color: #222;
    font-size: 12px;
    font-weight: 900;
  }
  .eventDetail {
    margin-top: 3px;
    color: #777;
    font-size: 10px;
    font-weight: 600;
  }
  .eventAssist {
    margin-top: 3px;
    color: #999;
    font-size: 9px;
  }
  .eventTeam {
    margin-top: 4px;
    color: #b0b0b0;
    font-size: 9px;
    font-weight: 700;
  }
  .statsTeams {
    display: grid;
    grid-template-columns: 1fr 60px 1fr;
    align-items: center;
    gap: 10px;
    padding: 12px 0 18px;
    color: #555;
    font-size: 11px;
    font-weight: 900;
    text-align: center;
  }
  .statsTeams span:first-child {
    text-align: right;
  }
  .statsTeams span:last-child {
    text-align: left;
  }
  .statsTeams span:nth-child(2) {
    color: #f97316;
    font-size: 9px;
  }
  .statsList {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .statItem {
    width: 100%;
  }
  .statValues {
    display: grid;
    grid-template-columns: 70px 1fr 70px;
    align-items: center;
    gap: 10px;
    margin-bottom: 7px;
  }
  .homeValue {
    text-align: left;
    color: #171717;
    font-size: 12px;
    font-weight: 900;
  }
  .awayValue {
    text-align: right;
    color: #171717;
    font-size: 12px;
    font-weight: 900;
  }
  .statName {
    text-align: center;
    color: #888;
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  .statBar {
    display: flex;
    width: 100%;
    height: 6px;
    gap: 3px;
    overflow: hidden;
    border-radius: 999px;
    background: #eeeeee;
  }
  .statHome {
    min-width: 3px;
    background: #f97316;
    border-radius: 999px;
    transition: width 0.5s ease;
  }
  .statAway {
    min-width: 3px;
    background: #d5d5d5;
    border-radius: 999px;
    transition: width 0.5s ease;
  }
  .lineupsGrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }
  .lineupBox {
    border: 1px solid #e8e8e8;
    border-radius: 14px;
    overflow: hidden;
    background: #fafafa;
  }
  .lineupHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 15px;
    background: #ffffff;
    border-bottom: 1px solid #e8e8e8;
  }
  .lineupTeam {
    color: #202020;
    font-size: 13px;
    font-weight: 900;
  }
  .lineupLabel {
    margin-top: 3px;
    color: #aaa;
    font-size: 8px;
    font-weight: 900;
    letter-spacing: 1px;
  }
  .formation {
    padding: 6px 8px;
    color: #f97316;
    background: #fff1e7;
    border: 1px solid #fed7aa;
    border-radius: 7px;
    font-size: 10px;
    font-weight: 900;
  }
  .playerList {
    padding: 7px;
  }
  .playerRow {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 39px;
    padding: 5px 7px;
    border-bottom: 1px solid #eeeeee;
  }
  .playerRow:last-child {
    border-bottom: none;
  }
  .playerNumber {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 24px;
    border-radius: 50%;
    background: #ffffff;
    border: 1px solid #e1e1e1;
    color: #f97316;
    font-size: 9px;
    font-weight: 900;
  }
  .playerInfo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
    width: 100%;
  }
  .playerName {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #333;
    font-size: 11px;
    font-weight: 750;
  }
  .playerPosition {
    flex: 0 0 auto;
    color: #aaa;
    font-size: 8px;
    font-weight: 800;
  }
  .substitutes {
    border-top: 1px solid #e8e8e8;
    background: #ffffff;
  }
  .substitutes summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    color: #777;
    font-size: 10px;
    font-weight: 900;
    cursor: pointer;
    list-style: none;
  }
  .substitutes summary::-webkit-details-marker {
    display: none;
  }
  .substitutes summary span {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 21px;
    height: 21px;
    border-radius: 50%;
    background: #f5f5f5;
    color: #888;
    font-size: 9px;
  }
  .substituteList {
    padding: 0 10px 10px;
  }
  .substituteRow {
    display: flex;
    align-items: center;
    gap: 9px;
    min-height: 32px;
    border-bottom: 1px solid #f0f0f0;
    color: #555;
    font-size: 10px;
    font-weight: 700;
  }
  .substituteRow small {
    margin-left: auto;
    color: #aaa;
    font-size: 8px;
  }
  .infoGrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .infoItem {
    padding: 15px;
    border: 1px solid #e9e9e9;
    border-radius: 12px;
    background: #fafafa;
  }
  .infoItem span {
    display: block;
    margin-bottom: 6px;
    color: #aaa;
    font-size: 8px;
    font-weight: 900;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .infoItem strong {
    display: block;
    color: #333;
    font-size: 11px;
    font-weight: 800;
    line-height: 1.4;
  }
  .emptyState {
    min-height: 280px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 30px;
  }
  .emptyIcon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 13px;
    border-radius: 50%;
    background: #fff1e7;
    color: #f97316;
    font-size: 24px;
  }
  .emptyState h3 {
    margin: 0;
    color: #333;
    font-size: 15px;
    font-weight: 900;
  }
  .emptyState p {
    max-width: 390px;
    margin: 7px 0 0;
    color: #999;
    font-size: 11px;
    line-height: 1.5;
  }
  .loadingScreen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 13px;
    color: #888;
    font-size: 12px;
    font-weight: 800;
  }
  .loadingSpinner {
    width: 30px;
    height: 30px;
    border: 3px solid #ffe4d0;
    border-top-color: #f97316;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  .notFound {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
    text-align: center;
  }
  .notFoundIcon {
    width: 70px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 18px;
    border-radius: 50%;
    background: #fff1e7;
    font-size: 30px;
  }
  .notFound h1 {
    margin: 0;
    color: #222;
    font-size: 22px;
    font-weight: 950;
  }
  .notFound p {
    margin: 8px 0 20px;
    color: #999;
    font-size: 12px;
  }
  .backButton {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 11px 17px;
    border-radius: 10px;
    background: #f97316;
    color: white;
    text-decoration: none;
    font-size: 11px;
    font-weight: 900;
    box-shadow: 0 5px 14px rgba(249, 115, 22, 0.22);
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes livePulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.35;
    }
  }
  @keyframes liveText {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.55;
    }
  }
  @media (max-width: 700px) {
    .detailContainer {
      width: calc(100% - 20px);
      padding-top: 12px;
    }
    .headerInner {
      min-height: 58px;
      padding: 0 12px;
    }
    .detailBrand {
      font-size: 14px;
    }
    .brandMark {
      width: 29px;
      height: 29px;
      font-size: 13px;
    }
    .backLink {
      font-size: 10px;
    }
    .heroTop {
      padding: 14px;
    }
    .leagueName {
      max-width: 180px;
      font-size: 12px;
    }
    .heroLeagueLogo {
      width: 29px;
      height: 29px;
      flex-basis: 29px;
    }
    .teamsArea {
      grid-template-columns: minmax(0, 1fr) 95px minmax(0, 1fr);
      gap: 5px;
      padding: 27px 10px 24px;
    }
    .teamLogoBox {
      width: 72px;
      height: 72px;
      margin-bottom: 10px;
    }
    .teamLogoBox img {
      width: 60px;
      height: 60px;
      max-width: 60px;
      max-height: 60px;
    }
    .teamSide h2 {
      max-width: 115px;
      font-size: 12px;
    }
    .mainScore {
      gap: 7px;
      font-size: 31px;
      letter-spacing: -1px;
    }
    .mainScore b {
      font-size: 18px;
    }
    .upcomingTime {
      padding: 8px 10px;
      font-size: 16px;
    }
    .dateText {
      font-size: 8px;
    }
    .heroFooter {
      grid-template-columns: 1fr;
    }
    .heroFooter > div {
      border-right: none;
      border-bottom: 1px solid #eeeeee;
    }
    .heroFooter > div:last-child {
      border-bottom: none;
    }
    .tabs {
      margin-top: 12px;
    }
    .tabButton {
      padding: 9px 12px;
      font-size: 10px;
    }
    .contentCard {
      padding: 16px 12px;
      border-radius: 14px;
    }
    .sectionTitle h3 {
      font-size: 14px;
    }
    .sectionTitle p {
      font-size: 9px;
    }
    .eventRow {
      grid-template-columns: 42px 25px minmax(0, 1fr);
    }
    .eventRow.awayEvent {
      grid-template-columns: minmax(0, 1fr) 25px 42px;
    }
    .eventContent {
      margin: 0 7px;
    }
    .eventPlayer {
      font-size: 10px;
    }
    .eventDetail,
    .eventAssist {
      font-size: 8px;
    }
    .lineupsGrid {
      grid-template-columns: 1fr;
    }
    .infoGrid {
      grid-template-columns: 1fr;
    }
    .statsTeams {
      grid-template-columns: 1fr 40px 1fr;
      font-size: 9px;
    }
    .statValues {
      grid-template-columns: 45px 1fr 45px;
    }
    .statName {
      font-size: 8px;
    }
  }
`}</style>

);
}
