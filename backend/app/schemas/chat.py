from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User question or query")
    session_id: Optional[str] = Field(default=None, description="UUID tracking the user session")


class ChatResponse(BaseModel):
    response: str
    intent: Optional[str] = None
    college: Optional[str] = None
    session_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
