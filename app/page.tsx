"use client";

import React, { useState } from "react";
import { 
  Trophy, 
  Search, 
  Star, 
  BarChart2, 
  Activity, 
  Users, 
  ChevronRight 
} from "lucide-react";

interface Match {
  id: string;
  minute: string;
  isLive: boolean;
  isFinished: boolean;
  homeTeam: string;
  homeLogo: string;
  homeScore: number | string;
  awayTeam: string;
  awayLogo: string;
  awayScore: number | string;
  htScore: string;
  venue: string;
  referee: string;
}

interface League {
  id: string;
  name: string;
  country: string;
  matches: Match[];
}

const LEAGUES_DATA: League[] = [
  {
    id: "tr-super-lig",
    name: "Super Lig",
    country: "Turkey",
    matches: [
      {
        id: "m1",
        minute: "78'",
        isLive: true,
        isFinished: false,
        homeTeam: "Galatasaray",
        homeLogo: "GS",
        homeScore: 2,
        awayTeam: "Fenerbahce",
        awayLogo: "FB",
        awayScore: 1,
        htScore: "1 - 0",
        venue: "RAMS Park",
        referee: "Halil Umut Meler"
      },
      {
        id: "m2",
        minute: "FT",
        isLive: false,
        isFinished: true,
        homeTeam: "Besiktas",
        homeLogo: "BJK",
        homeScore: 3,
        awayTeam: "Trabzonspor",
        awayLogo: "TS",
        awayScore: 0,
        htScore: "2 - 0",
        venue: "Tupras Stadyumu",
        referee: "Ali Sansalan"
      }
    ]
  },
  {
    id: "eng-premier",
    name: "Premier League",
    country: "England",
    matches: [
      {
        id: "m3",
        minute: "42'",
        isLive: true,
        isFinished: false,
        homeTeam: "Arsenal",
        homeLogo: "ARS",
        homeScore: 1,
        awayTeam: "Chelsea",
        awayLogo: "CHE",
        awayScore: 1,
        htScore: "1 - 1",
        venue: "Emirates Stadium",
        referee: "Michael Oliver"
      },
      {
        id: "m4",
        minute: "21:00",
        isLive: false,
        isFinished: false,
        homeTeam: "Manchester City",
        homeLogo: "MCI",
        homeScore: "-",
        awayTeam: "Liverpool",
        awayLogo: "LIV",
        awayScore: "-",
        htScore: "-",
        venue: "Etihad Stadium",
        referee: "Anthony Taylor"
      }
    ]
  },
  {
    id: "esp-la-liga",
    name: "La Liga",
    country: "Spain",
    matches: [
      {
        id: "m5",
        minute: "FT",
        isLive: false,
        isFinished: true,
        homeTeam: "Real Madrid",
        homeLogo: "RMA",
        homeScore: 2,
        awayTeam: "Barcelona",
        awayLogo: "BAR",
        awayScore: 1,
        htScore: "1 - 0",
        venue: "Santiago Bernabeu",
        referee: "Gil Manzano"
      }
    ]
  }
];

