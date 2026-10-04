"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import EvidencePicker from "@/components/evidence-picker";
import { analyzeSession, createSession, uploadEvidence } from "@/lib/api";

export default function InvestigatePage() {
  const router = useRouter();
  const [description, setDescription] = useState(
    "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState("");
  const pending = useRef({ sessionId: "", uploaded: false });
  const busy = useRef(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy.current) return;
    setError("");

    if (!description.trim() || description.trim().length < 10) {
      setError("Please describe the problem in at least 10 characters.");
      return;
    }

    if (!file) { setError("Please select an evidence image."); return; }
    busy.current = true;
    setIsSubmitting(true);

    try {
      if (!pending.current.sessionId) {
        setProgress("Starting your repair notes...");
        const data = await createSession(description.trim());
        pending.current.sessionId = data.session_id;
      }
      if (!pending.current.uploaded) {
        setProgress("Uploading your photo...");
        await uploadEvidence(pending.current.sessionId, file, description.trim());
        pending.current.uploaded = true;
      }
      setProgress("Looking at your photo and checking safety...");
      await analyzeSession(pending.current.sessionId);
      setProgress("Getting your notes ready...");
      router.push(`/session/${encodeURIComponent(pending.current.sessionId)}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The investigation could not start. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      busy.current = false;
      setProgress("");
    }
  }

  return (
    <main className="page-shell max-w-3xl">
      <Link href="/" className="muted hover:text-stone-800">Back home</Link>
      <h1 className="page-title mt-5">What needs fixing?</h1>
      <p className="mt-3 text-stone-600">Tell us a little about the problem and add a clear photo.</p>
      <form onSubmit={handleSubmit} className="surface mt-8 space-y-7">
        <div>
          <label htmlFor="problem" className="mb-2 block font-medium">What are you trying to fix?</label>
          <textarea id="problem" value={description} disabled={isSubmitting} rows={5} maxLength={2000}
            onChange={event => { setDescription(event.target.value); pending.current = { sessionId: "", uploaded: false }; }}
            className="field" placeholder="For example: My bike chain falls off when I change gears." />
          <div className="mt-2 flex justify-between gap-4 text-xs text-stone-500">
            <span>What happens? When did it start?</span><span>{description.length}/2000</span>
          </div>
        </div>
        <EvidencePicker file={file} disabled={isSubmitting} onChange={selected => { setFile(selected); pending.current = { sessionId: "", uploaded: false }; }} label="Add a photo" />
        {progress && <p role="status" aria-live="polite" className="text-sm text-[#465c3e]">{progress}</p>}
        {error && <div role="alert" className="notice-error">{error}</div>}
        <div className="flex flex-wrap items-center gap-4 border-t border-stone-200 pt-6">
          <button type="submit" disabled={isSubmitting} className="button-primary">
            {isSubmitting ? "Working on it..." : error ? "Try again" : "Check this problem"}
          </button>
          <span className="muted">You can add more photos later.</span>
        </div>
      </form>
    </main>
  );
}
