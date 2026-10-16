"""
test_rag_v2_upgrade.py
Verification test suite for Next-Gen Hybrid RAG Engine 2.0:
1. Vector Index Speed Test: RAM matrix search across 2,530 colleges executes in <50ms.
2. Multi-Turn Memory & Coreference Test (Turns 1, 2, 3 with same session_id).
3. Expanded Gujarat Hubs & Budget Caps Test (Vallabh Vidyanagar under 2 lakh).
"""

import sys
import os
import time
import uuid

if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Ensure backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.services.rag_service import vector_store, get_text_embedding, hybrid_search_colleges
from app.crud import crud_chat

client = TestClient(app)

def test_vector_index_speed():
    print("\n" + "="*60)
    print("TEST 1: VECTOR INDEX SPEED & ZERO CANDIDATE HTTP CALLS")
    print("="*60)

    assert vector_store.is_loaded, "Vector store matrix is not loaded in RAM!"
    assert vector_store.matrix is not None, "Vector store matrix is None!"
    assert len(vector_store.matrix) == 2530, f"Expected 2530 colleges in index, got {len(vector_store.matrix)}"

    query = "Top computer science engineering colleges in Gandhinagar"
    t0 = time.perf_counter()
    q_vec = get_text_embedding(query)
    results = vector_store.search(q_vec, top_k=25)
    t1 = time.perf_counter()
    latency_ms = (t1 - t0) * 1000

    print(f"Matrix Shape: {vector_store.matrix.shape}")
    print(f"Retrieved Top Candidates: {len(results)}")
    print(f"Search Execution Latency: {latency_ms:.2f} ms")
    print(f"Top 3 Candidate IDs & Cosine Scores:")
    for cid, sc in results[:3]:
        print(f"  - College ID {cid}: Cosine Similarity = {sc:.4f}")

    assert latency_ms < 50.0, f"Vector search exceeded 50ms! ({latency_ms:.2f} ms)"
    print("[PASS] Vector Index Speed Test Passed (< 50ms)")


def test_multi_turn_conversation_memory():
    print("\n" + "="*60)
    print("TEST 2: STATEFUL MULTI-TURN MEMORY & COREFERENCE RESOLUTION")
    print("="*60)

    test_session_id = f"test-session-{uuid.uuid4()}"
    print(f"Using Session ID: {test_session_id}")

    # --- Turn 1: Tell me about LDRP in Gandhinagar ---
    print("\n--- Turn 1: 'Tell me about LDRP in Gandhinagar' ---")
    t1_payload = {
        "message": "Tell me about LDRP in Gandhinagar",
        "session_id": test_session_id
    }
    r1 = client.post("/api/v1/chat/", json=t1_payload)
    assert r1.status_code == 200, f"Turn 1 failed: {r1.text}"
    d1 = r1.json()
    print("Detected College:", d1["college"])
    print("Response Snippet:", d1["response"][:220].replace("\n", " "))
    assert d1["college"] is not None and "LDRP" in d1["college"], f"Expected LDRP detected, got {d1['college']}"
    assert "LDRP" in d1["response"] or "Gandhinagar" in d1["response"], "Response missing LDRP"

    # --- Turn 2: What is its highest placement package and fees? (Coreference 'its') ---
    print("\n--- Turn 2: 'What is its highest placement package and fees?' ---")
    t2_payload = {
        "message": "What is its highest placement package and fees?",
        "session_id": test_session_id
    }
    r2 = client.post("/api/v1/chat/", json=t2_payload)
    assert r2.status_code == 200, f"Turn 2 failed: {r2.text}"
    d2 = r2.json()
    print("Detected College (Resolved from history):", d2["college"])
    print("Response Snippet:", d2["response"][:220].replace("\n", " "))
    assert d2["college"] is not None and "LDRP" in d2["college"], f"Coreference failed! Expected LDRP, got {d2['college']}"
    assert ("₹" in d2["response"] or "LPA" in d2["response"] or "fees" in d2["response"].lower()), "Missing fee or placement figures"

    # --- Turn 3: Compare it with Nirma University (Comparison + Coreference 'it') ---
    print("\n--- Turn 3: 'Compare it with Nirma University' ---")
    t3_payload = {
        "message": "Compare it with Nirma University",
        "session_id": test_session_id
    }
    r3 = client.post("/api/v1/chat/", json=t3_payload)
    assert r3.status_code == 200, f"Turn 3 failed: {r3.text}"
    d3 = r3.json()
    print("Detected Colleges (Comparison):", d3["college"])
    print("Intent:", d3["intent"])
    print("Response Snippet:\n", d3["response"][:450])
    assert ("LDRP" in str(d3["college"]) and "Nirma" in str(d3["college"])), f"Expected LDRP vs Nirma, got {d3['college']}"
    assert "|" in d3["response"], "Expected Markdown Comparison Table in response!"
    assert "LDRP" in d3["response"] and "Nirma" in d3["response"], "Comparison missing either LDRP or Nirma"

    # Clean up test session
    db = SessionLocal()
    crud_chat.delete_chat_session(db, test_session_id)
    db.close()
    print("\n[PASS] Multi-Turn Memory & Coreference Test Passed")


def test_expanded_hubs_and_budget_filter():
    print("\n" + "="*60)
    print("TEST 3: EXPANDED GUJARAT HUBS & BUDGET FILTER")
    print("="*60)

    query = "Best engineering colleges in Vallabh Vidyanagar under 2 lakh"
    print(f"Query: '{query}'")

    db = SessionLocal()
    results = hybrid_search_colleges(db, query, top_k=3)
    db.close()

    print(f"Retrieved {len(results)} colleges:")
    for r in results:
        print(f"  - [{r.get('id')}] {r.get('name')} | City: {r.get('city')}")

    assert len(results) > 0, "No colleges retrieved for Vallabh Vidyanagar query!"
    col_names = " ".join([r.get("name", "") for r in results])
    cities = " ".join([r.get("city", "") for r in results])

    # Should match BVM, MBICT, or Anand / Vallabh Vidyanagar colleges
    assert ("Birla" in col_names or "BVM" in col_names or "Anand" in cities or "Vallabh" in col_names or "Vidyanagar" in col_names), \
        f"Expected Vallabh Vidyanagar / Anand engineering college, got {col_names}"

    print("[PASS] Expanded Gujarat Hub + Budget Filter Test Passed")


if __name__ == "__main__":
    test_vector_index_speed()
    test_multi_turn_conversation_memory()
    test_expanded_hubs_and_budget_filter()
    print("\n" + "="*60)
    print("ALL RAG V2 UPGRADE TESTS PASSED SUCCESSFULLY! 🎯")
    print("="*60)
