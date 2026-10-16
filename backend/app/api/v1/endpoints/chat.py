import uuid
import re
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.core.database import get_db
from app.core.rag import extract_rag_entities
from app.crud import crud_college, crud_chat
from app.models.college import College
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.gemini_service import generate_ai_response
from app.services import rag_service

logger = logging.getLogger(__name__)

router = APIRouter()

# Known major acronym map for rapid entity matching
MAJOR_COLLEGE_ACRONYMS = {
    "ldrp": "LDRP Institute of Technology and Research",
    "pdeu": "Pandit Deendayal Energy University",
    "pdpu": "Pandit Deendayal Energy University",
    "nirma": "Nirma University",
    "ldce": "L.D. College of Engineering",
    "daiict": "Dhirubhai Ambani Institute of Information and Communication Technology",
    "da-iict": "Dhirubhai Ambani Institute of Information and Communication Technology",
    "msu": "Maharaja Sayajirao University of Baroda",
    "vgec": "Vishwakarma Government Engineering College",
    "bvm": "Birla Vishvakarma Mahavidyalaya",
    "adani": "Adani University",
    "charusat": "CHARUSAT University",
    "parul": "Parul University",
    "ddu": "Dharmsinh Desai University",
    "gcet": "G H Patel College of Engineering and Technology",
    "gec": "Government Engineering College",
    "bjmc": "B.J. Medical College",
    "gnlu": "Gujarat National Law University",
    "iitgn": "Indian Institute of Technology Gandhinagar",
    "svnit": "Sardar Vallabhbhai National Institute of Technology",
    "ait": "Ahmedabad Institute of Technology",
    "silver oak": "Silver Oak University",
    "lj": "LJ University",
    "marwadi": "Marwadi University",
    "ganpat": "Ganpat University"
}


def detect_colleges(user_query: str, db: Session) -> List[str]:
    """
    Detects one or multiple colleges mentioned in the query.
    Supports acronyms, codes, short names, and full names.
    """
    rag_entities = extract_rag_entities(user_query)
    query_lower = user_query.strip().lower()
    is_explicit_code = rag_entities["is_explicit_code"]
    
    detected: List[str] = []

    # 1. Check known acronyms directly
    tokens = re.findall(r'[a-zA-Z0-9\-]+', query_lower)
    for token in tokens:
        if token.isdigit() and 2020 <= int(token) <= 2030 and not is_explicit_code:
            continue
        if token in MAJOR_COLLEGE_ACRONYMS:
            cname = MAJOR_COLLEGE_ACRONYMS[token]
            if cname not in detected:
                detected.append(cname)

    # 2. Check compound phrases (e.g. "silver oak", "da-iict", "nirma university", "b.j. medical")
    for phrase, cname in MAJOR_COLLEGE_ACRONYMS.items():
        if " " in phrase and phrase in query_lower:
            if cname not in detected:
                detected.append(cname)

    # 3. Direct token check against acronyms, code, acpc_code in database
    for token in tokens:
        if token.isdigit() and 2020 <= int(token) <= 2030 and not is_explicit_code:
            continue

        if len(token) >= 2 and token not in [
            "in", "on", "at", "for", "the", "and", "or", "to", "fees", "fee", "cost", "code",
            "top", "best", "what", "are", "neet", "gujcet", "cutoff", "cutoffs", "out", "when",
            "year", "date", "it", "its", "vs", "compare", "with"
        ]:
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
                    if top.name not in detected:
                        detected.append(top.name)

    # 4. Search entire query if nothing found and not a broad list trigger
    generic_list_triggers = [
        "top", "best", "list", "recommend", "suggest", "which colleges",
        "what are the", "is 2026", "neet out", "gujcet out", "cutoff out", "admissions start"
    ]
    if not detected and not any(tr in query_lower for tr in generic_list_triggers):
        matches = crud_college.search_colleges(db, keyword=query_lower, limit=2)
        for top in matches:
            name_tokens = [
                t for t in re.findall(r'\w+', top.name.lower())
                if len(t) >= 3 and t not in [
                    "college", "institute", "technology", "university", "engineering",
                    "of", "and", "research", "gujarat", "state"
                ]
            ]
            if any(t in query_lower for t in name_tokens):
                if top.name not in detected:
                    detected.append(top.name)

    from thefuzz import fuzz
    unique_detected: List[str] = []
    for c in detected:
        if not any(fuzz.token_set_ratio(c.lower(), u.lower()) >= 80 for u in unique_detected):
            unique_detected.append(c)

    return unique_detected


def detect_intent(user_query: str) -> str:
    query = user_query.lower()
    if any(k in query for k in ["compare", "vs", "versus", "difference between", "which is better"]):
        return "comparison"
    if any(k in query for k in ["placement", "package", "salary", "job", "recruiter", "lpa", "ctc"]):
        return "placements"
    if any(k in query for k in ["fee", "fees", "cost", "price", "tuition", "charge", "annual"]):
        return "fees"
    if any(k in query for k in ["hostel", "facility", "wifi", "gym", "sports", "library", "campus"]):
        return "facilities"
    if any(k in query for k in ["cutoff", "cutoffs", "rank", "merit", "closing rank", "opening rank"]):
        return "cutoffs"
    if any(k in query for k in ["recommend", "suggest", "best college", "top college", "good college", "list"]):
        return "recommendation"

    return "general"


