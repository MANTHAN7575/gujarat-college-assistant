import logging
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

from typing import List, Dict, Any, Optional
import numpy as np
import google.generativeai as genai
from sqlalchemy.orm import Session

from app.core.config import settings
from app.crud import crud_college
from app.models.college import College

logger = logging.getLogger("rag_service")

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)


def get_text_embedding(text: str) -> np.ndarray:
    """
    Generates a normalized embedding vector for the input text using Gemini's text-embedding-004
    with automatic numpy fallback.
    """
    if settings.GEMINI_API_KEY and text.strip():
        embedding_models = ["models/text-embedding-004", "models/embedding-001"]
        for model in embedding_models:
            try:
                res = genai.embed_content(
                    model=model,
                    content=text,
                    task_type="retrieval_document"
                )
                if res and "embedding" in res:
                    vec = np.array(res["embedding"], dtype=np.float32)
                    norm = np.linalg.norm(vec)
                    return vec / norm if norm > 0 else vec
            except Exception as e:
                logger.debug(f"Embedding call with {model} failed: {e}")
                continue

    # Fallback deterministic text vector generator (character n-gram frequency vector)
    vec = np.zeros(128, dtype=np.float32)
    for i, char in enumerate(text.lower()):
        vec[ord(char) % 128] += 1.0
    norm = np.linalg.norm(vec)
    return vec / norm if norm > 0 else vec


def build_college_document(college_dict: Dict[str, Any]) -> str:
    """
    Constructs a rich unstructured textual document for a college context object.
    """
    courses_str = ", ".join([
        f"{c.get('course_name')} ({c.get('degree_type')}, Fees: ₹{c.get('annual_fees')}, Seats: {c.get('total_seats')})"
        for c in college_dict.get("courses", [])
    ])
    placements = college_dict.get("placements", {})
    facilities = college_dict.get("facilities", {})
    admissions = college_dict.get("admissions", {})

    doc = f"""
    College Name: {college_dict.get('name')} (ACPC Code: {college_dict.get('acpc_code')})
    City: {college_dict.get('city')}, District: {college_dict.get('district')}
    Type: {college_dict.get('college_type')}, Affiliation: {college_dict.get('university_affiliation')}
    Primary Stream: {college_dict.get('primary_stream')}, NAAC Grade: {college_dict.get('naac_grade')}
    Description: {college_dict.get('description')}
    Courses: {courses_str}
    Average Placement Package: ₹{placements.get('average_package')}, Highest Package: ₹{placements.get('highest_package')}, Rate: {placements.get('placement_percentage')}%
    Top Recruiters: {placements.get('top_recruiters')}
    Facilities: Hostel={facilities.get('hostel')}, Library={facilities.get('library')}, WiFi={facilities.get('wifi')}, Sports={facilities.get('sports')}, Gym={facilities.get('gym')}
    Admissions & Exams: {admissions.get('entrance_exams')}. Process: {admissions.get('admission_process')} Cutoffs: {admissions.get('cutoff_details')}
    """
    return doc.strip()


def hybrid_search_colleges(
    db: Session,
    query_text: str,
    max_fees: Optional[float] = None,
    city: Optional[str] = None,
    stream: Optional[str] = None,
    top_k: int = 3
) -> List[Dict[str, Any]]:
    """
    Hybrid Retrieval Engine across 2,450 colleges:
    1. Search candidate colleges using fuzzy database search engine.
    2. Filter by constraints (city, stream, max_fees).
    3. Ranks top candidate documents using Cosine Similarity.
    """
    # 1. Database Candidate Search
    candidates = crud_college.search_colleges(db, keyword=query_text, limit=15)
    
    if city:
        city_matches = [c for c in candidates if c.city and city.lower() in c.city.lower()]
        if city_matches:
            candidates = city_matches

    if stream:
        stream_matches = [c for c in candidates if c.primary_stream and stream.lower() in c.primary_stream.lower()]
        if stream_matches:
            candidates = stream_matches

    # 2. Extract full context
    candidate_contexts = []
    for c in candidates:
        ctx = crud_college.get_full_college_context(db, c.name)
        if ctx:
            if max_fees is not None:
                has_qualifying = any(
                    crs.get("annual_fees") and crs.get("annual_fees") <= max_fees
                    for crs in ctx.get("courses", [])
                )
                if not has_qualifying:
                    continue
            candidate_contexts.append(ctx)

    if not candidate_contexts:
        fallback_cols = crud_college.get_all_colleges(db, limit=10)
        candidate_contexts = [crud_college.get_full_college_context(db, c.name) for c in fallback_cols]
        candidate_contexts = [c for c in candidate_contexts if c]

    # 3. Cosine Similarity Vector Ranking
    query_vec = get_text_embedding(query_text)
    scored_candidates = []

    for ctx in candidate_contexts:
        doc_text = build_college_document(ctx)
        doc_vec = get_text_embedding(doc_text)
        score = float(np.dot(query_vec, doc_vec))
        scored_candidates.append((score, ctx))

    scored_candidates.sort(key=lambda x: x[0], reverse=True)

    return [ctx for score, ctx in scored_candidates[:top_k]]
