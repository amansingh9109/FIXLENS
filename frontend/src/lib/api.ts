export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) { super(message); }
}

async function request<T>(path: string, options: RequestInit = {}, fallback = "The request failed. Please retry."): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, cache: "no-store" });
  } catch {
    throw new ApiError("Cannot reach FixLens. Check your connection and retry.", 0);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = body.detail;
    const code = typeof detail === "object" ? detail?.code : undefined;
    const message = code === "ai_unavailable" ? "AI analysis is temporarily unavailable."
      : code === "invalid_ai_output" ? "FixLens couldn't complete this analysis. Please retry."
      : response.status === 404 ? "This investigation could not be found."
      : response.status === 415 ? "Please upload a JPEG, PNG, or WebP image."
      : response.status === 413 ? "Image exceeds the 10 MB limit."
      : typeof detail === "string" && response.status === 422 ? detail : fallback;
    throw new ApiError(message, response.status, code);
  }
  return response.json();
}

export type Analysis = {
  extracted_text?: string | null; text_evidence_reference?: string | null;
  object_name: string; component: string; confidence: number;
  observations: { description: string; confidence: number; evidence_reference: string }[];
  hypotheses: { cause: string; confidence: number; status: string }[];
  safety: { level: string; reason: string; warning?: string };
  evidence_required: { type: string; instruction: string; reason: string; recommended_angle?: string }[];
  next_action: string; risk_level: string;
  repair_steps: { step_number: number; title: string; instruction: string; expected_result: string; safety_warning: string; status: string }[];
};

export function getResultText(analysis: Analysis): string {
  if (analysis.extracted_text?.trim()) return analysis.extracted_text;
  const sections = [
    analysis.observations.length ? `What we can see:\n${analysis.observations.map(item => item.description).join("\n")}` : "",
    analysis.hypotheses.length ? `Possible causes:\n${analysis.hypotheses.map(item => item.cause).join("\n")}` : "",
    `Safety:\n${analysis.safety.reason}${analysis.safety.warning ? `\n${analysis.safety.warning}` : ""}`,
    `Next step:\n${analysis.next_action.replaceAll("_", " ")}`,
  ];
  return sections.filter(Boolean).join("\n\n");
}
export type Session = {
  session_id: string; description: string; status: string; object_category: string; risk_level: string;
  observations: Analysis["observations"]; hypotheses: Analysis["hypotheses"]; repair_steps: Analysis["repair_steps"];
  timeline: { id: string; type: string; description: string; timestamp: string }[];
  evidence: { id: string; type: string; description: string; file_name: string; url: string; stage: string }[];
  analysis?: Analysis; analysis_error?: { message?: string } | string | null;
};

export const createSession = (description: string) => request<{ session_id: string }>("/api/v1/sessions", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description }),
}, "Unable to create investigation.");
export const getSession = (id: string) => request<Session>(`/api/v1/sessions/${encodeURIComponent(id)}`);
export const analyzeSession = (id: string) => request<Analysis>(`/api/v1/sessions/${encodeURIComponent(id)}/analyze`, { method: "POST" }, "We couldn't analyze your evidence right now. Please retry.");
export const completeAction = (id: string, step: number, outcome: string) => request(`/api/v1/sessions/${encodeURIComponent(id)}/actions/${step}/complete`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ outcome }),
}, "Could not save this step. Please retry.");
export function uploadEvidence(id: string, file: File, description: string, stage = "INITIAL") {
  const data = new FormData();
  data.append("file", file); data.append("description", description); data.append("evidence_type", "image"); data.append("stage", stage);
  return request<{ evidence_id: string }>(`/api/v1/sessions/${encodeURIComponent(id)}/evidence`, { method: "POST", body: data }, "We couldn't upload this image. Please retry.");
}
export const verifySession = (id: string, final_note: string) => request(`/api/v1/sessions/${encodeURIComponent(id)}/verify`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ final_note }),
}, "Could not complete verification. Please retry.");
export const getReport = <T,>(id: string) => request<T>(`/api/v1/sessions/${encodeURIComponent(id)}/report`, {}, "Could not load the report. Please retry.");

export type ChatMessage = { id: string; role: "user" | "assistant"; content: string; evidence_id?: string; created_at: string };
export type ChatResponse = { session_id: string; messages: ChatMessage[] };
export function sendMessage(message: string, requestId: string, sessionId?: string, file?: File | null) {
  const body = new FormData();
  body.append("message", message); body.append("request_id", requestId);
  if (sessionId) body.append("session_id", sessionId);
  if (file) body.append("file", file);
  return request<ChatResponse>("/api/v1/chat", { method: "POST", body }, "Couldn't send your message. Please retry.");
}
export const getChat = (id: string) => request<ChatResponse>(`/api/v1/sessions/${encodeURIComponent(id)}`);
