"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, Theme } from "./ThemeProvider";
import { Palette, Check, Sparkles, Sun, Terminal, Zap } from "lucide-react";

const THEMES: { id: Theme; name: string; icon: React.ReactNode; color: string; desc: string }[] = [
  { 
    id: "neon", 
    name: "Midnight Neon", 
    icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
    color: "from-purple-500 to-cyan-400",
    desc: "Obsidian & Neon Glow" 
  },
  { 
    id: "emerald", 
    name: "Cyber Emerald", 
    icon: <Terminal className="w-3.5 h-3.5 text-emerald-400" />,
    color: "from-emerald-500 to-teal-400",
    desc: "Matrix & Terminal Green" 
  },
  { 
    id: "blue", 
    name: "Electric Blue", 
    icon: <Zap className="w-3.5 h-3.5 text-cyan-400" />,
    color: "from-cyan-400 to-blue-600",
    desc: "Deep Blue & Laser Cyan" 
  },
  { 
    id: "light", 
    name: "Diagnostic Light", 
    icon: <Sun className="w-3.5 h-3.5 text-amber-500" />,
    color: "from-zinc-200 to-slate-400",
    desc: "Clean Slate & Crisp White" 
  },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800/80 border border-white/10 hover:border-white/20 text-[11px] font-mono tracking-wider text-zinc-300 transition-all shadow-sm"
        title="Change theme"
      >
        <Palette className="w-3.5 h-3.5 text-purple-400" />
        <span className="hidden sm:inline-block uppercase">{currentTheme.name}</span>
        <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentTheme.color}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0e101a] border border-white/10 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl">
          <div className="px-3 py-2 text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase border-b border-white/[0.06] mb-1">
            Visual Themes
          </div>
          <div className="space-y-1">
            {THEMES.map((t) => {
              const isSelected = t.id === theme;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors text-xs font-mono ${
                    isSelected 
                      ? "bg-white/10 text-white font-medium" 
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                      {t.icon}
                    </span>
                    <div>
                      <div className="text-white text-xs">{t.name}</div>
                      <div className="text-[10px] text-zinc-500 font-sans">{t.desc}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