def extract_constraints(user_query: str):
    query = user_query.lower()
    max_fees = rag_service.parse_fee_budget_from_query(query)
    stream = None
    city = None

    streams = ["medical", "commerce", "science", "arts", "engineering", "law", "management", "polytechnic", "pharmacy"]
    for s in streams:
        if s in query:
            stream = s.capitalize()
            break

    hub_aliases = rag_service.extract_city_hub_filter(query)
    if hub_aliases:
        city = hub_aliases[0].capitalize()

    return max_fees, stream, city


@router.post("/", response_model=ChatResponse)
def chat_endpoint(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    user_query = request.message.strip()
    session_id = request.session_id or str(uuid.uuid4())
    query_lower = user_query.lower()

    # 1. Fetch Session Conversation History (up to 6 recent turns)
    history_records = crud_chat.get_chat_history_by_session(db, session_id=session_id, limit=6)
    chat_history: List[Dict[str, Any]] = [
        {
            "user": h.user_query,
            "bot": h.chatbot_response,
            "college": h.detected_college
        }
        for h in reversed(history_records)
    ]

    # Extract previously discussed college(s) from recent history
    prev_colleges: List[str] = []
    for h in history_records:
        if h.detected_college:
            for part in h.detected_college.split(" vs "):
                p_clean = part.strip()
                if p_clean and p_clean not in prev_colleges:
                    prev_colleges.append(p_clean)

    # 2. Entity Detection on current turn
    newly_detected = detect_colleges(user_query, db)
    detected_intent = detect_intent(user_query)
    max_fees, stream, city = extract_constraints(user_query)

    # 3. Coreference & Multi-turn Follow-up Resolution
    is_comparison_turn = (
        detected_intent == "comparison" or
        bool(re.search(r'\b(compare|vs|versus|difference between|which is better|how about|what about)\b', query_lower))
    )
    has_pronoun_reference = bool(
        re.search(r'\b(it|its|their|there|that college|this college|this university|that university|the college|same college)\b', query_lower)
    )
    is_implicit_attribute_query = bool(
        re.search(r'\b(fees?|placement|package|highest|average|hostel|cutoff|admission|seats?)\b', query_lower)
    )

    active_colleges: List[str] = []

    if is_comparison_turn:
        # If user says "Compare it with Nirma", merge previous college with newly detected Nirma
        if newly_detected:
            active_colleges.extend(newly_detected)
            if has_pronoun_reference or len(newly_detected) == 1:
                for pc in prev_colleges:
                    if pc not in active_colleges:
                        active_colleges.insert(0, pc)
                        break
        elif prev_colleges:
            active_colleges.extend(prev_colleges[:2])
    elif has_pronoun_reference or (not newly_detected and is_implicit_attribute_query and prev_colleges):
        # Follow-up referring to previous college (e.g. "What is its highest placement package and fees?")
        if prev_colleges:
            active_colleges = [prev_colleges[0]]
            if newly_detected and newly_detected[0] not in active_colleges:
                active_colleges.append(newly_detected[0])
        else:
            active_colleges = newly_detected
    else:
        active_colleges = newly_detected

    # 4. Context Assembly
    context_data: Dict[str, Any] = {}
    detected_college_label: Optional[str] = None

    if len(active_colleges) >= 2:
        # Multi-college comparison context
        contexts = []
        for cname in active_colleges[:3]:
            c_ctx = crud_college.get_full_college_context(db, cname)
            if c_ctx:
                contexts.append(c_ctx)
        context_data = {"retrieved_colleges": contexts}
        detected_college_label = " vs ".join(active_colleges[:2])
        detected_intent = "comparison"
    elif len(active_colleges) == 1:
        # Single college detailed context
        context_data = crud_college.get_full_college_context(db, active_colleges[0]) or {}
        detected_college_label = active_colleges[0]
    else:
        # Hybrid RAG 2.0 (DualVectorStore + RRF)
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
        detected_college_label = None

    # 5. Generate AI Counselor Response
    ai_response = generate_ai_response(
        user_query=user_query,
        college_data=context_data,
        intent=detected_intent,
        chat_history=chat_history
    )

    # 6. Log Interaction with Graceful Rollback
    try:
        crud_chat.log_chat_interaction(
            db=db,
            user_query=user_query,
            chatbot_response=ai_response,
            detected_college=detected_college_label,
            detected_intent=detected_intent,
            session_id=session_id,
            response_source="gemini_rag_v2"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to log chat interaction gracefully: {e}")

    return ChatResponse(
        response=ai_response,
        intent=detected_intent,
        college=detected_college_label,
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
