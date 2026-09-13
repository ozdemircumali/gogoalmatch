"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LEAGUES } from "@/lib/leagues";

type Fixture = {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      elapsed: number | null;
    };
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
};

type Standing = {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group?: string;
  form?: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
};

type LeagueData = {
  league: {
    id: number;
    name: string;
    logo: string;
    country: string;
  } | null;
  standings: Standing[];
  fixtures: Fixture[];
};

type Tab = "standings" | "fixtures" | "results" | "upcoming" | "teams";

const FINISHED_STATUSES = ["FT", "AET", "PEN"];

const UPCOMING_STATUSES = [
  "NS",
  "TBD",
  "PST",
  "CANC",
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function LeaguePage({
  params,
}: {
  params: { slug: string };
}) {
  const league = LEAGUES.find((item) => item.slug === params.slug);

  const [data, setData] = useState<LeagueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("standings");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!league) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadLeague() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/leagues/${league.id}`, {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Failed to load league");
        }

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError("Unable to load league information.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadLeague();

    return () => {
      cancelled = true;
    };
  }, [league]);

  const results = useMemo(() => {
    if (!data) return [];

    return data.fixtures
      .filter((match) => FINISHED_STATUSES.includes(match.fixture.status.short))
      .sort(
        (a, b) =>
          new Date(b.fixture.date).getTime() -
          new Date(a.fixture.date).getTime()
      );
  }, [data]);

  const upcoming = useMemo(() => {
    if (!data) return [];

    return data.fixtures
      .filter((match) => UPCOMING_STATUSES.includes(match.fixture.status.short))
      .sort(
        (a, b) =>
          new Date(a.fixture.date).getTime() -
          new Date(b.fixture.date).getTime()
      );
  }, [data]);

  const fixtures = useMemo(() => {
    if (!data) return [];

    return [...data.fixtures].sort(
      (a, b) =>
        new Date(a.fixture.date).getTime() -
        new Date(b.fixture.date).getTime()
    );
  }, [data]);

  if (!league) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/"
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            ← Back to GoGoalMatch
          </Link>

          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <h1 className="text-2xl font-bold">League not found</h1>
            <p className="mt-2 text-slate-400">
              The requested league does not exist.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const displayLeague = data?.league || {
    id: league.id,
    name: league.name,
    logo: "",
    country: league.country,
  };

  return (
    <main className="min-h-screen bg-slate-950 px-3 py-5 text-slate-100 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-white"
          >
            GoGoalMatch
          </Link>

          <Link
            href="/matches"
            className="text-sm text-slate-400 transition hover:text-emerald-400"
          >
            Matches
          </Link>
        </header>

        <section className="rounded-2xl border border-emerald-900/50 bg-slate-900/80 p-5 shadow-xl">
          <div className="flex items-center gap-4">
            {displayLeague.logo ? (
              <img
                src={displayLeague.logo}
                alt={displayLeague.name}
                className="h-16 w-16 rounded-xl object-contain"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-800 text-2xl">
                L
              </div>
            )}

            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-400">
                {displayLeague.country}
              </p>

              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                {displayLeague.name}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {new Date().getFullYear()} Season
              </p>
            </div>
          </div>
        </section>

        <nav className="mt-5 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <div className="flex min-w-max">
            {[
              ["standings", "Standings"],
              ["fixtures", "Fixtures"],
              ["results", "Results"],
              ["upcoming", "Upcoming"],
              ["teams", "Teams"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setActiveTab(value as Tab)}
                className={`border-b-2 px-5 py-4 text-sm font-semibold transition ${
                  activeTab === value
                    ? "border-emerald-400 text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>

        {loading && (
          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <p className="text-slate-400">Loading league information...</p>
          </div>
        )}

        {error && !loading && (
          <div className="mt-5 rounded-2xl border border-red-900/50 bg-red-950/20 p-8 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {data && !loading && !error && (
          <>
            {activeTab === "standings" && (
              <section className="mt-5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                <div className="border-b border-slate-800 px-4 py-4">
                  <h2 className="text-lg font-bold">Standings</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    League table
                  </p>
                </div>

                {data.standings.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    Standings are not available for this league.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-sm">
                      <thead className="bg-slate-950/70 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-3 py-3 text-left">#</th>
                          <th className="px-3 py-3 text-left">Team</th>
                          <th className="px-3 py-3">P</th>
                          <th className="px-3 py-3">W</th>
                          <th className="px-3 py-3">D</th>
                          <th className="px-3 py-3">L</th>
                          <th className="px-3 py-3">GD</th>
                          <th className="px-3 py-3">Pts</th>
                        </tr>
                      </thead>

                      <tbody>
                        {data.standings.map((team) => (
                          <tr
                            key={team.team.id}
                            className="border-t border-slate-800 transition hover:bg-slate-800/50"
                          >
                            <td className="px-3 py-3 font-bold text-slate-400">
                              {team.rank}
                            </td>

                            <td className="px-3 py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={team.team.logo}
                                  alt=""
                                  className="h-7 w-7 object-contain"
                                />
                                <span className="font-medium">
                                  {team.team.name}
                                </span>
                              </div>
                            </td>

                            <td className="px-3 py-3 text-center">
                              {team.all.played}
                            </td>

                            <td className="px-3 py-3 text-center">
                              {team.all.win}
                            </td>

                            <td className="px-3 py-3 text-center">
                              {team.all.draw}
                            </td>

                            <td className="px-3 py-3 text-center">
                              {team.all.lose}
                            </td>

                            <td className="px-3 py-3 text-center">
                              {team.goalsDiff > 0
                                ? `+${team.goalsDiff}`
                                : team.goalsDiff}
                            </td>

                            <td className="px-3 py-3 text-center font-bold text-emerald-400">
                              {team.points}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {(activeTab === "fixtures" ||
              activeTab === "results" ||
              activeTab === "upcoming") && (
              <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-900">
                <div className="border-b border-slate-800 px-4 py-4">
                  <h2 className="text-lg font-bold">
                    {activeTab === "fixtures"
                      ? "Fixtures"
                      : activeTab === "results"
                      ? "Results"
                      : "Upcoming Matches"}
                  </h2>
                </div>

                <div className="divide-y divide-slate-800">
                  {(activeTab === "fixtures"
                    ? fixtures
                    : activeTab === "results"
                    ? results
                    : upcoming
                  ).map((match) => {
                    const finished = FINISHED_STATUSES.includes(
                      match.fixture.status.short
                    );

                    return (
                      <Link
                        href={`/matches/${match.fixture.id}`}
                        key={match.fixture.id}
                        className="block px-4 py-4 transition hover:bg-slate-800/50"
                      >
                        <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                          <span>{formatDate(match.fixture.date)}</span>

                          <span>
                            {finished
                              ? match.fixture.status.short
                              : formatTime(match.fixture.date)}
                          </span>
                        </div>

                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                          <div className="flex items-center justify-end gap-2 text-right">
                            <span className="text-sm font-semibold">
                              {match.teams.home.name}
                            </span>

                            <img
                              src={match.teams.home.logo}
                              alt=""
                              className="h-7 w-7 object-contain"
                            />
                          </div>

                          <div className="min-w-[55px] text-center text-lg font-bold">
                            {finished
                              ? `${match.goals.home ?? 0} - ${
                                  match.goals.away ?? 0
                                }`
                              : "vs"}
                          </div>

                          <div className="flex items-center gap-2">
                            <img
                              src={match.teams.away.logo}
                              alt=""
                              className="h-7 w-7 object-contain"
                            />

                            <span className="text-sm font-semibold">
                              {match.teams.away.name}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {(activeTab === "fixtures"
                  ? fixtures
                  : activeTab === "results"
                  ? results
                  : upcoming
                ).length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    No matches available.
                  </div>
                )}
              </section>
            )}

            {activeTab === "teams" && (
              <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-900">
                <div className="border-b border-slate-800 px-4 py-4">
                  <h2 className="text-lg font-bold">Teams</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Teams currently listed in the standings
                  </p>
                </div>

                {data.standings.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    Team information is not available.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                    {data.standings.map((team) => (
                      <div
                        key={team.team.id}
                        className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                      >
                        <img
                          src={team.team.logo}
                          alt=""
                          className="h-10 w-10 object-contain"
                        />

                        <div>
                          <p className="font-semibold">
                            {team.team.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {team.points} points
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}

        <footer className="mt-8 border-t border-slate-800 py-6 text-center">
          <Link
            href="/"
            className="text-sm font-semibold text-emerald-400 hover:text-emerald-300"
          >
            GoGoalMatch
          </Link>

          <p className="mt-2 text-xs text-slate-600">
            Live Scores, Results and Football Statistics
          </p>
        </footer>
      </div>
    </main>
  );
}
