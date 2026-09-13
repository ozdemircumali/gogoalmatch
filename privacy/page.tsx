import Link from "next/link";

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold">Privacy Policy</h1>

          <p className="mt-3 text-sm text-slate-400">
            Last updated: September 13, 2026
          </p>

          <div className="mt-8 space-y-6 text-slate-300 leading-7">
            <p>
              GoGoalMatch respects your privacy. This Privacy Policy explains
              what information may be collected when you use our website and
              how that information may be used.
            </p>

            <h2 className="text-xl font-semibold text-white">
              Information We Collect
            </h2>

            <p>
              GoGoalMatch may collect limited technical information such as
              browser type, device information, IP address, pages visited, and
              general website usage information. We may also store preferences,
              such as favorite matches, in your browser.
            </p>

            <h2 className="text-xl font-semibold text-white">
              Match Notifications
            </h2>

            <p>
              If you enable match notifications, your browser may create a
              push-notification subscription. This information is used to
              deliver GoGoalMatch notifications that you have requested.
            </p>

            <h2 className="text-xl font-semibold text-white">
              Cookies and Advertising
            </h2>

            <p>
              GoGoalMatch may use cookies and similar technologies for website
              functionality, analytics, security, and advertising.
            </p>

            <p>
              Third-party advertising providers, including Google, may use
              cookies or similar technologies to provide, personalize, and
              measure advertisements. Where required by applicable law,
              appropriate choices regarding cookies and personalized
              advertising will be provided.
            </p>

            <h2 className="text-xl font-semibold text-white">
              Third-Party Services
            </h2>

            <p>
              GoGoalMatch may use third-party services for football data,
              hosting, analytics, notifications, and advertising. These
              providers may process information according to their own privacy
              policies.
            </p>

            <h2 className="text-xl font-semibold text-white">
              Your Choices
            </h2>

            <p>
              You can disable browser notifications through your browser or
              device settings. You can also clear locally stored website data
              through your browser settings.
            </p>

            <h2 className="text-xl font-semibold text-white">Contact</h2>

            <p>
              For privacy questions, contact us at{" "}
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
