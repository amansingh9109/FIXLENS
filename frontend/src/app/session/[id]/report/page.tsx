"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type ReportData = {
  session_id?: string;
  object?: string;
  original_problem?: string;
  initial_observations?: Array<{ description?: string }>;
  possible_causes?: Array<{ cause?: string }>;
  verification_result?: string;
  remaining_concerns?: string;
  safety_notes?: string;
  date?: string;
};

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const [report, setReport] = useState<ReportData | null>(null);

  useEffect(() => {
    async function loadReport() {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/sessions/${params.id}/report`,
      );
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      }
    }

    loadReport();
  }, [params.id]);

  if (!report) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-200">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-4">
          Preparing repair report...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900 p-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-cyan-400">
              Final repair report
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Session {report.session_id}
            </h1>
          </div>
          <Link
            href={`/session/${params.id}`}
            className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-cyan-400 hover:text-cyan-300"
          >
            Back to session
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <h2 className="text-lg font-semibold text-white">
              Problem summary
            </h2>
            <p className="mt-3 text-slate-300">
              Object: {report.object || "Unknown"}
            </p>
            <p className="mt-2 text-slate-300">
              Original problem: {report.original_problem}
            </p>
            <p className="mt-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              Verification: {report.verification_result || "UNCERTAIN"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <h2 className="text-lg font-semibold text-white">Safety notes</h2>
            <p className="mt-3 text-slate-300">{report.safety_notes}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <h2 className="text-lg font-semibold text-white">
              Initial observations
            </h2>
            <ul className="mt-3 space-y-2 text-slate-300">
              {(report.initial_observations || []).map((item, index) => (
                <li key={`${item.description}-${index}`}>{item.description}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <h2 className="text-lg font-semibold text-white">
              Possible causes
            </h2>
            <ul className="mt-3 space-y-2 text-slate-300">
              {(report.possible_causes || []).map((item, index) => (
                <li key={`${item.cause}-${index}`}>{item.cause}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <h2 className="text-lg font-semibold text-white">
            Remaining concerns
          </h2>
          <p className="mt-3 text-slate-300">{report.remaining_concerns}</p>
        </div>
      </div>
    </main>
  );
}
