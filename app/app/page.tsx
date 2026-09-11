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
          ? "Bugün"
          : i === -1
          ? "Dün"
          : i === 1
          ? "Yarın"
          : d.toLocaleDateString("tr-TR", { weekday: "short", month: "numeric", day: "numeric" });
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
    <main className="min-h-screen bg-[#0d0f12] text-slate-100 font-sans selection:bg-orange-500 selection:text-white">
      {/* Üst Header / Marka Alanı */}
      <header className="sticky top-0 z-50 bg-[#12161c]/95 backdrop-blur-md border-b border-orange-500/20 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-xl text-white shadow-md shadow-orange-500/30">
              G
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider text-white uppercase">
                GoGoal<span className="text-orange-500">Match</span>
              </h1>
              <p className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">Canlı Futbol Skorları</p>
            </div>
          </div>

          <div className="flex gap-2">
            <HeroStat label="Canlı" value={loading ? "–" : String(liveCount)} accent="text-orange-500 bg-orange-500/10 border-orange-500/30" isLivePulse={liveCount > 0} />
            <HeroStat label="Toplam" value={loading ? "–" : String(matches.length)} accent="text-slate-200 bg-slate-800/50 border-slate-700/50" />
            <HeroStat label="Lig" value={loading ? "–" : String(totalLeagues)} accent="text-slate-200 bg-slate-800/50 border-slate-700/50" />
          </div>
        </div>

        {/* Arama & Filtreleme Çubuğu */}
        <div className="max-w-5xl mx-auto px-4 pb-3 space-y-2.5">
          <div className="relative">
            <input
              type="text"
              placeholder="Takım veya lig ara (örn: Real Madrid, Süper Lig)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181d26] border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner"
            />
          </div>

          {/* Kategori Tabları */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <TabButton active={activeTab === "ALL"} onClick={() => setActiveTab("ALL")}>
              TÜMÜ ({matches.length})
            </TabButton>
            <TabButton active={activeTab === "LIVE"} onClick={() => setActiveTab("LIVE")}>
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping inline-block mr-1" /> CANLI ({liveCount})
            </TabButton>
            <TabButton active={activeTab === "UPCOMING"} onClick={() => setActiveTab("UPCOMING")}>
              MAÇ SAATİ
            </TabButton>
            <TabButton active={activeTab === "FINISHED"} onClick={() => setActiveTab("FINISHED")}>
              BİTEN
            </TabButton>
            <TabButton active={activeTab === "FAV"} onClick={() => setActiveTab("FAV")}>
              ⭐ FAVORİLER ({favorites.length})
            </TabButton>
          </div>

          {/* Tarih Şeridi */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {generateDateTabs().map((item) => (
              <button
                key={item.iso}
                onClick={() => setSelectedDate(item.iso)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-tight transition-all whitespace-nowrap ${
                  selectedDate === item.iso
                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/30 border border-orange-500"
                    : "bg-[#181d26] text-slate-400 border border-slate-800/60 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Ana İçerik / Maç Listesi */}
      <section className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="bg-[#12161c] border border-slate-800/80 p-16 rounded-2xl text-center text-slate-400 text-xs shadow-xl animate-pulse">
            Maçlar yükleniyor, lütfen bekleyin...
          </div>
        ) : leagueGroups.length === 0 ? (
          <div className="bg-[#12161c] rounded-2xl p-12 text-slate-500 text-xs border border-slate-800/80 text-center shadow-lg">
            Seçilen kriterlere uygun maç bulunamadı.
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

      <footer className="border-t border-slate-800/60 py-6 text-center text-slate-500 text-xs bg-[#12161c]/50">
        © {new Date().getFullYear()} GoGoalMatch — Profesyonel Canlı Futbol Skorları.
      </footer>
    </main>
  );
}

function HeroStat({ label, value, accent, isLivePulse }: { label: string; value: string; accent: string; isLivePulse?: boolean }) {
  return (
    <div className={`border rounded-xl px-3 py-1.5 text-center min-w-[56px] shadow-sm ${accent}`}>
      <div className="text-sm font-black leading-none flex items-center justify-center gap-1">
        {isLivePulse && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />}
        {value}
      </div>
      <div className="mt-1 text-[9px] font-extrabold tracking-wider uppercase opacity-80">{label}</div>
    </div>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold tracking-wider transition-all whitespace-nowrap flex items-center ${
        active
          ? "bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-sm"
          : "bg-[#181d26] text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white"
      }`}
    >
      {children}
    </button>
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
    <div className="bg-[#12161c] border border-slate-800/80 rounded-2xl overflow-hidden mb-4 shadow-xl">
      <div className="bg-[#181d26] px-4 py-2.5 border-b border-slate-800/80 flex items-center gap-3">
        {league.logo && (
          <img src={league.logo} alt="" className="w-5 h-5 object-contain" />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-xs font-black text-white truncate">{league.name}</div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{league.country}</div>
        </div>
        <div className="text-[10px] font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md">
          {matches.length} Maç
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
    ? "MS"
    : formatKickoffTime(match.fixture.date);

  return (
    <a
      href={`/matches/${match.fixture.id}`}
      className="grid grid-cols-[36px_1fr_84px_1fr] items-center px-3.5 py-3 gap-2 hover:bg-white/[0.02] transition-colors border-t border-slate-800/40 first:border-0 group"
    >
      {/* Favori Yıldızı */}
      <span
        onClick={onToggleFav}
        className={`text-sm cursor-pointer transition-colors text-center ${
          isFav ? "text-amber-400 scale-110" : "text-slate-700 hover:text-slate-400"
        }`}
      >
        ★
      </span>

      {/* Ev Sahibi Takım */}
      <div className="flex items-center justify-end gap-2.5 min-w-0">
        <span className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors text-right">
          {match.teams.home.name}
        </span>
        <img
          src={match.teams.home.logo}
          alt=""
          className="w-5 h-5 object-contain flex-shrink-0"
        />
      </div>

      {/* Skor / Saat Alanı */}
      <div className="text-center">
        {!isLive && !isFinished ? (
          <div className="text-xs font-black text-orange-400 tracking-wider bg-orange-500/10 border border-orange-500/20 rounded py-0.5">
            {statusText}
          </div>
        ) : (
          <div className="bg-[#181d26] border border-slate-800 rounded-lg py-1 px-2">
            <div className="text-sm font-black text-white tracking-widest">
              {`${match.goals.home ?? 0} - ${match.goals.away ?? 0}`}
            </div>
            <div
              className={`text-[9px] font-black uppercase tracking-wider mt-0.5 ${
                isLive ? "text-orange-500 animate-pulse" : "text-slate-400"
              }`}
            >
              {statusText}
            </div>
          </div>
        )}
      </div>

      {/* Deplasman Takımı */}
      <div className="flex items-center gap-2.5 min-w-0">
        <img
          src={match.teams.away.logo}
          alt=""
          className="w-5 h-5 object-contain flex-shrink-0"
        />
        <span className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors">
          {match.teams.away.name}
        </span>
      </div>
    </a>
  );
}
