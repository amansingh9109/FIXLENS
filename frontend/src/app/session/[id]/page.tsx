"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import EvidencePicker from "@/components/evidence-picker";
import ResultText from "@/components/result-text";
import { API_URL, analyzeSession, completeAction, getSession, uploadEvidence, type Session } from "@/lib/api";

export default function SessionPage() {
  const params = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState("");
  const busy = useRef(false);
  const uploaded = useRef(false);
  const loadSession = useCallback(async () => {
    try {
      const data = await getSession(params.id);
      setSession(data);
      if (data.analysis_error) {
        setError(typeof data.analysis_error === "string" ? data.analysis_error : data.analysis_error.message || "Analysis couldn't be completed.");
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not load this investigation.");
    } finally { setLoading(false); }
  }, [params.id]);
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => { if (active) void loadSession(); });
    return () => { active = false; };
  }, [loadSession]);

  async function investigate() {
    if (busy.current) return;
    busy.current = true; setError("");
    try {
      if (file && !uploaded.current) {
        setProgress("Uploading evidence...");
        await uploadEvidence(params.id, file, "Additional troubleshooting evidence", "ADDITIONAL");
        uploaded.current = true;
      }
      setProgress("Analyzing evidence and checking safety...");
      await analyzeSession(params.id);
      await loadSession();
      setFile(null); uploaded.current = false;
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Analysis couldn't be completed. Please retry.");
    } finally { busy.current = false; setProgress(""); }
  }

  async function recordAction(step: number, outcome: string) {
    if (busy.current) return;
    busy.current = true; setError(""); setProgress("Saving your repair notes...");
    try { await completeAction(params.id, step, outcome); await loadSession(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Could not save this step."); }
    finally { busy.current = false; setProgress(""); }
  }

  if (loading) {
    return (
      <main className="page-shell">
        <div className="muted">
          Loading investigation...
        </div>
      </main>
    );
  }

  if (!session) {
    return <main className="page-shell">
      <p role="alert">{error || "This investigation could not be loaded."}</p>
      <button className="button-primary mt-4" onClick={() => { setError(""); void loadSession(); }}>Retry loading</button>
      <Link className="ml-4" href="/investigate">New investigation</Link>
    </main>;
  }

  return (
    <main className="page-shell">
      <div className="flex flex-wrap items-start justify-between gap-5 border-b border-stone-200 pb-7">
        <div>
          <p className="muted">Your repair notes</p>
          <h1 className="page-title mt-2">{session.analysis?.object_name || "Your repair"}</h1>
          <p className="mt-3 max-w-2xl text-stone-600">{session.description}</p>
        </div>
        <Link href={`/session/${session.session_id}/verify`} className="button-secondary">Verify repair</Link>
      </div>
      {error && <div role="alert" className="notice-error mt-6">{error}</div>}
      {progress && <p role="status" aria-live="polite" className="mt-6 text-sm text-[#465c3e]">{progress}</p>}
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14">
        <div className="space-y-8">
          {session.analysis && <ResultText key={JSON.stringify(session.analysis)} analysis={session.analysis} />}
          <section>
            <h2 className="section-title">What we can see</h2>
            <p className="muted mt-1">What can be seen in your photos.</p>
            {session.observations.length === 0 && <p className="mt-4 text-stone-500">No observations yet. Run a check to get started.</p>}
            <ul className="mt-4 divide-y divide-stone-200">
              {session.observations.map((item, index) => <li key={index} className="py-4 first:pt-0">
                <p>{item.description}</p><p className="muted mt-2">{Math.round(item.confidence * 100)}% confidence</p>
              </li>)}
            </ul>
          </section>
          <section className="section-divider">
            <h2 className="section-title">Possible causes</h2>
            <p className="muted mt-1">Things to investigate, rather than confirmed faults.</p>
            <ul className="mt-4 divide-y divide-stone-200">
              {session.hypotheses.map((item, index) => <li key={index} className="py-4 first:pt-0">
                <p>{item.cause}</p><p className="muted mt-2">{item.status.toLowerCase()} · {Math.round(item.confidence * 100)}% confidence</p>
              </li>)}
            </ul>
          </section>
          <section className="section-divider">
            <h2 className="section-title">Safety assessment</h2>
            <p className="mt-3 text-sm font-medium">{session.risk_level === "HIGH" ? "Stop and get professional help" : session.risk_level === "MEDIUM" ? "Proceed with caution" : session.risk_level === "LOW" ? "Lower risk — still take care" : "Safety is not yet established"}</p>
            <p className="mt-2 text-stone-600">{session.analysis?.safety.reason || "There isn’t enough information to assess safety."}</p>
            {session.analysis?.safety.warning && <p className={session.risk_level === "HIGH" ? "notice-error mt-4" : "notice-warning mt-4"}>{session.analysis.safety.warning}</p>}
          </section>
          <section className="section-divider">
            <h2 className="section-title">What to do next</h2>
            <p className="mt-3 text-stone-600">{session.analysis?.next_action.replaceAll("_", " ") || "Add a photo and check the problem."}</p>
            {(session.analysis?.evidence_required.length ?? 0) > 0 && <>
              <h3 className="mt-6 font-medium">A few more photos would help</h3>
              <ul className="mt-3 space-y-4">
                {session.analysis?.evidence_required.map((item, index) => <li key={index} className="border-l-2 border-stone-200 pl-4">
                  <p>{item.instruction}</p><p className="muted mt-1">{item.reason}</p>
                </li>)}
              </ul>
            </>}
            <div className="mt-6">
              <EvidencePicker file={file} disabled={!!progress} onChange={selected => { setFile(selected); uploaded.current = false; }} label="Add another photo" />
              <button disabled={!!progress} onClick={investigate} className="button-primary mt-4">
                {progress ? "Working on it..." : file ? "Upload and check again" : "Check again"}
              </button>
            </div>
          </section>
          {session.repair_steps.length > 0 && <section className="section-divider">
            <h2 className="section-title">Things to check</h2>
            <ol className="mt-4 space-y-6">
              {session.repair_steps.map(step => <li key={step.step_number}>
                <h3 className="font-medium">{step.step_number}. {step.title}</h3>
                <p className="mt-2 text-stone-600">{step.instruction}</p>
                <p className="mt-2 text-sm text-amber-900">{step.safety_warning}</p>
                <p className="muted mt-2">Expected result: {step.expected_result}</p>
                <p className="muted mt-2">Status: {step.status.toLowerCase().replaceAll("_", " ")}</p>
                <label className="mt-3 block text-sm">Record the outcome of step {step.step_number}
                  <select className="field mt-2" value="" disabled={!!progress || !["LOW", "MEDIUM"].includes(session.risk_level)} onChange={event => { if (event.target.value) void recordAction(step.step_number, event.target.value); }}>
                    <option value="">Choose what happened</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="IMPROVED">The problem improved</option>
                    <option value="UNCHANGED">It did not help</option>
                    <option value="WORSE">The problem got worse</option>
                    <option value="CANNOT_PERFORM">I cannot do this step</option>
                  </select>
                </label>
              </li>)}
            </ol>
          </section>}
        </div>
        <aside className="space-y-7 lg:border-l lg:border-stone-200 lg:pl-7">
          <section>
            <h2 className="section-title">Your photos</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              {session.evidence.map(item => <figure key={item.id}>
                <Image unoptimized width={800} height={600} src={`${API_URL}${item.url}`} alt={`Uploaded evidence: ${item.file_name}`} className="h-auto max-h-64 w-full rounded-md object-contain" />
                <figcaption className="muted mt-2 break-all">{item.stage === "FINAL" ? "After" : item.stage === "ADDITIONAL" ? "Additional photo" : "Before"} · {item.file_name}</figcaption>
              </figure>)}
            </div>
          </section>
          <div className="section-divider text-sm">
            <p className="muted">Part being checked</p>
            <p className="mt-1">{session.analysis?.component || "Not yet identified"}</p>
            <p className="muted mt-4">Status</p><p className="mt-1 capitalize">{session.status.replaceAll("_", " ")}</p>
          </div>
          <details className="section-divider text-sm">
            <summary className="font-medium">Repair history</summary>
            <ul className="mt-4 space-y-3 text-stone-600">{session.timeline.map(event => <li key={event.id}>{event.description}</li>)}</ul>
            <p className="mt-5 break-all text-xs text-stone-400">Reference: {session.session_id}</p>
          </details>
        </aside>
      </div>
    </main>
  );
}
