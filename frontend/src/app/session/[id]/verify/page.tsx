"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, FileCheck, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ImageUploader";

export default function VerifyPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const router = useRouter();
  
  const [image, setImage] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    if (!image) return;
    
    setIsVerifying(true);
    
    setTimeout(() => {
      router.push(`/session/${sessionId}/report`);
    }, 2000);
  };

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto py-4 sm:py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono mb-2" style={{ color: "var(--text-muted)" }}>
          <span>SESSION // {sessionId}</span>
          <span 
            className="px-2 py-0.5 rounded border font-mono text-[10px] tracking-wider uppercase"
            style={{
              backgroundColor: "var(--bg-badge)",
              borderColor: "var(--border-badge)",
              color: "var(--accent-icon-3)"
            }}
          >
            Phase 03: Verification
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
          Verify Repair
        </h1>
        <p className="text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
          Upload a post-repair photo so FixLens can compare before and after visual evidence.
        </p>
      </div>

      <div className="space-y-6">
        <div 
          className="border rounded-2xl shadow-2xl overflow-hidden p-6 transition-all duration-300"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-color)"
          }}
        >
          <div className="pb-4">
            <div className="text-xs font-mono tracking-widest uppercase mb-1" style={{ color: "var(--accent-icon-3)" }}>
              Final Evidence Frame
            </div>
            <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <FileCheck className="w-5 h-5" style={{ color: "var(--accent-icon-3)" }} />
              Upload After Photo
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Capture a clear image from a similar angle as your initial upload to verify proper alignment and tension.
            </p>
          </div>
          <ImageUploader onImageSelected={setImage} />
        </div>

        {/* Verification Checkpoints */}
        <div 
          className="border rounded-2xl p-5 transition-all duration-300"
          style={{
            backgroundColor: "var(--bg-nested)",
            borderColor: "var(--border-color)"
          }}
        >
          <div className="text-xs font-mono font-medium uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
            Verification Checkpoints
          </div>
          <ul className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--signal-color)" }} />
              <span>Verify chain slack has returned to normal tension limits</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--signal-color)" }} />
              <span>Confirm vertical alignment of rear derailleur cage</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted local comparison</span>
          </div>

          <Button
            onClick={handleVerify}
            disabled={!image || isVerifying}
            size="lg"
            className="w-full sm:w-auto h-12 px-8 text-sm font-medium text-white hover:brightness-110 transition-all rounded-xl border border-white/10"
            style={{
              backgroundImage: "var(--btn-grad)",
              boxShadow: "var(--btn-shadow)"
            }}
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Comparing Evidence Frames...
              </>
            ) : (
              <>
                Run Verification
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
