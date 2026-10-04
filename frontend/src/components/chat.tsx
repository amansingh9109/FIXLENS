"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import { API_URL, getChat, sendMessage, type ChatMessage } from "@/lib/api";

function Reply({ text }: { text: string }) {
  return <>{text.split(/(```[\s\S]*?```)/g).map((part, index) => {
    if (!part.startsWith("```")) return <p key={index} className="whitespace-pre-wrap break-words">{part}</p>;
    const code = part.replace(/^```[^\n]*\n?/, "").replace(/```$/, "").trimEnd();
    return <div key={index} className="my-3 overflow-hidden rounded-lg border border-stone-200 bg-stone-50">
      <div className="flex justify-end border-b border-stone-200 px-3 py-1"><button type="button" className="text-xs text-stone-600" onClick={event => { const button = event.currentTarget; void navigator.clipboard.writeText(code).then(() => { button.textContent = "Copied"; }).catch(() => { button.textContent = "Select code to copy"; }); }}>Copy code</button></div>
      <pre className="overflow-x-auto p-3 text-sm leading-6"><code>{code}</code></pre>
    </div>;
  })}</>;
}

export default function Chat({ initialId }: { initialId?: string }) {
  const [sessionId, setSessionId] = useState(initialId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(!!initialId);
  const [error, setError] = useState("");
  const [retryLoad, setRetryLoad] = useState(0);
  const pending = useRef<{ id: string; text: string; file: File | null } | null>(null);
  const sending = useRef(false);
  const bottom = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initialId) return;
    let active = true;
    void getChat(initialId).then(data => {
      if (!active) return;
      setMessages(data.messages || []); setSessionId(data.session_id); setError("");
      const last = data.messages?.at(-1);
      if (last?.role === "user") { pending.current = { id: last.id, text: last.content, file: null }; setError("The last message needs a reply. Retry to continue."); }
    }).catch(failure => { if (active) setError(failure.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [initialId, retryLoad]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, busy]);

  async function send(event?: FormEvent) {
    event?.preventDefault();
    if (sending.current || loading) return;
    if (!pending.current && !draft.trim() && !file) return;
    sending.current = true; setBusy(true); setError("");
    const outgoing = pending.current || { id: crypto.randomUUID(), text: draft.trim(), file };
    pending.current = outgoing;
    setMessages(current => current.some(item => item.id === outgoing.id) ? current : [...current, { id: outgoing.id, role: "user", content: outgoing.text || "Help me with this screenshot.", created_at: new Date().toISOString() }]);
    try {
      const data = await sendMessage(outgoing.text, outgoing.id, sessionId, outgoing.file);
      setSessionId(data.session_id); setMessages(data.messages);
      window.history.replaceState(null, "", `/session/${encodeURIComponent(data.session_id)}`);
      pending.current = null; setDraft(""); setFile(null);
      if (picker.current) picker.current.value = "";
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Couldn't send your message."); }
    finally { sending.current = false; setBusy(false); }
  }

  return <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-3 py-5 sm:px-6">
    <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-xl border border-stone-200 bg-[#eeeae2]">
      <div className="border-b border-stone-200 bg-white px-5 py-4"><h1 className="font-semibold">FixLens chat</h1><p className="text-xs text-stone-500">Coding help, one message at a time</p></div>
      <div role="log" aria-label="Conversation" className="flex-1 space-y-4 p-4 sm:p-6">
        {!messages.length && !loading && <div className="mx-auto my-12 max-w-md text-center"><h2 className="text-xl font-semibold">What are you working on?</h2><p className="mt-3 text-sm text-stone-600">Paste your code, describe an error, or attach a screenshot. Ask follow-up questions right here.</p></div>}
        {loading && <p role="status" className="text-center text-sm text-stone-500">Loading your chat...</p>}
        {messages.map(message => <article key={message.id} aria-label={message.role === "user" ? "Your message" : "FixLens reply"} className={`w-fit min-w-0 max-w-[95%] rounded-xl px-4 py-3 text-sm shadow-sm sm:max-w-[85%] ${message.role === "user" ? "ml-auto bg-[#d9f1cf]" : "mr-auto bg-white"}`}>
          <p className="mb-1 text-xs font-medium text-stone-500">{message.role === "user" ? "You" : "FixLens"}</p>
          {message.evidence_id && sessionId && <Image unoptimized width={700} height={450} src={`${API_URL}/api/v1/sessions/${encodeURIComponent(sessionId)}/evidence/${message.evidence_id}`} alt="Attached screenshot" className="mb-3 h-auto max-h-72 w-auto rounded-md object-contain" />}
          <Reply text={message.content} />
        </article>)}
        {busy && <p role="status" className="w-fit rounded-xl bg-white px-4 py-3 text-sm text-stone-500">FixLens is replying...</p>}
        <div ref={bottom} />
      </div>
      <form onSubmit={send} className="sticky bottom-0 border-t border-stone-200 bg-white p-3 sm:p-4">
        {error && <div role="alert" className="notice-error mb-3">{error} <button type="button" className="ml-2 underline" disabled={busy} onClick={() => { if (pending.current) void send(); else setRetryLoad(value => value + 1); }}>Retry</button></div>}
        {file && <div className="mb-2 flex items-center gap-3 text-xs text-stone-600"><span className="min-w-0 truncate">{file.name}</span><button type="button" disabled={busy || !!pending.current} onClick={() => { setFile(null); if (picker.current) picker.current.value = ""; }}>Remove</button></div>}
        <div className="flex items-end gap-2">
          <label className="button-secondary cursor-pointer px-3" title="Attach a screenshot">+<span className="sr-only">Attach screenshot</span><input ref={picker} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={busy || !!pending.current || loading} onChange={event => { const selected = event.target.files?.[0]; if (selected && (!['image/png', 'image/jpeg', 'image/webp'].includes(selected.type) || selected.size > 10 * 1024 * 1024 || !selected.size)) { setError("Choose a JPEG, PNG or WebP screenshot under 10 MB."); event.target.value = ""; return; } setFile(selected || null); setError(""); }} /></label>
          <textarea aria-label="Message" className="field min-h-12 resize-none py-2" rows={2} maxLength={12000} value={draft} disabled={busy || !!pending.current || loading} onChange={event => setDraft(event.target.value)} placeholder="Ask a coding question or paste an error..." onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(); } }} />
          <button className="button-primary px-4" type="submit" disabled={busy || loading || (!!error && !pending.current && !!initialId) || (!draft.trim() && !file && !pending.current)}>{busy ? "..." : pending.current ? "Retry" : "Send"}</button>
        </div>
        <p className="mt-2 text-[11px] text-stone-400">Enter to send · Shift + Enter for a new line · Screenshots are optional</p>
      </form>
    </section>
  </main>;
}
