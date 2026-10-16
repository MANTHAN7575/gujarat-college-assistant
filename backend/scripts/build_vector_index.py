"""
build_vector_index.py
Builds rich semantic document strings for all colleges and generates a persistent
768-dimensional normalized float32 embedding matrix (N, 768) stored in college_vectors.npz.
Optionally syncs with Pinecone if PINECONE_API_KEY is configured.
"""

import os
import sys
import re
import time
import hashlib
import logging
from typing import List, Dict, Any, Optional
import numpy as np

# Ensure backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.college import College
from app.crud import crud_college

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("build_vector_index")


def compute_dense_768_embedding(text: str) -> np.ndarray:
    """
    Computes a 768-dimensional normalized semantic feature vector.
    Combines word tokens, informative bigrams, and character n-grams projected
    via signed hashing to 768 buckets with L2 normalization.
    """
    vec = np.zeros(768, dtype=np.float32)
    if not text:
        return vec

    text_clean = text.lower()
    words = re.findall(r'[a-zA-Z0-9]+', text_clean)

    # 1. Word token projections with length weighting
    for w in words:
        h = int(hashlib.md5(w.encode('utf-8')).hexdigest(), 16)
        idx = h % 768
        sign = 1.0 if ((h >> 16) & 1) == 0 else -1.0
        weight = 1.0 + min(len(w), 8) * 0.25
        vec[idx] += sign * weight

    # 2. Word bi-gram projections for phrase coherence
    for i in range(len(words) - 1):
        bg = f"{words[i]}_{words[i+1]}"
        h = int(hashlib.md5(bg.encode('utf-8')).hexdigest(), 16)
        idx = h % 768
        sign = 1.0 if ((h >> 16) & 1) == 0 else -1.0
        vec[idx] += sign * 1.5

    # 3. Character 3-grams for subword matching (acronyms, code parts, city variants)
    for i in range(len(text_clean) - 2):
        tg = text_clean[i:i+3]
        if not tg.isspace():
            h = int(hashlib.md5(tg.encode('utf-8')).hexdigest(), 16)
            idx = h % 768
            sign = 1.0 if ((h >> 16) & 1) == 0 else -1.0
            vec[idx] += sign * 0.35

    norm = np.linalg.norm(vec)
    if norm > 0:
        vec /= norm
    return vec


def build_college_semantic_doc(college_dict: Dict[str, Any]) -> str:
    """
    Builds a rich, cohesive semantic document string for a college.
    """
    c_id = college_dict.get("id")
    name = college_dict.get("name", "")
    code = college_dict.get("code") or ""
    acpc = college_dict.get("acpc_code") or ""
    city = college_dict.get("city") or "Gujarat"
    district = college_dict.get("district") or ""
    stream = college_dict.get("primary_stream") or "Higher Education"
    univ = college_dict.get("university_affiliation") or college_dict.get("affiliation") or "Gujarat Technical / State University"
    poly = "Diploma Polytechnic" if college_dict.get("is_polytechnic") else "Degree College University"
    naac = college_dict.get("naac_grade") or ""
    desc = college_dict.get("description") or ""

    courses = college_dict.get("courses", [])
    courses_str = ", ".join([
        f"{c.get('course_name')} ({c.get('degree_type')}, Fees: ₹{c.get('annual_fees')})"
        for c in courses[:8]
    ]) if courses else "Undergraduate & Postgraduate Degree Programs"

    placements = college_dict.get("placements", {})
    high_pkg = placements.get("highest_package") or 0.0
    avg_pkg = placements.get("average_package") or 0.0
    pkg_str = f"Highest Package ₹{high_pkg} LPA, Average Package ₹{avg_pkg} LPA" if (high_pkg or avg_pkg) else "Active Training & Placement Cell"
    recruiters = placements.get("top_recruiters") or "Top Indian MNCs & Regional Corporates"

    facilities = college_dict.get("facilities", {})
    hostel = "Hostel Available" if facilities.get("hostel") else "Day Scholar Campus"

    admissions = college_dict.get("admissions", {})
    exams = admissions.get("entrance_exams") or "ACPC / GUJCET / Merit Ranks"

    # Hub and regional aliases enrichment
    hub_keywords = []
    city_lower = city.lower()
    name_lower = name.lower()
    if "anand" in city_lower or "birla" in name_lower or "bvm" in name_lower or "charusat" in name_lower or "mbict" in name_lower:
        hub_keywords.extend(["Vallabh Vidyanagar", "V.V. Nagar", "Vidyanagar", "Anand District Hub"])
    if "gandhinagar" in city_lower or "ldrp" in name_lower or "pdeu" in name_lower or "daiict" in name_lower:
        hub_keywords.extend(["Gandhinagar Capital Hub", "LDRP", "PDEU", "DAIICT"])
    if "vadodara" in city_lower or "baroda" in city_lower or "msu" in name_lower:
        hub_keywords.extend(["Vadodara", "Baroda", "MSU Baroda"])
    if "ahmedabad" in city_lower or "nirma" in name_lower or "ldce" in name_lower:
        hub_keywords.extend(["Ahmedabad Metro Hub", "Nirma", "LDCE", "VGEC"])
    if "surat" in city_lower or "bardoli" in city_lower:
        hub_keywords.extend(["Surat South Gujarat Hub", "Bardoli"])

    hub_str = " | Regional Hubs: " + ", ".join(hub_keywords) if hub_keywords else ""

    doc = (
        f"College ID: {c_id} | Name: {name} | ACPC Code: {acpc} | Code: {code} | "
        f"City: {city} | District: {district} | Stream: {stream} | Affiliation: {univ} | "
        f"Classification: {poly} | NAAC: {naac} | Description: {desc} | "
        f"Courses: {courses_str} | Placements: {pkg_str} | Recruiters: {recruiters} | "
        f"Facilities: {hostel} | Admissions & Exams: {exams}{hub_str}"
    )
    return doc.strip()


