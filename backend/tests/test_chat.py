import json
from io import BytesIO
from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app import ai_service, storage
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def chat_model(monkeypatch, tmp_path):
    monkeypatch.setattr(storage, "DATA_DIR", tmp_path)
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    calls = []

    class FakeClient:
        def __init__(self, **kwargs):
            self.models = SimpleNamespace(generate_content=self.generate)

        def generate(self, **kwargs):
            calls.append(kwargs)
            return SimpleNamespace(text=json.dumps({"answer": 'Use quotes for a string:\n```python\nprint("hello world")\n```'}))

        def __enter__(self):
            return self

        def __exit__(self, *args):
            pass

    monkeypatch.setattr(ai_service.genai, "Client", FakeClient)
    return calls


def send(message="Why does print(hello) fail?", **extra):
    return client.post("/api/v1/chat", data={"request_id": str(uuid4()), "message": message, **extra})


def test_text_chat_and_follow_up_use_persisted_context(chat_model):
    first = send()
    assert first.status_code == 200, first.text
    session_id = first.json()["session_id"]
    second = send("Explain that line.", session_id=session_id)
    assert second.status_code == 200
    assert [item["role"] for item in second.json()["messages"]] == ["user", "assistant", "user", "assistant"]
    assert "print(hello)" in chat_model[-1]["contents"][0]
    assert 'print("hello world")' in chat_model[-1]["contents"][1]
    assert "Explain that line." in chat_model[-1]["contents"][2]
    assert client.get(f"/api/v1/sessions/{session_id}").json()["messages"] == second.json()["messages"]


def test_screenshot_bytes_remain_available_in_follow_up(chat_model):
    image = BytesIO()
    Image.new("RGB", (16, 16)).save(image, format="PNG")
    first = client.post("/api/v1/chat", data={"request_id": str(uuid4()), "message": "Read this code."}, files={"file": ("code.png", image.getvalue(), "image/png")})
    assert first.status_code == 200
    session_id = first.json()["session_id"]
    evidence_id = first.json()["messages"][0]["evidence_id"]
    assert client.get(f"/api/v1/sessions/{session_id}/evidence/{evidence_id}").content == image.getvalue()
    assert send("How do I fix it?", session_id=session_id).status_code == 200
    assert chat_model[-1]["contents"][1].inline_data.data == image.getvalue()


def test_retry_does_not_duplicate_user_message_or_reply(chat_model):
    request_id = str(uuid4())
    first = send(request_id=request_id)
    second = send(request_id=request_id)
    assert first.json() == second.json()
    assert len(chat_model) == 1


def test_failed_reply_can_retry_after_refresh(monkeypatch, chat_model):
    request_id = str(uuid4())
    monkeypatch.delenv("GEMINI_API_KEY")
    assert send(request_id=request_id).status_code == 503
    session_id = "CHAT-" + request_id
    assert len(client.get(f"/api/v1/sessions/{session_id}").json()["messages"]) == 1
    assert send("Another question", session_id=session_id).status_code == 409
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    response = send(request_id=request_id, session_id=session_id)
    assert response.status_code == 200
    assert len(response.json()["messages"]) == 2


def test_chat_validation_and_missing_session():
    assert send("").status_code == 422
    assert send(session_id="missing").status_code == 404
    assert send(request_id="bad-id").status_code == 422
    assert client.post("/api/v1/chat", data={"request_id": str(uuid4()), "message": "Read this."}, files={"file": ("bad.png", b"not an image", "image/png")}).status_code == 422
