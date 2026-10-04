import Link from "next/link";

export default function Home() {
  return (
    <main className="page-shell">
      <section className="grid gap-12 py-6 sm:py-12 md:grid-cols-[1.2fr_1fr] md:gap-20">
        <div>
          <p className="mb-5 text-sm font-medium text-[#526747]">A little help before you reach for the toolbox.</p>
          <h1 className="max-w-lg text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Something broken?<br />Let’s take a look.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-stone-600">Share a photo and tell us what’s wrong. We’ll help you understand what might be happening and what to check next.</p>
          <Link href="/investigate" className="button-primary mt-8">Start a repair</Link>
          <p className="mt-3 text-xs text-stone-500">A photo and a short description are all you need.</p>
        </div>
        <div id="how-it-works" className="border-t border-stone-200 pt-7 md:border-l md:border-t-0 md:pl-9 md:pt-1">
          <h2 className="section-title">How it works</h2>
          <ol className="mt-6 space-y-7">
            {[
              ["Show us the problem", "Take a clear photo of the part you’re having trouble with."],
              ["Tell us what happened", "Describe what it does, when it started, and anything you’ve already tried."],
              ["Work through the next steps", "Review possible causes, check the safety notes, and add another photo if needed."],
            ].map(([title, description], index) => (
              <li key={title} className="flex gap-4">
                <span className="pt-0.5 text-sm text-stone-400">0{index + 1}</span>
                <div><h3 className="font-medium">{title}</h3><p className="mt-1 text-sm leading-6 text-stone-500">{description}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="mt-5 border-t border-stone-200 py-8">
        <p className="text-sm font-medium">For the things you use every day.</p>
        <p className="mt-2 text-sm text-stone-500">Bikes, furniture, and household items. Suggestions come from your photos and description; they can’t confirm that a repair is safe.</p>
      </section>
    </main>
  );
}
