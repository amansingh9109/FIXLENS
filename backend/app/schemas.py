from typing import Literal
from pydantic import BaseModel, Field

class CreateSessionRequest(BaseModel):
    description: str = Field(..., min_length=10, max_length=2000)


class Observation(BaseModel):
    description: str
    confidence: float = Field(ge=0, le=1)
    evidence_reference: str = Field(min_length=1)


class Hypothesis(BaseModel):
    cause: str
    confidence: float = Field(ge=0, le=1)
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
    confidence: float = Field(ge=0, le=1)
    observations: list[Observation]
    hypotheses: list[Hypothesis]
    safety: SafetyAssessment
    evidence_required: list[EvidenceRequest]
    next_action: str
    risk_level: Literal["LOW", "MEDIUM", "HIGH", "UNKNOWN"]
    repair_steps: list[RepairStep] = Field(default_factory=list)
    extracted_text: str | None = Field(default=None, max_length=20000)
    text_evidence_reference: str | None = None


class VerificationInput(BaseModel):
    final_note: str | None = Field(default=None, max_length=2000)


class VerificationResult(BaseModel):
    verification_result: Literal["LIKELY_RESOLVED", "IMPROVED", "UNCHANGED", "WORSE", "UNCERTAIN"]
    explanation: str = Field(min_length=1, max_length=3000)


class ActionFeedback(BaseModel):
    outcome: Literal["COMPLETED", "IMPROVED", "UNCHANGED", "WORSE", "CANNOT_PERFORM"]


class EvidenceUploadResponse(BaseModel):
    status: str
    evidence_id: str
