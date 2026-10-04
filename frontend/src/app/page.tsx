import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  Lock, 
  Aperture, 
  ImagePlus, 
  Crosshair, 
  ClipboardCheck 
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="flex flex-col items-start max-w-3xl pt-2 sm:pt-6">
        {/* Evidence Before Assumptions Badge */}
        <div 
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-mono tracking-wider uppercase mb-6 backdrop-blur-sm transition-colors duration-300"
          style={{
            backgroundColor: "var(--bg-badge)",
            borderColor: "var(--border-badge)",
            color: "var(--text-badge)"
          }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--accent-icon)" }} />
          <span>Evidence before assumptions</span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.08]" style={{ color: "var(--text-primary)" }}>
          What are you<br />
          <span 
            className="bg-clip-text text-transparent transition-all duration-300"
            style={{ backgroundImage: "var(--heading-grad)" }}
          >
            trying to fix?
          </span>
        </h1>

        {/* Subtitles */}
        <div className="mt-6 space-y-1">
          <p className="text-lg sm:text-xl font-normal transition-colors duration-300" style={{ color: "var(--text-secondary)" }}>
            Show the problem. Find the cause. Fix it. Verify it.
          </p>
          <p className="text-base sm:text-lg font-normal transition-colors duration-300" style={{ color: "var(--text-muted)" }}>
            A visual investigation workspace for the objects you rely on.
          </p>
        </div>

        {/* Action Row */}
        <div className="flex flex-wrap items-center gap-5 mt-8">
          <Link
            href="/investigate"
            className="h-12 px-7 rounded-xl font-medium text-sm text-white hover:brightness-110 transition-all flex items-center gap-2"
            style={{
              backgroundImage: "var(--btn-grad)",
              boxShadow: "var(--btn-shadow)"
            }}
          >
            <span>Start Investigation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2 text-xs font-normal transition-colors duration-300" style={{ color: "var(--text-muted)" }}>
            <Lock className="w-3.5 h-3.5" />
            <span>Your evidence stays on this device</span>
          </div>
        </div>
      </div>

      {/* Live Investigation Visual Mockup Card */}
      <div 
        className="w-full mt-14 rounded-2xl border p-5 sm:p-6 shadow-2xl relative overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-color)"
        }}
      >
        {/* Subtle Ambient Glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 blur-[120px] pointer-events-none transition-all duration-500"
          style={{ backgroundColor: "var(--ambient-glow)" }}
        />

        {/* Card Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <span 
              className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_currentColor]"
              style={{ color: "var(--accent-icon-3)", backgroundColor: "var(--accent-icon-3)" }} 
            />
            <span className="text-xs font-mono tracking-[0.2em] uppercase" style={{ color: "var(--text-secondary)" }}>
              Live Investigation
            </span>
          </div>
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            FL-2026-00124
          </span>
        </div>

        {/* Center Radar / Evidence Visual Graphic */}
        <div 
          className="relative h-72 sm:h-80 w-full rounded-xl border overflow-hidden flex items-center justify-center bg-radar-grid transition-colors duration-300"
          style={{
            backgroundColor: "var(--bg-nested)",
            borderColor: "var(--border-color)"
          }}
        >
          {/* Top-Right Confidence Badge */}
          <div 
            className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono backdrop-blur-md shadow-lg border"
            style={{
              backgroundColor: "var(--bg-badge)",
              borderColor: "var(--border-badge)",
              color: "var(--text-badge)"
            }}
          >
            <span 
              className="w-1.5 h-1.5 rounded-full animate-pulse" 
              style={{ backgroundColor: "var(--accent-icon-3)" }}
            />
            <span>82% confidence</span>
          </div>

          {/* Bottom-Left Evidence Frame Badge */}
          <div 
            className="absolute bottom-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono backdrop-blur-md border"
            style={{
              backgroundColor: "var(--bg-badge)",
              borderColor: "var(--border-badge)",
              color: "var(--text-primary)"
            }}
          >
            <Aperture className="w-3.5 h-3.5" style={{ color: "var(--accent-icon-2)" }} />
            <span>Evidence frame / 01</span>
          </div>

          {/* SVG Animated Glowing Concentric Ellipses / Reticle */}
          <div className="relative w-72 h-44 sm:w-96 sm:h-52 flex items-center justify-center animate-pulse-slow">
            <svg
              viewBox="0 0 400 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              {/* Ellipse 1: Theme Primary Ring */}
              <ellipse
                cx="200"
                cy="120"
                rx="150"
                ry="55"
                transform="rotate(-12 200 120)"
                stroke="var(--radar-ring-1)"
                strokeWidth="2"
                strokeOpacity="0.85"
                className="transition-colors duration-300"
              />

              {/* Ellipse 2: Theme Secondary Ring */}
              <ellipse
                cx="195"
                cy="120"
                rx="90"
                ry="70"
                transform="rotate(15 195 120)"
                stroke="var(--radar-ring-2)"
                strokeWidth="1.5"
                strokeOpacity="0.75"
                className="transition-colors duration-300"
              />

              {/* Inner Focus Indicator */}
              <circle
                cx="200"
                cy="120"
                r="3"
                fill="var(--text-primary)"
                className="transition-colors duration-300"
              />
            </svg>
          </div>
        </div>

        {/* Bottom Metadata Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4">
          <div 
            className="rounded-xl border p-3 sm:p-4 transition-colors duration-300"
            style={{ backgroundColor: "var(--bg-nested)", borderColor: "var(--border-color)" }}
          >
            <div className="text-[11px] font-mono tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
              Object
            </div>
            <div className="text-sm font-medium mt-1" style={{ color: "var(--text-primary)" }}>
              Bicycle
            </div>
          </div>

          <div 
            className="rounded-xl border p-3 sm:p-4 transition-colors duration-300"
            style={{ backgroundColor: "var(--bg-nested)", borderColor: "var(--border-color)" }}
          >
            <div className="text-[11px] font-mono tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
              Signal
            </div>
            <div className="text-sm font-medium mt-1 transition-colors duration-300" style={{ color: "var(--signal-color)" }}>
              Chain slack
            </div>
          </div>

          <div 
            className="rounded-xl border p-3 sm:p-4 transition-colors duration-300"
            style={{ backgroundColor: "var(--bg-nested)", borderColor: "var(--border-color)" }}
          >
            <div className="text-[11px] font-mono tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
              Status
            </div>
            <div className="text-sm font-medium mt-1 transition-colors duration-300" style={{ color: "var(--status-color)" }}>
              Analysing
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-t my-16 transition-colors duration-300" style={{ borderColor: "var(--border-color)" }} />

      {/* The FixLens Workflow Section */}
      <div className="flex flex-col">
        <div className="text-xs font-mono tracking-[0.25em] uppercase mb-8 transition-colors duration-300" style={{ color: "var(--text-muted)" }}>
          The FixLens Workflow
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Step 01 */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between w-full">
              <div 
                className="w-11 h-11 rounded-xl border flex items-center justify-center shadow-inner transition-colors duration-300"
                style={{ backgroundColor: "var(--bg-nested)", borderColor: "var(--border-color)" }}
              >
                <ImagePlus className="w-5 h-5 transition-colors duration-300" style={{ color: "var(--accent-icon)" }} />
              </div>
              <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>01</span>
            </div>
            <h3 className="text-base font-semibold mt-4 transition-colors duration-300" style={{ color: "var(--text-primary)" }}>
              Upload photo
            </h3>
            <p className="text-sm mt-1.5 leading-relaxed transition-colors duration-300" style={{ color: "var(--text-secondary)" }}>
              Snap a clear picture of the part that is not behaving right.
            </p>
          </div>

          {/* Step 02 */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between w-full">
              <div 
                className="w-11 h-11 rounded-xl border flex items-center justify-center shadow-inner transition-colors duration-300"
                style={{ backgroundColor: "var(--bg-nested)", borderColor: "var(--border-color)" }}
              >
                <Crosshair className="w-5 h-5 transition-colors duration-300" style={{ color: "var(--accent-icon-2)" }} />
              </div>
              <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>02</span>
            </div>
            <h3 className="text-base font-semibold mt-4 transition-colors duration-300" style={{ color: "var(--text-primary)" }}>
              Investigate evidence
            </h3>
            <p className="text-sm mt-1.5 leading-relaxed transition-colors duration-300" style={{ color: "var(--text-secondary)" }}>
              Surface likely causes from what is visible, not what is assumed.
            </p>
          </div>

          {/* Step 03 */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between w-full">
              <div 
                className="w-11 h-11 rounded-xl border flex items-center justify-center shadow-inner transition-colors duration-300"
                style={{ backgroundColor: "var(--bg-nested)", borderColor: "var(--border-color)" }}
              >
                <ClipboardCheck className="w-5 h-5 transition-colors duration-300" style={{ color: "var(--accent-icon-3)" }} />
              </div>
              <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>03</span>
            </div>
            <h3 className="text-base font-semibold mt-4 transition-colors duration-300" style={{ color: "var(--text-primary)" }}>
              Get guided
            </h3>
            <p className="text-sm mt-1.5 leading-relaxed transition-colors duration-300" style={{ color: "var(--text-secondary)" }}>
              Work through a focused plan, then verify the repair actually held.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
