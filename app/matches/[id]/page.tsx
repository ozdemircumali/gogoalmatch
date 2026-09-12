"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type EventItem = {
  time: {
    elapsed: number;
    extra?: number;
  };
  team: {
    id: number;
    name: string;
  };
  player?: {
    name?: string;
  };
  assist?: {
    name?: string;
  };
  type: string;
  detail: string;
};

type StatItem = {
  type: string;
  value: number | string | null;
};

type TeamStats = {
  team: {
    id: number;
    name: string;
  };
  statistics: StatItem[];
};

type PlayerItem = {
  id: number;
  name: string;
  number: number;
  pos: string;
};

type LineupItem = {
  team: {
    id: number;
    name: string;
  };
  formation: string;
  startXI: Array<{
    player: PlayerItem;
  }>;
  substitutes: Array<{
    player: PlayerItem;
  }>;
};

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
  events?: EventItem[];
  statistics?: TeamStats[];
  lineups?: LineupItem[];
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

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadMatchDetail() {
      try {
        const response = await fetch(`/api/fixtures/${id}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load match");
        }

        const data = await response.json();

        if (!cancelled) {
          if (data.response && data.response.length > 0) {
            setMatch(data.response[0]);
          } else {
            setMatch(null);
          }

          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load match detail:", error);

        if (!cancelled) {
          setMatch(null);
          setLoading(false);
        }
      }
    }

    loadMatchDetail();

    const interval = setInterval(loadMatchDetail, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-4 h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
        </div>
      </main>
    );
  }

  if (!match) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <Link
            href="/"
            className="text-sm font-bold text-orange-600"
          >
            ← Matches
          </Link>

          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="text-xl font-black text-gray-900">
              Match Not Found
            </div>

            <p className="mt-2 text-sm text-gray-500">
              The match information could not be loaded.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const status = match.fixture.status.short;

  const isLive = LIVE_STATUSES.includes(status);
  const isFinished = FINISHED_STATUSES.includes(status);

  const matchDate = new Date(match.fixture.date);

  const matchTime = matchDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const formattedDate = matchDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const statusText = isLive
    ? match.fixture.status.elapsed != null
      ? `${match.fixture.status.elapsed}'`
      : "LIVE"
    : isFinished
      ? "FULL TIME"
      : matchTime;

  const halftimeHome = match.score?.halftime?.home;
  const halftimeAway = match.score?.halftime?.away;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-lg font-black text-white">
              G
            </div>

            <div className="leading-none">
              <div className="text-lg font-black tracking-tight">
                GoGoal<span className="text-orange-500">Match</span>
              </div>

              <div className="mt-1 hidden text-[9px] font-semibold text-gray-400 sm:block">
                Live Scores, Results & Statistics
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:border-orange-300 hover:text-orange-600"
          >
            ← Matches
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="mb-3 flex items-center gap-2 overflow-hidden text-xs font-semibold text-gray-400">
          <Link
            href="/"
            className="shrink-0 text-orange-600"
          >
            Matches
          </Link>

          <span>/</span>

          <span className="truncate">
            {match.league.name}
          </span>
        </div>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="h-1 bg-orange-500" />

          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              {match.league.logo ? (
                <img
                  src={match.league.logo}
                  alt={match.league.name}
                  width={24}
                  height={24}
                  style={{
                    width: "24px",
                    height: "24px",
                    minWidth: "24px",
                    maxWidth: "24px",
                    objectFit: "contain",
                  }}
                />
              ) : null}

              <div className="min-w-0">
                <div className="truncate text-xs font-black text-gray-800">
                  {match.league.name}
                </div>

                <div className="text-[10px] font-medium text-gray-400">
                  {match.league.country}
                </div>
              </div>
            </div>

            {isLive ? (
              <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[9px] font-black text-red-600">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                LIVE
              </div>
            ) : isFinished ? (
              <div className="rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-black text-gray-500">
                FULL TIME
              </div>
            ) : (
              <div className="rounded-full bg-orange-50 px-2.5 py-1 text-[9px] font-black text-orange-600">
                UPCOMING
              </div>
            )}
          </div>

          <div className="px-3 py-6 sm:px-8 sm:py-8">
            <div className="grid grid-cols-[1fr_105px_1fr] items-center gap-2 sm:grid-cols-[1fr_150px_1fr]">
              <TeamScoreSide
                name={match.teams.home.name}
                logo={match.teams.home.logo}
                winner={match.teams.home.winner}
                align="right"
              />

              <div className="text-center">
                {isLive || isFinished ? (
                  <>
                    <div
                      className={`text-[9px] font-black uppercase tracking-widest ${
                        isLive
                          ? "text-orange-600"
                          : "text-gray-400"
                      }`}
                    >
                      {statusText}
                    </div>

                    <div className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                      {match.goals.home ?? 0}
                      <span className="px-1.5 text-gray-300">
                        -
                      </span>
                      {match.goals.away ?? 0}
                    </div>

                    {halftimeHome != null &&
                      halftimeAway != null && (
                        <div className="mt-1 text-[10px] font-bold text-gray-400">
                          HT {halftimeHome} - {halftimeAway}
                        </div>
                      )}
                  </>
                ) : (
                  <>
                    <div className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                      KICK-OFF
                    </div>

                    <div className="mt-1 text-2xl font-black sm:text-3xl">
                      {matchTime}
                    </div>

                    <div className="mt-1 text-[10px] font-semibold text-gray-400">
                      {matchDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </>
                )}
              </div>

              <TeamScoreSide
                name={match.teams.away.name}
                logo={match.teams.away.logo}
                winner={match.teams.away.winner}
                align="left"
              />
            </div>
          </div>
        </section>

        <section className="mt-3 grid grid-cols-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm sm:grid-cols-4">
          <InfoBox
            label="DATE"
            value={formattedDate}
          />

          <InfoBox
            label="KICK-OFF"
            value={matchTime}
          />

          <InfoBox
            label="VENUE"
            value={match.fixture.venue?.name || "Not available"}
            secondary={match.fixture.venue?.city || undefined}
          />

          <InfoBox
            label="REFEREE"
            value={match.fixture.referee || "Not available"}
          />
        </section>

        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          <div className="grid grid-cols-3 gap-1">
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
        </div>

        <section className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
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
    </main>
  );
}

function TeamScoreSide({
  name,
  logo,
  winner,
  align,
}: {
  name: string;
  logo: string;
  winner: boolean | null;
  align: "left" | "right";
}) {
  const isRight = align === "right";

  return (
    <div
      className={`flex min-w-0 flex-col ${
        isRight ? "items-end text-right" : "items-start text-left"
      }`}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          minWidth: "32px",
          maxWidth: "32px",
          minHeight: "32px",
          maxHeight: "32px",
        }}
        className="overflow-hidden rounded-full bg-white"
      >
        <img
          src={logo}
          alt={name}
          width={32}
          height={32}
          style={{
            width: "32px",
            height: "32px",
            minWidth: "32px",
            maxWidth: "32px",
            minHeight: "32px",
            maxHeight: "32px",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>

      <div
        className={`mt-2 max-w-[145px] text-xs font-black leading-tight sm:text-sm ${
          winner ? "text-orange-600" : "text-gray-900"
        }`}
      >
        {name}
      </div>

      <div className="mt-1 text-[8px] font-black uppercase tracking-wider text-gray-400">
        {isRight ? "HOME" : "AWAY"}
      </div>
    </div>
  );
}

function InfoBox({
  label,
  value,
  secondary,
}: {
  label: string;
  value: string;
  secondary?: string;
}) {
  return (
    <div className="border-b border-gray-100 p-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div className="text-[9px] font-black uppercase tracking-wider text-gray-400">
        {label}
      </div>

      <div className="mt-1 truncate text-xs font-bold text-gray-800">
        {value}
      </div>

      {secondary && (
        <div className="mt-0.5 truncate text-[10px] text-gray-400">
          {secondary}
        </div>
      )}
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
      className={`rounded-lg px-3 py-2.5 text-xs font-black transition ${
        active
          ? "bg-orange-500 text-white shadow-sm"
          : "text-gray-500 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function MatchSummary({
  events,
  homeId,
}: {
  events: EventItem[];
  homeId: number;
}) {
  if (events.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="text-2xl">-</div>

        <div className="mt-2 text-sm font-black text-gray-800">
          No match events
        </div>

        <div className="mt-1 text-xs text-gray-400">
          Match events are not available.
        </div>
      </div>
    );
  }

  const sortedEvents = [...events].sort((a, b) => {
    if (a.time.elapsed !== b.time.elapsed) {
      return a.time.elapsed - b.time.elapsed;
    }

    return (a.time.extra || 0) - (b.time.extra || 0);
  });

  return (
    <div>
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <h2 className="text-sm font-black text-gray-900">
            Match Events
          </h2>

          <p className="mt-0.5 text-[10px] text-gray-400">
            Goals, cards and substitutions
          </p>
        </div>

        <div className="rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-black text-gray-500">
          {events.length}
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {sortedEvents.map((event, index) => {
          const isHome = event.team.id === homeId;
          const minute = event.time.extra
            ? `${event.time.elapsed}+${event.time.extra}'`
            : `${event.time.elapsed}'`;

          const type = event.type.toLowerCase();
          const detail = event.detail.toLowerCase();

          const isGoal = type === "goal";
          const isCard = type === "card";
          const isRed =
            isCard &&
            (detail.includes("red") ||
              detail.includes("second yellow"));

          let icon = "•";
          let iconClass = "bg-gray-100 text-gray-500";

          if (isGoal) {
            icon = "G";
            iconClass = "bg-orange-500 text-white";
          } else if (isRed) {
            icon = "RC";
            iconClass = "bg-red-500 text-white";
          } else if (isCard) {
            icon = "YC";
            iconClass = "bg-yellow-400 text-gray-900";
          } else if (type === "subst") {
            icon = "SUB";
            iconClass = "bg-gray-200 text-gray-600";
          } else if (type === "var") {
            icon = "VAR";
            iconClass = "bg-purple-100 text-purple-700";
          }

          const playerName =
            event.player?.name || event.detail || "Event";

          return (
            <div
              key={`${event.time.elapsed}-${event.time.extra || 0}-${index}`}
              className="grid min-h-[64px] grid-cols-[1fr_48px_1fr] items-center px-2 sm:px-5"
            >
              <div className="min-w-0 pr-2 text-right">
                {isHome && (
                  <>
                    <div className="truncate text-xs font-black text-gray-900">
                      {playerName}
                    </div>

                    <div className="mt-0.5 truncate text-[9px] font-medium text-gray-400">
                      {getEventDescription(event)}
                    </div>

                    {event.assist?.name && (
                      <div className="mt-0.5 truncate text-[9px] text-gray-400">
                        Assist: {event.assist.name}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-col items-center">
                <div className="text-[9px] font-black text-gray-400">
                  {minute}
                </div>

                <div
                  className={`mt-1 flex h-6 min-h-[24px] w-6 min-w-[24px] items-center justify-center rounded-full text-[7px] font-black ${iconClass}`}
                >
                  {icon}
                </div>
              </div>

              <div className="min-w-0 pl-2 text-left">
                {!isHome && (
                  <>
                    <div className="truncate text-xs font-black text-gray-900">
                      {playerName}
                    </div>

                    <div className="mt-0.5 truncate text-[9px] font-medium text-gray-400">
                      {getEventDescription(event)}
                    </div>

                    {event.assist?.name && (
                      <div className="mt-0.5 truncate text-[9px] text-gray-400">
                        Assist: {event.assist.name}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getEventDescription(event: EventItem) {
  const type = event.type.toLowerCase();

  if (type === "goal") {
    return event.detail || "Goal";
  }

  if (type === "card") {
    return event.detail || "Card";
  }

  if (type === "subst") {
    return event.detail || "Substitution";
  }

  if (type === "var") {
    return event.detail || "VAR";
  }

  return event.detail || event.type;
}

function MatchStatistics({
  statistics,
  homeTeam,
  awayTeam,
}: {
  statistics: TeamStats[];
  homeTeam: string;
  awayTeam: string;
}) {
  if (statistics.length < 2) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="text-xl font-black text-gray-400">%</div>

        <div className="mt-2 text-sm font-black text-gray-800">
          Statistics unavailable
        </div>

        <div className="mt-1 text-xs text-gray-400">
          Match statistics are not available.
        </div>
      </div>
    );
  }

  const homeStats =
    statistics.find(
      (item) => item.team.id === statistics[0].team.id
    )?.statistics || [];

  const awayStats =
    statistics.find(
      (item) => item.team.id !== statistics[0].team.id
    )?.statistics || [];

  const rows = homeStats.map((item) => {
    const awayItem = awayStats.find(
      (stat) => stat.type === item.type
    );

    return {
      type: item.type,
      home: item.value,
      away: awayItem?.value ?? "-",
    };
  });

  return (
    <div>
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-black text-gray-900">
          Match Statistics
        </h2>

        <p className="mt-0.5 text-[10px] text-gray-400">
          Team performance comparison
        </p>
      </div>

      <div className="grid grid-cols-[1fr_70px_1fr] border-b border-gray-100 px-4 py-3 text-[9px] font-black uppercase tracking-wide text-gray-400">
        <div className="truncate text-right">
          {homeTeam}
        </div>

        <div className="text-center">STAT</div>

        <div className="truncate">{awayTeam}</div>
      </div>

      <div className="divide-y divide-gray-100 px-4">
        {rows.map((row, index) => {
          const homeValue = numericValue(row.home);
          const awayValue = numericValue(row.away);

          const total = homeValue + awayValue;

          const homeWidth =
            total > 0 ? (homeValue / total) * 100 : 50;

          return (
            <div
              key={`${row.type}-${index}`}
              className="py-3"
            >
              <div className="grid grid-cols-[40px_1fr_40px] items-center gap-3">
                <div className="text-right text-xs font-black text-gray-900">
                  {row.home ?? "-"}
                </div>

                <div className="text-center">
                  <div className="text-[10px] font-bold text-gray-500">
                    {formatStatName(row.type)}
                  </div>

                  <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="bg-orange-500"
                      style={{
                        width: `${homeWidth}%`,
                      }}
                    />

                    <div
                      className="bg-gray-300"
                      style={{
                        width: `${100 - homeWidth}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="text-left text-xs font-black text-gray-900">
                  {row.away ?? "-"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function numericValue(
  value: number | string | null | undefined
) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const number = parseFloat(value.replace("%", ""));

    return Number.isNaN(number) ? 0 : number;
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
  lineups: LineupItem[];
  homeId: number;
}) {
  if (lineups.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="text-xl font-black text-gray-400">
          XI
        </div>

        <div className="mt-2 text-sm font-black text-gray-800">
          Lineups unavailable
        </div>

        <div className="mt-1 text-xs text-gray-400">
          Starting lineups are not available.
        </div>
      </div>
    );
  }

  const homeLineup =
    lineups.find((item) => item.team.id === homeId) ||
    lineups[0];

  const awayLineup =
    lineups.find((item) => item.team.id !== homeId) ||
    lineups[1];

  return (
    <div>
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-black text-gray-900">
          Starting Lineups
        </h2>

        <p className="mt-0.5 text-[10px] text-gray-400">
          Starting XI and substitutes
        </p>
      </div>

      <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <LineupColumn
          title="Home"
          lineup={homeLineup}
        />

        <LineupColumn
          title="Away"
          lineup={awayLineup}
        />
      </div>
    </div>
  );
}

function LineupColumn({
  title,
  lineup,
}: {
  title: string;
  lineup?: LineupItem;
}) {
  if (!lineup) {
    return (
      <div className="p-4 text-center text-xs text-gray-400">
        Lineup unavailable
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <div className="text-[9px] font-black uppercase tracking-wider text-orange-500">
            {title}
          </div>

          <div className="mt-0.5 text-sm font-black text-gray-900">
            {lineup.team.name}
          </div>
        </div>

        <div className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-black text-gray-600">
          {lineup.formation || "-"}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 text-[9px] font-black uppercase tracking-wider text-gray-400">
          Starting XI
        </div>

        <div className="space-y-1">
          {lineup.startXI?.map((item, index) => (
            <div
              key={`${item.player.id}-${index}`}
              className="flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-2"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-[9px] font-black text-gray-500">
                {item.player.number}
              </div>

              <div className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-800">
                {item.player.name}
              </div>

              <div className="text-[9px] font-bold text-gray-400">
                {item.player.pos}
              </div>
            </div>
          ))}
        </div>
      </div>

      {lineup.substitutes &&
        lineup.substitutes.length > 0 && (
          <div className="mt-5">
            <div className="mb-2 text-[9px] font-black uppercase tracking-wider text-gray-400">
              Substitutes
            </div>

            <div className="space-y-1">
              {lineup.substitutes.map((item, index) => (
                <div
                  key={`${item.player.id}-${index}`}
                  className="flex items-center gap-2 rounded-lg border border-gray-100 px-2.5 py-2"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gray-50 text-[9px] font-black text-gray-400">
                    {item.player.number}
                  </div>

                  <div className="min-w-0 flex-1 truncate text-xs font-medium text-gray-700">
                    {item.player.name}
                  </div>

                  <div className="text-[9px] font-bold text-gray-400">
                    {item.player.pos}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
