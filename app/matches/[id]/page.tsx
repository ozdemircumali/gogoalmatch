"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type MatchEvent = {
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
};

type MatchStatistic = {
  type: string;
  value: number | string | null;
};

type TeamStatistics = {
  team: {
    id: number;
    name: string;
  };
  statistics: MatchStatistic[];
};

type LineupPlayer = {
  player: {
    id: number;
    name: string;
    number: number;
    pos: string;
  };
};

type TeamLineup = {
  team: {
    id: number;
    name: string;
  };
  formation: string;
  startXI: LineupPlayer[];
  substitutes: LineupPlayer[];
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
  events?: MatchEvent[];
  statistics?: TeamStatistics[];
  lineups?: TeamLineup[];
};

const LIVE_STATUSES = ["1H", "2H", "HT", "ET", "BT", "P"];
const FINISHED_STATUSES = ["FT", "AET", "PEN"];

type DetailTab = "SUMMARY" | "STATS" | "LINEUPS";

export default function MatchDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTab>("SUMMARY");

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function fetchMatch() {
      try {
        const response = await fetch(`/api/fixtures/${id}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load match");
        }

        const data = await response.json();

        if (!cancelled) {
          if (data?.response && data.response.length > 0) {
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

    fetchMatch();

    const interval = setInterval(fetchMatch, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f7f9] text-[#111827]">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="bg-white border border-gray-200 rounded-2xl h-72" />
            <div className="bg-white border border-gray-200 rounded-2xl h-20" />
          </div>
        </div>
      </main>
    );
  }

  if (!match) {
    return (
      <main className="min-h-screen bg-[#f6f7f9] text-[#111827] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-orange-50 flex items-center justify-center">
            <span className="text-2xl font-black text-orange-500">!</span>
          </div>

          <h1 className="text-lg font-black mb-2">
            Match Not Found
          </h1>

          <p className="text-sm text-gray-500 mb-6">
            The match information could not be found.
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition"
          >
            Back to Matches
          </Link>
        </div>
      </main>
    );
  }

  const status = match.fixture.status.short;
  const isLive = LIVE_STATUSES.includes(status);
  const isFinished = FINISHED_STATUSES.includes(status);

  const homeScore = match.goals.home ?? 0;
  const awayScore = match.goals.away ?? 0;

  const kickoffTime = new Date(match.fixture.date).toLocaleTimeString(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  let statusText = kickoffTime;

  if (isLive) {
    statusText =
      match.fixture.status.elapsed != null
        ? `${match.fixture.status.elapsed}'`
        : status;
  }

  if (isFinished) {
    statusText = "FULL TIME";
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#111827] pb-12">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-orange-500 transition"
          >
            <span className="text-lg">←</span>
            <span>All Matches</span>
          </Link>

          <div className="flex items-center gap-2 min-w-0">
            {match.league.logo && (
              <img
                src={match.league.logo}
                alt=""
                width={24}
                height={24}
                className="w-6 h-6 object-contain shrink-0"
              />
            )}

            <div className="text-right min-w-0">
              <div className="text-xs font-black truncate max-w-[180px] sm:max-w-[300px]">
                {match.league.name}
              </div>

              <div className="text-[10px] text-gray-400 font-medium">
                {match.league.country}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-5 sm:pt-7">
        <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600" />

          <div className="px-4 sm:px-8 py-7 sm:py-9">
            <div className="text-center mb-7">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  isLive
                    ? "bg-red-50 text-red-600"
                    : isFinished
                      ? "bg-gray-100 text-gray-500"
                      : "bg-orange-50 text-orange-600"
                }`}
              >
                {isLive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}

                {statusText}
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8">
              <TeamHeader
                name={match.teams.home.name}
                logo={match.teams.home.logo}
                winner={match.teams.home.winner}
              />

              <div className="text-center min-w-[90px] sm:min-w-[130px]">
                {isLive || isFinished ? (
                  <>
                    <div className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900">
                      {homeScore}
                      <span className="text-gray-300 mx-2 sm:mx-3">
                        -
                      </span>
                      {awayScore}
                    </div>

                    {match.score.halftime.home != null &&
                      match.score.halftime.away != null && (
                        <div className="mt-2 text-[10px] sm:text-xs text-gray-400 font-bold">
                          HT {match.score.halftime.home} -{" "}
                          {match.score.halftime.away}
                        </div>
                      )}
                  </>
                ) : (
                  <>
                    <div className="text-2xl sm:text-3xl font-black text-gray-900">
                      {kickoffTime}
                    </div>

                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                      Kick-off
                    </div>
                  </>
                )}
              </div>

              <TeamHeader
                name={match.teams.away.name}
                logo={match.teams.away.logo}
                winner={match.teams.away.winner}
              />
            </div>
          </div>
        </section>

        <nav className="mt-5 bg-white border border-gray-200 rounded-2xl p-1.5 flex overflow-x-auto shadow-sm">
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
        </nav>

        <section className="mt-4">
          {activeTab === "SUMMARY" && (
            <SummarySection
              events={match.events || []}
              homeId={match.teams.home.id}
              fixture={match.fixture}
            />
          )}

          {activeTab === "STATS" && (
            <StatisticsSection
              statistics={match.statistics || []}
              homeId={match.teams.home.id}
            />
          )}

          {activeTab === "LINEUPS" && (
            <LineupsSection
              lineups={match.lineups || []}
              homeId={match.teams.home.id}
            />
          )}
        </section>

        <section className="mt-4 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-black">Match Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2">
            <InfoItem
              label="Venue"
              value={
                match.fixture.venue?.name
                  ? `${match.fixture.venue.name}${
                      match.fixture.venue.city
                        ? `, ${match.fixture.venue.city}`
                        : ""
                    }`
                  : "Not available"
              }
            />

            <InfoItem
              label="Referee"
              value={match.fixture.referee || "Not available"}
            />

            <InfoItem
              label="Competition"
              value={match.league.name}
            />

            <InfoItem
              label="Country"
              value={match.league.country}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function TeamHeader({
  name,
  logo,
  winner,
}: {
  name: string;
  logo: string;
  winner: boolean | null;
}) {
  return (
    <div className="min-w-0 flex flex-col items-center text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-3">
        <img
          src={logo}
          alt={name}
          width={80}
          height={80}
          className="w-full h-full object-contain"
        />
      </div>

      <div
        className={`text-xs sm:text-sm leading-tight max-w-[130px] sm:max-w-[190px] ${
          winner
            ? "font-black text-gray-900"
            : "font-bold text-gray-600"
        }`}
      >
        {name}
      </div>
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
      className={`flex-1 min-w-[110px] px-4 py-2.5 rounded-xl text-xs font-black transition ${
        active
          ? "bg-orange-500 text-white shadow-sm"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function SummarySection({
  events,
  homeId,
  fixture,
}: {
  events: MatchEvent[];
  homeId: number;
  fixture: MatchDetail["fixture"];
}) {
  const sortedEvents = [...events].sort(
    (a, b) => a.time.elapsed - b.time.elapsed
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-black">Match Events</h2>
      </div>

      {sortedEvents.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <div className="text-sm font-bold text-gray-500">
            No match events available.
          </div>

          <div className="text-xs text-gray-400 mt-1">
            Events will appear here when provided by the data feed.
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-6">
          <div className="space-y-2">
            {sortedEvents.map((event, index) => {
              const isHome = event.team.id === homeId;
              const type = event.type.toLowerCase();

              let icon = "•";

              if (type === "goal") {
                icon = "G";
              } else if (type === "card") {
                icon = event.detail.toLowerCase().includes("red")
                  ? "R"
                  : "Y";
              } else if (type === "subst") {
                icon = "S";
              }

              return (
                <div
                  key={`${event.time.elapsed}-${event.player.name}-${index}`}
                  className={`flex items-center gap-3 ${
                    isHome ? "" : "flex-row-reverse"
                  }`}
                >
                  <div className="w-10 shrink-0 text-center">
                    <span className="text-[11px] font-black text-orange-500">
                      {event.time.elapsed}
                      {event.time.extra
                        ? `+${event.time.extra}`
                        : ""}
                      '
                    </span>
                  </div>

                  <div
                    className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 ${
                      isHome ? "" : "flex-row-reverse text-right"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-black text-gray-700">
                        {icon}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-black text-gray-900">
                        {event.player?.name || "Unknown player"}
                      </div>

                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {event.detail || event.type}
                      </div>

                      {event.assist?.name && (
                        <div className="text-[10px] text-gray-500 mt-1">
                          Assist: {event.assist.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-400 font-bold">Status</span>
            <div className="font-black text-gray-700 mt-1">
              {fixture.status.long}
            </div>
          </div>

          <div>
            <span className="text-gray-400 font-bold">Match Date</span>
            <div className="font-black text-gray-700 mt-1">
              {new Date(fixture.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatisticsSection({
  statistics,
  homeId,
}: {
  statistics: TeamStatistics[];
  homeId: number;
}) {
  if (statistics.length < 2) {
    return (
      <EmptyState
        title="Statistics Not Available"
        text="Statistics for this match are not available yet."
      />
    );
  }

  const homeTeam =
    statistics.find((team) => team.team.id === homeId) ||
    statistics[0];

  const awayTeam =
    statistics.find((team) => team.team.id !== homeId) ||
    statistics[1];

  const awayMap = new Map(
    awayTeam.statistics.map((item) => [item.type, item.value])
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-black">Match Statistics</h2>

          <div className="text-[10px] text-gray-400 font-bold">
            {homeTeam.team.name} vs {awayTeam.team.name}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7 space-y-5">
        {homeTeam.statistics.map((item, index) => {
          const awayValue = awayMap.get(item.type);

          const homeNumber = parseStatisticValue(item.value);
          const awayNumber = parseStatisticValue(awayValue);

          const total = homeNumber + awayNumber;

          const homePercent =
            total > 0 ? (homeNumber / total) * 100 : 50;

          return (
            <div key={`${item.type}-${index}`}>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-2">
                <span className="text-xs font-black text-gray-900">
                  {formatStatisticValue(item.value)}
                </span>

                <span className="text-[10px] sm:text-xs font-bold text-gray-400 text-center">
                  {formatStatisticName(item.type)}
                </span>

                <span className="text-xs font-black text-gray-900 text-right">
                  {formatStatisticValue(awayValue)}
                </span>
              </div>

              <div className="flex gap-1 h-2">
                <div className="flex-1 bg-gray-100 rounded-l-full overflow-hidden flex justify-end">
                  <div
                    className="h-full bg-orange-500 rounded-l-full transition-all"
                    style={{
                      width: `${homePercent}%`,
                    }}
                  />
                </div>

                <div className="flex-1 bg-gray-100 rounded-r-full overflow-hidden">
                  <div
                    className="h-full bg-gray-300 rounded-r-full transition-all"
                    style={{
                      width: `${100 - homePercent}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LineupsSection({
  lineups,
  homeId,
}: {
  lineups: TeamLineup[];
  homeId: number;
}) {
  if (lineups.length === 0) {
    return (
      <EmptyState
        title="Lineups Not Available"
        text="Starting lineups have not been provided for this match yet."
      />
    );
  }

  const homeLineup =
    lineups.find((lineup) => lineup.team.id === homeId) ||
    lineups[0];

  const awayLineup =
    lineups.find((lineup) => lineup.team.id !== homeId) ||
    lineups[1];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <LineupCard lineup={homeLineup} />

      {awayLineup && <LineupCard lineup={awayLineup} />}
    </div>
  );
}

function LineupCard({
  lineup,
}: {
  lineup: TeamLineup;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-black truncate">
            {lineup.team.name}
          </h2>

          {lineup.formation && (
            <span className="shrink-0 text-[10px] font-black text-orange-500 bg-orange-50 px-2.5 py-1 rounded-lg">
              {lineup.formation}
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">
          Starting XI
        </h3>

        {lineup.startXI.length > 0 ? (
          <div className="space-y-1.5">
            {lineup.startXI.map((item, index) => (
              <PlayerRow
                key={`${item.player.id}-${index}`}
                player={item.player}
              />
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-400">
            Starting lineup unavailable.
          </div>
        )}

        {lineup.substitutes.length > 0 && (
          <>
            <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mt-6 mb-3">
              Substitutes
            </h3>

            <div className="space-y-1.5">
              {lineup.substitutes.map((item, index) => (
                <PlayerRow
                  key={`sub-${item.player.id}-${index}`}
                  player={item.player}
                  substitute
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PlayerRow({
  player,
  substitute = false,
}: {
  player: LineupPlayer["player"];
  substitute?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
        substitute ? "bg-gray-50" : "bg-white border border-gray-100"
      }`}
    >
      <span
        className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${
          substitute
            ? "bg-gray-100 text-gray-500"
            : "bg-orange-50 text-orange-500"
        }`}
      >
        {player.number}
      </span>

      <span className="text-xs font-bold text-gray-700 flex-1 truncate">
        {player.name}
      </span>

      <span className="text-[9px] font-black text-gray-400">
        {player.pos}
      </span>
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
    <div className="px-5 py-4 border-b border-gray-100 sm:nth-[3]:border-b-0">
      <div className="text-[10px] uppercase tracking-wider font-black text-gray-400">
        {label}
      </div>

      <div className="text-xs font-bold text-gray-700 mt-1">
        {value}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-5 py-14 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
        <span className="text-sm font-black text-gray-400">—</span>
      </div>

      <h2 className="text-sm font-black text-gray-800">{title}</h2>

      <p className="text-xs text-gray-400 mt-1">{text}</p>
    </div>
  );
}

function parseStatisticValue(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = parseFloat(String(value).replace("%", ""));

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatStatisticValue(
  value: number | string | null | undefined
) {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  return String(value);
}

function formatStatisticName(type: string) {
  const names: Record<string, string> = {
    "Shots on Goal": "Shots on Goal",
    "Shots off Goal": "Shots off Goal",
    "Total Shots": "Total Shots",
    "Blocked Shots": "Blocked Shots",
    "Shots insidebox": "Shots Inside Box",
    "Shots outsidebox": "Shots Outside Box",
    Fouls: "Fouls",
    "Corner Kicks": "Corners",
    Offsides: "Offsides",
    "Ball Possession": "Possession",
    "Yellow Cards": "Yellow Cards",
    "Red Cards": "Red Cards",
    "Goalkeeper Saves": "Goalkeeper Saves",
    "Total passes": "Total Passes",
    "Passes accurate": "Accurate Passes",
    "Passes %": "Pass Accuracy",
    "expected_goals": "Expected Goals",
  };

  return names[type] || type;
}
