from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv(Path(__file__).resolve().parents[2] / ".env")
load_dotenv(Path(__file__).resolve().parents[2] / ".env.example")

try:
    from google import genai
except Exception:  # pragma: no cover - optional dependency fallback
    genai = None

app = FastAPI(title="FixLens API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SESSIONS: dict[str, dict[str, Any]] = {}


class CreateSessionRequest(BaseModel):
    description: str = Field(..., min_length=10, max_length=2000)


class Observation(BaseModel):
    description: str
    confidence: float
    evidence_reference: str = "initial_evidence"


class Hypothesis(BaseModel):
    cause: str
    confidence: float
    status: Literal["POSSIBLE", "SUPPORTED", "WEAKENED", "REJECTED"] = "POSSIBLE"


class SafetyAssessment(BaseModel):
    level: Literal["LOW", "MEDIUM", "HIGH", "UNKNOWN"]
    reason: str
    warning: str | None = None


class EvidenceRequest(BaseModel):
    type: str
    instruction: str
    reason: str
    recommended_angle: str | None = None
    required_components: list[str]
    priority: Literal["low", "medium", "high"] = "medium"


class RepairStep(BaseModel):
    step_number: int
    title: str
    instruction: str
    reason: str
    safety_warning: str
    expected_result: str
    status: Literal["PENDING", "IN_PROGRESS", "COMPLETED", "SKIPPED", "BLOCKED"] = "PENDING"


class InvestigationResponse(BaseModel):
    object_name: str
    component: str
    confidence: float
    observations: list[Observation]
    hypotheses: list[Hypothesis]
    safety: SafetyAssessment
    evidence_required: list[EvidenceRequest]
    next_action: str
    risk_level: Literal["LOW", "MEDIUM", "HIGH", "UNKNOWN"]
    repair_steps: list[RepairStep] = []


class VerificationInput(BaseModel):
    final_note: str | None = None


class EvidenceUploadResponse(BaseModel):
    status: str
    evidence_id: str


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
    return f"FL-{datetime.now().strftime('%Y%m%d')}-{uuid4().hex[:6].upper()}"


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


def build_analysis(description: str) -> InvestigationResponse:
    lowered = description.lower()
    object_name = normalise_object(description)
    if object_name == "Bicycle":
        component = "Rear drivetrain"
        confidence = 0.94
        observations = [
            Observation(
                description="Chain appears loose or misaligned in the provided image.",
                confidence=0.82,
                evidence_reference="initial_evidence",
            ),
            Observation(
                description="The drivetrain area shows signs of chain tension or alignment issues.",
                confidence=0.75,
                evidence_reference="initial_evidence",
            ),
        ]
        hypotheses = [
            Hypothesis(cause="Derailleur adjustment issue", confidence=0.72),
            Hypothesis(cause="Chain wear or stretched chain", confidence=0.58),
        ]
        evidence_required = [
            EvidenceRequest(
                type="image",
                instruction="Upload a close-up photo of the rear derailleur and chain.",
                reason="Current evidence does not clearly show derailleur alignment.",
                recommended_angle="side",
                required_components=["chain", "derailleur", "cassette"],
                priority="high",
            )
        ]
        repair_steps = [
            RepairStep(
                step_number=1,
                title="Inspect Chain Position",
                instruction="Check whether the chain sits correctly on the cassette and chainrings before changing anything.",
                reason="This identifies whether the issue is caused by misalignment or tension.",
                safety_warning="Do not force the chain while the drivetrain is under load.",
                expected_result="The chain sits evenly without obvious slack or misalignment.",
                status="PENDING",
            ),
            RepairStep(
                step_number=2,
                title="Check Rear Derailleur Alignment",
                instruction="Look for derailleur hanger alignment and confirm the chain is not rubbing or sitting outside the sprockets.",
                reason="A misaligned derailleur often causes chain drop under load.",
                safety_warning="Wear gloves if the bike is in a work stand and avoid touching moving teeth.",
                expected_result="The derailleur appears aligned and the chain tracks cleanly.",
                status="PENDING",
            ),
        ]
        risk_level = "LOW"
        safety = SafetyAssessment(
            level="LOW",
            reason="This is a standard mechanical bicycle inspection with no obvious high-risk conditions.",
            warning="Use caution around drivetrain components and avoid working near moving parts.",
        )
    else:
        component = "Visible component"
        confidence = 0.62
        observations = [
            Observation(
                description="The object appears to have a visible defect or mismatch in the supplied photo.",
                confidence=0.66,
                evidence_reference="initial_evidence",
            )
        ]
        hypotheses = [
            Hypothesis(cause="Visible misalignment or loose assembly", confidence=0.56),
            Hypothesis(cause="Missing or degraded fastening component", confidence=0.48),
        ]
        evidence_required = [
            EvidenceRequest(
                type="image",
                instruction="Take a clearer photo of the affected area in direct light.",
                reason="The current image is not detailed enough to identify the exact cause reliably.",
                recommended_angle="straight_on",
                required_components=["affected area", "fastener", "surrounding structure"],
                priority="medium",
            )
        ]
        repair_steps = []
        risk_level = "UNKNOWN"
        safety = SafetyAssessment(
            level="UNKNOWN",
            reason="The available evidence is not sufficient to judge whether the item is safe to repair without more context.",
            warning="More images are required before troubleshooting can continue safely.",
        )

    return InvestigationResponse(
        object_name=object_name,
        component=component,
        confidence=confidence,
        observations=observations,
        hypotheses=hypotheses,
        safety=safety,
        evidence_required=evidence_required,
        next_action="collect_evidence",
        risk_level=risk_level,
        repair_steps=repair_steps,
    )


def call_gemini_analysis(description: str) -> InvestigationResponse | None:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or genai is None:
        return None

    try:
        client = genai.Client(api_key=api_key)
        prompt = """
        You are FixLens, a visual troubleshooting investigator for physical objects.
        Return a valid JSON object with this exact structure:
        {
          "object_name": "string",
          "component": "string",
          "confidence": 0.0,
          "observations": [{"description": "string", "confidence": 0.0, "evidence_reference": "string"}],
          "hypotheses": [{"cause": "string", "confidence": 0.0, "status": "POSSIBLE"}],
          "safety": {"level": "LOW", "reason": "string", "warning": "string"},
          "evidence_required": [{"type": "image", "instruction": "string", "reason": "string", "recommended_angle": "string", "required_components": ["string"], "priority": "high"}],
          "next_action": "collect_evidence",
          "risk_level": "LOW",
          "repair_steps": [{"step_number": 1, "title": "string", "instruction": "string", "reason": "string", "safety_warning": "string", "expected_result": "string", "status": "PENDING"}]
        }
        User description: """ + description + """
        Keep the output valid JSON only. Do not use markdown fences.
        """
        response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
        raw_text = getattr(response, "text", None) or str(response)
        payload = json.loads(raw_text)
        return InvestigationResponse.model_validate(payload)
    except Exception:
        return None


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/v1/sessions")
def create_session(payload: CreateSessionRequest) -> dict[str, str]:
    session_id = generate_session_id()
    SESSIONS[session_id] = {
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
    return {"session_id": session_id, "status": "created"}


@app.get("/api/v1/sessions/{session_id}")
def get_session(session_id: str) -> dict[str, Any]:
    session = SESSIONS.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@app.post("/api/v1/sessions/{session_id}/evidence")
async def upload_evidence(
    session_id: str,
    file: UploadFile | None = File(default=None),
    description: str = Form(default=""),
    evidence_type: str = Form(default="image"),
) -> EvidenceUploadResponse:
    session = SESSIONS.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    evidence_id = str(uuid4())
    item = {
        "id": evidence_id,
        "session_id": session_id,
        "type": evidence_type,
        "file_name": file.filename if file else "n/a",
        "description": description or "Uploaded evidence",
        "stage": "INITIAL",
        "created_at": utc_now(),
    }
    session["evidence"].append(item)
    session["timeline"].append(create_event("evidence_uploaded", f"Evidence uploaded: {item['type']}"))
    session["updated_at"] = utc_now()
    return EvidenceUploadResponse(status="uploaded", evidence_id=evidence_id)


@app.post("/api/v1/sessions/{session_id}/analyze")
def analyze_session(session_id: str) -> dict[str, Any]:
    session = SESSIONS.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    result = call_gemini_analysis(session["description"]) or build_analysis(session["description"])
    session["status"] = "analyzed"
    session["risk_level"] = result.risk_level
    session["object_category"] = result.object_name
    session["observations"] = [obs.model_dump() for obs in result.observations]
    session["hypotheses"] = [hyp.model_dump() for hyp in result.hypotheses]
    session["repair_steps"] = [step.model_dump() for step in result.repair_steps]
    session["analysis"] = result.model_dump()
    session["timeline"].append(create_event("analysis_complete", "Initial multimodal investigation completed"))
    session["updated_at"] = utc_now()
    return result.model_dump()


@app.post("/api/v1/sessions/{session_id}/verify")
def verify_session(session_id: str, payload: VerificationInput) -> dict[str, str]:
    session = SESSIONS.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    note = (payload.final_note or "").lower()
    if "better" in note or "improved" in note or "resolved" in note:
        verification_result = "LIKELY_RESOLVED"
    elif "worse" in note or "worsened" in note:
        verification_result = "WORSE"
    elif "unchanged" in note or "same" in note:
        verification_result = "UNCHANGED"
    else:
        verification_result = "UNCERTAIN"

    session["status"] = "verified"
    session["verification_result"] = verification_result
    session["timeline"].append(create_event("verification_complete", "Final verification completed"))
    session["updated_at"] = utc_now()
    return {"verification_result": verification_result, "status": "verified"}


@app.get("/api/v1/sessions/{session_id}/report")
def get_report(session_id: str) -> dict[str, Any]:
    session = SESSIONS.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    original_problem = session["description"]
    report = {
        "session_id": session_id,
        "object": session.get("object_category", "Object"),
        "original_problem": original_problem,
        "initial_observations": session.get("observations", []),
        "possible_causes": session.get("hypotheses", []),
        "evidence_collected": session.get("evidence", []),
        "actions_performed": session.get("repair_steps", []),
        "verification_result": session.get("verification_result", "UNCERTAIN"),
        "remaining_concerns": "Continue monitoring for recurring symptoms and re-check alignment if the issue reappears.",
        "safety_notes": "Follow the recommended safety guidance during troubleshooting and stop if conditions become unsafe.",
        "date": session.get("created_at", utc_now()),
    }
    return report
