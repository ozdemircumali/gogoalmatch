"use client";

import { useEffect, useState } from "react";

type Match = {
  fixture: {
    id: number;
    date?: string;
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id?: number;
    name: string;
    country: string;
    logo: string;
  };
  teams: {
    home: {
      name: string;
      logo: string;
    };
    away: {
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
};

type FilterTab = "ALL" | "LIVE" | "UPCOMING" | "FINISHED" | "FAV";

const LIVE_STATUSES = ["1H", "2H", "HT", "ET", "BT", "P"];
const FINISHED_STATUSES = ["FT", "AET", "PEN"];

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("ggm_favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load favorites", e);
      }
    }
  }, []);

  async function loadMatches() {
    try {
      const response = await fetch(`/api/fixtures?date=${selectedDate}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (Array.isArray(data.response)) {
        setMatches(data.response);
      } else {
        setMatches([]);
      }
    } catch (error) {
      console.error("Failed to load matches:", error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    loadMatches();
    const interval = setInterval(loadMatches, 30000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const toggleFavorite = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    let updated = [...favorites];
    if (updated.includes(id)) {
      updated = updated.filter((favId) => favId !== id);
    } else {
      updated.push(id);
    }
    setFavorites(updated);
    localStorage.setItem("ggm_favorites", JSON.stringify(updated));
  };

  const generateDateTabs = () => {
    const dates = [];
    for (let i = -2; i <= 2; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      const label =
        i === 0
          ? "Today"
          : i === -1
          ? "Yesterday"
          : i === 1
          ? "Tomorrow"
          : d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });
      dates.push({ iso, label });
    }
    return dates;
  };

  const filteredMatches = matches.filter((match) => {
    const isLive = LIVE_STATUSES.includes(match.fixture.status.short);
    const isFinished = FINISHED_STATUSES.includes(match.fixture.status.short);
    const isUpcoming = !isLive && !isFinished;
    const isFav = favorites.includes(match.fixture.id);

    if (activeTab === "LIVE" && !isLive) return false;
    if (activeTab === "UPCOMING" && !isUpcoming) return false;
    if (activeTab === "FINISHED" && !isFinished) return false;
    if (activeTab === "FAV" && !isFav) return false;

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const home = match.teams.home.name.toLowerCase();
      const away = match.teams.away.name.toLowerCase();
      const league = match.league.name.toLowerCase();
      return home.includes(query) || away.includes(query) || league.includes(query);
    }
    return true;
  });

  const liveCount = matches.filter((m) =>
    LIVE_STATUSES.includes(m.fixture.status.short)
  ).length;

  const totalLeagues = new Set(
    matches.map((match) =>
      match.league.id !== undefined && match.league.id !== null
        ? `id-${match.league.id}`
        : `${match.league.country}-${match.league.name}`
    )
  ).size;

  const leagueGroups = groupMatchesByLeague(filteredMatches);

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-emerald-500 selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#080c16]/90 backdrop-blur-md border-b border-emerald-500/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-black text-lg text-slate-950 shadow-lg shadow-emerald-500/20">
              G
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">
                GoGoal<span className="text-emerald-400">Match</span>
              </h1>
            </div>
          </div>

          <div className="flex gap-2">
            <HeroStat label="Live" value={loading ? "–" : String(liveCount)} accent="text-rose-500" />
            <HeroStat label="Total" value={loading ? "–" : String(matches.length)} accent="text-emerald-400" />
            <HeroStat label="Leagues" value={loading ? "–" : String(totalLeagues)} accent="text-sky-400" />
          </div>
        </div>

        {/* Arama & Filtreleme Barı */}
        <div className="max-w-6xl mx-auto px-4 pb-3 space-y-2.5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search team or league..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0c1220] border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
            />
          </div>

          {/* Tab Filtreleri */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "ALL"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm"
                  : "bg-[#0c1220] text-slate-400 border border-slate-800 hover:border-slate-700"
              }`}
            >
              ALL ({matches.length})
            </button>
            <button
              onClick={() => setActiveTab("LIVE")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "LIVE"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm"
                  : "bg-[#0c1220] text-slate-400 border border-slate-800 hover:border-slate-700"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#ef4444]" /> LIVE ({liveCount})
            </button>
            <button
              onClick={() => setActiveTab("UPCOMING")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
                activeTab === "UPCOMING"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm"
                  : "bg-[#0c1220] text-slate-400 border border-slate-800 hover:border-slate-700"
              }`}
            >
              UPCOMING
            </button>
            <button
              onClick={() => setActiveTab("FINISHED")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
                activeTab === "FINISHED"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm"
                  : "bg-[#0c1220] text-slate-400 border border-slate-800 hover:border-slate-700"
              }`}
            >
              FINISHED
            </button>
            <button
              onClick={() => setActiveTab("FAV")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
                activeTab === "FAV"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm"
                  : "bg-[#0c1220] text-slate-400 border border-slate-800 hover:border-slate-700"
              }`}
            >
              ★ FAV ({favorites.length})
            </button>
          </div>

          {/* Tarih Şeridi */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {generateDateTabs().map((item) => (
              <button
                key={item.iso}
                onClick={() => setSelectedDate(item.iso)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-tight transition-all whitespace-nowrap ${
                  selectedDate === item.iso
                    ? "bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm"
                    : "bg-[#080c16] text-slate-500 border border-slate-800/60 hover:text-slate-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Maç Listesi Alanı */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="bg-[#0c1220] border border-slate-800/80 p-12 rounded-2xl text-center text-slate-400 text-sm shadow-xl">
            Loading matches...
          </div>
        ) : leagueGroups.length === 0 ? (
          <div className="bg-[#0c1220] rounded-2xl p-8 text-slate-500 text-xs border border-slate-800/80 text-center">
            No matches found for the selected filter.
          </div>
        ) : (
          leagueGroups.map((group) => (
            <LeagueGroup
              key={group.key}
              league={group.league}
              matches={group.matches}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          ))
        )}
      </section>

      <footer className="border-t border-slate-800/60 py-6 text-center text-slate-600 text-xs">
        © {new Date().getFullYear()} GoGoalMatch — Live sports scores & standings.
      </footer>
    </main>
  );
}

function HeroStat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-[#0c1220] border border-slate-800/80 rounded-xl px-3 py-1.5 text-center min-w-[56px] shadow-sm">
      <div className={`text-base font-black leading-none ${accent}`}>{value}</div>
      <div className="mt-1 text-[9px] font-bold tracking-wider text-slate-500 uppercase">{label}</div>
    </div>
  );
}

function getLeagueKey(league: Match["league"]): string {
  if (league.id !== undefined && league.id !== null) {
    return `league-${league.id}`;
  }
  return `fallback-${league.country.trim().toLowerCase()}-${league.name.trim().toLowerCase()}`;
}

function groupMatchesByLeague(matches: Match[]) {
  const groups = new Map<string, { league: Match["league"]; matches: Match[] }>();
  for (const match of matches) {
    const key = getLeagueKey(match.league);
    const existing = groups.get(key);
    if (existing) {
      existing.matches.push(match);
    } else {
      groups.set(key, { league: match.league, matches: [match] });
    }
  }
  return Array.from(groups.entries()).map(([key, value]) => ({
    key,
    league: value.league,
    matches: value.matches,
  }));
}

function LeagueGroup({
  league,
  matches,
  favorites,
  onToggleFavorite,
}: {
  league: Match["league"];
  matches: Match[];
  favorites: number[];
  onToggleFavorite: (e: React.MouseEvent, id: number) => void;
}) {
  return (
    <div className="bg-[#0c1220] border border-slate-800/80 rounded-2xl overflow-hidden mb-4 shadow-xl">
      <div className="bg-white/[0.02] px-3.5 py-2.5 border-b border-slate-800/80 flex items-center gap-2.5">
        {league.logo && (
          <img src={league.logo} alt="" className="w-5 h-5 object-contain" />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-xs font-extrabold text-slate-200 truncate">{league.name}</div>
          <div className="text-[10px] text-slate-500 truncate">{league.country}</div>
        </div>
        <div className="text-[10px] font-bold text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">
          {matches.length}
        </div>
      </div>

      <div>
        {matches.map((match) => (
          <MatchRow
            key={match.fixture.id}
            match={match}
            isFav={favorites.includes(match.fixture.id)}
            onToggleFav={(e) => onToggleFavorite(e, match.fixture.id)}
          />
        ))}
      </div>
    </div>
  );
}

function formatKickoffTime(dateString?: string): string {
  if (!dateString) return "--:--";
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "--:--";
  return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function MatchRow({
  match,
  isFav,
  onToggleFav,
}: {
  match: Match;
  isFav: boolean;
  onToggleFav: (e: React.MouseEvent) => void;
}) {
  const isLive = LIVE_STATUSES.includes(match.fixture.status.short);
  const isFinished = FINISHED_STATUSES.includes(match.fixture.status.short);

  const statusText = isLive
    ? match.fixture.status.elapsed != null
      ? `${match.fixture.status.elapsed}'`
      : match.fixture.status.short
    : isFinished
    ? "FT"
    : formatKickoffTime(match.fixture.date);

  return (
    <a
      href={`/matches/${match.fixture.id}`}
      className="grid grid-cols-[32px_1fr_80px_1fr] items-center px-3.5 py-2.5 gap-2 hover:bg-white/[0.03] transition-colors border-t border-slate-800/50 first:border-0 group"
    >
      {/* Favori Yıldızı */}
      <span
        onClick={onToggleFav}
        className={`text-base cursor-pointer transition-colors text-center ${
          isFav ? "text-amber-400" : "text-slate-700 hover:text-slate-500"
        }`}
      >
        ★
      </span>

      {/* Ev Sahibi */}
      <div className="flex items-center justify-end gap-2 min-w-0">
        <span className="text-xs font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
          {match.teams.home.name}
        </span>
        <img
          src={match.teams.home.logo}
          alt=""
          className="w-5 h-5 object-contain flex-shrink-0"
        />
      </div>

      {/* Skor / Saat */}
      <div className="text-center">
        {!isLive && !isFinished ? (
          <div className="text-xs font-bold text-emerald-400 tracking-wider">
            {statusText}
          </div>
        ) : (
          <div>
            <div className="text-sm font-black text-slate-100 tracking-tight">
              {`${match.goals.home ?? 0} - ${match.goals.away ?? 0}`}
            </div>
            <div
              className={`text-[9px] font-extrabold uppercase mt-0.5 ${
                isLive ? "text-rose-500 animate-pulse" : "text-slate-500"
              }`}
            >
              {statusText}
            </div>
          </div>
        )}
      </div>

      {/* Deplasman */}
      <div className="flex items-center gap-2 min-w-0">
        <img
          src={match.teams.away.logo}
          alt=""
          className="w-5 h-5 object-contain flex-shrink-0"
        />
        <span className="text-xs font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
          {match.teams.away.name}
        </span>
      </div>
    </a>
  );
}
