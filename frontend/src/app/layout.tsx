import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { FixLensLogo } from "@/components/FixLensLogo";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FixLens — Visual Troubleshooting System",
  description: "Show the problem. Find the cause. Fix it. Verify it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`theme-neon ${inter.variable} ${mono.variable} h-full antialiased`} suppressHydrationWarning>
      <body 
        className="min-h-full flex flex-col transition-colors duration-300"
        style={{
          backgroundColor: "var(--bg-page)",
          color: "var(--text-primary)"
        }}
      >
        <ThemeProvider>
          {/* Top Navbar Header */}
          <header 
            className="w-full border-b sticky top-0 z-50 transition-colors duration-300 backdrop-blur-md"
            style={{
              backgroundColor: "var(--bg-page)",
              borderColor: "var(--border-color)"
            }}
          >
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
              {/* Brand Logo & Tagline */}
              <Link href="/" className="flex items-center gap-3.5 group">
                {/* Official FixLens Reticle Logo */}
                <FixLensLogo className="w-9 h-9" />
                
                <span 
                  className="text-lg font-bold tracking-tight transition-colors duration-300" 
                  style={{ color: "var(--text-primary)" }}
                >
                  fixlens
                </span>
                
                <span className="font-light opacity-40 select-none">|</span>
                
                <span 
                  className="hidden sm:inline-block text-[11px] font-mono tracking-[0.2em] uppercase transition-colors duration-300" 
                  style={{ color: "var(--text-muted)" }}
                >
                  Visual Troubleshooting System
                </span>
              </Link>

              {/* Right Status & Theme Switcher */}
              <div className="flex items-center gap-3">
                <ThemeSwitcher />

                <div 
                  className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-full border text-[11px] font-mono tracking-[0.15em] transition-colors duration-300"
                  style={{
                    backgroundColor: "var(--bg-nested)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-muted)"
                  }}
                >
                  <span 
                    className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" 
                    style={{ backgroundColor: "var(--accent-icon-3)", color: "var(--accent-icon-3)" }}
                  />
                  <span>LOCAL WORKSPACE</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col w-full max-w-6xl mx-auto px-6 py-10 sm:py-14">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
