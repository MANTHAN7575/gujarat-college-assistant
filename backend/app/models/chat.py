from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.core.database import Base


class ChatLog(Base):
    __tablename__ = "chatbot_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True, nullable=True)
    user_query = Column(Text, nullable=False)
    detected_college = Column(String(255), nullable=True)
    detected_intent = Column(String(255), nullable=True)
    chatbot_response = Column(Text, nullable=False)
    response_source = Column(String(100), default="gemini")
    created_at = Column(DateTime, default=datetime.utcnow)
