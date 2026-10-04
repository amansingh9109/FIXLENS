"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  CheckCircle2, 
  Info, 
  Search, 
  ChevronRight, 
  FileCheck,
  Aperture,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const MOCK_DATA = {
  object: { name: "Bicycle", component: "Rear Drivetrain", confidence: 94 },
  observations: [
    { id: 1, desc: "Chain appears to have more slack than expected", confidence: 82, signal: "Chain slack" },
    { id: 2, desc: "Rear derailleur alignment seems slightly off-axis", confidence: 75, signal: "Derailleur angle" }
  ],
  causes: [
    { id: 1, title: "Derailleur indexing & B-tension adjustment issue", confidence: 68 },
    { id: 2, title: "Excessive chain link wear / stretched chain", confidence: 45 }
  ],
  safety: { level: "LOW RISK", desc: "Standard mechanical adjustment. No electrical or high-pressure hazard." },
  steps: [
    { 
      id: 1, 
      title: "Inspect Chain Position & Tension", 
      desc: "Check whether the chain is seated cleanly on the rear cassette cogs without binding.",
      reason: "Confirms if chain derailment is caused by misaligned cogs or physical chain link damage." 
    },
    { 
      id: 2, 
      title: "Check Rear Derailleur Hanger Alignment", 
      desc: "Look directly from behind the bicycle to verify if the derailleur cage forms a straight vertical line with the chosen rear cog.",
      reason: "A bent hanger causes irregular chain jumping across multiple gears." 
    }
  ]
};

