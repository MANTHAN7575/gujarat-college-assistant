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


def delete_chat_log(db: Session, log_id: int) -> bool:
    log = db.query(ChatLog).filter(ChatLog.id == log_id).first()
    if log:
        db.delete(log)
        db.commit()
        return True
    return False


def delete_chat_logs_by_session(db: Session, session_id: str) -> bool:
    logs = db.query(ChatLog).filter(ChatLog.session_id == session_id).all()
    if logs:
        for log in logs:
            db.delete(log)
        db.commit()
        return True
    return False
