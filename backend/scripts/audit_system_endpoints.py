import sys
import io
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.append('.')

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.college import College
from app.models.chat import ChatLog

client = TestClient(app)

def run_audit():
    print("==========================================================")
    print("   SYSTEM-WIDE BACKEND MODELS, SCHEMAS & API AUDIT REPORT ")
    print("==========================================================\n")

    results = []

    # --- 1. HOME PAGE & DIRECTORY ENDPOINTS ---
    print("1. Auditing Home Page & Directory API Endpoints...")
    res_list = client.get("/api/v1/colleges/?page=1&per_page=5")
    assert res_list.status_code == 200, f"GET /api/v1/colleges/ failed: {res_list.status_code}"
    data_list = res_list.json()
    assert "items" in data_list and "total" in data_list, "Invalid PaginatedCollegeResponse schema"
    print(f"  ✅ GET /api/v1/colleges/ -> 200 OK (Total: {data_list['total']} institutions)")
    results.append("GET /api/v1/colleges/ -> 200 OK")

    res_search = client.get("/api/v1/colleges/search?keyword=SSU")
    assert res_search.status_code == 200, f"GET /api/v1/colleges/search failed: {res_search.status_code}"
    data_search = res_search.json()
    assert data_search['total'] >= 1, "Search query failed to return expected institution"
    print(f"  ✅ GET /api/v1/colleges/search?keyword=SSU -> 200 OK (Found: {data_search['total']} matches)")
    results.append("GET /api/v1/colleges/search -> 200 OK")

    sample_id = data_list['items'][0]['id']
    res_branches = client.get(f"/api/v1/colleges/{sample_id}/branches")
    assert res_branches.status_code == 200, f"GET /api/v1/colleges/{sample_id}/branches failed: {res_branches.status_code}"
    branches_data = res_branches.json()
    assert isinstance(branches_data, list), "Invalid branches schema output"
    print(f"  ✅ GET /api/v1/colleges/{{id}}/branches -> 200 OK ({len(branches_data)} branches resolved)")
    results.append("GET /api/v1/colleges/{id}/branches -> 200 OK")

    # --- 2. INSTITUTIONAL PROFILE ENDPOINT ---
    print("\n2. Auditing Institutional Profile API Endpoint...")
    res_detail = client.get(f"/api/v1/colleges/{sample_id}")
    assert res_detail.status_code == 200, f"GET /api/v1/colleges/{sample_id} failed: {res_detail.status_code}"
    data_detail = res_detail.json()
    assert "college" in data_detail and "courses" in data_detail, "Invalid CollegeDetailResponse schema"
    print(f"  ✅ GET /api/v1/colleges/{{id}} -> 200 OK ({data_detail['college']['name']})")
    results.append("GET /api/v1/colleges/{id} -> 200 OK")

    # --- 3. COMPARISON MATRIX ENDPOINT ---
    print("\n3. Auditing Side-by-Side Comparison Matrix API Endpoint...")
    sample_ids = [data_list['items'][0]['id'], data_list['items'][1]['id']]
    res_compare = client.post("/api/v1/colleges/compare/", json={"college_ids": sample_ids})
    assert res_compare.status_code == 200, f"POST /api/v1/colleges/compare/ failed: {res_compare.status_code}"
    data_compare = res_compare.json()
    assert "colleges" in data_compare and len(data_compare['colleges']) == 2, "Invalid CompareResponse schema"
    print(f"  ✅ POST /api/v1/colleges/compare/ -> 200 OK ({len(data_compare['colleges'])} colleges compared)")
    results.append("POST /api/v1/colleges/compare/ -> 200 OK")

    # --- 4. AI CHATBOT RAG ENGINE ENDPOINTS ---
    print("\n4. Auditing AI Assistant Chat RAG Engine Endpoints...")
    res_chat = client.post("/api/v1/chat/", json={"message": "tell me about GTU cutoff", "session_id": "audit-session-101"})
    assert res_chat.status_code == 200, f"POST /api/v1/chat/ failed: {res_chat.status_code}"
    data_chat = res_chat.json()
    assert "response" in data_chat, "Invalid ChatResponse schema"
    print(f"  ✅ POST /api/v1/chat/ -> 200 OK (Response generated)")
    results.append("POST /api/v1/chat/ -> 200 OK")

    res_history = client.get("/api/v1/chat/history/?session_id=audit-session-101")
    assert res_history.status_code == 200, f"GET /api/v1/chat/history/ failed: {res_history.status_code}"
    data_history = res_history.json()
    assert len(data_history) >= 1, "Chat history failed to return logged session"
    log_id = data_history[0]['id']
    print(f"  ✅ GET /api/v1/chat/history/ -> 200 OK ({len(data_history)} session logs retrieved)")
    results.append("GET /api/v1/chat/history/ -> 200 OK")

    res_delete = client.delete(f"/api/v1/chat/history/{log_id}")
    assert res_delete.status_code == 200, f"DELETE /api/v1/chat/history/{log_id} failed: {res_delete.status_code}"
    print(f"  ✅ DELETE /api/v1/chat/history/{{log_id}} -> 200 OK (Purged log {log_id})")
    results.append("DELETE /api/v1/chat/history/{log_id} -> 200 OK")

    print("\n==========================================================")
    print("   ALL SYSTEM ENDPOINTS & SCHEMAS VERIFIED 100% SUCCESSFUL ")
    print("==========================================================")

if __name__ == "__main__":
    run_audit()
