"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "neon" | "emerald" | "blue" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("neon");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("fixlens-theme") as Theme | null;
    if (saved && ["neon", "emerald", "blue", "light"].includes(saved)) {
      setTheme(saved);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    
    // Remove previous theme classes/attributes
    root.classList.remove("theme-neon", "theme-emerald", "theme-blue", "theme-light", "dark", "light");
    
    if (theme === "light") {
      root.classList.add("light", "theme-light");
      root.setAttribute("data-theme", "light");
    } else {
      root.classList.add("dark", `theme-${theme}`);
      root.setAttribute("data-theme", theme);
    }
    
    localStorage.setItem("fixlens-theme", theme);
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
