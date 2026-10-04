import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FixLens | Coding chat",
  description:
    "Chat about code, share screenshots, and work through errors together.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-stone-200 bg-white">
          <nav aria-label="Main navigation" className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
            <Link href="/" className="text-xl font-semibold tracking-tight">FixLens<span className="ml-3 hidden text-sm font-normal tracking-normal text-stone-500 sm:inline">A hand with your code</span></Link>
            <a href="/" className="button-secondary">New chat</a>
          </nav>
        </header>
        {children}
        <footer className="mx-auto mt-auto flex w-full max-w-5xl flex-wrap justify-between gap-2 px-5 py-7 text-xs text-stone-500 sm:px-8">
          <span>FixLens</span><span>Check suggested code before running it.</span>
        </footer>
      </body>
    </html>
  );
}
