"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type StandingTeam = {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
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
  group: string;
  form?: string;
};

type LeagueStandingsData = {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    standings: StandingTeam[][];
  };
};

export default function StandingsPage() {
  const [standings, setStandings] = useState<LeagueStandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [leagueId, setLeagueId] = useState(39); // Varsayılan: Premier League (İstediğin lig ID'si ile değiştirebilirsin)
  const [season, setSeason] = useState(2026);

  // Popüler Ligler Örnek ID'leri (API-Football uyumlu)
  const popularLeagues = [
    { id: 39, name: "Premier League", country: "England" },
    { id: 140, name: "La Liga", country: "Spain" },
    { id: 78, name: "Bundesliga", country: "Germany" },
    { id: 135, name: "Serie A", country: "Italy" },
    { id: 203, name: "Süper Lig", country: "Turkey" },
    { id: 61, name: "Ligue 1", country: "France" },
  ];

  async function loadStandings() {
    setLoading(true);
    try {
      const response = await fetch(`/api/standings?league=${leagueId}&season=${season}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (data.response && data.response.length > 0) {
        setStandings(data.response[0]);
      } else {
        setStandings(null);
      }
    } catch (error) {
      console.error("Failed to load standings:", error);
      setStandings(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStandings();
  }, [leagueId, season]);

  return (
    <main className="min-h-screen bg-[#0d0f12] text-slate-100 font-sans selection:bg-orange-500 selection:text-white pb-12">
      {/* Üst Header */}
      <header className="sticky top-0 z-50 bg-[#12161c]/95 backdrop-blur-md border-b border-orange-500/20 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-orange-400 transition-colors bg-[#181d26] border border-slate-800 px-3 py-1.5 rounded-xl"
          >
            ← Ana Sayfaya Dön
          </Link>
          <div className="text-sm font-black text-white uppercase tracking-wider">
            Canlı Puan Durumu
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Lig Seçim Butonları */}
        <div className="bg-[#12161c] border border-slate-800/80 rounded-2xl p-4 shadow-xl">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Popüler Ligler</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {popularLeagues.map((l) => (
              <button
                key={l.id}
                onClick={() => setLeagueId(l.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center truncate ${
                  leagueId === l.id
                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/30 border border-orange-500"
                    : "bg-[#181d26] text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700"
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>

        {/* Puan Tablosu Kartı */}
        <div className="bg-[#12161c] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-16 text-center text-slate-400 text-xs animate-pulse">
              Puan durumu yükleniyor...
            </div>
          ) : !standings || !standings.league.standings[0] ? (
            <div className="p-16 text-center text-slate-500 text-xs">
              Bu lig için puan durumu verisi bulunamadı.
            </div>
          ) : (
            <div>
              {/* Lig Başlık Bilgisi */}
              <div className="bg-[#181d26] px-5 py-4 border-b border-slate-800 flex items-center gap-3">
                {standings.league.logo && (
                  <img src={standings.league.logo} alt="" className="w-7 h-7 object-contain" />
                )}
                <div>
                  <div className="text-sm font-black text-white">{standings.league.name}</div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{standings.league.country}</div>
                </div>
              </div>

              {/* Tablo Yapısı */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-900/50">
                      <th className="py-3 px-3 text-center w-12">#</th>
                      <th className="py-3 px-3">Takım</th>
                      <th className="py-3 px-3 text-center w-10">O</th>
                      <th className="py-3 px-3 text-center w-10">G</th>
                      <th className="py-3 px-3 text-center w-10">B</th>
                      <th className="py-3 px-3 text-center w-10">M</th>
                      <th className="py-3 px-3 text-center w-12">AG</th>
                      <th className="py-3 px-3 text-center w-12">YG</th>
                      <th className="py-3 px-3 text-center w-12">AV</th>
                      <th className="py-3 px-3 text-center w-12 text-orange-400">P</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-xs">
                    {standings.league.standings[0].map((row) => (
                      <tr key={row.team.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3 text-center font-bold text-slate-400">
                          <span
                            className={`inline-block w-6 h-6 rounded-lg leading-6 text-center text-[11px] ${
                              row.rank <= 4
                                ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                : row.rank === 5 || row.rank === 6
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : row.rank >= 18
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "text-slate-300"
                            }`}
                          >
                            {row.rank}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-200 flex items-center gap-2.5">
                          <img src={row.team.logo} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
                          <span className="truncate max-w-[160px] sm:max-w-xs">{row.team.name}</span>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-400">{row.all.played}</td>
                        <td className="py-3 px-3 text-center text-slate-300">{row.all.win}</td>
                        <td className="py-3 px-3 text-center text-slate-300">{row.all.draw}</td>
                        <td className="py-3 px-3 text-center text-slate-300">{row.all.lose}</td>
                        <td className="py-3 px-3 text-center text-slate-400">{row.all.goals.for}</td>
                        <td className="py-3 px-3 text-center text-slate-400">{row.all.goals.against}</td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-300">
                          {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
                        </td>
                        <td className="py-3 px-3 text-center font-black text-orange-400">{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
