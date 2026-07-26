import sys
import io
import uuid

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.append('.')

from app.core.database import SessionLocal
from app.crud import crud_chat
from app.api.v1.endpoints.chat import get_history, delete_history_log

def run_test():
    db = SessionLocal()
    session_id = f"test-session-{uuid.uuid4()}"
    print(f"--- STARTING CHAT HISTORY DELETION TEST (Session: {session_id}) ---")

    # 1. Create 3 test logs
    log1 = crud_chat.log_chat_interaction(db, "DAIICT placement stats", "DAIICT average package is 16 LPA.", session_id=session_id)
    log2 = crud_chat.log_chat_interaction(db, "PDEU tuition fees", "PDEU tuition fees are 2.4 Lakhs per year.", session_id=session_id)
    log3 = crud_chat.log_chat_interaction(db, "LDRP cutoffs", "LDRP cutoff rank open is 4500.", session_id=session_id)

    history = get_history(session_id=session_id, db=db)
    print(f"Step 1: Created 3 logs. History count = {len(history)}")
    queries_1 = [h['user_query'] for h in history]
    print(f"  Current queries: {queries_1}")
    assert len(history) == 3, f"Expected 3 logs, got {len(history)}"

    # 2. Delete DAIICT and PDEU logs
    print("\nStep 2: Deleting DAIICT and PDEU logs...")
    res1 = delete_history_log(log_id=str(log1.id), db=db)
    res2 = delete_history_log(log_id=str(log2.id), db=db)
    print(f"  Deleted log {log1.id}: {res1}")
    print(f"  Deleted log {log2.id}: {res2}")

    # 3. Create a new "hi" log
    print("\nStep 3: Creating a new 'hi' chat message...")
    log_new = crud_chat.log_chat_interaction(db, "hi", "Hello! How can I assist you today?", session_id=session_id)

    # 4. Fetch updated history and assert
    updated_history = get_history(session_id=session_id, db=db)
    remaining_queries = [h['user_query'] for h in updated_history]
    print(f"\nStep 4: Fetching updated history (Count = {len(updated_history)}):")
    print(f"  Remaining queries: {remaining_queries}")

    # Assertions
    assert "DAIICT placement stats" not in remaining_queries, "FAILURE: DAIICT log reappeared!"
    assert "PDEU tuition fees" not in remaining_queries, "FAILURE: PDEU log reappeared!"
    assert "LDRP cutoffs" in remaining_queries, "FAILURE: LDRP log missing!"
    assert "hi" in remaining_queries, "FAILURE: new 'hi' log missing!"
    assert len(updated_history) == 2, f"Expected 2 logs, got {len(updated_history)}"

    print("\n✅ MANDATORY AUTOMATED TEST PASSED PERFECTLY! Deleted sessions stay 100% purged.")

if __name__ == "__main__":
    run_test()
