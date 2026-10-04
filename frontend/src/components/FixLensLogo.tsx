import React from "react";

export function FixLensLogo({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className} group`}>
      {/* Outer Viewfinder Container */}
      <div 
        className="w-full h-full rounded-xl border flex items-center justify-center relative overflow-hidden transition-all duration-300 shadow-md group-hover:scale-105"
        style={{
          backgroundColor: "var(--bg-nested)",
          borderColor: "var(--border-color)",
        }}
      >
        {/* Viewfinder Reticle Corners & Center Lens Vector */}
        <svg 
          viewBox="0 0 36 36" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 transition-all duration-300"
        >
          {/* Top-Left Corner */}
          <path 
            d="M6 13V9C6 7.34315 7.34315 6 9 6H13" 
            stroke="var(--accent-icon)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Top-Right Corner */}
          <path 
            d="M23 6H27C28.6569 6 30 7.34315 30 9V13" 
            stroke="var(--accent-icon)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Bottom-Left Corner */}
          <path 
            d="M6 23V27C6 28.6569 7.34315 30 9 30H13" 
            stroke="var(--accent-icon)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Bottom-Right Corner */}
          <path 
            d="M23 30H27C28.6569 30 30 28.6569 30 27V23" 
            stroke="var(--accent-icon)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Central Horizontal Lens Aperture / Scanning Slits */}
          <line 
            x1="11" 
            y1="18" 
            x2="15" 
            y2="18" 
            stroke="var(--text-primary)" 
            strokeWidth="2" 
            strokeLinecap="round" 
          />
          <line 
            x1="21" 
            y1="18" 
            x2="25" 
            y2="18" 
            stroke="var(--text-primary)" 
            strokeWidth="2" 
            strokeLinecap="round" 
          />
          
          {/* Center Focus Dot */}
          <circle 
            cx="18" 
            cy="18" 
            r="1.5" 
            fill="var(--accent-icon-2)" 
          />
        </svg>

        {/* Ambient Inner Shimmer */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none transition-colors duration-300"
          style={{ backgroundColor: "var(--accent-icon)" }}
        />
      </div>

      {/* Top-Right Glowing Cyan Status Beacon */}
      <span 
        className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-black/40 animate-pulse shadow-[0_0_8px_currentColor]"
        style={{
          backgroundColor: "var(--accent-icon-2)",
          color: "var(--accent-icon-2)",
        }}
      />
    </div>
  );
}
