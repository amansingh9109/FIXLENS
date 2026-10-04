"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Info, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ImageUploader } from "@/components/ImageUploader";

export default function InvestigatePage() {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setError("Please upload an image first.");
      return;
    }
    if (description.length < 10) {
      setError("Please describe the problem with at least 10 characters.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const mockSessionId = `FL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      router.push(`/session/${mockSessionId}`);
    }, 1500);
  };

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto py-4 sm:py-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="mb-8">
        <div 
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-mono tracking-wider uppercase mb-3 transition-colors duration-300"
          style={{
            backgroundColor: "var(--bg-badge)",
            borderColor: "var(--border-badge)",
            color: "var(--text-badge)"
          }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--accent-icon)" }} />
          <span>New Session</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
          Start Investigation
        </h1>
        <p className="text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
          Provide visual evidence and describe what you observe.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div 
          className="rounded-2xl border p-6 shadow-2xl overflow-hidden transition-all duration-300"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-color)"
          }}
        >
          <div className="pb-4">
            <div className="text-xs font-mono tracking-widest uppercase mb-1" style={{ color: "var(--accent-icon)" }}>
              Step 01
            </div>
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Upload Evidence</h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Provide a clear photo of the object and the component experiencing issues.
            </p>
          </div>
          <div className="mt-2">
            <ImageUploader onImageSelected={setImage} />
          </div>
        </div>

        <div 
          className="rounded-2xl border p-6 shadow-2xl transition-all duration-300"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-color)"
          }}
        >
          <div className="pb-4">
            <div className="text-xs font-mono tracking-widest uppercase mb-1" style={{ color: "var(--accent-icon-2)" }}>
              Step 02
            </div>
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Problem Description</h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Explain the symptoms in natural words without worrying about technical terms.
            </p>
          </div>
          <Textarea
            placeholder="e.g. My bicycle chain keeps falling when I shift to higher gears..."
            className="min-h-[120px] text-base focus-visible:ring-1 rounded-xl transition-colors duration-300"
            style={{
              backgroundColor: "var(--bg-nested)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)"
            }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && (
          <Alert variant="destructive" className="rounded-xl">
            <Info className="h-4 w-4" />
            <AlertTitle>Missing Information</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted local session</span>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full sm:w-auto h-12 px-8 text-sm font-medium text-white hover:brightness-110 transition-all rounded-xl border border-white/10"
            style={{
              backgroundImage: "var(--btn-grad)",
              boxShadow: "var(--btn-shadow)"
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Evidence...
              </>
            ) : (
              <>
                Begin Investigation
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
