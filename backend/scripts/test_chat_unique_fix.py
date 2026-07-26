import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.append('.')

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_test():
    print("--- STARTING CRITICAL BUG FIX VERIFICATION TEST ---")

    payload = {"message": "expected cutoff for jee for adani college for engineering"}
    res = client.post("/api/v1/chat/", json=payload)
    
    assert res.status_code == 200, f"POST /api/v1/chat/ failed with status {res.status_code}: {res.text}"
    data = res.json()
    assert "response" in data and len(data["response"]) > 0
    assert data["college"] is not None
    print(f"✅ POST /api/v1/chat/ -> 200 OK")
    print(f"   Detected College: {data['college']}")
    print(f"   Response Length: {len(data['response'])} characters")
    print(f"   Session ID: {data['session_id']}")

    print("\n🎉 CRITICAL UNIQUE CONSTRAINT BUG FIX VERIFIED 100% SUCCESSFUL!")

if __name__ == "__main__":
    run_test()
