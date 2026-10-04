import json
from io import BytesIO
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app import main
from app import storage, ai_service
from PIL import Image

client = TestClient(app)


@pytest.fixture(autouse=True)
def isolate_sessions(monkeypatch, tmp_path):
    monkeypatch.setattr(storage, "DATA_DIR", tmp_path)
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    yield


@pytest.fixture
def gemini_calls(monkeypatch):
    calls = []

    def generate_content(**kwargs):
        calls.append(kwargs)
        evidence = [part for part in kwargs["contents"] if isinstance(part, str) and part.startswith("Evidence ID ")]
        observations = [{"description": "Chain visible in evidence", "confidence": 0.7, "evidence_reference": evidence[0].split()[2].rstrip(",")}] if evidence else []
        return SimpleNamespace(text=json.dumps({
            "object_name": "Bicycle", "component": "Chain", "confidence": 0.7,
            "observations": observations,
            "hypotheses": [{"cause": "Chain alignment", "confidence": 0.5}],
            "safety": {"level": "UNKNOWN", "reason": "Needs inspection"},
            "evidence_required": [], "next_action": "collect_evidence",
            "risk_level": "UNKNOWN", "repair_steps": [],
        }))

    class FakeClient:
        models = SimpleNamespace(generate_content=generate_content)

        def __init__(self, **kwargs):
            pass

        def __enter__(self):
            return self

        def __exit__(self, *args):
            pass

    monkeypatch.setattr(ai_service.genai, "Client", FakeClient)
    return calls


def test_create_session_and_get_session():
    response = client.post("/api/v1/sessions", json={"description": "My bicycle chain keeps falling."})
    assert response.status_code == 200, response.text
    payload = response.json()
    assert "session_id" in payload
    session_id = payload["session_id"]

    detail = client.get(f"/api/v1/sessions/{session_id}")
    assert detail.status_code == 200
    assert detail.json()["description"] == "My bicycle chain keeps falling."


def test_analyze_session_returns_structured_results(gemini_calls):
    response = client.post("/api/v1/sessions", json={"description": "My bicycle chain keeps falling."})
    session_id = response.json()["session_id"]

    analysis = client.post(f"/api/v1/sessions/{session_id}/analyze")
    assert analysis.status_code == 200, analysis.text
    body = analysis.json()
    assert body["risk_level"] in {"LOW", "MEDIUM", "HIGH", "UNKNOWN"}
    assert isinstance(body["observations"], list)
    assert not body["observations"]  # No fabricated visual observations without images.
    assert len(body["hypotheses"]) >= 1
    assert isinstance(body["repair_steps"], list)


def test_verify_session_generates_report(gemini_calls):
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


def test_image_bytes_are_sent_to_gemini(gemini_calls):
    session_id = client.post("/api/v1/sessions", json={"description": "My bicycle chain keeps falling."}).json()["session_id"]
    buffer = BytesIO()
    Image.new("RGB", (16, 16), "red").save(buffer, format="PNG")
    image = buffer.getvalue()
    upload = client.post(f"/api/v1/sessions/{session_id}/evidence", files={"file": ("chain.png", image, "image/png")})
    assert upload.status_code == 200
    assert client.post(f"/api/v1/sessions/{session_id}/analyze").status_code == 200
    image_part = gemini_calls[0]["contents"][-1]
    assert image_part.inline_data.data == image
    assert image_part.inline_data.mime_type == "image/png"
    assert "image-data" not in client.get(f"/api/v1/sessions/{session_id}").text
    assert client.get(f"/api/v1/sessions/{session_id}/evidence/{upload.json()['evidence_id']}").content == image


@pytest.mark.parametrize("file,status", [
    (("bad.txt", b"text", "text/plain"), 415),
    (("empty.png", b"", "image/png"), 422),
    (("large.png", b"x" * (main.MAX_IMAGE_BYTES + 1), "image/png"), 413),
])
def test_invalid_uploads_are_rejected(file, status):
    session_id = client.post("/api/v1/sessions", json={"description": "My bicycle chain keeps falling."}).json()["session_id"]
    response = client.post(f"/api/v1/sessions/{session_id}/evidence", files={"file": file})
    assert response.status_code == status
    assert not storage.load_session(session_id)["evidence"]


