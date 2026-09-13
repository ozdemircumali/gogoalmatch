"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Trophy,
  Search,
  Star,
  ChevronRight,
  RefreshCw,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { LEAGUES } from "../lib/leagues";

interface ApiTeam {
  id?: number;
  name?: string;
  logo?: string;
}

interface ApiLeague {
  id?: number;
  name?: string;
  country?: string;
  logo?: string;
}

interface ApiFixture {
  fixture?: {
    id?: number;
    date?: string;
    timestamp?: number;
    status?: {
      long?: string;
      short?: string;
      elapsed?: number | null;
    };
    venue?: {
      name?: string | null;
    };
    referee?: string | null;
  };
  league?: ApiLeague;
  teams?: {
    home?: ApiTeam;
    away?: ApiTeam;
  };
  goals?: {
    home?: number | null;
    away?: number | null;
  };
}

interface Match {
  id: string;
  minute: string;
  status: string;
  isLive: boolean;
  isFinished: boolean;
  isUpcoming: boolean;
  homeTeam: string;
  homeLogo: string;
  homeScore: number | string;
  awayTeam: string;
  awayLogo: string;
  awayScore: number | string;
  leagueId: string;
  leagueName: string;
  country: string;
}

type Filter = "all" | "live" | "upcoming" | "finished" | "favorites";

const LIVE_STATUSES = ["1H", "2H", "HT", "ET", "BT", "P"];
const FINISHED_STATUSES = ["FT", "AET", "PEN"];

