import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.append('.')

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_test():
    print("--- STARTING RAG YEAR VS ACPC CODE DISAMBIGUATION TEST ---")

    # 1. Test General Exam Question with 2026 year
    prompt1 = "is 2026 cutoff for neet out?"
    res1 = client.post("/api/v1/chat/", json={"message": prompt1})
    assert res1.status_code == 200, f"Failed prompt 1 with {res1.status_code}"
    data1 = res1.json()

    print(f"\nQuery: '{prompt1}'")
    print(f"  Detected College: {data1['college']}")
    print(f"  Response snippet: {data1['response'][:140]}...")

    assert data1['college'] is None, f"FAILURE: Falsely detected single college '{data1['college']}' for general exam year prompt!"
    assert "2026" in data1['response'] and "Pending" in data1['response'], "FAILURE: Did not return general 2026 pending status response!"
    print("  ✅ DISAMBIGUATION SUCCESS: General 2026 year query returned status without falsely matching ACPC code 2026.")

    # 2. Test Explicit ACPC Code Lookup for 2026
    prompt2 = "show me details for acpc code 2026"
    res2 = client.post("/api/v1/chat/", json={"message": prompt2})
    assert res2.status_code == 200, f"Failed prompt 2 with {res2.status_code}"
    data2 = res2.json()

    print(f"\nQuery: '{prompt2}'")
    print(f"  Detected College: {data2['college']}")
    print(f"  Response snippet: {data2['response'][:140]}...")

    assert data2['college'] is not None and "2026" in data2['college'] or "Palanpur" in data2['college'] or "L.J." in data2['college'], f"FAILURE: Failed to detect L.J. Palanpur for explicit ACPC code 2026 lookup! Got '{data2['college']}'"
    print("  ✅ EXPLICIT CODE SUCCESS: Explicit 'acpc code 2026' correctly retrieved target college record.")

    print("\n🎉 ALL RAG YEAR DISAMBIGUATION TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    run_test()
