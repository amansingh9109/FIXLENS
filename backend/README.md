# FixLens backend

From the repository root, use the project virtual environment (tested on Python 3.14):

```powershell
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --port 8000
```

Set `GEMINI_API_KEY` and `AI_MODEL=gemma-4-26b-a4b-it` in the root `.env`.
The model was listed by the configured key and successfully tested with a real
bicycle image. Google GenAI SDK 2.28.0 uses the Gemini Developer API's
`generate_content` endpoint to access Gemma. `GEMINI_MODEL` remains a legacy
configuration alias; `AI_MODEL` takes precedence. No credentials are sent to Next.js.

Set `FRONTEND_URL` for the frontend's origin. `.env.example` is documentation,
not runtime configuration. `DATABASE_URL`, Qdrant, and cloud storage settings are
currently unused. Sessions, validated analyses, and image bytes are persisted in
`backend/data/fixlens.sqlite3` using SQLite. Override the directory with
`FIXLENS_DATA_DIR`. The data directory is ignored by Git.

For the live browser test, a pre-existing backend was using port 8000. The corrected
backend runs on **8010**, and `frontend/.env.local` points to that port. Use
`--port 8010` to keep this setup. For a fresh setup on port 8000, set
`NEXT_PUBLIC_API_URL=http://127.0.0.1:8000` in `frontend/.env.local` and restart Next.js.

Health: `/health`. Interactive documentation: `/docs`.

The existing API flow is:

1. POST `/api/v1/sessions` with JSON `description`.
2. POST `/api/v1/sessions/{id}/evidence` with multipart `file`, `description`,
   `evidence_type=image`, and `stage=INITIAL`, `ADDITIONAL`, or `FINAL`.
3. POST `/api/v1/sessions/{id}/analyze` sends all images and previous analysis
   context to the configured model. Pydantic validates the result before storage.
4. GET `/api/v1/sessions/{id}` restores the stored investigation. Evidence URLs
   serve the uploaded images without encoding their bytes into session JSON.
5. Additional uploads and another analysis update the same investigation.
6. Verification preserves the final note and final evidence references. It remains
   based on the user's reported outcome, not an AI comparison or guarantee.

Images must have matching MIME type, extension, and decoded JPEG/PNG/WebP format,
be nonempty, and be at most 10 MB. Pillow verifies and safely decodes the image;
decompression bombs are rejected. Observation confidence is restricted to 0–1 and
visual observations must reference actual uploaded evidence IDs.

Missing AI configuration, unavailable models, access restrictions, and quota
failures return 503. Other provider failures or invalid output return 502. HTTP
timeout is 60 seconds, with automatic SDK retries disabled. Gemma uses minimal
thinking mode to reserve the output budget for the JSON response. Markdown JSON
fences are recovered; invalid responses get one bounded retry. No sample diagnosis
is returned on failure. Model, session,
pipeline stage, exception type, and provider status are logged without credentials.

Independent conservative safety rules block DIY steps for recognized dangerous
conditions or a HIGH model assessment. UNKNOWN safety also suppresses repair steps.
These rules supplement the model; they are not a comprehensive hazard detector.

Mocked backend tests:

```powershell
cd backend
..\.venv\Scripts\python.exe -B -m pytest tests -q -p no:cacheprovider
```

Frontend unit tests, lint, and build:

```powershell
cd frontend
npm test
npm run lint
npm run build
```

The explicit live browser test uses installed Chrome, a real image, and live AI:

```powershell
.\.venv\Scripts\python.exe -m pip install -r backend\requirements-dev.txt
.\.venv\Scripts\python.exe -B frontend\tests\browser_workflow.py
```

Place a real bicycle photograph in `test-results/bicycle.jpg` first. Override
`TEST_FRONTEND_URL` and `TEST_API_URL` if needed. This script is separate from normal
unit tests, whose external AI calls are mocked. Screenshots and results are written
to the Git-ignored `test-results` directory.

This is a local development application: no authentication, per-user authorization,
retention policy, or multi-user concurrency control has been added. Bind to localhost.
