"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, ChevronLeft, ShieldCheck, Settings2, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const REPORT_DATA = {
  date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  object: "Bicycle",
  component: "Rear Drivetrain",
  problem: "My bicycle chain keeps falling when I change gears.",
  before: [
    "Chain appeared to have more slack than expected (82% conf.)",
    "Rear derailleur alignment was 4° off vertical index"
  ],
  actions: [
    "Inspected chain link play on rear cassette",
    "Realigned rear derailleur hanger using indexing barrel",
    "Calibrated high/low limit screws"
  ],
  after: [
    "Chain slack returned to calibrated tension",
    "Derailleur cage vertically aligned with cassette index"
  ],
  result: "LIKELY RESOLVED",
  confidence: 88
};

export default function ReportPage() {
  const params = useParams();
  const sessionId = params.id as string;

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-4 sm:py-8 animate-in fade-in duration-700">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link 
            href="/" 
            className="inline-flex items-center gap-1 text-xs font-mono mb-2 transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronLeft className="w-4 h-4" />
            RETURN TO DASHBOARD
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>
            Investigation Report
          </h1>
          <p className="font-mono text-xs flex items-center gap-3" style={{ color: "var(--text-muted)" }}>
            <span>SESSION // {sessionId}</span>
            <span>•</span>
            <span>{REPORT_DATA.date}</span>
          </p>
        </div>
        <div>
          <Button 
            variant="outline" 
            className="font-mono text-xs rounded-xl border transition-colors"
            style={{
              backgroundColor: "var(--bg-nested)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)"
            }}
          >
            <Download className="w-3.5 h-3.5 mr-2" />
            EXPORT PDF
          </Button>
        </div>
      </div>

      <div 
        className="border shadow-2xl overflow-hidden relative rounded-2xl transition-all duration-300"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-color)"
        }}
      >
        {/* Subtle Ambient Glow */}
        <div 
          className="absolute top-0 right-0 w-96 h-96 blur-[120px] pointer-events-none -translate-y-1/3 translate-x-1/3"
          style={{ backgroundColor: "var(--ambient-glow)" }}
        />
        
        <div className="border-b p-6 sm:p-8" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div>
              <div className="text-xs font-mono tracking-widest uppercase mb-1" style={{ color: "var(--text-muted)" }}>
                Object Diagnosis
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                {REPORT_DATA.object} — {REPORT_DATA.component}
              </h2>
              <p className="text-sm italic" style={{ color: "var(--text-secondary)" }}>
                &quot;{REPORT_DATA.problem}&quot;
              </p>
            </div>
            
            <div className="flex flex-col sm:items-end">
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors"
                style={{
                  backgroundColor: "var(--bg-badge)",
                  borderColor: "var(--border-badge)"
                }}
              >
                <ShieldCheck className="w-4 h-4" style={{ color: "var(--accent-icon-3)" }} />
                <span className="text-xs font-mono font-bold tracking-wider" style={{ color: "var(--accent-icon-3)" }}>
                  {REPORT_DATA.result}
                </span>
              </div>
              <p className="text-xs font-mono mt-1.5" style={{ color: "var(--text-muted)" }}>
                Confidence: {REPORT_DATA.confidence}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-mono tracking-widest uppercase mb-3 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <span 
                    className="w-5 h-5 rounded border flex items-center justify-center text-[10px]"
                    style={{
                      backgroundColor: "var(--bg-nested)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)"
                    }}
                  >
                    01
                  </span>
                  Initial Observations
                </h3>
                <ul className="space-y-2.5">
                  {REPORT_DATA.before.map((obs, i) => (
                    <li key={i} className="flex items-start text-sm" style={{ color: "var(--text-secondary)" }}>
                      <div className="w-1.5 h-1.5 rounded-full mt-2 mr-3 shrink-0" style={{ backgroundColor: "var(--signal-color)" }} />
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-mono tracking-widest uppercase mb-3 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <span 
                    className="w-5 h-5 rounded border flex items-center justify-center text-[10px]"
                    style={{
                      backgroundColor: "var(--bg-nested)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)"
                    }}
                  >
                    02
                  </span>
                  Corrective Actions Performed
                </h3>
                <ul className="space-y-2.5">
                  {REPORT_DATA.actions.map((action, i) => (
                    <li key={i} className="flex items-start text-sm" style={{ color: "var(--text-secondary)" }}>
                      <Settings2 className="w-4 h-4 mr-2.5 shrink-0 mt-0.5" style={{ color: "var(--accent-icon)" }} />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div 
                className="border rounded-xl p-5 transition-colors"
                style={{
                  backgroundColor: "var(--bg-badge)",
                  borderColor: "var(--border-badge)"
                }}
              >
                <h3 className="text-xs font-mono tracking-widest uppercase mb-3 flex items-center gap-2" style={{ color: "var(--accent-icon-3)" }}>
                  <span 
                    className="w-5 h-5 rounded border flex items-center justify-center text-[10px]"
                    style={{
                      backgroundColor: "var(--bg-nested)",
                      borderColor: "var(--border-badge)",
                      color: "var(--accent-icon-3)"
                    }}
                  >
                    03
                  </span>
                  Verification Telemetry
                </h3>
                <ul className="space-y-2.5">
                  {REPORT_DATA.after.map((res, i) => (
                    <li key={i} className="flex items-start text-sm" style={{ color: "var(--text-primary)" }}>
                      <CheckCircle2 className="w-4 h-4 mr-2.5 shrink-0 mt-0.5" style={{ color: "var(--accent-icon-3)" }} />
                      <span>{res}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div 
                className="border rounded-xl p-5 transition-colors"
                style={{
                  backgroundColor: "var(--bg-nested)",
                  borderColor: "var(--border-color)"
                }}
              >
                <h3 className="text-xs font-mono tracking-widest uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Safety Disclaimer
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  Visual verification confirms alignment and mechanical tension within visible tolerances. Test operate in a secure environment before full regular load.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-center">
        <Link 
          href="/investigate" 
          className="h-12 px-8 rounded-xl font-medium text-xs font-mono uppercase tracking-wider text-white hover:brightness-110 transition-all border border-white/10 inline-flex items-center gap-2"
          style={{
            backgroundImage: "var(--btn-grad)",
            boxShadow: "var(--btn-shadow)"
          }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Start Another Investigation</span>
        </Link>
      </div>
    </div>
  );
}
