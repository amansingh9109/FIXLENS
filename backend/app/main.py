from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from starlette.concurrency import run_in_threadpool

from .config import MAX_IMAGE_BYTES
from .schemas import ActionFeedback, CreateSessionRequest, EvidenceUploadResponse, QuickAnalyzeResponse, VerificationInput
from .ai_service import analyze as call_gemini_analysis, verify as call_gemini_verification, chat as call_chat, quick_analyze as call_quick_analyze
from .evidence import validate_image
from .safety import apply_safety
from . import storage

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")

app = FastAPI(title="FixLens API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys([
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:3001", "http://127.0.0.1:3001",
        os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/"),
    ])),
    allow_credentials=True,
    allow_origin_regex=r"^chrome-extension://.*$",
    allow_methods=["*"],
    allow_headers=["*"],
)

def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_event(event_type: str, description: str) -> dict[str, str]:
    return {
        "id": str(uuid4()),
        "timestamp": utc_now(),
        "type": event_type,
        "description": description,
    }


def generate_session_id() -> str:
    return f"FL-{datetime.now().strftime('%Y%m%d')}-{uuid4().hex.upper()}"


def normalise_object(description: str) -> str:
    lowered = description.lower()
    if "bicycle" in lowered or "bike" in lowered or "chain" in lowered or "derailleur" in lowered:
        return "Bicycle"
    if "computer" in lowered or "laptop" in lowered or "keyboard" in lowered:
        return "Computer"
    if "table" in lowered or "chair" in lowered or "cabinet" in lowered or "furniture" in lowered:
        return "Furniture"
    if "appliance" in lowered or "washer" in lowered or "dryer" in lowered or "fridge" in lowered:
        return "Appliance"
    return "Object"


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/v1/quick-analyze", response_model=QuickAnalyzeResponse)
async def quick_analyze(
    image: UploadFile = File(...),
    question: str = Form(default="Explain what appears to be wrong in this selected area and how I can fix it."),
    page_url: str = Form(default=""),
    page_title: str = Form(default=""),
) -> QuickAnalyzeResponse:
    try:
        data = await image.read(MAX_IMAGE_BYTES + 1)
        validate_image(data, image.content_type or "image/png", image.filename or "screenshot.png")
    finally:
        await image.close()

    result = await run_in_threadpool(
        call_quick_analyze,
        image_bytes=data,
        mime_type=image.content_type or "image/png",
        question=question,
        page_url=page_url,
        page_title=page_title,
    )
    return result


@app.post("/api/v1/chat")
async def send_chat(
    message: str = Form(default="", max_length=12000),
    request_id: str = Form(..., min_length=1, max_length=100),
    session_id: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
) -> dict[str, Any]:
    if not message.strip() and file is None:
        raise HTTPException(422, "Write a message or attach a screenshot.")
    # A stable request ID makes retries reuse the conversation and uploaded image.
    if session_id is None:
        from uuid import UUID
        try:
            session_id = "CHAT-" + str(UUID(request_id))
        except ValueError:
            raise HTTPException(422, "A valid request ID is required for a new chat.")
        session = storage.load_session(session_id)
        if not session:
            session = {"session_id": session_id, "description": message.strip() or "Help with this screenshot.",
                       "status": "chatting", "evidence": [], "messages": [], "timeline": [],
                       "created_at": utc_now(), "updated_at": utc_now()}
    else:
        session = storage.load_session(session_id)
        if not session:
            raise HTTPException(404, "Chat not found")
    messages = session.setdefault("messages", [])
    completed = next((item for item in messages if item["id"] == request_id + "-reply"), None)
    if completed:
        if file:
            await file.close()
        return {"session_id": session_id, "messages": messages}
    existing = next((item for item in messages if item["id"] == request_id), None)
    if not existing:
        if messages and messages[-1]["role"] == "user":
            raise HTTPException(409, "Retry the unanswered message before sending another one.")
        evidence_id = None
        if file:
            try:
                data = await file.read(MAX_IMAGE_BYTES + 1)
                validate_image(data, file.content_type, file.filename or "")
                evidence_id = str(uuid4())
                storage.save_evidence(evidence_id, session_id, data, file.content_type)
                session["evidence"].append({"id": evidence_id, "stage": "INITIAL" if not messages else "ADDITIONAL",
                    "file_name": file.filename, "description": message, "type": "image",
                    "url": f"/api/v1/sessions/{session_id}/evidence/{evidence_id}", "created_at": utc_now()})
            finally:
                await file.close()
        messages.append({"id": request_id, "role": "user", "content": message.strip() or "Help me with this screenshot.",
                         "evidence_id": evidence_id, "created_at": utc_now()})
        storage.save_session(session)
    elif file:
        await file.close()
    result = await run_in_threadpool(call_chat, session)
    messages.append({"id": request_id + "-reply", "role": "assistant", "content": result.answer, "created_at": utc_now()})
    session["status"] = "chatting"
    session["updated_at"] = utc_now()
    storage.save_session(session)
    return {"session_id": session_id, "messages": messages}


