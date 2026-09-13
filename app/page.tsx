import Link from "next/link";

export default function HomePage() {
  const matches = [
    {
      id: "santos-cruzeiro",
      league: "Serie A • Brazil",
      time: "38'",
      isLive: true,
      homeTeam: "Santos",
      homeCode: "SAN",
      homeScore: 2,
      awayTeam: "Cruzeiro",
      awayCode: "CRU",
      awayScore: 0,
    },
    {
      id: "flamengo-palmeiras",
      league: "Serie A • Brazil",
      time: "FT",
      isLive: false,
      homeTeam: "Flamengo",
      homeCode: "FLA",
      homeScore: 1,
      awayTeam: "Palmeiras",
      awayCode: "PAL",
      awayScore: 1,
    },
    {
      id: "sao-paulo-gremio",
      league: "Serie A • Brazil",
      time: "21:30",
      isLive: false,
      homeTeam: "São Paulo",
      homeCode: "SAO",
      homeScore: "-",
      awayTeam: "Grêmio",
      awayCode: "GRE",
      awayScore: "-",
    },
  ];

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Top Navbar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-2">
        <Link 
          href="/" 
          className="text-2xl font-black text-white tracking-tight"
        >
          GoGoal<span className="text-emerald-500">Match</span>
        </Link>
        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-semibold border border-emerald-500/20">
          Live Scores & Results
        </span>
      </div>

      {/* Matches Header */}
      <div className="flex items-center justify-between text-sm text-slate-400 py-1">
        <h1 className="text-lg font-bold text-slate-100">Matches Today</h1>
        <div className="flex space-x-2">
          <button className="bg-emerald-500 text-slate-950 px-3 py-1 rounded-md text-xs font-bold">All</button>
          <button className="bg-slate-900 text-slate-400 px-3 py-1 rounded-md text-xs font-semibold hover:text-white border border-slate-800">Live</button>
          <button className="bg-slate-900 text-slate-400 px-3 py-1 rounded-md text-xs font-semibold hover:text-white border border-slate-800">Finished</button>
        </div>
      </div>

      {/* Match Cards List */}
      <div className="space-y-3">
        {matches.map((m) => (
          <Link
            key={m.id}
            href={`/match/${m.id}`}
            className="block bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition shadow-lg group"
          >
            <div className="flex justify-between items-center text-xs text-slate-400 mb-3 pb-2 border-b border-slate-800/60">
              <span className="font-semibold">{m.league}</span>
              {m.isLive ? (
                <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-bold animate-pulse">
                  {m.time}
                </span>
              ) : (
                <span className="text-slate-500 font-medium">{m.time}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              {/* Home Team */}
              <div className="flex items-center space-x-3 w-2/5">
                <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center font-bold text-xs text-slate-200 border border-slate-700">
                  {m.homeCode}
                </div>
                <span className="font-semibold text-slate-100 group-hover:text-emerald-400 transition truncate">
                  {m.homeTeam}
                </span>
              </div>

              {/* Score Display */}
              <div className="w-1/5 text-center bg-slate-950/50 py-1.5 px-3 rounded-lg border border-slate-800 font-black text-lg text-white">
                {m.homeScore} : {m.awayScore}
              </div>

              {/* Away Team */}
              <div className="flex items-center justify-end space-x-3 w-2/5 text-right">
                <span className="font-semibold text-slate-100 group-hover:text-emerald-400 transition truncate">
                  {m.awayTeam}
                </span>
                <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center font-bold text-xs text-slate-200 border border-slate-700">
                  {m.awayCode}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
