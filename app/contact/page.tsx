import Link from "next/link";

export default function ContactPage() {
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
          <h1 className="text-3xl font-bold">Contact Us</h1>

          <div className="mt-8 space-y-6 text-slate-300 leading-7">
            <p>
              If you have a question about GoGoalMatch, privacy, advertising,
              football data, corrections, or technical issues, please contact
              us by email.
            </p>

            <div className="rounded-xl border border-emerald-950 bg-[#07140f] p-5">
              <p className="text-sm text-slate-400">Email</p>

              <a
                href="mailto:admin@gogoalmatch.com"
                className="mt-1 inline-block text-lg text-emerald-400 hover:underline"
              >
                admin@gogoalmatch.com
              </a>
            </div>

            <p>
              We will review legitimate requests and respond as soon as
              reasonably possible.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