export default function App() {
  const [filter, setFilter] = useState<"all" | "live" | "finished">("all");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [activeTab, setActiveTab] = useState<"stats" | "events" | "lineups">("stats");
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (matchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(matchId) ? prev.filter(id => id !== matchId) : [...prev, matchId]
    );
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 font-sans">
      <header className="border-b border-slate-800/80 bg-[#121721]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setSelectedMatch(null)}>
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/20">
              G
            </div>
            <span className="text-xl font-bold tracking-tight">
              GoGoal<span className="text-emerald-400">Match</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search team or league..." 
                className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-emerald-500 w-60 transition"
              />
            </div>
            <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>LIVE SCORES</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="hidden lg:block space-y-4">
          <div className="bg-[#121721] border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span>Top Leagues</span>
            </h3>
            <ul className="space-y-1 text-sm">
              {LEAGUES_DATA.map(league => (
                <li key={league.id}>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/60 transition flex items-center justify-between text-slate-300 hover:text-white">
                    <span>{league.name}</span>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="lg:col-span-3 space-y-4">
          {!selectedMatch ? (
            <>
              <div className="bg-[#121721] border border-slate-800 rounded-xl p-2 flex items-center justify-between">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                      filter === "all" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter("live")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                      filter === "live" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>Live</span>
                  </button>
                  <button
                    onClick={() => setFilter("finished")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                      filter === "finished" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Finished
                  </button>
                </div>

                <div className="text-xs text-slate-500 font-medium px-2">
                  Today, Sep 12
                </div>
              </div>

              <div className="space-y-4">
                {LEAGUES_DATA.map(league => {
                  const filteredMatches = league.matches.filter(m => {
                    if (filter === "live") return m.isLive;
                    if (filter === "finished") return m.isFinished;
                    return true;
                  });

                  if (filteredMatches.length === 0) return null;

                  return (
                    <div key={league.id} className="bg-[#121721] border border-slate-800 rounded-xl overflow-hidden">
                      <div className="bg-slate-900/60 px-4 py-2.5 border-b border-slate-800 flex items-center space-x-2 text-xs font-semibold text-slate-300">
                        <span>{league.country}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-emerald-400">{league.name}</span>
                      </div>

                      <div className="divide-y divide-slate-800/50">
                        {filteredMatches.map(match => (
                          <div
                            key={match.id}
                            onClick={() => setSelectedMatch(match)}
                            className="p-4 hover:bg-slate-800/30 transition cursor-pointer flex items-center justify-between group"
                          >
                            <div className="flex items-center space-x-3 w-16">
                              <button onClick={(e) => toggleFavorite(match.id, e)}>
                                <Star className={`w-4 h-4 ${favorites.includes(match.id) ? "fill-amber-400 text-amber-400" : "text-slate-600 hover:text-slate-400"}`} />
                              </button>
                              {match.isLive ? (
                                <span className="text-xs font-bold text-red-500 animate-pulse">{match.minute}</span>
                              ) : (
                                <span className="text-xs font-medium text-slate-500">{match.minute}</span>
                              )}
                            </div>

                            <div className="flex-1 grid grid-cols-3 items-center max-w-lg mx-auto">
                              <div className="flex items-center space-x-3 justify-end text-right">
                                <span className="text-sm font-semibold group-hover:text-emerald-400 transition truncate">{match.homeTeam}</span>
                                <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold border border-slate-700">
                                  {match.homeLogo}
                                </div>
                              </div>

                              <div className="text-center px-3 py-1 bg-slate-900 rounded-lg border border-slate-800 text-sm font-black mx-auto min-w-[60px]">
                                {match.homeScore} - {match.awayScore}
                              </div>

                              <div className="flex items-center space-x-3 justify-start">
                                <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold border border-slate-700">
                                  {match.awayLogo}
                                </div>
                                <span className="text-sm font-semibold group-hover:text-emerald-400 transition truncate">{match.awayTeam}</span>
                              </div>
                            </div>

                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition ml-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <button 
                onClick={() => setSelectedMatch(null)}
                className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 transition mb-2"
              >
                <span>Back to Matches</span>
              </button>

              <div className="bg-[#121721] border border-slate-800 rounded-xl p-6 shadow-2xl">
                <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800/80 pb-3 mb-6">
                  <span className="font-semibold text-slate-300">{selectedMatch.homeTeam} vs {selectedMatch.awayTeam}</span>
                  {selectedMatch.isLive ? (
                    <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full font-bold animate-pulse">
                      {selectedMatch.minute}
                    </span>
                  ) : (
                    <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-bold">
                      {selectedMatch.minute}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 items-center text-center py-4">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-lg border border-slate-700 text-slate-200 shadow-inner">
                      {selectedMatch.homeLogo}
                    </div>
                    <span className="font-bold text-base">{selectedMatch.homeTeam}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-black text-white tracking-wider mb-2">
                      {selectedMatch.homeScore} : {selectedMatch.awayScore}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                      HT: {selectedMatch.htScore}
                    </span>
                  </div>

                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-lg border border-slate-700 text-slate-200 shadow-inner">
                      {selectedMatch.awayLogo}
                    </div>
                    <span className="font-bold text-base">{selectedMatch.awayTeam}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 text-center">
                  <div>
                    <span className="block text-slate-500 font-medium">VENUE</span>
                    <span className="text-slate-200 font-semibold">{selectedMatch.venue}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 font-medium">REFEREE</span>
                    <span className="text-slate-200 font-semibold">{selectedMatch.referee}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-slate-500 font-medium">STATUS</span>
                    <span className="text-emerald-400 font-semibold">{selectedMatch.isLive ? "In Progress" : "Finished"}</span>
                  </div>
                </div>
              </div>

              <div className="flex border-b border-slate-800 text-sm font-medium">
                <button
                  onClick={() => setActiveTab("stats")}
                  className={`px-5 py-2.5 border-b-2 transition flex items-center space-x-2 ${
                    activeTab === "stats" ? "border-emerald-500 text-emerald-400 font-semibold" : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <BarChart2 className="w-4 h-4" />
                  <span>Statistics</span>
                </button>
                <button
                  onClick={() => setActiveTab("events")}
                  className={`px-5 py-2.5 border-b-2 transition flex items-center space-x-2 ${
                    activeTab === "events" ? "border-emerald-500 text-emerald-400 font-semibold" : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>Events</span>
                </button>
                <button
                  onClick={() => setActiveTab("lineups")}
                  className={`px-5 py-2.5 border-b-2 transition flex items-center space-x-2 ${
                    activeTab === "lineups" ? "border-emerald-500 text-emerald-400 font-semibold" : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Lineups</span>
                </button>
              </div>

              <div className="bg-[#121721] border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-emerald-400">58%</span>
                    <span className="text-slate-400">Ball Possession</span>
                    <span className="text-slate-300">42%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full w-[58%]" />
                    <div className="bg-slate-600 h-full w-[42%]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-emerald-400">14</span>
                    <span className="text-slate-400">Total Shots</span>
                    <span className="text-slate-300">8</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full w-[63%]" />
                    <div className="bg-slate-600 h-full w-[37%]" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
