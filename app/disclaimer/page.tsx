import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-[#07140f] text-slate-100">
      <div className="mx-auto max-w-4xl px-5 py-10">
        <Link
          href="/"
          className="text-sm text-emerald-400 hover:text-emerald-300"
        >
          ← Back to GoGoalMatch
        </Link>

        <article className="mt-8 rounded-2xl border border-emerald-950 bg-[#0b1b14] p-6 sm:p-10">
          <h1 className="text-3xl font-bold">Disclaimer</h1>

          <p className="mt-3 text-sm text-slate-400">
            Last updated: September 13, 2026
          </p>

          <div className="mt-8 space-y-6 text-slate-300 leading-7">
            <p>
              GoGoalMatch is a football information website. Scores, fixtures,
              statistics, standings, match events, and other information are
              provided for general informational purposes.
            </p>

            <h2 className="text-xl font-semibold text-white">
              No Guarantee of Accuracy
            </h2>

            <p>
              Football information can change rapidly and may be delayed,
              incomplete, or contain errors. GoGoalMatch does not guarantee the
              accuracy, completeness, availability, or timeliness of the
              information displayed on the website.
            </p>

            <h2 className="text-xl font-semibold text-white">
              Betting and Gambling
            </h2>

            <p>
              GoGoalMatch does not provide financial advice, betting advice, or
              guarantees regarding betting outcomes. Information displayed on
              this website should not be considered a recommendation to place a
              wager.
            </p>

            <h2 className="text-xl font-semibold text-white">
              Third-Party Data
            </h2>

            <p>
              Football data and related information may be provided by
              third-party data providers. GoGoalMatch is not responsible for
              errors, delays, interruptions, or inaccuracies originating from
              those providers.
            </p>

            <h2 className="text-xl font-semibold text-white">
              External Websites
            </h2>

            <p>
              GoGoalMatch may contain links to third-party websites. We are not
              responsible for the content, privacy practices, security, or
              availability of external websites.
            </p>

            <h2 className="text-xl font-semibold text-white">Contact</h2>

            <p>
              For questions regarding this Disclaimer, contact{" "}
              <a
                href="mailto:admin@gogoalmatch.com"
                className="text-emerald-400 hover:underline"
              >
                admin@gogoalmatch.com
              </a>
              .
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
