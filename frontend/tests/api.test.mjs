import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function client(fetch) {
  const source = fs.readFileSync(path.join(__dirname, "../src/lib/api.ts"), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, fetch, FormData, File, process: { env: { NEXT_PUBLIC_API_URL: "http://test-api:8000/" } } });
  return exports;
}

test("session request uses configured URL and sends the user's description", async () => {
  let request;
  const api = client(async (url, options) => { request = { url, options }; return { ok: true, json: async () => ({ session_id: "real-id" }) }; });
  assert.equal((await api.createSession("My chain keeps falling.")).session_id, "real-id");
  assert.equal(request.url, "http://test-api:8000/api/v1/sessions");
  assert.equal(JSON.parse(request.options.body).description, "My chain keeps falling.");
});

test("multipart upload contains the actual selected image", async () => {
  let request;
  const api = client(async (url, options) => { request = options; return { ok: true, json: async () => ({ evidence_id: "evidence" }) }; });
  const file = new File([new Uint8Array([1, 2, 3])], "bicycle.png", { type: "image/png" });
  await api.uploadEvidence("session", file, "User evidence");
  assert.deepEqual(new Uint8Array(await request.body.get("file").arrayBuffer()), new Uint8Array([1, 2, 3]));
  assert.equal(request.body.get("evidence_type"), "image");
  assert.equal(request.body.get("description"), "User evidence");
  assert.equal(request.headers, undefined); // Browser supplies multipart boundary.
});

test("unavailable models return an error, never findings", async () => {
  const api = client(async () => ({ ok: false, status: 503, json: async () => ({ detail: { code: "ai_unavailable" } }) }));
  await assert.rejects(api.analyzeSession("session"), /AI analysis is temporarily unavailable/);
});

test("malformed analysis produces retry message", async () => {
  const api = client(async () => ({ ok: false, status: 502, json: async () => ({ detail: { code: "invalid_ai_output" } }) }));
  await assert.rejects(api.analyzeSession("session"), /couldn't complete this analysis/);
});

test("missing sessions cannot return hardcoded bicycle data", async () => {
  const api = client(async () => ({ ok: false, status: 404, json: async () => ({ detail: "Session not found" }) }));
  await assert.rejects(api.getSession("missing"), /could not be found/);
});

test("network failures remain errors", async () => {
  const api = client(async () => { throw new Error("connection refused"); });
  await assert.rejects(api.getSession("session"), /Cannot reach FixLens/);
});

test("result box preserves image code, quotes, and indentation exactly", () => {
  const api = client(async () => {});
  const code = 'if True:\n    print("hello world")';
  assert.equal(api.getResultText({ extracted_text: code }), code);
});

test("older analyses have a readable result without invented image text", () => {
  const api = client(async () => {});
  const result = api.getResultText({ observations: [{ description: "A loose chain is visible." }],
    hypotheses: [{ cause: "Tension may be incorrect." }], safety: { reason: "Needs inspection." }, next_action: "collect_evidence" });
  assert.match(result, /A loose chain is visible/);
  assert.match(result, /Possible causes/);
  assert.match(result, /Needs inspection/);
  assert.match(result, /collect evidence/);
  assert.doesNotMatch(result, /hello world/);
});
