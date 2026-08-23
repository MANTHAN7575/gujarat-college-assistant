"""
Regression test: POST /api/v1/chat/ payload validation.

Verifies that the exact JSON shape sent by the frontend
({ message: "...", session_id: "..." }) returns 200 OK
and a valid ChatResponse body, NOT a 422 validation error.

Also confirms that the OLD broken payload ({ query: "..." })
is correctly rejected with 422.
"""

import sys
import os
import io
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_correct_payload_returns_200():
    """Frontend sends { message, session_id } — must return 200 OK."""
    payload = {
        "message": "Highest placement packages at PDEU?",
        "session_id": "regression-test-001"
    }
    res = client.post("/api/v1/chat/", json=payload)
    assert res.status_code == 200, (
        f"Expected 200 but got {res.status_code}: {res.text}"
    )
    data = res.json()
    assert "response" in data, f"Missing 'response' key in body: {data}"
    assert "intent" in data, f"Missing 'intent' key in body: {data}"
    assert "session_id" in data, f"Missing 'session_id' key in body: {data}"
    assert len(data["response"]) > 0, "Empty response text"
    print(f"  ✅ POST /api/v1/chat/ with correct payload -> 200 OK")
    print(f"     Response length: {len(data['response'])} chars")
    print(f"     Detected intent: {data.get('intent')}")
    print(f"     Detected college: {data.get('college')}")


def test_message_only_without_session_id():
    """session_id is Optional — omitting it should still return 200."""
    payload = {"message": "Top engineering colleges in Ahmedabad"}
    res = client.post("/api/v1/chat/", json=payload)
    assert res.status_code == 200, (
        f"Expected 200 but got {res.status_code}: {res.text}"
    )
    data = res.json()
    assert "response" in data
    assert data.get("session_id") is not None, "Backend should auto-assign session_id"
    print(f"  ✅ POST /api/v1/chat/ without session_id -> 200 OK (auto-assigned: {data['session_id'][:12]}...)")


def test_old_broken_payload_returns_422():
    """The OLD frontend payload { query: "..." } must be rejected with 422."""
    payload = {
        "query": "This is the old broken field name",
        "session_id": "regression-test-broken"
    }
    res = client.post("/api/v1/chat/", json=payload)
    assert res.status_code == 422, (
        f"Expected 422 for old payload but got {res.status_code}: {res.text}"
    )
    detail = res.json().get("detail", [])
    assert any(
        d.get("loc") == ["body", "message"] and d.get("type") == "missing"
        for d in detail
    ), f"Expected missing 'message' field error, got: {detail}"
    print(f"  ✅ POST /api/v1/chat/ with old {{query}} payload -> 422 (correctly rejected)")
    print(f"     Validation detail: {json.dumps(detail, indent=2)}")


def test_empty_message_returns_422():
    """Empty message string should fail min_length=1 validation."""
    payload = {"message": ""}
    res = client.post("/api/v1/chat/", json=payload)
    assert res.status_code == 422, (
        f"Expected 422 for empty message but got {res.status_code}: {res.text}"
    )
    print(f"  ✅ POST /api/v1/chat/ with empty message -> 422 (correctly rejected)")


if __name__ == "__main__":
    print("=" * 60)
    print("  CHAT API REGRESSION TEST — PAYLOAD VALIDATION")
    print("=" * 60)
    print()

    test_correct_payload_returns_200()
    print()
    test_message_only_without_session_id()
    print()
    test_old_broken_payload_returns_422()
    print()
    test_empty_message_returns_422()

    print()
    print("=" * 60)
    print("  ALL CHAT API REGRESSION TESTS PASSED ✅")
    print("=" * 60)
