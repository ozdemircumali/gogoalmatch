import Link from "next/link";

export default function CookiePolicyPage() {
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
          <h1 className="text-3xl font-bold">Cookie Policy</h1>

          <p className="mt-3 text-sm text-slate-400">
            Last updated: September 13, 2026
          </p>

          <div className="mt-8 space-y-6 text-slate-300 leading-7">
            <p>
              GoGoalMatch uses cookies and similar technologies to operate the
              website, remember preferences, understand website usage, and
              support advertising.
            </p>

            <h2 className="text-xl font-semibold text-white">
              Essential Storage
            </h2>

            <p>
              Some information may be stored in your browser to support
              features such as favorite matches, notification preferences, and
              other website settings.
            </p>

            <h2 className="text-xl font-semibold text-white">
              Analytics
            </h2>

            <p>
              GoGoalMatch may use analytics technologies to understand how
              visitors use the website and to improve website performance,
              content, and user experience.
            </p>

            <h2 className="text-xl font-semibold text-white">
              Advertising Cookies
            </h2>

            <p>
              If advertising is enabled, Google and other advertising partners
              may use cookies or similar technologies to deliver, personalize,
              limit, and measure advertisements, subject to applicable laws and
              user choices.
            </p>

            <h2 className="text-xl font-semibold text-white">
              Managing Cookies
            </h2>

            <p>
              You can control or delete cookies through your browser settings.
              Blocking certain cookies may affect some website features.
            </p>

            <h2 className="text-xl font-semibold text-white">Contact</h2>

            <p>
              Questions about this Cookie Policy can be sent to{" "}
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
