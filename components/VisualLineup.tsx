'use client';

import React from 'react';

interface Player {
  id: number;
  number: number;
  name: string;
  position: string;
  x: number; // Saha üzerindeki X yüzdesi (0 - 100)
  y: number; // Saha üzerindeki Y yüzdesi (0 - 100)
  rating?: number; // SofaScore tarzı oyuncu puanı (örn: 7.4)
}

interface TeamLineup {
  name: string;
  formation: string;
  logo?: string;
  players: Player[];
}

interface VisualLineupProps {
  homeTeam: TeamLineup;
  awayTeam: TeamLineup;
}

export default function VisualLineup({ homeTeam, awayTeam }: VisualLineupProps) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-zinc-800 p-4 text-white">
      {/* Üst Başlık & Takım Bilgileri */}
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-2">
          {homeTeam.logo && <img src={homeTeam.logo} alt={homeTeam.name} className="w-6 h-6 object-contain" />}
          <span className="font-bold text-sm md:text-base">{homeTeam.name}</span>
          <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">{homeTeam.formation}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">{awayTeam.formation}</span>
          <span className="font-bold text-sm md:text-base">{awayTeam.name}</span>
          {awayTeam.logo && <img src={awayTeam.logo} alt={awayTeam.name} className="w-6 h-6 object-contain" />}
        </div>
      </div>

      {/* Futbol Sahası */}
      <div className="relative w-full aspect-[2/3] md:aspect-[3/2] bg-emerald-800 rounded-lg border-2 border-emerald-600/50 overflow-hidden shadow-inner flex flex-col justify-between">
        {/* Saha Çim Deseni */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.08)_50%)] bg-[length:100%_12%] pointer-events-none" />

        {/* Saha Çizgileri */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/40 -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-28 h-28 md:w-36 md:h-36 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/60 rounded-full -translate-x-1/2 -translate-y-1/2" />

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/6 border-b-2 border-x-2 border-white/40 rounded-b-sm" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-1/12 border-b-2 border-x-2 border-white/40" />

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1/6 border-t-2 border-x-2 border-white/40 rounded-t-sm" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/4 h-1/12 border-t-2 border-x-2 border-white/40" />

        {/* Ev Sahibi Oyuncuları */}
        <div className="absolute inset-x-0 top-0 h-1/2">
          {homeTeam.players.map((player) => (
            <PlayerNode key={`home-${player.id}`} player={player} teamColor="bg-blue-600" />
          ))}
        </div>

        {/* Deplasman Oyuncuları */}
        <div className="absolute inset-x-0 bottom-0 h-1/2">
          {awayTeam.players.map((player) => (
            <PlayerNode key={`away-${player.id}`} player={player} teamColor="bg-red-600" />
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayerNode({ player, teamColor }: { player: Player; teamColor: string }) {
  const getRatingBg = (rating?: number) => {
    if (!rating) return 'bg-zinc-700 text-white';
    if (rating >= 8.0) return 'bg-blue-500 text-white font-bold';
    if (rating >= 7.0) return 'bg-emerald-500 text-white font-bold';
    if (rating >= 6.0) return 'bg-amber-500 text-white';
    return 'bg-red-500 text-white';
  };

  return (
    <div
      className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 cursor-pointer z-10"
      style={{ left: `${player.x}%`, top: `${player.y}%` }}
    >
      <div className="relative">
        <div className={`w-7 h-7 md:w-9 md:h-9 rounded-full ${teamColor} border-2 border-white flex items-center justify-center shadow-lg font-bold text-xs md:text-sm text-white`}>
          {player.number}
        </div>
        {player.rating && (
          <span className={`absolute -top-1 -right-2 text-[9px] md:text-[10px] px-1 rounded-sm shadow-sm ${getRatingBg(player.rating)}`}>
            {player.rating.toFixed(1)}
          </span>
        )}
      </div>
      <span className="mt-1 text-[10px] md:text-xs font-semibold bg-zinc-950/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-zinc-100 whitespace-nowrap max-w-[75px] md:max-w-[100px] truncate border border-zinc-700/50">
        {player.name}
      </span>
    </div>
  );
}
