# FixLens investigation workflow repair

Verified on 4 October 2026 with the problem: **“My bicycle chain keeps falling when I change gears.”**
The complete browser path now works with real image bytes and a live Gemma response.

1. **Root causes.** The configured `gemini-2.5-flash` request returned provider 404
   for this account. The frontend created sessions but did not upload the selected
   file or trigger analysis. Session failures displayed hardcoded bicycle findings.
   Sessions and evidence were previously held only in memory, and uploads were not
   decoded to verify their content. The report could remain loading indefinitely
   after a failed request. Verification's final-image input was also disconnected.

2. **Files changed.** Backend: `app/main.py`, `app/config.py`, `app/schemas.py`,
   `app/ai_service.py`, `app/evidence.py`, `app/safety.py`, `app/storage.py`,
   `tests/test_api.py`, `requirements.txt`, `requirements-dev.txt`, and `README.md`.
   Frontend: investigation, session, verification, and report pages; `src/lib/api.ts`;
   `src/components/evidence-picker.tsx`; `tests/api.test.mjs`;
   `tests/browser_workflow.py`; `package.json`; `.env.example`; and `.gitignore`.
   Root: `.env.example`, `.gitignore`, and this report. Private local configuration
   was updated in `.env` and `frontend/.env.local`; neither is tracked by Git.

3. **Important changes.** Submission now creates a session, uploads the actual
   selected image with FormData, triggers analysis, and displays the persisted API
   result. Stage-specific progress and submission guards prevent duplicate clicks.
   Retry retains the selected image, description, session, and completed upload.
   Preview, evidence display, confidence, component, safety warnings, additional
   evidence requests, and next action use actual state. The existing additional
   evidence endpoint and analysis endpoint support another image with previous
   investigation context. API URLs and errors are centralized. No diagnosis fallback
   remains in the runtime error path. SQLite stores sessions, validated analysis,
   and image bytes; connections are explicitly committed and closed.

4. **Model/API configuration.** Google GenAI SDK **2.28.0**, Gemini Developer API,
   `client.models.generate_content`, `AI_MODEL=gemma-4-26b-a4b-it`. The configured
   API key listed this model, and actual text and image requests succeeded before
   the model was selected. This preserves the PRD's Gemma requirement. Server-side
   `AI_MODEL` is centralized; `GEMINI_MODEL` remains a legacy alias. Gemma uses
   minimal thinking mode to preserve the JSON output budget. Responses are parsed,
   confidence values are bounded, observations must reference uploaded evidence,
   and Pydantic validates the result before storage. JSON fences are recovered;
   invalid output gets one retry. SDK automatic retries are disabled and each HTTP
   request has a 60-second timeout. Provider errors are logged by model, exception
   type, and status; frontend messages do not reveal secrets. Missing configuration,
   unavailable/access-denied models, and quota failures return 503; invalid output
   and other provider failures return 502. Google's supported endpoint and image
   input are documented in [Run Gemma with the Gemini API](https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api).

5. **Tests added/modified.** Backend coverage includes session creation, actual
   image-byte transfer to the AI SDK, rejected MIME types, corrupt/empty/oversized
   images, AI success, provider failure, unavailable model, invalid-output retry,
   parsing recovery, SQLite persistence, previous investigation context, independent
   danger rules, and negative verification wording. The visual-observation test now
   uses a real decoded image fixture; description-only requests must not invent
   visual findings. Frontend API tests cover configured URLs, actual multipart bytes,
   model unavailability, invalid output, missing sessions, and network failures.
   All ordinary unit tests mock external AI. Browser testing is an explicit separate
   script, not part of normal unit-test execution.

6. **Backend tests.** **22 passed**, with two upstream deprecation warnings from
   Starlette's httpx TestClient support and the Google SDK's Python typing internals.
   `pip check` found no broken requirements. SQLite data and exact image bytes were
   restored in a fresh Python process and after restarting the backend.

7. **Frontend checks.** **6 API tests passed**. ESLint passed without warnings.
   Production build and TypeScript validation passed for all five application routes.
   Initial sandbox worker restrictions required running build/test workers outside
   the sandbox; these were environment restrictions, not application failures.

8. **Live AI result.** **PASS** with a real JPEG bicycle photo and the stated problem.
   Gemma identified visible single-speed/fixed-gear features rather than repeating
   the earlier hardcoded derailleur diagnosis. It noted the conflict with the claim
   about changing gears and requested closer drivetrain photos. The selected photo
   is a test fixture, not a photograph of the user's damaged bicycle. Its source is
   [this Unsplash photograph](https://images.unsplash.com/photo-1485965120184-e220f721d03e).
   The downloaded fixture was resized by the image service to 1024×683 and was not
   modified by the application. A Wikimedia download attempt was rejected with 429;
   that image was not used.

9. **Browser result.** **PASS** in actual headless Chrome via Playwright. Tested:
   navigation, real file selection, preview, disabled submission, progress, upload,
   live analysis, response findings in the DOM, SQLite retrieval, refresh, final
   image upload, verification, and report. Uploaded bytes matched the selected file
   exactly. UI observations and hypotheses matched the live backend response.
   Forced 503/502 responses and a missing session produced error UI rather than fake
   findings. Retry did not create another session or require reselecting the image.
   These failure responses were deliberately injected with Playwright routes; the
   backend's provider failures were independently tested with SDK mocks.

10. **Remaining limitations.** Persistence is local SQLite, not the configured
    PostgreSQL/cloud services. Final verification records real final evidence and
    the user's reported outcome, but does not yet perform AI before/after comparison.
    Safety rules are conservative text rules supplementing the model, not a complete
    hazard detector. Concurrent editing of the same session, retention limits, and
    multi-user deployment are not implemented. The successful initial photo reveals
    a single-speed bike; a real geared-bike diagnosis needs the user's actual image.

11. **Security findings.** No API key was found in the generated browser bundles.
    `.env` and `frontend/.env.local` are untracked; the root `.env` has no recorded
    history in the available Git repository. MIME type, extension, decoded format,
    empty/oversized data, and decompression bombs are checked. Images are served by
    generated IDs with `nosniff`; filenames are not used as storage paths. Session
    IDs now use the full UUID rather than six hexadecimal characters. Runtime data
    is excluded from Git. Existing tracked Python bytecode remains a repository
    hygiene issue. There is still no authentication or per-user authorization, and
    the local database is not encrypted; the application remains bound to localhost.

12. **Recommended next step.** Try the workflow with a close-up of the user's actual
    geared-bicycle drivetrain, then add evidence-based before/after verification.
    Do not treat this software test as proof that a physical repair is safe or complete.

| Required status | Result |
|---|---|
| Frontend → Session | PASS |
| Frontend → Image Upload | PASS |
| Backend → AI | PASS |
| AI → Structured JSON | PASS |
| JSON → Pydantic | PASS |
| Analysis → Database | PASS — local SQLite |
| Database → Frontend | PASS |
| Failure → Error UI | PASS |
| Hardcoded fallback removed | PASS |
| End-to-End FixLens Flow | PASS |

Local frontend: **http://localhost:3000**. Corrected backend: **http://127.0.0.1:8010**.
The earlier backend on port 8000 was not stopped. `frontend/.env.local` points to
8010. Startup and port-switching instructions are in `backend/README.md`.

Review artifacts (Git-ignored): `test-results/browser-results.json`,
`test-results/browser-success.png`, `test-results/browser-error.png`,
`test-results/live-analysis.json`, and `test-results/live-session.json`.
The latest browser result identifies its actual session and includes the validated
AI response; screenshots show successful findings and the forced error state.