export default function SessionWorkspace() {
  const params = useParams();
  const sessionId = params.id as string;
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleStepComplete = (id: number) => {
    if (!completedSteps.includes(id)) {
      setCompletedSteps([...completedSteps, id]);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-2 sm:py-6 animate-in fade-in duration-500">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b" style={{ borderColor: "var(--border-color)" }}>
        <div>
          <div className="flex items-center gap-2 text-xs font-mono mb-1" style={{ color: "var(--text-muted)" }}>
            <span>SESSION // {sessionId}</span>
            <span>•</span>
            <span style={{ color: "var(--accent-icon-3)" }}>ACTIVE INVESTIGATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Workspace Console
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-colors duration-300"
            style={{
              backgroundColor: "var(--bg-badge)",
              borderColor: "var(--border-badge)",
              color: "var(--accent-icon-3)"
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--accent-icon-3)" }} />
            <span>AI ANALYSIS ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Evidence & Visual Telemetry */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          <div 
            className="border rounded-2xl shadow-xl overflow-hidden transition-all duration-300"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)"
            }}
          >
            {/* Radar Viewport */}
            <div 
              className="h-60 relative overflow-hidden flex items-center justify-center bg-radar-grid border-b"
              style={{
                backgroundColor: "var(--bg-nested)",
                borderColor: "var(--border-color)"
              }}
            >
              <div 
                className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono"
                style={{
                  backgroundColor: "var(--bg-badge)",
                  borderColor: "var(--border-badge)",
                  color: "var(--accent-icon-3)"
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--accent-icon-3)" }} />
                <span>94% confidence</span>
              </div>

              <div 
                className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono"
                style={{
                  backgroundColor: "var(--bg-badge)",
                  borderColor: "var(--border-badge)",
                  color: "var(--text-primary)"
                }}
              >
                <Aperture className="w-3 h-3" style={{ color: "var(--accent-icon-2)" }} />
                <span>Frame / 01</span>
              </div>

              {/* Glowing SVG Target Rings */}
              <div className="w-48 h-32 flex items-center justify-center animate-pulse-slow">
                <svg viewBox="0 0 200 120" fill="none" className="w-full h-full">
                  <ellipse cx="100" cy="60" rx="80" ry="28" transform="rotate(-10 100 60)" stroke="var(--radar-ring-1)" strokeWidth="1.5" />
                  <ellipse cx="98" cy="60" rx="45" ry="36" transform="rotate(12 98 60)" stroke="var(--radar-ring-2)" strokeWidth="1" />
                  <circle cx="100" cy="60" r="2.5" fill="var(--text-primary)" />
                </svg>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <div className="text-[11px] font-mono tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                  Detected Object
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>{MOCK_DATA.object.name}</span>
                  <span 
                    className="px-2 py-0.5 rounded border font-mono text-xs"
                    style={{
                      backgroundColor: "var(--bg-badge)",
                      borderColor: "var(--border-badge)",
                      color: "var(--accent-icon)"
                    }}
                  >
                    {MOCK_DATA.object.confidence}% match
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{MOCK_DATA.object.component}</p>
              </div>

              <div className="border-t" style={{ borderColor: "var(--border-color)" }} />

              <div>
                <div className="text-[11px] font-mono tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                  Safety Classification
                </div>
                <div 
                  className="flex p-3 rounded-xl border"
                  style={{
                    backgroundColor: "var(--bg-badge)",
                    borderColor: "var(--border-badge)"
                  }}
                >
                  <ShieldCheck className="w-5 h-5 mt-0.5 mr-2.5 shrink-0" style={{ color: "var(--accent-icon-3)" }} />
                  <div>
                    <p className="font-semibold text-xs tracking-wider uppercase font-mono" style={{ color: "var(--accent-icon-3)" }}>
                      {MOCK_DATA.safety.level}
                    </p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {MOCK_DATA.safety.desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Analysis and Action Plan Tabs */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList 
              className="grid w-full grid-cols-2 border p-1 rounded-xl transition-colors duration-300"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-color)"
              }}
            >
              <TabsTrigger 
                value="analysis" 
                className="data-[state=active]:shadow-sm rounded-lg text-xs font-mono uppercase tracking-wider transition-all"
                style={{ color: "var(--text-primary)" }}
              >
                Visual Analysis
              </TabsTrigger>
              <TabsTrigger 
                value="guidance" 
                className="data-[state=active]:shadow-sm rounded-lg text-xs font-mono uppercase tracking-wider transition-all"
                style={{ color: "var(--text-primary)" }}
              >
                Troubleshooting Steps ({completedSteps.length}/{MOCK_DATA.steps.length})
              </TabsTrigger>
            </TabsList>
            
            {/* Tab 1: AI Visual Analysis */}
            <TabsContent value="analysis" className="space-y-6 mt-5 animate-in slide-in-from-bottom-2 fade-in duration-300">
              <div className="space-y-3">
                <h2 className="text-sm font-mono tracking-wider uppercase flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <Search className="w-4 h-4" style={{ color: "var(--accent-icon-2)" }} />
                  Observed Visual Signals
                </h2>
                
                <div className="grid gap-3">
                  {MOCK_DATA.observations.map((obs) => (
                    <div 
                      key={obs.id} 
                      className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors duration-300"
                      style={{
                        backgroundColor: "var(--bg-card)",
                        borderColor: "var(--border-color)"
                      }}
                    >
                      <div className="space-y-1">
                        <div className="text-[11px] font-mono uppercase tracking-wider font-semibold" style={{ color: "var(--signal-color)" }}>
                          SIGNAL: {obs.signal}
                        </div>
                        <p className="text-sm" style={{ color: "var(--text-primary)" }}>{obs.desc}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Progress value={obs.confidence} className="w-16" />
                        <span className="text-xs font-mono w-8" style={{ color: "var(--text-muted)" }}>{obs.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hypotheses */}
              <div className="space-y-3 pt-2">
                <h2 className="text-sm font-mono tracking-wider uppercase flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <Zap className="w-4 h-4" style={{ color: "var(--accent-icon)" }} />
                  Likely Root Causes
                </h2>
                <div className="grid gap-3">
                  {MOCK_DATA.causes.map((cause) => (
                    <div 
                      key={cause.id} 
                      className="border rounded-xl p-4 transition-colors duration-300"
                      style={{
                        backgroundColor: "var(--bg-card)",
                        borderColor: "var(--border-color)"
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{cause.title}</p>
                        <span 
                          className="px-2 py-0.5 rounded border font-mono text-xs"
                          style={{
                            backgroundColor: "var(--bg-badge)",
                            borderColor: "var(--border-badge)",
                            color: "var(--accent-icon)"
                          }}
                        >
                          {cause.confidence}% probability
                        </span>
                      </div>
                      <Progress value={cause.confidence} className="w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Troubleshooting Action Plan */}
            <TabsContent value="guidance" className="space-y-4 mt-5 animate-in slide-in-from-bottom-2 fade-in duration-300">
              <div className="relative border-l ml-4 space-y-6 pb-2" style={{ borderColor: "var(--border-color)" }}>
                {MOCK_DATA.steps.map((step, index) => {
                  const isCompleted = completedSteps.includes(step.id);
                  const isNext = !isCompleted && (index === 0 || completedSteps.includes(MOCK_DATA.steps[index - 1].id));
                  
                  return (
                    <div key={step.id} className="relative pl-8 transition-opacity duration-300" style={{ opacity: isNext || isCompleted ? 1 : 0.4 }}>
                      {/* Timeline Indicator */}
                      <div 
                        className="absolute -left-3.5 top-1 h-7 w-7 rounded-full border flex items-center justify-center transition-all duration-300"
                        style={{
                          backgroundColor: "var(--bg-page)",
                          borderColor: isCompleted ? "var(--accent-icon-3)" : isNext ? "var(--accent-icon)" : "var(--border-color)",
                          color: isCompleted ? "var(--accent-icon-3)" : isNext ? "var(--accent-icon)" : "var(--text-muted)"
                        }}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-mono font-bold">0{index + 1}</span>}
                      </div>

                      <div 
                        className="border rounded-xl transition-all duration-300 p-5 space-y-3"
                        style={{
                          backgroundColor: isNext ? "var(--bg-nested)" : "var(--bg-card)",
                          borderColor: isNext ? "var(--accent-icon)" : "var(--border-color)"
                        }}
                      >
                        <div className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Step 0{index + 1}</div>
                        <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{step.title}</h3>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{step.desc}</p>
                        
                        <div 
                          className="p-3 rounded-lg border text-xs flex items-start"
                          style={{
                            backgroundColor: "var(--bg-card)",
                            borderColor: "var(--border-color)",
                            color: "var(--text-secondary)"
                          }}
                        >
                          <Info className="w-3.5 h-3.5 mr-2 shrink-0 mt-0.5" style={{ color: "var(--accent-icon-2)" }} />
                          <span><strong className="font-mono uppercase text-[10px]" style={{ color: "var(--text-primary)" }}>Rationale:</strong> {step.reason}</span>
                        </div>
                        
                        {isNext && (
                          <div className="pt-2">
                            <Button 
                              onClick={() => handleStepComplete(step.id)}
                              className="h-10 px-5 text-xs font-mono uppercase tracking-wider text-white hover:brightness-110 transition-all rounded-lg"
                              style={{
                                backgroundImage: "var(--btn-grad)",
                                boxShadow: "var(--btn-shadow)"
                              }}
                            >
                              Mark as Completed
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {completedSteps.length === MOCK_DATA.steps.length && (
                <div 
                  className="mt-6 border rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-500 p-6 text-center space-y-4"
                  style={{
                    backgroundColor: "var(--bg-badge)",
                    borderColor: "var(--border-badge)"
                  }}
                >
                  <div 
                    className="mx-auto w-12 h-12 rounded-full flex items-center justify-center border"
                    style={{
                      backgroundColor: "var(--bg-nested)",
                      borderColor: "var(--border-badge)"
                    }}
                  >
                    <FileCheck className="w-6 h-6" style={{ color: "var(--accent-icon-3)" }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Action Steps Complete</h3>
                    <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Upload final evidence to verify that the repair held.</p>
                  </div>
                  <div className="flex justify-center">
                    <Link 
                      href={`/session/${sessionId}/verify`}
                      className="inline-flex items-center gap-1.5 h-11 px-6 rounded-xl font-medium text-xs font-mono tracking-wider uppercase text-white hover:brightness-110 transition-all"
                      style={{
                        backgroundImage: "var(--btn-grad)",
                        boxShadow: "var(--btn-shadow)"
                      }}
                    >
                      <span>Proceed to Verification</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
