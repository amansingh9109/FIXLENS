import os

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_create_session_and_get_session():
    response = client.post("/api/v1/sessions", json={"description": "My bicycle chain keeps falling."})
    assert response.status_code == 200, response.text
    payload = response.json()
    assert "session_id" in payload
    session_id = payload["session_id"]

    detail = client.get(f"/api/v1/sessions/{session_id}")
    assert detail.status_code == 200
    assert detail.json()["description"] == "My bicycle chain keeps falling."


def test_analyze_session_returns_structured_results():
    response = client.post("/api/v1/sessions", json={"description": "My bicycle chain keeps falling."})
    session_id = response.json()["session_id"]

    analysis = client.post(f"/api/v1/sessions/{session_id}/analyze")
    assert analysis.status_code == 200, analysis.text
    body = analysis.json()
    assert body["risk_level"] in {"LOW", "MEDIUM", "HIGH", "UNKNOWN"}
    assert len(body["observations"]) >= 1
    assert len(body["hypotheses"]) >= 1
    assert isinstance(body["repair_steps"], list)


def test_verify_session_generates_report():
    response = client.post("/api/v1/sessions", json={"description": "Loose bicycle chain."})
    session_id = response.json()["session_id"]

    client.post(f"/api/v1/sessions/{session_id}/analyze")
    verify = client.post(f"/api/v1/sessions/{session_id}/verify", json={"final_note": "Chain looks better after adjustment."})
    assert verify.status_code == 200, verify.text
    result = verify.json()
    assert result["verification_result"] in {"LIKELY_RESOLVED", "IMPROVED", "UNCHANGED", "WORSE", "UNCERTAIN"}

    report = client.get(f"/api/v1/sessions/{session_id}/report")
    assert report.status_code == 200
    assert report.json()["original_problem"] == "Loose bicycle chain."
