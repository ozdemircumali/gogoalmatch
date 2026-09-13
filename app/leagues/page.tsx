import Link from "next/link";
import { LEAGUES } from "@/lib/leagues";

export default function LeaguesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6">

        <header className="flex items-center justify-between border-b border-slate-800 pb-5">
          <Link
            href="/"
            className="text-xl font-bold text-white"
          >
            GoGoalMatch
          </Link>

          <Link
            href="/matches"
            className="text-sm text-slate-400 hover:text-emerald-400"
          >
            Matches
          </Link>
        </header>

        <section className="py-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Football
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Leagues
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Standings, fixtures, results and upcoming matches.
          </p>
        </section>

        <div className="space-y-8">
          {LEAGUES.map((league) => (
            <Link
              key={league.id}
              href={`/leagues/${league.slug}`}
              className="block rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-emerald-700 hover:bg-slate-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {league.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {league.country}
                  </p>
                </div>

                <span className="text-slate-500">
                  →
                </span>
              </div>

              <p className="mt-4 text-xs text-slate-600">
                Standings · Fixtures · Results · Upcoming
              </p>
            </Link>
          ))}
        </div>

        <footer className="mt-10 border-t border-slate-800 py-6 text-center">
          <Link
            href="/"
            className="text-sm font-semibold text-emerald-400"
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