def test_missing_key_reports_configuration_error(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY")
    session_id = client.post("/api/v1/sessions", json={"description": "My bicycle chain keeps falling."}).json()["session_id"]
    assert client.post(f"/api/v1/sessions/{session_id}/analyze").status_code == 503
    assert storage.load_session(session_id)["status"] == "created"


def test_provider_failure_does_not_return_sample_results(monkeypatch):
    def fail(**kwargs):
        raise RuntimeError("provider failure")
    monkeypatch.setattr(ai_service.genai, "Client", fail)
    session_id = client.post("/api/v1/sessions", json={"description": "My bicycle chain keeps falling."}).json()["session_id"]
    assert client.post(f"/api/v1/sessions/{session_id}/analyze").status_code == 502
    assert not storage.load_session(session_id)["observations"]


def test_unverified_report_and_health():
    assert client.get("/health").json() == {"status": "ok"}
    session_id = client.post("/api/v1/sessions", json={"description": "My bicycle chain keeps falling."}).json()["session_id"]
    assert client.get(f"/api/v1/sessions/{session_id}/report").json()["verification_result"] == "UNCERTAIN"


def test_corrupt_image_is_rejected():
    session_id = client.post("/api/v1/sessions", json={"description": "My bicycle chain keeps falling."}).json()["session_id"]
    assert client.post(f"/api/v1/sessions/{session_id}/evidence", files={"file": ("fake.png", b"not-an-image", "image/png")}).status_code == 422


def test_analysis_persists_in_database(gemini_calls):
    session_id = client.post("/api/v1/sessions", json={"description": "My bicycle chain keeps falling."}).json()["session_id"]
    analysis = client.post(f"/api/v1/sessions/{session_id}/analyze").json()
    session = client.get(f"/api/v1/sessions/{session_id}").json()
    assert session["analysis"] == analysis
    assert session["status"] == "analyzed"


def test_malformed_output_retries_once_and_reports_error(monkeypatch, gemini_calls):
    calls = []
    def malformed(**kwargs):
        calls.append(kwargs)
        return SimpleNamespace(text='{"confidence": 7}')
    monkeypatch.setattr(ai_service.genai.Client.models, "generate_content", malformed)
    session_id = client.post("/api/v1/sessions", json={"description": "My bicycle chain keeps falling."}).json()["session_id"]
    response = client.post(f"/api/v1/sessions/{session_id}/analyze")
    assert response.status_code == 502
    assert response.json()["detail"]["code"] == "invalid_ai_output"
    assert len(calls) == 2
    assert "analysis" not in storage.load_session(session_id)


def test_unavailable_model_has_useful_error(monkeypatch):
    class Unavailable(Exception):
        code = 404
    def fail(**kwargs):
        raise Unavailable()
    monkeypatch.setattr(ai_service.genai, "Client", fail)
    session_id = client.post("/api/v1/sessions", json={"description": "My bicycle chain keeps falling."}).json()["session_id"]
    response = client.post(f"/api/v1/sessions/{session_id}/analyze")
    assert response.status_code == 503
    assert response.json()["detail"]["provider_status"] == 404


def test_json_fences_are_recovered():
    payload = {"object_name": "Object", "component": "Unknown", "confidence": 0,
               "observations": [], "hypotheses": [], "safety": {"level": "UNKNOWN", "reason": "Insufficient evidence"},
               "evidence_required": [], "next_action": "collect_evidence", "risk_level": "UNKNOWN"}
    assert ai_service.parse_result('```json\n' + json.dumps(payload) + '\n```').object_name == "Object"


def test_invalid_output_recovers_on_second_attempt(monkeypatch, gemini_calls):
    original = ai_service.genai.Client.models.generate_content
    attempts = []
    def recover(**kwargs):
        attempts.append(kwargs)
        return SimpleNamespace(text="broken JSON") if len(attempts) == 1 else original(**kwargs)
    monkeypatch.setattr(ai_service.genai.Client.models, "generate_content", recover)
    session_id = client.post("/api/v1/sessions", json={"description": "My bicycle chain keeps falling."}).json()["session_id"]
    assert client.post(f"/api/v1/sessions/{session_id}/analyze").status_code == 200
    assert len(attempts) == 2


def test_additional_evidence_includes_previous_analysis(gemini_calls):
    session_id = client.post("/api/v1/sessions", json={"description": "My bicycle chain keeps falling."}).json()["session_id"]
    assert client.post(f"/api/v1/sessions/{session_id}/analyze").status_code == 200
    buffer = BytesIO()
    Image.new("RGB", (16, 16)).save(buffer, format="PNG")
    assert client.post(f"/api/v1/sessions/{session_id}/evidence", files={"file": ("more.png", buffer.getvalue(), "image/png")}, data={"stage": "ADDITIONAL"}).status_code == 200
    assert client.post(f"/api/v1/sessions/{session_id}/analyze").status_code == 200
    assert any(isinstance(part, str) and part.startswith("Previous investigation") for part in gemini_calls[1]["contents"])


@pytest.mark.parametrize("description", ["There is a gas leak in the appliance.", "The lithium battery is swollen.", "There are exposed mains wires.", "The bicycle has a cracked frame."])
def test_safety_blocks_dangerous_diy(description, gemini_calls):
    session_id = client.post("/api/v1/sessions", json={"description": description}).json()["session_id"]
    response = client.post(f"/api/v1/sessions/{session_id}/analyze").json()
    assert response["safety"]["level"] == "HIGH"
    assert response["repair_steps"] == []
    assert response["next_action"] == "seek_professional_help"


def test_negative_verification_is_not_resolved():
    session_id = client.post("/api/v1/sessions", json={"description": "My bicycle chain keeps falling."}).json()["session_id"]
    response = client.post(f"/api/v1/sessions/{session_id}/verify", json={"final_note": "The problem is not resolved."})
    assert response.json()["verification_result"] == "UNCHANGED"


@pytest.mark.parametrize("text", ['print("hello world")', 'if True:\n    print("hello world")'])
def test_image_text_is_preserved_and_persisted(text, monkeypatch, gemini_calls):
    original = ai_service.genai.Client.models.generate_content
    def transcribe(**kwargs):
        response = original(**kwargs)
        payload = json.loads(response.text)
        payload["extracted_text"] = text
        payload["text_evidence_reference"] = payload["observations"][0]["evidence_reference"]
        return SimpleNamespace(text=json.dumps(payload))
    monkeypatch.setattr(ai_service.genai.Client.models, "generate_content", transcribe)
    session_id = client.post("/api/v1/sessions", json={"description": "Please read the code in this screenshot."}).json()["session_id"]
    image = BytesIO()
    Image.new("RGB", (16, 16)).save(image, format="PNG")
    upload = client.post(f"/api/v1/sessions/{session_id}/evidence", files={"file": ("code.png", image.getvalue(), "image/png")})
    result = client.post(f"/api/v1/sessions/{session_id}/analyze")
    assert result.status_code == 200
    assert result.json()["extracted_text"] == text
    assert result.json()["text_evidence_reference"] == upload.json()["evidence_id"]
    assert client.get(f"/api/v1/sessions/{session_id}").json()["analysis"]["extracted_text"] == text


def test_image_text_without_real_evidence_is_rejected(monkeypatch, gemini_calls):
    original = ai_service.genai.Client.models.generate_content
    def invented(**kwargs):
        payload = json.loads(original(**kwargs).text)
        payload["extracted_text"] = 'print("hello world")'
        payload["text_evidence_reference"] = "nonexistent"
        return SimpleNamespace(text=json.dumps(payload))
    monkeypatch.setattr(ai_service.genai.Client.models, "generate_content", invented)
    session_id = client.post("/api/v1/sessions", json={"description": "Please read the code in this screenshot."}).json()["session_id"]
    assert client.post(f"/api/v1/sessions/{session_id}/analyze").status_code == 502
    assert "analysis" not in storage.load_session(session_id)
