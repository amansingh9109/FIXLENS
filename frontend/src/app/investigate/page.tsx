"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function InvestigatePage() {
  const router = useRouter();
  const [description, setDescription] = useState(
    "My bicycle chain keeps falling when I change gears.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!description.trim() || description.trim().length < 10) {
      setError("Please describe the problem in at least 10 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: description.trim() }),
      });

      if (!response.ok) {
        throw new Error("Unable to create a repair session.");
      }

      const data = await response.json();
      router.push(`/session/${data.session_id}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The investigation could not start. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/70 p-7 shadow-2xl shadow-slate-950/50 backdrop-blur-sm">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-400">
              FixLens
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Start a new investigation
            </h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            Back home
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <label
              htmlFor="problem"
              className="mb-3 block text-base font-medium text-slate-200"
            >
              What are you trying to fix?
            </label>
            <textarea
              id="problem"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={6}
              maxLength={2000}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-white outline-none transition focus:border-cyan-400"
              placeholder="Example: My bicycle chain keeps falling when I change gears."
            />
            <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
              <span>Clear, natural language is encouraged.</span>
              <span>{description.length}/2000</span>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-5">
            <label className="mb-3 block text-base font-medium text-slate-200">
              Add evidence image
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-950 hover:file:bg-cyan-400"
            />
            <p className="mt-2 text-sm text-slate-400">
              Supported: JPG, JPEG, PNG, WebP. Max size: 10 MB.
            </p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-700 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Starting investigation..." : "Start Investigation"}
          </button>
        </form>
      </div>
    </main>
  );
}
