from fastapi import APIRouter
from app.api.v1.endpoints import colleges, chat

api_router = APIRouter()
api_router.include_router(colleges.router, prefix="/colleges", tags=["Colleges"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chatbot"])