@app.post("/api/v1/sessions")
def create_session(payload: CreateSessionRequest) -> dict[str, str]:
    session_id = generate_session_id()
    session = {
        "session_id": session_id,
        "description": payload.description,
        "user_description": payload.description,
        "status": "created",
        "object_category": normalise_object(payload.description),
        "risk_level": "UNKNOWN",
        "observations": [],
        "hypotheses": [],
        "repair_steps": [],
        "evidence": [],
        "timeline": [create_event("session_created", "Repair session created")],
        "verification_result": None,
        "created_at": utc_now(),
        "updated_at": utc_now(),
    }
    storage.save_session(session)
    logger.info("session created id=%s", session_id)
    return {"session_id": session_id, "status": "created"}


@app.get("/api/v1/sessions/{session_id}")
def get_session(session_id: str) -> dict[str, Any]:
    session = storage.load_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@app.post("/api/v1/sessions/{session_id}/evidence")
async def upload_evidence(
    session_id: str,
    file: UploadFile | None = File(default=None),
    description: str = Form(default=""),
    evidence_type: str = Form(default="image"),
    stage: str = Form(default="INITIAL"),
) -> EvidenceUploadResponse:
    session = storage.load_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if evidence_type != "image":
        raise HTTPException(status_code=422, detail="Only image evidence is supported.")
    if file is None:
        raise HTTPException(status_code=422, detail="An evidence image is required.")
    if stage not in {"INITIAL", "ADDITIONAL", "FINAL"}:
        raise HTTPException(422, "Invalid evidence stage.")
    logger.info("evidence upload started session=%s", session_id)
    try:
        data = await file.read(MAX_IMAGE_BYTES + 1)
        validate_image(data, file.content_type, file.filename or "")
    finally:
        await file.close()

    evidence_id = str(uuid4())
    storage.save_evidence(evidence_id, session_id, data, file.content_type)
    item = {
        "id": evidence_id,
        "session_id": session_id,
        "type": evidence_type,
        "file_name": file.filename if file else "n/a",
        "description": description or "Uploaded evidence",
        "stage": stage,
        "url": f"/api/v1/sessions/{session_id}/evidence/{evidence_id}",
        "created_at": utc_now(),
    }
    session["evidence"].append(item)
    session["verification_result"] = None
    session.pop("verification_explanation", None)
    if session["status"] == "verified":
        session["status"] = "evidence_added"
    session["timeline"].append(create_event("evidence_uploaded", f"Evidence uploaded: {item['type']}"))
    session["updated_at"] = utc_now()
    storage.save_session(session)
    logger.info("evidence stored session=%s evidence=%s", session_id, evidence_id)
    return EvidenceUploadResponse(status="uploaded", evidence_id=evidence_id)


@app.post("/api/v1/sessions/{session_id}/analyze")
def analyze_session(session_id: str) -> dict[str, Any]:
    session = storage.load_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    logger.info("analysis started session=%s", session_id)
    files = {item["id"]: storage.load_evidence(item["id"], session_id) for item in session["evidence"]}
    if any(value is None for value in files.values()):
        raise HTTPException(409, "Evidence is missing. Please upload it again.")
    try:
        previous = session.get("analysis")
        if previous:
            previous = {**previous, "recorded_actions": session.get("action_history", [])}
        result = call_gemini_analysis(session["description"], session["evidence"], files, previous)
        result = apply_safety(result, session["description"], session["evidence"])
    except HTTPException as exc:
        session["analysis_error"] = exc.detail
        storage.save_session(session)
        logger.warning("analysis failed session=%s status=%s", session_id, exc.status_code)
        raise
    session["analysis_error"] = None
    session["status"] = "analyzed"
    session["risk_level"] = result.risk_level
    session["object_category"] = result.object_name
    session["observations"] = [obs.model_dump() for obs in result.observations]
    if "initial_observations" not in session:
        session["initial_observations"] = session["observations"]
    session["hypotheses"] = [hyp.model_dump() for hyp in result.hypotheses]
    session["repair_steps"] = [step.model_dump() for step in result.repair_steps]
    session["analysis"] = result.model_dump()
    session["verification_result"] = None
    session.pop("verification_explanation", None)
    session["timeline"].append(create_event("analysis_complete", "Initial multimodal investigation completed"))
    session["updated_at"] = utc_now()
    storage.save_session(session)
    logger.info("analysis stored session=%s", session_id)
    return result.model_dump()


