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
  const [activeTab, setActiveTab] = useState<SubTab>("STATS");

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadMatchDetail() {
      try {
        const response = await fetch(`/api/fixtures/${id}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load match data");
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
        console.error("Error loading match detail:", error);
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
      <main className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Loading Match Center...
          </span>
        </div>
      </main>
    );
  }

  if (!match) {
    return (
      <main className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4">
        <div className="mx-auto max-w-xl text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-orange-500 hover:underline mb-6"
          >
            ← Back to Matches
          </Link>
          <div className="rounded-2xl border border-gray-800 bg-gray-800/50 p-8 backdrop-blur">
            <h1 className="text-xl font-black text-white">Match Not Found</h1>
            <p className="mt-2 text-xs text-gray-400">
              The requested match data could not be retrieved or is unavailable.
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
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 font-black text-white">
              G
            </div>
            <div className="leading-none">
              <span className="text-base font-black tracking-tight text-white">
                GoGoal<span className="text-orange-500">Match</span>
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            ← Matches
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-6">
        {/* Breadcrumb / League Name */}
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/" className="text-orange-500 hover:underline">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-300">{match.league.name}</span>
        </div>

        {/* Primary Scoreboard Card */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

          {/* League Bar */}
          <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/50 px-5 py-3">
            <div className="flex items-center gap-3">
              {match.league.logo && (
                <img
                  src={match.league.logo}
                  alt={match.league.name}
                  className="h-6 w-6 object-contain"
                />
              )}
              <div>
                <div className="text-xs font-bold text-slate-200">
                  {match.league.name}
                </div>
                <div className="text-[10px] text-slate-400">
                  {match.league.country}
                </div>
              </div>
            </div>

            {/* Match Status Badge */}
            <div>
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-[10px] font-black text-red-500">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                  {statusText}
                </span>
              ) : isFinished ? (
                <span className="rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-[10px] font-black text-slate-400">
                  FINISHED
                </span>
              ) : (
                <span className="rounded-full bg-orange-500/10 border border-orange-500/30 px-3 py-1 text-[10px] font-black text-orange-400">
                  UPCOMING
                </span>
              )}
            </div>
          </div>

          {/* Teams & Score Display */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              {/* Home Team */}
              <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-slate-800 p-2 border border-slate-700/50 flex items-center justify-center">
                  <img
                    src={match.teams.home.logo}
                    alt={match.teams.home.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <h2 className="mt-3 text-sm sm:text-lg font-black tracking-tight text-white">
                  {match.teams.home.name}
                </h2>
                <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                  HOME
                </span>
              </div>

              {/* Score Core */}
              <div className="flex flex-col items-center px-2">
                {isLive || isFinished ? (
                  <>
                    <div className="flex items-center gap-2 text-4xl sm:text-6xl font-black text-white tracking-tight">
                      <span>{match.goals.home ?? 0}</span>
                      <span className="text-slate-600">:</span>
                      <span>{match.goals.away ?? 0}</span>
                    </div>
                    {match.score?.halftime?.home !== null && (
                      <div className="mt-2 text-[11px] font-bold text-slate-400">
                        HT: {match.score.halftime.home} - {match.score.halftime.away}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      {matchTime}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 mt-1">
                      {formattedDate}
                    </div>
                  </div>
                )}
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-slate-800 p-2 border border-slate-700/50 flex items-center justify-center">
                  <img
                    src={match.teams.away.logo}
                    alt={match.teams.away.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <h2 className="mt-3 text-sm sm:text-lg font-black tracking-tight text-white">
                  {match.teams.away.name}
                </h2>
                <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                  AWAY
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Venue / Info Grid */}
        <section className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <InfoCard label="DATE" value={formattedDate} />
          <InfoCard label="KICK-OFF" value={matchTime} />
          <InfoCard
            label="VENUE"
            value={match.fixture.venue?.name || "N/A"}
            subValue={match.fixture.venue?.city || undefined}
          />
          <InfoCard
            label="REFEREE"
            value={match.fixture.referee || "N/A"}
          />
        </section>

        {/* Tab Selector */}
        <div className="mt-4 border-b border-slate-800 flex gap-2">
          <TabNavButton
            active={activeTab === "STATS"}
            onClick={() => setActiveTab("STATS")}
          >
            Statistics
          </TabNavButton>
          <TabNavButton
            active={activeTab === "SUMMARY"}
            onClick={() => setActiveTab("SUMMARY")}
          >
            Summary & Events
          </TabNavButton>
          <TabNavButton
            active={activeTab === "LINEUPS"}
            onClick={() => setActiveTab("LINEUPS")}
          >
            Lineups
          </TabNavButton>
        </div>

        {/* Tab Content Section */}
        <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6 shadow-xl">
          {activeTab === "STATS" && (
            <MatchStatisticsSection
              statistics={match.statistics || []}
              homeTeamName={match.teams.home.name}
              awayTeamName={match.teams.away.name}
            />
          )}

          {activeTab === "SUMMARY" && (
            <MatchEventsSummary
              events={match.events || []}
              homeId={match.teams.home.id}
            />
          )}

          {activeTab === "LINEUPS" && (
            <MatchLineupsSection
              lineups={match.lineups || []}
              homeId={match.teams.home.id}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
      <div className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
        {label}
      </div>
      <div className="mt-1 truncate text-xs font-bold text-slate-200">
        {value}
      </div>
      {subValue && (
        <div className="truncate text-[10px] text-slate-400">{subValue}</div>
      )}
    </div>
  );
}

function TabNavButton({
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
      className={`pb-3 px-4 text-xs font-black transition relative ${
        active
          ? "text-orange-500 border-b-2 border-orange-500"
          : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

{/* Match Statistics Component with Visual Dominance Bars */}
function MatchStatisticsSection({
  statistics,
  homeTeamName,
  awayTeamName,
}: {
  statistics: TeamStats[];
  homeTeamName: string;
  awayTeamName: string;
}) {
  if (!statistics || statistics.length < 2) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs font-semibold">
        Detailed statistics are not available for this match yet.
      </div>
    );
  }

  const homeStats = statistics[0]?.statistics || [];
  const awayStats = statistics[1]?.statistics || [];

  const combinedStats = homeStats.map((item) => {
    const awayItem = awayStats.find((s) => s.type === item.type);
    return {
      type: item.type,
      home: item.value,
      away: awayItem?.value ?? 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Teams Label */}
      <div className="flex items-center justify-between text-xs font-black text-slate-300 border-b border-slate-800 pb-3">
        <span className="w-1/3 truncate text-left">{homeTeamName}</span>
        <span className="w-1/3 text-center text-[10px] tracking-widest text-slate-400 uppercase">
          STATISTIC
        </span>
        <span className="w-1/3 truncate text-right">{awayTeamName}</span>
      </div>

      {/* Stats List */}
      <div className="space-y-5">
        {combinedStats.map((stat, idx) => {
          const homeVal = parseStatValue(stat.home);
          const awayVal = parseStatValue(stat.away);
          const total = homeVal + awayVal || 1;

          const homePercent = Math.round((homeVal / total) * 100);
          const awayPercent = 100 - homePercent;

          const isHomeDominant = homeVal > awayVal;
          const isAwayDominant = awayVal > homeVal;

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span
                  className={
                    isHomeDominant ? "text-orange-500 font-black" : "text-slate-300"
                  }
                >
                  {stat.home ?? 0}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  {formatStatLabel(stat.type)}
                </span>
                <span
                  className={
                    isAwayDominant ? "text-orange-500 font-black" : "text-slate-300"
                  }
                >
                  {stat.away ?? 0}
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    isHomeDominant ? "bg-orange-500" : "bg-slate-600"
                  }`}
                  style={{ width: `${homePercent}%` }}
                />
                <div
                  className={`h-full transition-all duration-300 ${
                    isAwayDominant ? "bg-orange-500" : "bg-slate-700"
                  }`}
                  style={{ width: `${awayPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function parseStatValue(val: number | string | null): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const parsed = parseFloat(val.replace("%", ""));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function formatStatLabel(label: string): string {
  return label
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

{/* Match Timeline / Summary Component */}
function MatchEventsSummary({
  events,
  homeId,
}: {
  events: EventItem[];
  homeId: number;
}) {
  if (!events || events.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs font-semibold">
        No key events available for this match.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-800 pb-2">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
          Timeline Events
        </h3>
      </div>

      <div className="divide-y divide-slate-800/60">
        {events.map((event, idx) => {
          const isHome = event.team.id === homeId;
          const timeDisplay = event.time.extra
            ? `${event.time.elapsed}+${event.time.extra}'`
            : `${event.time.elapsed}'`;

          return (
            <div
              key={idx}
              className="grid grid-cols-[1fr_60px_1fr] items-center py-3 text-xs"
            >
              {/* Home Side Event */}
              <div className="text-right pr-3">
                {isHome && (
                  <div>
                    <div className="font-bold text-slate-100">
                      {event.player?.name || event.detail}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {event.detail} {event.assist?.name ? `(Assist: ${event.assist.name})` : ""}
                    </div>
                  </div>
                )}
              </div>

              {/* Minute & Badge */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-orange-500">
                  {timeDisplay}
                </span>
                <span className="mt-1 rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-300">
                  {event.type}
                </span>
              </div>

              {/* Away Side Event */}
              <div className="text-left pl-3">
                {!isHome && (
                  <div>
                    <div className="font-bold text-slate-100">
                      {event.player?.name || event.detail}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {event.detail} {event.assist?.name ? `(Assist: ${event.assist.name})` : ""}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

{/* Lineups Component */}
function MatchLineupsSection({
  lineups,
  homeId,
}: {
  lineups: LineupItem[];
  homeId: number;
}) {
  if (!lineups || lineups.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs font-semibold">
        Starting lineups are not yet available.
      </div>
    );
  }

  const homeLineup = lineups.find((l) => l.team.id === homeId) || lineups[0];
  const awayLineup = lineups.find((l) => l.team.id !== homeId) || lineups[1];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <LineupList teamTitle="HOME" lineup={homeLineup} />
      <LineupList teamTitle="AWAY" lineup={awayLineup} />
    </div>
  );
}

function LineupList({
  teamTitle,
  lineup,
}: {
  teamTitle: string;
  lineup?: LineupItem;
}) {
  if (!lineup) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div>
          <span className="text-[9px] font-black text-orange-500 tracking-wider">
            {teamTitle}
          </span>
          <h4 className="text-sm font-bold text-white">{lineup.team.name}</h4>
        </div>
        <span className="rounded bg-slate-800 px-2 py-1 text-[10px] font-black text-slate-300">
          {lineup.formation || "N/A"}
        </span>
      </div>

      <div className="space-y-1.5">
        {lineup.startXI?.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between rounded-lg bg-slate-800/40 px-3 py-1.5 text-xs border border-slate-800/60"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-[10px] font-black text-slate-300">
                {item.player.number || "-"}
              </span>
              <span className="font-semibold text-slate-200">
                {item.player.name}
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-500">
              {item.player.pos}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
