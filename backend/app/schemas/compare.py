from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.college import CollegeDetailResponse


class CompareRequest(BaseModel):
    college_ids: List[int] = Field(..., min_items=1, max_items=3, description="List of college IDs to compare")


class CompareResponse(BaseModel):
    colleges: List[CollegeDetailResponse]
