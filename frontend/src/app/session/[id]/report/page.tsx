"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getReport } from "@/lib/api";

type ReportData = {
  session_id?: string;
  object?: string;
  original_problem?: string;
  initial_observations?: Array<{ description?: string }>;
  possible_causes?: Array<{ cause?: string }>;
  verification_result?: string;
  verification_explanation?: string;
  actions_performed?: Array<{ title: string; outcome: string }>;
  remaining_concerns?: string;
  safety_notes?: string;
  date?: string;
};

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const [report, setReport] = useState<ReportData | null>(null);

  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    async function loadReport() {
      try { setError(""); setReport(await getReport<ReportData>(params.id)); }
      catch (failure) { setError(failure instanceof Error ? failure.message : "Could not load the report."); }
    }

    loadReport();
  }, [params.id, retry]);

  if (error) return <main className="page-shell">
    <p role="alert">{error}</p><button className="button-primary mt-4" onClick={() => setRetry(value => value + 1)}>Retry report</button>
  </main>;
  if (!report) {
    return (
      <main className="page-shell">
        <div className="muted">
          Preparing repair report...
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell max-w-3xl">
      <Link href={`/session/${params.id}`} className="muted hover:text-stone-800">Back to repair notes</Link>
      <h1 className="page-title mt-5">Repair summary</h1>
      <p className="muted mt-2">{report.date ? new Date(report.date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : ""}</p>
      <article className="surface mt-8 space-y-7">
        <section>
          <h2 className="section-title">{report.object || "Your repair"}</h2>
          <p className="mt-3 text-stone-600">{report.original_problem}</p>
          <p className="mt-4 text-sm font-medium">Verification: {report.verification_result || "UNCERTAIN"}</p>
          {report.verification_explanation && <p className="mt-3 text-stone-600">{report.verification_explanation}</p>}
        </section>
        <section className="section-divider">
          <h2 className="section-title">What we observed</h2>
          <ul className="mt-3 space-y-3 text-stone-600">{report.initial_observations?.map((item, index) => <li key={index}>{item.description}</li>)}</ul>
        </section>
        <section className="section-divider">
          <h2 className="section-title">Possible causes</h2>
          <ul className="mt-3 space-y-3 text-stone-600">{report.possible_causes?.map((item, index) => <li key={index}>{item.cause}</li>)}</ul>
        </section>
        {!!report.actions_performed?.length && <section className="section-divider"><h2 className="section-title">What you tried</h2><ul className="mt-3 space-y-3 text-stone-600">{report.actions_performed.map((item, index) => <li key={index}>{item.title}: {item.outcome.toLowerCase().replaceAll("_", " ")}</li>)}</ul></section>}
        <section className="section-divider"><h2 className="section-title">Safety notes</h2><p className="mt-3 text-stone-600">{report.safety_notes}</p></section>
        <section className="section-divider"><h2 className="section-title">Keep in mind</h2><p className="mt-3 text-stone-600">{report.remaining_concerns}</p></section>
        <details className="section-divider text-xs text-stone-500"><summary>Repair reference</summary><p className="mt-3 break-all">{report.session_id}</p></details>
      </article>
    </main>
  );
}
