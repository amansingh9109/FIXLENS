# FixLens 🔍

> **See a Problem → Select It → FixLens Explains It.**

FixLens is an AI-powered visual troubleshooting assistant. It allows developers, testers, and users to select any broken UI element, bug, or physical issue on their screen and instantly receive an AI explanation, likely cause, and actionable fix steps.

---

## 🌟 Features

- **Chrome Extension MVP**: Select any region on any webpage with a simple drag-and-drop rectangle.
- **Instant Visual Diagnosis**: Captures and crops the selected region, sending it to Google Gemini/Gemma vision models for instant analysis.
- **In-Page Result Panel**: Clear explanation of *What I See*, *Possible Cause*, and *How to Fix* directly on your active webpage without navigating away.
- **Web App**: Full Next.js investigation studio with multi-stage evidence collection, timeline tracking, and interactive chat.
- **FastAPI Backend**: Fast, lightweight asynchronous API with Pydantic validation, CORS support, and automatic retries.

---

## 📁 Project Structure

```text
fixlens/
├── extension/          # Chrome Extension (Manifest V3, Vanilla JS/CSS/HTML)
├── backend/            # FastAPI Python backend + Gemini/Gemma integration
├── frontend/           # Next.js 16 (React, Tailwind CSS, TypeScript) web app
└── README.md           # Unified documentation
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites

- **Python 3.10+** (with virtual environment)
- **Node.js 18+** & **npm**
- **Google Chrome** (or Chromium-based browser)
- **Google Gemini API Key** ([Get one from Google AI Studio](https://aistudio.google.com/))

---

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemma-4-26b-a4b-it
FRONTEND_URL=http://localhost:3000
```

---

### 3. Start the Backend

From the root directory:

```bash
# Activate your virtual environment
.venv\Scripts\activate      # Windows
# or: source .venv/bin/activate (macOS/Linux)

# Navigate to backend and start server
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

The API will be available at **`http://localhost:8000`** (Docs at `http://localhost:8000/docs`).

---

### 4. Load the Chrome Extension

1. Open Google Chrome and navigate to:
   ```text
   chrome://extensions
   ```
2. Enable **Developer mode** (toggle in top-right corner).
3. Click **Load unpacked**.
4. Select the **`fixlens/extension`** folder.
5. FixLens is now installed in your browser toolbar!

---

### 5. Start the Web Frontend (Optional)

If you want to use the full FixLens web interface:

```bash
cd frontend
npm install
npm run dev
```

The web app will run at **`http://localhost:3000`**.

---

## 🎯 How to Use the Chrome Extension

```text
Open any webpage → Click FixLens extension → Click "Select Problem Area"
      ↓
Drag rectangle over the issue → Release mouse
      ↓
FixLens captures & crops screenshot → Gemma analyzes it
      ↓
Instant diagnosis appears on page!
```

- **Drag to Select**: Click and drag over any error message, misaligned layout, or broken UI element.
- **Cancel Selection**: Press `Escape` at any time to cancel.
- **Select Again**: Click the `Select Again` button on the result panel to inspect another area.
- **Retry**: If your connection drops or the backend was restarting, click `↻ Retry`.

---

## 🔌 API Reference

### `POST /api/v1/quick-analyze` (Used by Chrome Extension)
Analyzes a cropped screenshot and returns structured troubleshooting advice.

- **Request** (`multipart/form-data`):
  - `image`: Screenshot file (`.png`, `.jpg`, `.webp`)
  - `question`: *(Optional)* Custom question or prompt
  - `page_url`: *(Optional)* URL of the active webpage
  - `page_title`: *(Optional)* Title of the active webpage

- **Response** (`application/json`):
  ```json
  {
    "problem": "The submit button overlaps the input field.",
    "possible_cause": "Incorrect positioning styles on parent container.",
    "solution": [
      "Inspect parent container width.",
      "Check CSS position: absolute rules.",
      "Verify responsive flex/grid configuration."
    ],
    "confidence": 0.85
  }
  ```

---

### Additional Endpoints

- `GET /health` — Health check endpoint.
- `POST /api/v1/chat` — Interactive troubleshooting chat with optional screenshot attachment.
- `POST /api/v1/sessions` — Create a structured multi-step repair session.
- `POST /api/v1/sessions/{id}/evidence` — Upload initial/additional evidence photos.
- `POST /api/v1/sessions/{id}/verify` — Verify visual repair before/after comparison.

---

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
..\.venv\Scripts\python -m pytest
```

### Frontend Build Verification
```bash
cd frontend
npm run build
```

---

## 🛡️ Privacy & Permissions

- **Selective Tab Capture**: The extension captures the visible tab *only* when you click `Select Problem Area`.
- **Minimal Footprint**: Only the cropped bounding box area you selected is sent to the backend.
- **No Tracking**: No background tracking, continuous recording, form scraping, or cookie collection.
