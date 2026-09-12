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

type Player = {
  id: number;
  name: string;
  number: number;
  pos: string;
};

type Lineup = {
  team: {
    id: number;
    name: string;
  };
  formation: string;
  startXI: { player: Player }[];
  substitutes: { player: Player }[];
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
  lineups?: Lineup[];
};

const LIVE_STATUSES = ["1H", "2H", "HT", "ET", "BT", "P"];
const FINISHED_STATUSES = ["FT", "AET", "PEN"];

type Tab = "SUMMARY" | "STATISTICS" | "LINEUPS";

export default function MatchDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("SUMMARY");

  useEffect(() => {
    if (!id) return;

    let stopped = false;

    const load = async () => {
      try {
        const response = await fetch(`/api/fixtures/${id}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Match request failed");
        }

        const data = await response.json();

        if (!stopped) {
          setMatch(
            data?.response?.length > 0 ? data.response[0] : null
          );
          setLoading(false);
        }
      } catch (error) {
        console.error(error);

        if (!stopped) {
          setMatch(null);
          setLoading(false);
        }
      }
    };

    load();

    const interval = setInterval(load, 30000);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
        <div className="text-sm font-bold text-gray-500">
          Loading match...
        </div>
      </main>
    );
  }

  if (!match) {
    return (
      <main className="min-h-screen bg-[#f5f6f8] flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center max-w-sm w-full">
          <h1 className="text-lg font-black text-gray-900">
            Match Not Found
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            This match is unavailable.
          </p>

          <Link
            href="/"
            className="inline-block mt-6 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl text-sm font-bold"
          >
            Back to Matches
          </Link>
        </div>
      </main>
    );
  }

  const status = match.fixture.status.short;
  const live = LIVE_STATUSES.includes(status);
  const finished = FINISHED_STATUSES.includes(status);

  const homeScore = match.goals.home ?? 0;
  const awayScore = match.goals.away ?? 0;

  const time = new Date(match.fixture.date).toLocaleTimeString(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-gray-900 pb-10">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-bold text-gray-500 hover:text-orange-500"
          >
            ← All Matches
          </Link>

          <div className="flex items-center gap-2 max-w-[55%]">
            {match.league.logo && (
              <img
                src={match.league.logo}
                alt=""
                className="w-6 h-6 object-contain"
              />
            )}

            <div className="min-w-0">
              <div className="text-xs font-black truncate">
                {match.league.name}
              </div>

              <div className="text-[10px] text-gray-400 truncate">
                {match.league.country}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-4">
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-1 bg-orange-500" />

          <div className="px-4 sm:px-10 py-7 sm:py-9">
            <div className="text-center mb-8">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  live
                    ? "bg-red-50 text-red-600"
                    : finished
                      ? "bg-gray-100 text-gray-500"
                      : "bg-orange-50 text-orange-600"
                }`}
              >
                {live && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}

                {live
                  ? match.fixture.status.elapsed != null
                    ? `${match.fixture.status.elapsed}'`
                    : "LIVE"
                  : finished
                    ? "FULL TIME"
                    : time}
              </span>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-10">
              <Team
                name={match.teams.home.name}
                logo={match.teams.home.logo}
                winner={match.teams.home.winner}
              />

              <div className="text-center">
                {live || finished ? (
                  <>
                    <div className="text-4xl sm:text-6xl font-black tracking-tight">
                      {homeScore}
                      <span className="text-gray-300 mx-2 sm:mx-4">
                        -
                      </span>
                      {awayScore}
                    </div>

                    {match.score.halftime.home !== null &&
                      match.score.halftime.away !== null && (
                        <div className="mt-2 text-[10px] font-bold text-gray-400">
                          HALF TIME {match.score.halftime.home} -{" "}
                          {match.score.halftime.away}
                        </div>
                      )}
                  </>
                ) : (
                  <div className="text-2xl sm:text-3xl font-black">
                    {time}
                  </div>
                )}
              </div>

              <Team
                name={match.teams.away.name}
                logo={match.teams.away.logo}
                winner={match.teams.away.winner}
              />
            </div>
          </div>
        </section>

        <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-1.5 flex">
          <Tab
            active={tab === "SUMMARY"}
            onClick={() => setTab("SUMMARY")}
          >
            Summary
          </Tab>

          <Tab
            active={tab === "STATISTICS"}
            onClick={() => setTab("STATISTICS")}
          >
            Statistics
          </Tab>

          <Tab
            active={tab === "LINEUPS"}
            onClick={() => setTab("LINEUPS")}
          >
            Lineups
          </Tab>
        </div>

        <div className="mt-4">
          {tab === "SUMMARY" && (
            <Summary
              events={match.events || []}
              homeId={match.teams.home.id}
            />
          )}

          {tab === "STATISTICS" && (
            <Statistics
              statistics={match.statistics || []}
              homeId={match.teams.home.id}
            />
          )}

          {tab === "LINEUPS" && (
            <Lineups
              lineups={match.lineups || []}
              homeId={match.teams.home.id}
            />
          )}
        </div>

        <section className="mt-4 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-black">Match Information</h2>
          </div>

          <div className="grid grid-cols-2">
            <Info
              label="Venue"
              value={
                match.fixture.venue?.name ||
                "Not available"
              }
            />

            <Info
              label="City"
              value={
                match.fixture.venue?.city ||
                "Not available"
              }
            />

            <Info
              label="Referee"
              value={
                match.fixture.referee ||
                "Not available"
              }
            />

            <Info
              label="Competition"
              value={match.league.name}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function Team({
  name,
  logo,
  winner,
}: {
  name: string;
  logo: string;
  winner: boolean | null;
}) {
  return (
    <div className="flex flex-col items-center text-center min-w-0">
      <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
        <img
          src={logo}
          alt={name}
          className="w-full h-full object-contain"
        />
      </div>

      <div
        className={`mt-3 text-xs sm:text-sm max-w-[140px] sm:max-w-[210px] leading-tight ${
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

function Tab({
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
      className={`flex-1 py-3 rounded-xl text-xs font-black transition ${
        active
          ? "bg-orange-500 text-white"
          : "text-gray-500 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function Summary({
  events,
  homeId,
}: {
  events: MatchEvent[];
  homeId: number;
}) {
  const sorted = [...events].sort(
    (a, b) => a.time.elapsed - b.time.elapsed
  );

  if (sorted.length === 0) {
    return (
      <Empty
        title="No Events"
        text="No match events are available."
      />
    );
  }

  return (
    <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-black">Match Events</h2>
      </div>

      <div className="p-4 sm:p-6 space-y-2">
        {sorted.map((event, index) => {
          const home = event.team.id === homeId;
          const goal = event.type.toLowerCase() === "goal";
          const card = event.type.toLowerCase() === "card";

          return (
            <div
              key={index}
              className={`flex items-center gap-3 ${
                home ? "" : "flex-row-reverse"
              }`}
            >
              <div className="w-10 text-center shrink-0">
                <span className="text-[11px] font-black text-orange-500">
                  {event.time.elapsed}
                  {event.time.extra
                    ? `+${event.time.extra}`
                    : ""}
                  '
                </span>
              </div>

              <div
                className={`flex-1 flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 ${
                  home ? "" : "flex-row-reverse text-right"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                    goal
                      ? "bg-orange-100 text-orange-600"
                      : card
                        ? "bg-yellow-50 text-yellow-600"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {goal ? "G" : card ? "C" : "•"}
                </div>

                <div>
                  <div className="text-xs font-black text-gray-900">
                    {event.player?.name || "Unknown"}
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
    </section>
  );
}

function Statistics({
  statistics,
  homeId,
}: {
  statistics: TeamStatistics[];
  homeId: number;
}) {
  if (statistics.length < 2) {
    return (
      <Empty
        title="Statistics Unavailable"
        text="Statistics are not available for this match."
      />
    );
  }

  const home =
    statistics.find((x) => x.team.id === homeId) ||
    statistics[0];

  const away =
    statistics.find((x) => x.team.id !== homeId) ||
    statistics[1];

  const awayValues = new Map(
    away.statistics.map((x) => [x.type, x.value])
  );

  return (
    <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-black">Match Statistics</h2>
      </div>

      <div className="p-5 sm:p-7 space-y-6">
        {home.statistics.map((item, index) => {
          const awayValue = awayValues.get(item.type);

          const h = numberValue(item.value);
          const a = numberValue(awayValue);
          const total = h + a;

          const hp = total > 0 ? (h / total) * 100 : 50;

          return (
            <div key={`${item.type}-${index}`}>
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center mb-2">
                <span className="text-xs font-black">
                  {item.value ?? 0}
                </span>

                <span className="text-[10px] font-bold text-gray-400 text-center">
                  {item.type}
                </span>

                <span className="text-xs font-black text-right">
                  {awayValue ?? 0}
                </span>
              </div>

              <div className="flex gap-1 h-2">
                <div className="flex-1 bg-gray-100 rounded-l-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500"
                    style={{ width: `${hp}%` }}
                  />
                </div>

                <div className="flex-1 bg-gray-100 rounded-r-full overflow-hidden">
                  <div
                    className="h-full bg-gray-300"
                    style={{ width: `${100 - hp}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Lineups({
  lineups,
  homeId,
}: {
  lineups: Lineup[];
  homeId: number;
}) {
  if (lineups.length === 0) {
    return (
      <Empty
        title="Lineups Unavailable"
        text="Lineup information is not available yet."
      />
    );
  }

  const home =
    lineups.find((x) => x.team.id === homeId) ||
    lineups[0];

  const away =
    lineups.find((x) => x.team.id !== homeId) ||
    lineups[1];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <LineupCard lineup={home} />

      {away && <LineupCard lineup={away} />}
    </div>
  );
}

function LineupCard({ lineup }: { lineup: Lineup }) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <h2 className="text-sm font-black truncate">
          {lineup.team.name}
        </h2>

        <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2.5 py-1 rounded-lg">
          {lineup.formation || "Lineup"}
        </span>
      </div>

      <div className="p-5">
        <div className="text-[10px] uppercase tracking-wider font-black text-gray-400 mb-3">
          Starting XI
        </div>

        <div className="space-y-1.5">
          {lineup.startXI.map((item, index) => (
            <Player
              key={`${item.player.id}-${index}`}
              player={item.player}
            />
          ))}
        </div>

        {lineup.substitutes.length > 0 && (
          <>
            <div className="text-[10px] uppercase tracking-wider font-black text-gray-400 mt-6 mb-3">
              Substitutes
            </div>

            <div className="space-y-1.5">
              {lineup.substitutes.map((item, index) => (
                <Player
                  key={`sub-${item.player.id}-${index}`}
                  player={item.player}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function Player({ player }: { player: Player }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
      <span className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[10px] font-black text-orange-500">
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

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="px-5 py-4 border-b border-gray-100">
      <div className="text-[9px] uppercase tracking-wider font-black text-gray-400">
        {label}
      </div>

      <div className="text-xs font-bold text-gray-700 mt-1">
        {value}
      </div>
    </div>
  );
}

function Empty({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
      <h2 className="text-sm font-black text-gray-800">
        {title}
      </h2>

      <p className="text-xs text-gray-400 mt-2">
        {text}
      </p>
    </section>
  );
}

function numberValue(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  const number = parseFloat(String(value).replace("%", ""));

  return Number.isFinite(number) ? number : 0;
}
