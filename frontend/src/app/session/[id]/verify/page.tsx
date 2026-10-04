"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function VerifyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [finalNote, setFinalNote] = useState(
    "The chain looks better after adjustment.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/sessions/${params.id}/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ final_note: finalNote }),
        },
      );

      if (!response.ok) {
        throw new Error("Verification failed.");
      }

      router.push(`/session/${params.id}/report`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not complete verification. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-7">
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-400">
          Verification
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          Compare before and after
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <label
              htmlFor="final-note"
              className="mb-3 block text-base font-medium text-slate-200"
            >
              Final evidence note
            </label>
            <textarea
              id="final-note"
              value={finalNote}
              onChange={(event) => setFinalNote(event.target.value)}
              rows={5}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-5">
            <label className="mb-3 block text-base font-medium text-slate-200">
              Upload final image
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-950 hover:file:bg-cyan-400"
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-700 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Verifying..." : "Verify repair"}
            </button>
            <a
              href={`/session/${params.id}`}
              className="rounded-full border border-slate-700 px-5 py-3 text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
            >
              Return to session
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
