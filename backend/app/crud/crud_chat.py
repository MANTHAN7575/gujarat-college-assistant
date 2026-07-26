from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.chat import ChatLog


def log_chat_interaction(
    db: Session,
    user_query: str,
    chatbot_response: str,
    detected_college: Optional[str] = None,
    detected_intent: Optional[str] = None,
    session_id: Optional[str] = None,
    response_source: str = "gemini"
) -> ChatLog:
    chat_log = ChatLog(
        session_id=session_id,
        user_query=user_query,
        detected_college=detected_college,
        detected_intent=detected_intent,
        chatbot_response=chatbot_response,
        response_source=response_source
    )
    db.add(chat_log)
    db.commit()
    db.refresh(chat_log)
    return chat_log


def get_chat_history_by_session(db: Session, session_id: Optional[str] = None, limit: int = 30) -> List[ChatLog]:
    query = db.query(ChatLog)
    if session_id:
        query = query.filter(ChatLog.session_id == session_id)
    return query.order_by(ChatLog.created_at.desc()).limit(limit).all()


def delete_chat_session(db: Session, session_id: str) -> bool:
    try:
        deleted = db.query(ChatLog).filter(ChatLog.session_id == session_id).delete(synchronize_session=False)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        return False


def delete_chat_log(db: Session, log_id: str) -> bool:
    try:
        # Check by session_id string first
        deleted = db.query(ChatLog).filter(ChatLog.session_id == str(log_id)).delete(synchronize_session=False)
        if deleted > 0:
            db.commit()
            return True

        # Check by integer ID if numeric
        if str(log_id).isdigit():
            db.query(ChatLog).filter(ChatLog.id == int(log_id)).delete(synchronize_session=False)
            db.commit()

        return True
    except Exception as e:
        db.rollback()
        return False


def delete_chat_logs_by_session(db: Session, session_id: str) -> bool:
    return delete_chat_session(db, session_id)
