import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.append('.')

from fastapi.testclient import TestClient
from app.main import app
from app.core.rag import extract_rag_entities

client = TestClient(app)

def run_test():
    print("--- STARTING SYSTEM AUDIT & MULTI-ISSUE REPAIR VERIFICATION ---")

    # 1. Test Compare Endpoint (Fix for Pydantic Schema / HTTP 500)
    compare_payload = {"college_ids": [128, 129]}
    res_compare = client.post("/api/v1/colleges/compare/", json=compare_payload)
    assert res_compare.status_code == 200, f"Compare endpoint failed with status {res_compare.status_code}: {res_compare.text}"
    compare_data = res_compare.json()
    assert "colleges" in compare_data and len(compare_data["colleges"]) == 2
    print(f"✅ 1. POST /api/v1/colleges/compare/ -> 200 OK (Compared {len(compare_data['colleges'])} colleges successfully)")

    # 2. Test Chat History Session Deletion Endpoint (Fix for 404/UUID parameter issue)
    test_session_id = "55283d4f-159c-439b-8c11-151ff4a5ad99"
    res_delete = client.delete(f"/api/v1/chat/history/{test_session_id}")
    assert res_delete.status_code == 200, f"Delete endpoint failed with status {res_delete.status_code}: {res_delete.text}"
    delete_data = res_delete.json()
    assert delete_data["status"] == "success"
    print(f"✅ 2. DELETE /api/v1/chat/history/{test_session_id} -> 200 OK ({delete_data['message']})")

    # 3. Test Modular RAG Engine Entity Extraction
    entities = extract_rag_entities("is 2026 cutoff for neet out?")
    assert entities["is_academic_year"] == True
    assert entities["year"] == 2026
    assert entities["is_explicit_code"] == False
    print(f"✅ 3. Modular RAG Entity Extraction (`extract_rag_entities`) -> Verified year 2026 disambiguation")

    print("\n🎉 ALL SYSTEM REPAIR & INTEGRATION TESTS PASSED 100%!")

if __name__ == "__main__":
    run_test()
