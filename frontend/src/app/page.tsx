import Link from "next/link";

const workflow = [
  "See the problem",
  "Investigate the evidence",
  "Reason about causes",
  "Guide safe troubleshooting",
  "Verify the repair",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-full border border-slate-800 bg-slate-900/80 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400 text-sm font-bold text-slate-950">
              F
            </div>
            <div>
              <p className="text-lg font-semibold text-white">FixLens</p>
            </div>
          </div>
          <Link
            href="/investigate"
            className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Start investigation
          </Link>
        </header>

        <section className="grid gap-10 pb-16 pt-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
              Visual troubleshooting powered by multimodal AI
            </p>
            <h1 className="mt-5 max-w-xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Show the problem. Find the cause. Fix it. Verify it.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              FixLens helps people diagnose broken objects from photos and
              plain-language descriptions, then guides safe troubleshooting with
              evidence-backed checks.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/investigate"
                className="rounded-full bg-cyan-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                New investigation
              </Link>
              <a
                href="#workflow"
                className="rounded-full border border-slate-700 px-6 py-3 text-base font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-300"
              >
                See workflow
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-slate-950/60">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
              What are you trying to fix?
            </p>
            <div className="mt-5 rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-5">
              <div className="mb-4 h-48 rounded-2xl bg-linear-to-br from-cyan-500/20 via-slate-800 to-slate-950 p-4">
                <div className="flex h-full items-center justify-center rounded-2xl border border-cyan-500/40 bg-slate-900/80 text-sm text-cyan-300">
                  Upload or capture evidence
                </div>
              </div>
              <textarea
                readOnly
                value="My bicycle chain keeps falling when I change gears."
                className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-200"
                rows={4}
              />
            </div>
          </div>
        </section>

        <section id="workflow" className="pb-16">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">
              Investigation flow
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              SEE → INVESTIGATE → REASON → GUIDE → VERIFY
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {workflow.map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400 text-sm font-bold text-slate-950">
                  {index + 1}
                </div>
                <p className="text-base font-medium text-white">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
