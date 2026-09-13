import Link from "next/link";
import { LEAGUES } from "@/lib/leagues";

export default function LeaguesPage() {
  const countries = Array.from(
    new Set(LEAGUES.map((league) => league.country))
  );

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
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

        <section className="mt-8">
          <p className="text-xs uppercase tracking-wider text-emerald-400">
            Football
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Leagues
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Standings, fixtures, results and upcoming matches.
          </p>
        </section>

        <div className="mt-8 space-y-8">
          {countries.map((country) => {
            const leagues = LEAGUES.filter(
              (league) => league.country === country
            );

            return (
              <section key={country}>
                <h2 className="mb-3 text-lg font-bold">
                  {country}
                </h2>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {leagues.map((league) => (
                    <Link
                      key={league.id}
                      href={`/leagues/${league.slug}`}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-4 transition hover:border-emerald-800 hover:bg-slate-900/80"
                    >
                      <p className="font-semibold">
                        {league.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Standings · Fixtures · Results
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <footer className="mt-10 border-t border-slate-800 py-6 text-center">
          <Link
            href="/"
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            GoGoalMatch
          </Link>
        </footer>
      </div>
    </main>
  );
}