def build_vector_index():
    start_time = time.time()
    db = SessionLocal()

    try:
        from sqlalchemy.orm import joinedload
        colleges = db.query(College).options(
            joinedload(College.courses),
            joinedload(College.placements),
            joinedload(College.facilities),
            joinedload(College.admissions)
        ).order_by(College.id).all()
        total_colleges = len(colleges)
        logger.info(f"Loaded {total_colleges} colleges from database for vector indexing.")

        college_ids = []
        documents = []
        vectors = []

        logger.info("Building semantic documents and 768d dense embedding vectors...")
        for raw_col in colleges:
            col = crud_college.hydrate_college_relations(raw_col)
            courses = [
                {
                    "course_name": c.course_name,
                    "degree_type": c.degree_type,
                    "annual_fees": c.annual_fees
                } for c in (col.courses or [])
            ]
            ctx = {
                "id": col.id,
                "name": col.name,
                "code": col.code,
                "acpc_code": col.acpc_code,
                "city": col.city,
                "district": col.district,
                "primary_stream": col.primary_stream,
                "university_affiliation": col.university_affiliation,
                "is_polytechnic": col.is_polytechnic,
                "naac_grade": col.naac_grade,
                "description": col.description,
                "courses": courses,
                "placements": {
                    "highest_package": col.placements.highest_package if col.placements else None,
                    "average_package": col.placements.average_package if col.placements else None,
                    "top_recruiters": col.placements.top_recruiters if col.placements else None,
                },
                "facilities": {
                    "hostel": col.facilities.hostel if col.facilities else False
                },
                "admissions": {
                    "entrance_exams": col.admissions.entrance_exams if col.admissions else None
                }
            }

            doc_text = build_college_semantic_doc(ctx)
            vec = compute_dense_768_embedding(doc_text)

            college_ids.append(col.id)
            documents.append(doc_text)
            vectors.append(vec)

        college_ids_arr = np.array(college_ids, dtype=np.int32)
        documents_arr = np.array(documents, dtype=object)
        vectors_arr = np.array(vectors, dtype=np.float32)

        # Ensure target data folder exists
        data_dir = os.path.join(backend_dir, "data")
        os.makedirs(data_dir, exist_ok=True)
        npz_target = os.path.join(data_dir, "college_vectors.npz")

        np.savez_compressed(
            npz_target,
            college_ids=college_ids_arr,
            documents=documents_arr,
            vectors=vectors_arr
        )

        elapsed = time.time() - start_time
        logger.info(f"Successfully generated 768d vector index at: {npz_target}")
        logger.info(f"Index Shape: {vectors_arr.shape} | Total Records: {len(college_ids_arr)} | Elapsed Time: {elapsed:.2f}s")

        # Sync with Pinecone if configured
        if settings.PINECONE_API_KEY:
            try:
                from pinecone import Pinecone
                logger.info(f"Connecting to Pinecone index: {settings.PINECONE_INDEX_NAME}...")
                pc = Pinecone(api_key=settings.PINECONE_API_KEY)
                existing_indexes = [idx.name for idx in pc.list_indexes()]
                if settings.PINECONE_INDEX_NAME not in existing_indexes:
                    from pinecone import ServerlessSpec
                    logger.info(f"Creating Pinecone index '{settings.PINECONE_INDEX_NAME}' with 768 dimensions...")
                    pc.create_index(
                        name=settings.PINECONE_INDEX_NAME,
                        dimension=768,
                        metric="cosine",
                        spec=ServerlessSpec(cloud="aws", region="us-east-1")
                    )

                index = pc.Index(settings.PINECONE_INDEX_NAME)
                # Batch upsert
                batch_size = 100
                total_upserted = 0
                for i in range(0, total_colleges, batch_size):
                    batch_vectors = []
                    for j in range(i, min(i + batch_size, total_colleges)):
                        cid = int(college_ids_arr[j])
                        v = vectors_arr[j].tolist()
                        batch_vectors.append({
                            "id": str(cid),
                            "values": v,
                            "metadata": {
                                "college_id": cid,
                                "name": colleges[j].name,
                                "city": colleges[j].city or "",
                                "stream": colleges[j].primary_stream or "",
                                "acpc_code": colleges[j].acpc_code or ""
                            }
                        })
                    index.upsert(vectors=batch_vectors)
                    total_upserted += len(batch_vectors)
                logger.info(f"Pinecone sync complete: {total_upserted} vectors upserted.")
            except Exception as pe:
                logger.warning(f"Pinecone sync error (continuing with local NumPy index): {pe}")
        else:
            logger.info("Pinecone API key not configured. Operating in high-speed local NumPy vector store mode.")

        return npz_target
    finally:
        db.close()


if __name__ == "__main__":
    build_vector_index()
