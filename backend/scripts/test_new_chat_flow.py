import sys
import io
import uuid

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.append('.')

from app.core.database import SessionLocal
from app.crud import crud_chat
from app.api.v1.endpoints.chat import get_history

def run_test():
    db = SessionLocal()
    sid1 = f"session-1-{uuid.uuid4()}"
    print(f"--- STARTING NEW CHAT FLOW VERIFICATION TEST ---")

    # 1. Existing conversation session 1
    log1 = crud_chat.log_chat_interaction(db, "LDRP cutoffs", "LDRP open cutoff rank is 4500.", session_id=sid1)
    print(f"Step 1: Created initial session log for 'LDRP cutoffs' (Session ID: {sid1})")

    # 2. Simulate clicking "New Chat +" -> generate sid2
    sid2 = f"session-2-{uuid.uuid4()}"
    print(f"Step 2: User clicks 'New Chat +' button -> Generated new session ID: {sid2}")

    # 3. User sends query under new session ID
    log2 = crud_chat.log_chat_interaction(db, "What is the NIRF rank of GTU?", "GTU ranks in top 150 state universities.", session_id=sid2)
    print(f"Step 3: User sends query 'What is the NIRF rank of GTU?' under new session ID")

    # 4. Fetch overall history across all sessions (as performed by loadHistory())
    all_history = get_history(session_id=None, db=db)
    queries = [h['user_query'] for h in all_history]
    print(f"\nStep 4: Fetching overall history for sidebar display (Count = {len(all_history)}):")
    print(f"  Queries in history: {queries[:5]}")

    # Assertions
    assert "LDRP cutoffs" in queries, "FAILURE: Previous conversation 'LDRP cutoffs' disappeared!"
    assert "What is the NIRF rank of GTU?" in queries, "FAILURE: New query 'What is the NIRF rank of GTU?' missing from history!"

    print("\n✅ NEW CHAT FUNCTIONALITY TEST PASSED PERFECTLY!")

if __name__ == "__main__":
    run_test()
