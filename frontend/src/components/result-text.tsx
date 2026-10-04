"use client";

import { useState } from "react";
import { getResultText, type Analysis } from "@/lib/api";

export default function ResultText({ analysis }: { analysis: Analysis }) {
  const [copyStatus, setCopyStatus] = useState("");
  const text = getResultText(analysis);
  const extracted = !!analysis.extracted_text?.trim();
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Copied.");
    } catch {
      setCopyStatus("Couldn't copy. Select the text and copy it manually.");
    }
  }
  return <section className="surface mb-8">
    <div className="flex items-center justify-between gap-4">
      <label htmlFor="analysis-result" className="section-title">Result</label>
      <button type="button" className="button-secondary" onClick={copy}>Copy text</button>
    </div>
    <p id="result-description" className="muted mt-2">{extracted ? "Text read from your image. Check unclear characters against the original." : "Your analysis in one place. Possible causes still need to be checked."}</p>
    <textarea id="analysis-result" readOnly spellCheck={false} value={text}
      aria-describedby="result-description"
      rows={Math.max(3, Math.min(14, text.split("\n").length + 1))}
      className={`field mt-4 min-h-28 resize-y leading-7 ${extracted ? "font-mono text-sm" : "text-sm"}`} />
    <p role="status" aria-live="polite" className="mt-2 text-xs text-stone-500">{copyStatus}</p>
  </section>;
}
