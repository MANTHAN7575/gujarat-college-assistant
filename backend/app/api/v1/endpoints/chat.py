import uuid
import re
import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.rag import extract_rag_entities
from app.crud import crud_college, crud_chat
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.gemini_service import generate_ai_response
from app.services import rag_service

logger = logging.getLogger(__name__)

router = APIRouter()


def detect_college(user_query: str, db: Session) -> Optional[str]:
    rag_entities = extract_rag_entities(user_query)
    query_lower = user_query.strip().lower()
    
    is_explicit_code = rag_entities["is_explicit_code"]
    tokens = re.findall(r'[a-zA-Z0-9\-]+', query_lower)

    # 1. Direct token check against acronyms, code, acpc_code
    for token in tokens:
        # Year Disambiguation Rule:
        # 4-digit numbers in 2020-2030 are academic years, NOT college ACPC codes,
        # unless explicitly requested with "code 2026" / "acpc code 2026".
        if token.isdigit() and 2020 <= int(token) <= 2030 and not is_explicit_code:
            continue

        if len(token) >= 2 and token not in ["in", "on", "at", "for", "the", "and", "or", "to", "fees", "fee", "cost", "code", "top", "best", "what", "are", "neet", "gujcet", "cutoff", "cutoffs", "out", "when", "year", "date"]:
            matches = crud_college.search_colleges(db, keyword=token, limit=1)
            if matches:
                top = matches[0]
                code_lower = (top.code or "").lower()
                acpc_lower = (top.acpc_code or "").lower()
                acronyms_list = [a.lower() for a in (top.acronyms or [])]
                if (
                    token == code_lower or
                    token == acpc_lower or
                    token in acronyms_list or
                    any(token == ac for ac in acronyms_list)
                ):
                    return top.name

    # If the user query is a general exam / cutoff question or broad recommendation question, don't force single college detection
    generic_list_triggers = ["top", "best", "list", "recommend", "suggest", "which colleges", "what are the", "is 2026", "neet out", "gujcet out", "cutoff out", "admissions start"]
    if any(tr in query_lower for tr in generic_list_triggers):
        return None

    # 2. Search entire query
    matches = crud_college.search_colleges(db, keyword=query_lower, limit=1)
    if matches:
        top = matches[0]
        name_tokens = [t for t in re.findall(r'\w+', top.name.lower()) if len(t) >= 3 and t not in ["college", "institute", "technology", "university", "engineering", "of", "and", "research"]]
        if any(t in query_lower for t in name_tokens):
            return top.name

    return None


def detect_intent(user_query: str) -> str:
    query = user_query.lower()
    placement_keywords = ["placement", "package", "salary", "job", "recruiter", "lpa", "ctc"]
    fees_keywords = ["fee", "fees", "cost", "price", "tuition", "charge", "annual"]
    facility_keywords = ["hostel", "facility", "wifi", "gym", "sports", "library", "campus"]
    recommend_keywords = ["recommend", "suggest", "best college", "top college", "good college", "list"]

    for kw in placement_keywords:
        if kw in query:
            return "placements"
    for kw in fees_keywords:
        if kw in query:
            return "fees"
    for kw in facility_keywords:
        if kw in query:
            return "facilities"
    for kw in recommend_keywords:
        if kw in query:
            return "recommendation"

    return "general"


def extract_constraints(user_query: str):
    query = user_query.lower()
    max_fees = None
    stream = None
    city = None

    fee_match = re.search(r'(?:under|below|less than|within)\s*(?:rs\.?|₹)?\s*(\d+)\s*(k|lakh|lakhs)?', query)
    if fee_match:
        val = float(fee_match.group(1))
        unit = fee_match.group(2)
        if unit == 'k':
            val *= 1000
        elif unit in ['lakh', 'lakhs']:
            val *= 100000
        max_fees = val

    streams = ["medical", "commerce", "science", "arts", "engineering", "law", "management", "polytechnic"]
    for s in streams:
        if s in query:
            stream = s.capitalize()
            break

    cities = ["ahmedabad", "gandhinagar", "vadodara", "surat", "rajkot", "anand", "bhavnagar", "mehsana"]
    for c in cities:
        if c in query:
            city = c.capitalize()
            break

    return max_fees, stream, city


@router.post("/", response_model=ChatResponse)
def chat_endpoint(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    user_query = request.message
    session_id = request.session_id or str(uuid.uuid4())

    detected_college = detect_college(user_query, db)
    detected_intent = detect_intent(user_query)
    max_fees, stream, city = extract_constraints(user_query)

    context_data = {}

    if detected_college:
        context_data = crud_college.get_full_college_context(db, detected_college) or {}
    else:
        rag_results = rag_service.hybrid_search_colleges(
            db=db,
            query_text=user_query,
            max_fees=max_fees,
            city=city,
            stream=stream,
            top_k=3
        )
        context_data = {
            "retrieved_colleges": rag_results
        }

    ai_response = generate_ai_response(
        user_query=user_query,
        college_data=context_data,
        intent=detected_intent
    )

    try:
        crud_chat.log_chat_interaction(
            db=db,
            user_query=user_query,
            chatbot_response=ai_response,
            detected_college=detected_college,
            detected_intent=detected_intent,
            session_id=session_id,
            response_source="gemini_rag"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to log chat interaction gracefully: {e}")

    return ChatResponse(
        response=ai_response,
        intent=detected_intent,
        college=detected_college,
        session_id=session_id
    )


@router.delete("/history/{log_id}")
def delete_chat_history_log(
    log_id: str,
    db: Session = Depends(get_db)
):
    """
    Deletes chat history records by session_id UUID string or log ID.
    Always returns 200 OK with success status.
    """
    crud_chat.delete_chat_log(db=db, log_id=log_id)
    return {
        "status": "success",
        "message": f"Chat history session '{log_id}' deleted successfully.",
        "session_id": log_id
    }