function convertFixture(fixture: ApiFixture): Match | null {
  const id = fixture.fixture?.id;

  if (!id) return null;

  const status = fixture.fixture?.status?.short || "NS";
  const elapsed = fixture.fixture?.status?.elapsed;

  const home = fixture.teams?.home;
  const away = fixture.teams?.away;

  const isLive = LIVE_STATUSES.includes(status);
  const isFinished = FINISHED_STATUSES.includes(status);

  let minute = "";

  if (isLive) {
    if (status === "HT") {
      minute = "HT";
    } else if (status === "BT") {
      minute = "BT";
    } else if (status === "P") {
      minute = "P";
    } else if (elapsed !== null && elapsed !== undefined) {
      minute = `${elapsed}'`;
    } else {
      minute = "LIVE";
    }
  } else if (isFinished) {
    minute = "FT";
  } else if (fixture.fixture?.date) {
    minute = new Date(fixture.fixture.date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    minute = status;
  }

  return {
    id: String(id),
    minute,
    status,
    isLive,
    isFinished,
    isUpcoming: !isLive && !isFinished,

    homeTeam: home?.name || "Home",
    homeLogo: home?.logo || "",
    homeScore:
      fixture.goals?.home !== null &&
      fixture.goals?.home !== undefined
        ? fixture.goals.home
        : "-",

    awayTeam: away?.name || "Away",
    awayLogo: away?.logo || "",
    awayScore:
      fixture.goals?.away !== null &&
      fixture.goals?.away !== undefined
        ? fixture.goals.away
        : "-",

    leagueId: String(fixture.league?.id || "unknown"),
    leagueName: fixture.league?.name || "Unknown League",
    country: fixture.league?.country || "",
  };
}

export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const [openCountry, setOpenCountry] = useState<string | null>(null);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(
    null
  );

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/fixtures", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      const fixtures: ApiFixture[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.response)
        ? data.response
        : Array.isArray(data?.fixtures)
        ? data.fixtures
        : [];

      const converted = fixtures
        .map(convertFixture)
        .filter((match): match is Match => match !== null);

      setMatches(converted);
    } catch (err) {
      console.error("Failed to load fixtures:", err);
      setError("Unable to load matches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();

    const interval = setInterval(() => {
      loadMatches();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ggm_favorites");

      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch {
      setFavorites([]);
    }
  }, []);

  const toggleFavorite = (
    matchId: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setFavorites((previous) => {
      const next = previous.includes(matchId)
        ? previous.filter((id) => id !== matchId)
        : [...previous, matchId];

      localStorage.setItem("ggm_favorites", JSON.stringify(next));

      return next;
    });
  };

  const countries = useMemo(() => {
    const map = new Map<string, typeof LEAGUES>();

    LEAGUES.forEach((league) => {
      if (!map.has(league.country)) {
        map.set(league.country, []);
      }

      map.get(league.country)!.push(league);
    });

    return Array.from(map.entries());
  }, []);

  const selectedLeague = useMemo(() => {
    if (!selectedLeagueId) return null;

    return (
      LEAGUES.find(
        (league) => String(league.id) === selectedLeagueId
      ) || null
    );
  }, [selectedLeagueId]);

  const filteredMatches = useMemo(() => {
    let result = matches;

    if (selectedLeagueId) {
      result = result.filter(
        (match) => match.leagueId === selectedLeagueId
      );
    }

    if (filter === "live") {
      result = result.filter((match) => match.isLive);
    }

    if (filter === "finished") {
      result = result.filter((match) => match.isFinished);
    }

    if (filter === "upcoming") {
      result = result.filter((match) => match.isUpcoming);
    }

    if (filter === "favorites") {
      result = result.filter((match) =>
        favorites.includes(match.id)
      );
    }

    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();

      result = result.filter(
        (match) =>
          match.homeTeam.toLowerCase().includes(search) ||
          match.awayTeam.toLowerCase().includes(search) ||
          match.leagueName.toLowerCase().includes(search) ||
          match.country.toLowerCase().includes(search)
      );
    }

    return result;
  }, [
    matches,
    selectedLeagueId,
    filter,
    favorites,
    searchQuery,
  ]);

  const leagues = useMemo(() => {
    const map = new Map<string, Match[]>();

    filteredMatches.forEach((match) => {
      const key = `${match.leagueId}-${match.leagueName}`;

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key)!.push(match);
    });

    return Array.from(map.entries()).map(([key, leagueMatches]) => ({
      id: key,
      name: leagueMatches[0].leagueName,
      country: leagueMatches[0].country,
      matches: leagueMatches,
    }));
  }, [filteredMatches]);

  const liveCount = matches.filter((match) => match.isLive).length;

  const selectLeague = (leagueId: number) => {
    setSelectedLeagueId(String(leagueId));
    setFilter("all");
    setMenuOpen(false);
    setOpenCountry(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showAllMatches = () => {
    setSelectedLeagueId(null);
    setFilter("all");
    setMenuOpen(false);
    setOpenCountry(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 font-sans">
      <header className="border-b border-slate-800/80 bg-[#121721]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMenuOpen(true)}
              className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-emerald-500 transition"
              aria-label="Open leagues menu"
            >
              <Menu className="w-5 h-5 text-slate-300" />
            </button>

            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/20">
              G
            </div>

            <span className="text-xl font-bold tracking-tight">
              GoGoal<span className="text-emerald-400">Match</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team or league..."
                className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-emerald-500 w-64 transition"
              />
            </div>

            <button
              onClick={loadMatches}
              className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-emerald-500 transition"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 text-slate-400 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>

            <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>LIVE {liveCount}</span>
            </span>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-[100]"
          onClick={() => setMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <aside
            className="absolute left-0 top-0 h-full w-[330px] max-w-[88vw] bg-[#10151f] border-r border-slate-800 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-[#10151f] border-b border-slate-800">
              <div className="h-16 px-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold">Football Leagues</span>
                </div>

                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-red-400 transition"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <button
                onClick={showAllMatches}
                className={`w-full px-5 py-3 text-left text-sm font-semibold border-t border-slate-800 transition ${
                  !selectedLeagueId
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                All Matches
              </button>
            </div>

            <div className="p-3 space-y-1">
              {countries.map(([country, countryLeagues]) => {
                const isOpen = openCountry === country;

                return (
                  <div
                    key={country}
                    className="rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setOpenCountry(isOpen ? null : country)
                      }
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-900 transition text-left"
                    >
                      <span className="text-sm font-semibold text-slate-200">
                        {country}
                      </span>

                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="ml-3 mr-1 mb-2 border-l border-slate-800">
                        {countryLeagues.map((league) => {
                          const isSelected =
                            selectedLeagueId === String(league.id);

                          return (
                            <button
                              key={`${country}-${league.id}`}
                              onClick={() => selectLeague(league.id)}
                              className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition ${
                                isSelected
                                  ? "text-emerald-400 bg-emerald-500/10"
                                  : "text-slate-400 hover:text-white hover:bg-slate-900"
                              }`}
                            >
                              <span>{league.name}</span>

                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {selectedLeague && (
          <div className="mb-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-500 font-bold">
                Selected League
              </div>

              <div className="text-base font-bold text-white">
                {selectedLeague.name}
              </div>

              <div className="text-xs text-slate-400">
                {selectedLeague.country}
              </div>
            </div>

            <button
              onClick={showAllMatches}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-emerald-500 transition"
            >
              Show All
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-[#121721] border border-slate-800 rounded-xl p-4 sticky top-24">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-400" />
                <span>
                  {selectedLeague ? selectedLeague.name : "Today's Leagues"}
                </span>
              </h3>

              <div className="space-y-1 max-h-[70vh] overflow-y-auto">
                {leagues.length === 0 ? (
                  <div className="text-xs text-slate-500 px-2 py-3">
                    No matches available.
                  </div>
                ) : (
                  leagues.map((league) => (
                    <div
                      key={league.id}
                      className="px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800/60"
                    >
                      <div className="font-medium truncate">
                        {league.name}
                      </div>

                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {league.country} · {league.matches.length} matches
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>

          <section className="lg:col-span-4 space-y-4">
            <div className="bg-[#121721] border border-slate-800 rounded-xl p-2 flex items-center justify-between gap-2">
              <div className="flex gap-1 overflow-x-auto">
                {(
                  [
                    ["all", `All (${matches.length})`],
                    [
                      "live",
                      `Live (${matches.filter((m) => m.isLive).length})`,
                    ],
                    ["upcoming", "Upcoming"],
                    ["finished", "Finished"],
                    ["favorites", "Favorites"],
                  ] as [Filter, string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      filter === value
                        ? "bg-emerald-500 text-slate-950"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {value === "favorites" && (
                      <Star className="w-3.5 h-3.5 inline mr-1" />
                    )}
                    {label}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-500 whitespace-nowrap hidden sm:block">
                {filteredMatches.length} matches
              </div>
            </div>

            {loading && matches.length === 0 && (
              <div className="bg-[#121721] border border-slate-800 rounded-xl p-10 text-center">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-3" />
                <p className="text-sm text-slate-400">
                  Loading matches...
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-center">
                <p className="text-sm text-red-400">{error}</p>

                <button
                  onClick={loadMatches}
                  className="mt-3 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-300 hover:bg-red-500/20"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading &&
              !error &&
              filteredMatches.length === 0 && (
                <div className="bg-[#121721] border border-slate-800 rounded-xl p-10 text-center">
                  <Trophy className="w-8 h-8 text-slate-600 mx-auto mb-3" />

                  <p className="text-sm text-slate-400">
                    {selectedLeague
                      ? `No ${selectedLeague.name} matches found today.`
                      : "No matches found."}
                  </p>
                </div>
              )}

            <div className="space-y-4">
              {leagues.map((league) => (
                <div
                  key={league.id}
                  className="bg-[#121721] border border-slate-800 rounded-xl overflow-hidden"
                >
                  <div className="bg-slate-900/60 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                        <span className="text-[9px] font-bold text-slate-400">
                          {league.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-emerald-400 truncate">
                          {league.name}
                        </div>

                        <div className="text-[10px] text-slate-500">
                          {league.country}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-500">
                      {league.matches.length} matches
                    </span>
                  </div>

                  <div className="divide-y divide-slate-800/50">
                    {league.matches.map((match) => (
                      <a
                        key={match.id}
                        href={`/matches/${match.id}`}
                        className="p-4 hover:bg-slate-800/30 transition cursor-pointer flex items-center gap-3 group"
                      >
                        <div className="flex items-center gap-3 w-20 shrink-0">
                          <button
                            onClick={(e) =>
                              toggleFavorite(match.id, e)
                            }
                            className="shrink-0"
                          >
                            <Star
                              className={`w-4 h-4 transition ${
                                favorites.includes(match.id)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-600 hover:text-slate-400"
                              }`}
                            />
                          </button>

                          <span
                            className={`text-xs font-semibold ${
                              match.isLive
                                ? "text-red-400 animate-pulse"
                                : "text-slate-500"
                            }`}
                          >
                            {match.minute}
                          </span>
                        </div>

                        <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                          <div className="flex items-center justify-end gap-3 text-right min-w-0">
                            <span className="text-sm font-semibold group-hover:text-emerald-400 transition truncate">
                              {match.homeTeam}
                            </span>

                            {match.homeLogo ? (
                              <img
                                src={match.homeLogo}
                                alt=""
                                className="w-7 h-7 object-contain shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 bg-slate-800 rounded-full border border-slate-700 shrink-0" />
                            )}
                          </div>

                          <div className="text-center px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800 text-sm font-black min-w-[64px]">
                            {match.homeScore} - {match.awayScore}
                          </div>

                          <div className="flex items-center gap-3 min-w-0">
                            {match.awayLogo ? (
                              <img
                                src={match.awayLogo}
                                alt=""
                                className="w-7 h-7 object-contain shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 bg-slate-800 rounded-full border border-slate-700 shrink-0" />
                            )}

                            <span className="text-sm font-semibold group-hover:text-emerald-400 transition truncate">
                              {match.awayTeam}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
