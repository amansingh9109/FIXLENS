"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import EvidencePicker from "@/components/evidence-picker";
import { uploadEvidence, verifySession } from "@/lib/api";

export default function VerifyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [finalNote, setFinalNote] = useState(
    "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const uploaded = useRef(false);
  const busy = useRef(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setError("");
    setIsSubmitting(true);

    try {
      if (file && !uploaded.current) {
        await uploadEvidence(params.id, file, finalNote, "FINAL");
        uploaded.current = true;
      }
      await verifySession(params.id, finalNote);

      router.push(`/session/${params.id}/report`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not complete verification. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      busy.current = false;
    }
  }

  return (
    <main className="page-shell max-w-3xl">
      <a href={`/session/${params.id}`} className="muted hover:text-stone-800">Back to repair notes</a>
      <h1 className="page-title mt-5">How did it go?</h1>
      <p className="mt-3 text-stone-600">Record what changed and add a photo of the result.</p>
      <form onSubmit={handleSubmit} className="surface mt-8 space-y-7">
        <div>
          <label htmlFor="final-note" className="mb-2 block font-medium">What changed?</label>
          <textarea id="final-note" value={finalNote} onChange={event => setFinalNote(event.target.value)} disabled={isSubmitting} rows={4}
            className="field" placeholder="What did you try? Is the problem better, worse, or unchanged?" />
        </div>
        <EvidencePicker file={file} disabled={isSubmitting} onChange={selected => { setFile(selected); uploaded.current = false; }} label="Add a photo of the result (optional)" />
        <p className="muted">If before and after photos are available, we compare visible changes. Otherwise, we record your note. Neither can guarantee that the item works or is safe.</p>
        {error && <div role="alert" className="notice-error">{error}</div>}
        <div className="flex flex-wrap items-center gap-4 border-t border-stone-200 pt-6">
          <button type="submit" disabled={isSubmitting} className="button-primary">{isSubmitting ? "Saving..." : "Verify repair"}</button>
          <a href={`/session/${params.id}`} className="text-sm text-stone-600 hover:text-stone-900">Return to notes</a>
        </div>
      </form>
    </main>
  );
}
