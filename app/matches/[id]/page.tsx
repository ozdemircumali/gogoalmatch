"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type MatchEvent = {
  time: { elapsed: number; extra?: number };
  team: { id: number; name: string };
  player: { name: string };
  assist?: { name: string };
  type: string;
  detail: string;
};

type MatchStatistic = {
  type: string;
  value: number | string | null;
};

type TeamStatistics = {
  team: { id: number; name: string };
  statistics: MatchStatistic[];
};

type Player = {
  id: number;
  name: string;
  number: number;
  pos: string;
};

type Lineup = {
  team: { id: number; name: string };
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
    venue?: { name?: string | null; city?: string | null };
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

const LIVE = ["1H", "2H", "HT", "ET", "BT", "P"];
const FINISHED = ["FT", "AET", "PEN"];

type Tab = "SUMMARY" | "STATISTICS" | "LINEUPS";

export default function MatchDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("SUMMARY");

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/fixtures/${id}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Request failed");

        const data = await res.json();

        if (!cancelled) {
          setMatch(data?.response?.[0] ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setMatch(null);
          setLoading(false);
        }
      }
    }

    load();

    const timer = setInterval(load, 30000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f3f4f6] flex items-center justify-center">
        <span className="text-xs font-bold text-gray-500">
          Loading match...
        </span>
      </main>
    );
  }

  if (!match) {
    return (
      <main className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="font-black text-gray-900">
            Match Not Found
          </div>
          <Link
            href="/"
            className="inline-block mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-black"
          >
            Back to Matches
          </Link>
        </div>
      </main>
    );
  }

  const status = match.fixture.status.short;
  const isLive = LIVE.includes(status);
  const isFinished = FINISHED.includes(status);

  const homeScore = match.goals.home ?? 0;
  const awayScore = match.goals.away ?? 0;

  const kickoff = new Date(match.fixture.date).toLocaleTimeString(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <main className="min-h-screen bg-[#f3f4f6] text-gray-900">
      <div className="max-w-4xl mx-auto">

        {/* TOP BAR */}
        <div className="h-11 px-3 flex items-center justify-between bg-[#111827] text-white">
          <Link
            href="/"
            className="text-[11px] font-bold text-gray-300 hover:text-white"
          >
            ← Matches
          </Link>

          <div className="flex items-center gap-1.5 max-w-[60%]">
            <img
              src={match.league.logo}
              alt=""
              width={18}
              height={18}
              style={{
                width: "18px",
                height: "18px",
                objectFit: "contain",
              }}
            />

            <span className="text-[10px] font-black truncate">
              {match.league.name}
            </span>
          </div>
        </div>

        {/* SCOREBOARD */}
        <section className="bg-white border-b border-gray-200">
          <div className="h-0.5 bg-orange-500" />

          <div className="px-3 py-4 sm:px-8 sm:py-5">

            <div className="flex justify-center mb-3">
              <Status
                live={isLive}
                finished={isFinished}
                elapsed={match.fixture.status.elapsed}
                status={status}
                kickoff={kickoff}
              />
            </div>

            <div className="grid grid-cols-[1fr_92px_1fr] sm:grid-cols-[1fr_130px_1fr] items-center">

              <Team
                name={match.teams.home.name}
                logo={match.teams.home.logo}
                winner={match.teams.home.winner}
              />

              <div className="text-center">
                {isLive || isFinished ? (
                  <>
                    <div className="text-[32px] sm:text-[42px] leading-none font-black tracking-tight">
                      {homeScore}
                      <span className="mx-1.5 text-gray-300">
                        -
                      </span>
                      {awayScore}
                    </div>

                    {match.score.halftime.home !== null &&
                      match.score.halftime.away !== null && (
                        <div className="mt-1.5 text-[8px] font-bold text-gray-400">
                          HT {match.score.halftime.home} -{" "}
                          {match.score.halftime.away}
                        </div>
                      )}
                  </>
                ) : (
                  <>
                    <div className="text-xl font-black">
                      {kickoff}
                    </div>
                    <div className="text-[8px] text-gray-400 mt-1 font-bold">
                      {new Date(match.fixture.date).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </div>
                  </>
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

        {/* TABS */}
        <div className="px-2 pt-2">
          <div className="bg-white border border-gray-200 rounded-lg p-0.5 flex">
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
        </div>

        {/* CONTENT */}
        <div className="px-2 pt-2 pb-6">
          {tab === "SUMMARY" && (
            <Summary
              events={match.events ?? []}
              homeId={match.teams.home.id}
            />
          )}

          {tab === "STATISTICS" && (
            <Statistics
              statistics={match.statistics ?? []}
              homeId={match.teams.home.id}
            />
          )}

          {tab === "LINEUPS" && (
            <Lineups
              lineups={match.lineups ?? []}
              homeId={match.teams.home.id}
            />
          )}

          <Information match={match} />
        </div>
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
    <div className="flex flex-col items-center justify-center min-w-0 px-1">
      <div
        style={{
          width: "38px",
          height: "38px",
          minWidth: "38px",
          minHeight: "38px",
          maxWidth: "38px",
          maxHeight: "38px",
        }}
        className="flex items-center justify-center"
      >
        <img
          src={logo}
          alt=""
          width={38}
          height={38}
          style={{
            width: "38px",
            height: "38px",
            maxWidth: "38px",
            maxHeight: "38px",
            objectFit: "contain",
          }}
        />
      </div>

      <div
        className={`mt-1.5 text-[10px] sm:text-[11px] leading-tight text-center truncate w-full max-w-[125px] ${
          winner === true
            ? "font-black text-gray-900"
            : "font-bold text-gray-600"
        }`}
      >
        {name}
      </div>
    </div>
  );
}

function Status({
  live,
  finished,
  elapsed,
  status,
  kickoff,
}: {
  live: boolean;
  finished: boolean;
  elapsed: number | null;
  status: string;
  kickoff: string;
}) {
  if (live) {
    return (
      <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 rounded-full px-2.5 py-1 text-[9px] font-black">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
        {elapsed !== null ? `${elapsed}'` : "LIVE"}
      </span>
    );
  }

  if (finished) {
    return (
      <span className="bg-gray-100 text-gray-500 rounded-full px-2.5 py-1 text-[9px] font-black">
        {status === "PEN" ? "PENALTIES" : "FULL TIME"}
      </span>
    );
  }

  return (
    <span className="bg-orange-50 text-orange-600 rounded-full px-2.5 py-1 text-[9px] font-black">
      {kickoff}
    </span>
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
      className={`flex-1 h-8 rounded-md text-[10px] font-black ${
        active
          ? "bg-orange-500 text-white"
          : "text-gray-500"
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
    (a, b) =>
      a.time.elapsed - b.time.elapsed ||
      (a.time.extra || 0) - (b.time.extra || 0)
  );

  return (
    <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <Header title="Match Events" />

      {sorted.length === 0 ? (
        <div className="py-8 text-center">
          <div className="text-[11px] font-black text-gray-500">
            No events
          </div>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {sorted.map((event, index) => {
            const home = event.team.id === homeId;
            const goal =
              event.type.toLowerCase() === "goal";
            const card =
              event.type.toLowerCase() === "card";

            return (
              <div
                key={`${event.time.elapsed}-${index}`}
                className="grid grid-cols-[42px_1fr_42px] items-center min-h-[48px] px-3"
              >
                <div
                  className={`text-[10px] font-black ${
                    home
                      ? "text-right pr-2"
                      : "text-left pl-2"
                  }`}
                >
                  {home
                    ? `${event.time.elapsed}${event.time.extra ? `+${event.time.extra}` : ""}'`
                    : ""}
                </div>

                <div
                  className={`flex items-center gap-2 ${
                    home
                      ? "justify-end text-right"
                      : "justify-start"
                  }`}
                >
                  {!home && (
                    <span className="text-[10px] font-black text-gray-500 w-7">
                      {event.time.elapsed}
                      {event.time.extra
                        ? `+${event.time.extra}`
                        : ""}
                      '
                    </span>
                  )}

                  <span
                    className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[8px] font-black ${
                      goal
                        ? "bg-orange-500 text-white"
                        : card
                          ? "bg-yellow-400 text-white"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {goal ? "G" : card ? "C" : "•"}
                  </span>

                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-gray-800 truncate">
                      {event.player?.name || "Unknown"}
                    </div>

                    <div className="text-[8px] text-gray-400 truncate">
                      {event.detail || event.type}
                    </div>

                    {event.assist?.name && (
                      <div className="text-[8px] text-gray-400 truncate">
                        Assist: {event.assist.name}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`text-[10px] font-black ${
                    !home
                      ? "text-left pl-2"
                      : "text-right pr-2"
                  }`}
                >
                  {!home
                    ? `${event.time.elapsed}${event.time.extra ? `+${event.time.extra}` : ""}'`
                    : ""}
                </div>
              </div>
            );
          })}
        </div>
      )}
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
        title="Statistics unavailable"
        text="No statistics are available."
      />
    );
  }

  const home =
    statistics.find((x) => x.team.id === homeId) ||
    statistics[0];

  const away =
    statistics.find((x) => x.team.id !== homeId) ||
    statistics[1];

  const awayMap = new Map(
    away.statistics.map((x) => [x.type, x.value])
  );

  return (
    <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <Header title="Statistics" />

      <div className="px-3 py-4">
        <div className="grid grid-cols-3 text-[9px] font-black mb-4">
          <span className="truncate">
            {home.team.name}
          </span>

          <span className="text-center text-gray-400">
            STATISTICS
          </span>

          <span className="text-right truncate">
            {away.team.name}
          </span>
        </div>

        <div className="space-y-4">
          {home.statistics.map((item, index) => {
            const awayValue = awayMap.get(item.type);

            const h = numberValue(item.value);
            const a = numberValue(awayValue);
            const total = h + a;
            const homePercent =
              total > 0 ? (h / total) * 100 : 50;

            return (
              <div key={`${item.type}-${index}`}>
                <div className="grid grid-cols-[35px_1fr_35px] items-center mb-1">
                  <span className="text-[9px] font-black">
                    {item.value ?? 0}
                  </span>

                  <span className="text-[8px] font-bold text-gray-400 text-center truncate">
                    {item.type}
                  </span>

                  <span className="text-[9px] font-black text-right">
                    {awayValue ?? 0}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 h-1.5">
                  <div className="bg-gray-100 rounded-l-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500"
                      style={{
                        width: `${homePercent}%`,
                      }}
                    />
                  </div>

                  <div className="bg-gray-100 rounded-r-full overflow-hidden">
                    <div
                      className="h-full bg-gray-400"
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
        title="Lineups unavailable"
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <LineupCard lineup={home} />
      {away && <LineupCard lineup={away} />}
    </div>
  );
}

function LineupCard({ lineup }: { lineup: Lineup }) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-3 py-2.5 border-b border-gray-100 flex items-center justify-between">
        <span className="text-[10px] font-black truncate">
          {lineup.team.name}
        </span>

        <span className="text-[8px] font-black text-orange-600 bg-orange-50 rounded px-1.5 py-1">
          {lineup.formation || "XI"}
        </span>
      </div>

      <div className="p-2.5">
        <div className="text-[8px] font-black uppercase text-gray-400 mb-1.5">
          Starting XI
        </div>

        <div className="space-y-1">
          {lineup.startXI.map((item, index) => (
            <Player
              key={`${item.player.id}-${index}`}
              player={item.player}
            />
          ))}
        </div>

        {lineup.substitutes.length > 0 && (
          <>
            <div className="text-[8px] font-black uppercase text-gray-400 mt-4 mb-1.5">
              Substitutes
            </div>

            <div className="space-y-1">
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
    <div className="h-7 px-2 flex items-center gap-2 bg-gray-50 rounded">
      <span className="w-5 h-5 shrink-0 bg-white border border-gray-200 rounded flex items-center justify-center text-[8px] font-black text-orange-500">
        {player.number}
      </span>

      <span className="text-[9px] font-bold truncate flex-1">
        {player.name}
      </span>

      <span className="text-[7px] font-black text-gray-400">
        {player.pos}
      </span>
    </div>
  );
}

function Information({
  match,
}: {
  match: MatchDetail;
}) {
  return (
    <section className="mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden">
      <Header title="Match Information" />

      <div className="grid grid-cols-2 sm:grid-cols-4">
        <Info
          label="Venue"
          value={match.fixture.venue?.name || "N/A"}
        />

        <Info
          label="City"
          value={match.fixture.venue?.city || "N/A"}
        />

        <Info
          label="Referee"
          value={match.fixture.referee || "N/A"}
        />

        <Info
          label="Competition"
          value={match.league.name}
        />
      </div>
    </section>
  );
}

function Header({ title }: { title: string }) {
  return (
    <div className="h-10 px-3 flex items-center border-b border-gray-100">
      <h2 className="text-[10px] font-black uppercase tracking-wide">
        {title}
      </h2>
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
    <div className="px-3 py-2.5 border-b border-gray-100 min-w-0">
      <div className="text-[7px] uppercase font-black tracking-wide text-gray-400">
        {label}
      </div>

      <div className="mt-0.5 text-[9px] font-bold text-gray-700 truncate">
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
    <section className="bg-white border border-gray-200 rounded-lg p-8 text-center">
      <div className="text-[10px] font-black text-gray-600">
        {title}
      </div>

      <div className="text-[9px] text-gray-400 mt-1">
        {text}
      </div>
    </section>
  );
}

function numberValue(
  value: number | string | null | undefined
) {
  if (value === null || value === undefined) return 0;

  const n = parseFloat(
    String(value).replace("%", "")
  );

  return Number.isFinite(n) ? n : 0;
}