@app.post("/api/v1/sessions/{session_id}/actions/{action_id}/complete")
def complete_action(session_id: str, action_id: int, payload: ActionFeedback) -> dict[str, Any]:
    session = storage.load_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    if session["risk_level"] not in {"LOW", "MEDIUM"}:
        raise HTTPException(409, "Safety must be assessed before recording a repair action.")
    step = next((item for item in session["repair_steps"] if item["step_number"] == action_id), None)
    if not step:
        raise HTTPException(404, "Repair step not found")
    step["status"] = "BLOCKED" if payload.outcome == "CANNOT_PERFORM" else "COMPLETED"
    step["outcome"] = payload.outcome
    session.setdefault("action_history", []).append({**step, "recorded_at": utc_now()})
    session["verification_result"] = None
    session.pop("verification_explanation", None)
    session["status"] = "repair_in_progress"
    session["updated_at"] = utc_now()
    session["timeline"].append(create_event("action_recorded", f"Step {action_id}: {payload.outcome.lower().replace('_', ' ')}"))
    storage.save_session(session)
    return step


@app.post("/api/v1/sessions/{session_id}/verify")
def verify_session(session_id: str, payload: VerificationInput) -> dict[str, str]:
    session = storage.load_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    note = (payload.final_note or "").lower()
    if "not resolved" in note or "not better" in note or "not improved" in note:
        verification_result = "UNCHANGED"
    elif "worse" in note or "worsened" in note:
        verification_result = "WORSE"
    elif "better" in note or "improved" in note:
        verification_result = "IMPROVED"
    elif "resolved" in note:
        verification_result = "LIKELY_RESOLVED"
    elif "unchanged" in note or "same" in note:
        verification_result = "UNCHANGED"
    else:
        verification_result = "UNCERTAIN"

    explanation = "Outcome recorded from your note; no before-and-after photo comparison was possible."
    initial = [item for item in session["evidence"] if item["stage"] == "INITIAL"]
    final = [item for item in session["evidence"] if item["stage"] == "FINAL"]
    if initial and final:
        files = {item["id"]: storage.load_evidence(item["id"], session_id) for item in initial + final}
        if any(value is None for value in files.values()):
            raise HTTPException(409, "Evidence is missing. Please upload it again.")
        comparison = call_gemini_verification(session, payload.final_note, files)
        verification_result = comparison.verification_result
        explanation = comparison.explanation
    session["status"] = "verified"
    session["verification_result"] = verification_result
    session["timeline"].append(create_event("verification_complete", "Final verification completed"))
    session["updated_at"] = utc_now()
    session["final_note"] = payload.final_note
    session["verification_explanation"] = explanation
    session["verification_evidence_ids"] = [item["id"] for item in session["evidence"] if item["stage"] == "FINAL"]
    storage.save_session(session)
    return {"verification_result": verification_result, "explanation": explanation, "status": "verified"}


@app.get("/api/v1/sessions/{session_id}/report")
def get_report(session_id: str) -> dict[str, Any]:
    session = storage.load_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    original_problem = session["description"]
    report = {
        "session_id": session_id,
        "object": session.get("object_category", "Object"),
        "original_problem": original_problem,
        "initial_observations": session.get("initial_observations", session.get("observations", [])),
        "possible_causes": session.get("hypotheses", []),
        "evidence_collected": session.get("evidence", []),
        "actions_performed": session.get("action_history", []),
        "verification_explanation": session.get("verification_explanation"),
        "verification_result": session.get("verification_result") or "UNCERTAIN",
        "remaining_concerns": "Photos and reported outcomes cannot guarantee repair success or safety.",
        "safety_notes": session.get("analysis", {}).get("safety", {}).get("warning") or "Safety has not been established.",
        "date": session.get("created_at", utc_now()),
    }
    return report


@app.get("/api/v1/sessions/{session_id}/evidence/{evidence_id}")
def get_evidence(session_id: str, evidence_id: str):
    session = storage.load_session(session_id)
    if not session or not any(item["id"] == evidence_id for item in session["evidence"]):
        raise HTTPException(404, "Evidence not found")
    stored = storage.load_evidence(evidence_id, session_id)
    if not stored:
        raise HTTPException(404, "Evidence not found")
    return Response(stored[0], media_type=stored[1], headers={"X-Content-Type-Options": "nosniff"})
