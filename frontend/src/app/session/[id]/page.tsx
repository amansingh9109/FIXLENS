"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type SessionData = {
  session_id?: string;
  description?: string;
  status?: string;
  object_category?: string;
  risk_level?: string;
  observations?: Array<{
    description: string;
    confidence: number;
    evidence_reference?: string;
  }>;
  hypotheses?: Array<{ cause: string; confidence: number; status?: string }>;
  repair_steps?: Array<{
    step_number: number;
    title: string;
    instruction: string;
    expected_result: string;
    safety_warning: string;
  }>;
  timeline?: Array<{ type: string; description: string; timestamp: string }>;
  evidence?: Array<{ type: string; description: string; file_name?: string }>;
  analysis?: { safety?: { level: string; reason: string; warning?: string } };
};

export default function SessionPage() {
  const params = useParams<{ id: string }>();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/v1/sessions/${params.id}`,
        );
        if (!response.ok) {
          throw new Error("Session not found");
        }
        const data = await response.json();
        setSession(data);
      } catch {
        setSession({
          session_id: params.id,
          description: "My bicycle chain keeps falling when I change gears.",
          status: "offline-mode",
          object_category: "Bicycle",
          risk_level: "LOW",
          observations: [
            {
              description: "Chain appears loose or misaligned in the image.",
              confidence: 0.82,
            },
          ],
          hypotheses: [
            {
              cause: "Derailleur adjustment issue",
              confidence: 0.72,
              status: "POSSIBLE",
            },
          ],
          repair_steps: [
            {
              step_number: 1,
              title: "Inspect chain position",
              instruction:
                "Check whether the chain sits correctly on the cassette.",
              expected_result:
                "Chain appears aligned and no obvious slack is visible.",
              safety_warning:
                "Do not work near moving parts while the bike is in gear.",
            },
          ],
          timeline: [
            {
              type: "session_created",
              description: "Repair session started",
              timestamp: new Date().toISOString(),
            },
          ],
          evidence: [
            { type: "image", description: "Initial evidence uploaded" },
          ],
          analysis: {
            safety: {
              level: "LOW",
              reason: "No obvious high-risk condition is visible.",
            },
          },
        });
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [params.id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-200">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-4 text-lg">
          Loading investigation...
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  const riskTone =
    session.risk_level === "HIGH"
      ? "border-rose-500 bg-rose-500/10 text-rose-200"
      : session.risk_level === "MEDIUM"
        ? "border-amber-500 bg-amber-500/10 text-amber-200"
        : "border-emerald-500 bg-emerald-500/10 text-emerald-200";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">
              Investigation workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Session {session.session_id}
            </h1>
          </div>
          <div className="flex gap-3">
            <Link
              href="/investigate"
              className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-cyan-400"
            >
              New session
            </Link>
            <Link
              href={`/session/${session.session_id}/verify`}
              className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
            >
              Verify repair
            </Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
                Problem description
              </p>
              <p className="mt-3 text-lg text-slate-100">
                {session.description}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Observed findings
                </h2>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskTone}`}
                >
                  {session.risk_level || "UNKNOWN"} Risk
                </span>
              </div>
              <div className="space-y-4">
                {(session.observations || []).map((observation, index) => (
                  <div
                    key={`${observation.description}-${index}`}
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                  >
                    <p className="text-slate-100">{observation.description}</p>
                    <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
                      <span>Confidence</span>
                      <span>
                        {Math.round((observation.confidence || 0) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">
                Possible causes
              </h2>
              <div className="space-y-4">
                {(session.hypotheses || []).map((hypothesis, index) => (
                  <div
                    key={`${hypothesis.cause}-${index}`}
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                  >
                    <p className="text-slate-100">{hypothesis.cause}</p>
                    <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
                      <span>{hypothesis.status || "POSSIBLE"}</span>
                      <span>
                        {Math.round((hypothesis.confidence || 0) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">
                Investigation status
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>
                  Object:{" "}
                  <span className="font-medium text-white">
                    {session.object_category || "Unknown"}
                  </span>
                </li>
                <li>
                  Status:{" "}
                  <span className="font-medium text-white">
                    {session.status}
                  </span>
                </li>
                <li>
                  Safety:{" "}
                  <span className="font-medium text-white">
                    {session.analysis?.safety?.level ||
                      session.risk_level ||
                      "UNKNOWN"}
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">
                Suggested next step
              </h2>
              <p className="mt-3 text-sm text-slate-300">
                {session.analysis?.safety?.reason ||
                  "More evidence is required before continuing."}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">
                Evidence timeline
              </h2>
              <ul className="mt-4 space-y-3 border-l border-slate-700 pl-4 text-sm text-slate-300">
                {(session.timeline || []).map((event) => (
                  <li
                    key={event.timestamp}
                    className="relative before:absolute before:left-[-1.3rem] before:top-1 before:h-2 before:w-2 before:rounded-full before:bg-cyan-400"
                  >
                    <div className="font-medium text-white">{event.type}</div>
                    <div>{event.description}</div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-white">
            Troubleshooting steps
          </h2>
          <div className="mt-4 space-y-4">
            {(session.repair_steps || []).map((step) => (
              <div
                key={step.step_number}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm uppercase tracking-[0.14em] text-cyan-400">
                    Step {step.step_number}
                  </p>
                  <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">
                    PENDING
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-slate-200">{step.instruction}</p>
                <p className="mt-2 text-sm text-slate-400">
                  Expected result: {step.expected_result}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
