import Link from "next/link";

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold">Terms of Service</h1>

          <p className="mt-3 text-sm text-slate-400">
            Last updated: September 13, 2026
          </p>

          <div className="mt-8 space-y-6 text-slate-300 leading-7">
            <p>
              By using GoGoalMatch, you agree to these Terms of Service. If you
              do not agree with these terms, please do not use the website.
            </p>

            <h2 className="text-xl font-semibold text-white">
              Use of the Website
            </h2>

            <p>
              GoGoalMatch provides football scores, fixtures, results,
              statistics, standings, and related information for general
              informational purposes.
            </p>

            <p>
              You agree not to misuse the website, interfere with its
              operation, attempt unauthorized access, or use the service for
              unlawful purposes.
            </p>

            <h2 className="text-xl font-semibold text-white">
              Accuracy of Information
            </h2>

            <p>
              Football information may be delayed, incomplete, or contain
              errors. GoGoalMatch does not guarantee that scores, statistics,
              fixtures, standings, or other information will always be
              accurate, complete, current, or available.
            </p>

            <h2 className="text-xl font-semibold text-white">
              Third-Party Services
            </h2>

            <p>
              GoGoalMatch may use third-party services to provide football
              data, hosting, analytics, notifications, and advertising.
              Third-party services may operate under their own terms and
              policies.
            </p>

            <h2 className="text-xl font-semibold text-white">
              Changes to These Terms
            </h2>

            <p>
              We may update these terms or change website features from time to
              time. Updated terms will be posted on this page.
            </p>

            <h2 className="text-xl font-semibold text-white">Contact</h2>

            <p>
              Questions about these terms can be sent to{" "}
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
