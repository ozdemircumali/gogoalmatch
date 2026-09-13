import Link from "next/link";

export default function MatchDetailPage() {
  const stats = [
    { label: "Ball Possession", home: "54%", away: "46%", homeVal: 54, awayVal: 46 },
    { label: "Shots on Goal", home: 4, away: 0, homeVal: 4, awayVal: 0 },
    { label: "Total Shots", home: 12, away: 1, homeVal: 12, awayVal: 1 },
    { label: "Shots insidebox", home: 5, away: 1, homeVal: 5, awayVal: 1 },
    { label: "Shots outsidebox", home: 7, away: 0, homeVal: 7, awayVal: 0 },
    { label: "Blocked Shots", home: 5, away: 0, homeVal: 5, awayVal: 0 },
    { label: "Shots off Goal", home: 3, away: 1, homeVal: 3, awayVal: 1 },
    { label: "Passes accurate", home: 180, away: 140, homeVal: 180, awayVal: 140 },
    { label: "Total passes", home: 207, away: 174, homeVal: 207, awayVal: 174 },
    { label: "Corner Kicks", home: 3, away: 1, homeVal: 3, awayVal: 1 },
    { label: "Free Kicks", home: 2, away: 4, homeVal: 2, awayVal: 4 },
    { label: "Fouls", home: 5, away: 2, homeVal: 5, awayVal: 2 },
    { label: "Offsides", home: 0, away: 1, homeVal: 0, awayVal: 1 },
    { label: "Goalkeeper Saves", home: 0, away: 3, homeVal: 0, awayVal: 3 },
    { label: "Yellow Cards", home: 0, away: 0, homeVal: 0, awayVal: 0 },
    { label: "Red Cards", home: 0, away: 0, homeVal: 0, awayVal: 0 },
  ];

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Navbar & Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
        <Link 
          href="/" 
          className="text-2xl font-black text-white hover:text-emerald-400 transition tracking-tight"
        >
          GoGoal<span className="text-emerald-500">Match</span>
        </Link>
        <div className="flex items-center space-x-2 text-slate-400 text-xs sm:text-sm">
          <Link href="/" className="hover:text-white transition">
            ← Matches
          </Link>
          <span>/</span>
          <span>Home</span>
          <span>/</span>
          <span className="text-emerald-400 font-medium">Serie A</span>
        </div>
      </div>

      {/* Main Score Board Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800 pb-3 mb-6">
          <span className="font-semibold text-slate-300">Serie A • Brazil</span>
          <span className="bg-red-500/10 text-red-500 px-2.5 py-1 rounded-full font-bold animate-pulse">
            38'
          </span>
        </div>

        <div className="grid grid-cols-3 items-center text-center">
          {/* Home Team */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 font-bold text-xl text-slate-100 shadow-inner">
              SAN
            </div>
            <span className="font-bold text-lg text-slate-100">Santos</span>
            <span className="text-xs text-slate-400 font-semibold tracking-wider">HOME</span>
          </div>

          {/* Score & Period */}
          <div className="flex flex-col items-center">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-1">
              2 : 0
            </span>
            <span className="text-xs text-slate-400 font-semibold bg-slate-800/80 px-3 py-1 rounded-md border border-slate-700/50">
              HT: 2 - 0
            </span>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 font-bold text-xl text-slate-100 shadow-inner">
              CRU
            </div>
            <span className="font-bold text-lg text-slate-100">Cruzeiro</span>
            <span className="text-xs text-slate-400 font-semibold tracking-wider">AWAY</span>
          </div>
        </div>

        {/* Match Metadata Footer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-4 border-t border-slate-800/80 text-xs text-slate-400 text-center">
          <div>
            <div className="text-slate-500 font-medium">DATE</div>
            <div className="text-slate-200 font-semibold">Sat, Sep 12, 2026</div>
          </div>
          <div>
            <div className="text-slate-500 font-medium">KICK-OFF</div>
            <div className="text-slate-200 font-semibold">20:00</div>
          </div>
          <div>
            <div className="text-slate-500 font-medium">VENUE</div>
            <div className="text-slate-200 font-semibold truncate">Estadio Urbano Caldeira</div>
          </div>
          <div>
            <div className="text-slate-500 font-medium">REFEREE</div>
            <div className="text-slate-200 font-semibold">N/A</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 text-sm font-medium">
        <button className="px-5 py-3 border-b-2 border-emerald-500 text-emerald-400 font-semibold">
          Statistics
        </button>
        <button className="px-5 py-3 text-slate-400 hover:text-slate-200 transition">
          Summary & Events
        </button>
        <button className="px-5 py-3 text-slate-400 hover:text-slate-200 transition">
          Lineups
        </button>
      </div>

      {/* Full Statistics Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 shadow-xl">
        {stats.map((item, idx) => {
          const total = item.homeVal + item.awayVal || 1;
          const homePct = (item.homeVal / total) * 100;
          const awayPct = (item.awayVal / total) * 100;

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-emerald-400 w-12">{item.home}</span>
                <span className="text-xs text-slate-400 font-semibold text-center flex-1 uppercase tracking-wider">
                  {item.label}
                </span>
                <span className="font-bold text-slate-300 w-12 text-right">{item.away}</span>
              </div>
              <div className="flex h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${homePct}%` }}
                />
                <div
                  className="bg-slate-600 h-full transition-all duration-500"
                  style={{ width: `${awayPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
