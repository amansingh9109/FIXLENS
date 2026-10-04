"""Explicit integration check: uses real AI; never part of the mocked unit suite.

Run from repository root after starting frontend and backend:
.venv/Scripts/python.exe -B frontend/tests/browser_workflow.py
"""
import json
import os
from pathlib import Path

import httpx
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[2]
RESULTS = ROOT / "test-results"
FRONTEND = os.getenv("TEST_FRONTEND_URL", "http://localhost:3000")
BACKEND = os.getenv("TEST_API_URL", "http://127.0.0.1:8010")
PROBLEM = "My bicycle chain keeps falling when I change gears."


def main():
    RESULTS.mkdir(exist_ok=True)
    image = RESULTS / "bicycle.jpg"
    if not image.exists():
        raise RuntimeError("Place a real bicycle photograph at test-results/bicycle.jpg first.")
    statuses = {}
    requests = []
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1100})
        page.on("request", lambda request: requests.append((request.method, request.url)))
        page.goto(FRONTEND)
        page.get_by_role("link", name="Start a repair", exact=True).click()
        page.locator('input[type="file"]').set_input_files(str(image))
        expect(page.get_by_alt_text("Selected evidence preview")).to_be_visible()
        page.get_by_label("What are you trying to fix?").fill(PROBLEM)
        with page.expect_response(lambda r: r.url.endswith("/analyze") and r.request.method == "POST", timeout=150000) as pending:
            page.get_by_role("button", name="Check this problem", exact=True).click()
            expect(page.get_by_role("button", name="Working on it...")).to_be_disabled()
            expect(page.get_by_role("status")).to_be_visible()
        response = pending.value
        if response.status != 200:
            page.screenshot(path=str(RESULTS / "browser-failure.png"), full_page=True)
            raise AssertionError(f"Live browser analysis failed: {response.status} {response.text()}")
        analysis = response.json()
        assert analysis["observations"] and analysis["hypotheses"]
        page.wait_for_url("**/session/*", timeout=30000)
        session_id = page.url.rstrip("/").split("/")[-1]
        session = httpx.get(f"{BACKEND}/api/v1/sessions/{session_id}").json()
        assert session["analysis"] == analysis
        assert len(session["evidence"]) == 1
        uploaded = httpx.get(BACKEND + session["evidence"][0]["url"])
        assert uploaded.content == image.read_bytes()
        creates = [url for method, url in requests if method == "POST" and url.endswith("/api/v1/sessions")]
        assert len(creates) == 1
        for observation in analysis["observations"]:
            expect(page.get_by_text(observation["description"], exact=True)).to_be_visible()
        for hypothesis in analysis["hypotheses"]:
            expect(page.get_by_text(hypothesis["cause"], exact=True)).to_be_visible()
        expect(page.get_by_role("heading", name="Safety assessment")).to_be_visible()
        if analysis["evidence_required"]:
            expect(page.get_by_role("heading", name="A few more photos would help")).to_be_visible()
        expect(page.get_by_alt_text("Uploaded evidence: bicycle.jpg")).to_be_visible()
        statuses.update({name: "PASS" for name in [
            "Frontend → Session", "Frontend → Image Upload", "Backend → AI",
            "AI → Structured JSON", "JSON → Pydantic", "Analysis → Database", "Database → Frontend",
        ]})
        page.screenshot(path=str(RESULTS / "browser-success.png"), full_page=True)
        page.reload()
        expect(page.get_by_text(analysis["observations"][0]["description"], exact=True)).to_be_visible(timeout=15000)
        statuses["Refresh restores analysis"] = "PASS"

        page.get_by_role("link", name="Verify repair", exact=True).click()
        page.get_by_label("What changed?").fill("The chain is unchanged.")
        page.locator('input[type="file"]').set_input_files(str(image))
        page.get_by_role("button", name="Verify repair", exact=True).click()
        page.wait_for_url("**/report", timeout=30000)
        expect(page.get_by_text("Verification: UNCHANGED", exact=True)).to_be_visible()
        verified = httpx.get(f"{BACKEND}/api/v1/sessions/{session_id}").json()
        assert verified["verification_evidence_ids"]
        final = next(item for item in verified["evidence"] if item["stage"] == "FINAL")
        assert httpx.get(BACKEND + final["url"]).content == image.read_bytes()
        statuses["Final evidence and verification"] = "PASS"
        page.goto(FRONTEND + "/session/" + session_id)
        expect(page.get_by_text(analysis["observations"][0]["description"], exact=True)).to_be_visible(timeout=15000)

        # Force a provider-unavailable HTTP response without inventing diagnosis data.
        page.route("**/api/v1/sessions/*/analyze", lambda route: route.fulfill(
            status=503, content_type="application/json",
            body=json.dumps({"detail": {"code": "ai_unavailable", "message": "AI analysis is temporarily unavailable."}})))
        page.get_by_role("button", name="Check again", exact=True).click()
        expect(page.locator('[role="alert"]:not(#__next-route-announcer__)')).to_contain_text("AI analysis is temporarily unavailable.")
        assert httpx.get(f"{BACKEND}/api/v1/sessions/{session_id}").json()["analysis"] == analysis
        page.screenshot(path=str(RESULTS / "browser-error.png"), full_page=True)
        page.unroute("**/api/v1/sessions/*/analyze")
        page.route("**/api/v1/sessions/missing-session", lambda route: route.fulfill(
            status=404, content_type="application/json", body='{"detail":"Session not found"}'))
        page.goto(FRONTEND + "/session/missing-session")
        expect(page.locator('[role="alert"]:not(#__next-route-announcer__)')).to_contain_text("could not be found")
        expect(page.get_by_role("heading", name="What we can see")).to_have_count(0)
        statuses["Hardcoded fallback removed"] = "PASS"

        page.goto(FRONTEND + "/investigate")
        page.locator('input[type="file"]').set_input_files(str(image))
        page.get_by_label("What are you trying to fix?").fill(PROBLEM)
        page.route("**/api/v1/sessions/*/analyze", lambda route: route.fulfill(
            status=502, content_type="application/json",
            body=json.dumps({"detail": {"code": "invalid_ai_output"}})))
        page.get_by_role("button", name="Check this problem", exact=True).click()
        expect(page.locator('[role="alert"]:not(#__next-route-announcer__)')).to_contain_text("couldn't complete this analysis", timeout=30000)
        expect(page.get_by_label("What are you trying to fix?")).to_have_value(PROBLEM)
        expect(page.get_by_alt_text("Selected evidence preview")).to_be_visible()
        before = len([url for method, url in requests if method == "POST" and url.endswith("/api/v1/sessions")])
        page.get_by_role("button", name="Try again", exact=True).click()
        expect(page.locator('[role="alert"]:not(#__next-route-announcer__)')).to_be_visible(timeout=30000)
        after = len([url for method, url in requests if method == "POST" and url.endswith("/api/v1/sessions")])
        assert before == after
        statuses["Failure → Error UI"] = "PASS"
        statuses["End-to-End FixLens Flow"] = "PASS"
        (RESULTS / "browser-results.json").write_text(json.dumps({"statuses": statuses, "session_id": session_id, "analysis": analysis}, indent=2, ensure_ascii=False), encoding="utf-8")
        print(json.dumps(statuses, ensure_ascii=True))
        browser.close()


if __name__ == "__main__":
    main()
