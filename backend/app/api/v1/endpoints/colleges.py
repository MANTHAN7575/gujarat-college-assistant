from typing import Optional, List
import requests
from fastapi import APIRouter, Depends, Query, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.core.database import get_db
from app.crud import crud_college
from app.models.college import College
from app.schemas.college import (
    CollegeSummary,
    CollegeDetailResponse,
    CollegePaginatedResponse,
    AcpcCutoffYearSchema
)
from app.schemas.compare import CompareRequest, CompareResponse

router = APIRouter()

FALLBACK_CAMPUS_BANNER = "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1200&auto=format&fit=crop"
SECONDARY_FALLBACK = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop"


VERIFIED_EXTERIOR_MAP = {
    "LDRP": "https://upload.wikimedia.org/wikipedia/commons/f/f3/LDRP_ITR_Gandhinagar_Campus.jpg",
    "PDEU": "https://upload.wikimedia.org/wikipedia/commons/8/87/Pandit_Deendayal_Energy_University_Main_Building.jpg",
    "PDPU": "https://upload.wikimedia.org/wikipedia/commons/8/87/Pandit_Deendayal_Energy_University_Main_Building.jpg",
    "DEENDAYAL": "https://upload.wikimedia.org/wikipedia/commons/8/87/Pandit_Deendayal_Energy_University_Main_Building.jpg",
    "NIRMA": "https://upload.wikimedia.org/wikipedia/commons/a/a2/Nirma_University_Dome_Building.jpg",
    "LDCE": "https://upload.wikimedia.org/wikipedia/commons/5/52/LD_College_of_Engineering_Ahmedabad.jpg",
    "L.D.": "https://upload.wikimedia.org/wikipedia/commons/5/52/LD_College_of_Engineering_Ahmedabad.jpg",
    "MSU": "https://upload.wikimedia.org/wikipedia/commons/d/d4/The_Maharaja_Sayajirao_University_of_Baroda_Main_Dome.jpg",
    "SAYAJIRAO": "https://upload.wikimedia.org/wikipedia/commons/d/d4/The_Maharaja_Sayajirao_University_of_Baroda_Main_Dome.jpg",
    "GUJARAT UNIVERSITY": "https://upload.wikimedia.org/wikipedia/commons/f/f1/Gujarat_University_Tower_Building.jpg"
}


def get_fallback_image_response() -> Response:
    """Download and stream default exterior campus banner bytes directly without redirecting."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
    }

    try:
        res = requests.get(FALLBACK_CAMPUS_BANNER, headers=headers, timeout=5)
        if res.status_code == 200:
            content_type = res.headers.get("Content-Type", "image/jpeg")
            return Response(content=res.content, media_type=content_type)
    except Exception:
        pass

    try:
        res2 = requests.get(SECONDARY_FALLBACK, headers=headers, timeout=5)
        if res2.status_code == 200:
            content_type = res2.headers.get("Content-Type", "image/jpeg")
            return Response(content=res2.content, media_type=content_type)
    except Exception:
        pass

    return Response(content=b"", media_type="image/jpeg", status_code=200)


@router.get("/", response_model=CollegePaginatedResponse)
def read_colleges(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query across college names, cities, codes"),
    keyword: Optional[str] = Query(None, description="Search keyword alias"),
    query_param: Optional[str] = Query(None, alias="query", description="Search query alias"),
    stream: Optional[str] = Query(None, description="Filter by primary stream (e.g. Engineering, Medical, Commerce)"),
    city: Optional[str] = Query(None, description="Filter by city"),
    is_polytechnic: Optional[bool] = Query(None, description="Filter diploma / polytechnic institutions"),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * per_page
    query_builder = db.query(College)

    clean_search = (search or keyword or query_param or "").strip()

    if clean_search:
        matched = crud_college.search_colleges(db, keyword=clean_search, limit=500)
        matched_ids = [c.id for c in matched]
        query_builder = query_builder.filter(College.id.in_(matched_ids))

    if stream and stream.strip() and stream.lower() != "all":
        query_builder = query_builder.filter(func.lower(College.primary_stream).like(f"%{stream.strip().lower()}%"))

    if city and city.strip() and city.lower() != "all":
        query_builder = query_builder.filter(func.lower(College.city) == city.strip().lower())

    if is_polytechnic is not None:
        query_builder = query_builder.filter(College.is_polytechnic == is_polytechnic)

    total = query_builder.count()
    pages = (total + per_page - 1) // per_page if total > 0 else 1

    items = query_builder.order_by(College.name).offset(skip).limit(per_page).all()

    # Hydrate branches for each college item
    summary_items = []
    for item in items:
        summary = CollegeSummary.model_validate(item)
        summary.branches = crud_college.get_related_branches(db, college_id=item.id)
        summary_items.append(summary)

    return CollegePaginatedResponse(
        items=summary_items,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=pages
    )


@router.get("/search", response_model=CollegePaginatedResponse)
def search_colleges_endpoint(
    keyword: Optional[str] = Query(None, description="Search keyword"),
    query: Optional[str] = Query(None, description="Search query alias"),
    search: Optional[str] = Query(None, description="Search query alias"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    search_term = keyword or query or search or ""
    return read_colleges(
        page=page,
        per_page=per_page,
        search=search_term,
        keyword=None,
        query_param=None,
        stream=None,
        city=None,
        is_polytechnic=None,
        db=db
    )


@router.get("/stream/{stream_name}", response_model=CollegePaginatedResponse)
def get_colleges_by_stream_endpoint(
    stream_name: str,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    return read_colleges(
        page=page,
        per_page=per_page,
        search=None,
        keyword=None,
        query_param=None,
        stream=stream_name,
        city=None,
        is_polytechnic=None,
        db=db
    )


@router.post("/compare/", response_model=CompareResponse)
@router.post("/compare", response_model=CompareResponse)
@router.get("/compare/", response_model=CompareResponse)
@router.get("/compare", response_model=CompareResponse)
def compare_colleges(
    request: Optional[CompareRequest] = None,
    college_ids: Optional[List[int]] = Query(None),
    db: Session = Depends(get_db)
):
    ids = []
    if request and request.college_ids:
        ids = request.college_ids
    elif college_ids:
        ids = college_ids

    details_list = []
    for c_id in ids:
        college = crud_college.get_college_by_id(db, college_id=c_id)
        if college:
            detail = CollegeDetailResponse.model_validate(college)
            detail.multi_year_cutoffs = crud_college.get_multi_year_cutoffs(college)
            detail.branches = crud_college.get_related_branches(db, college_id=college.id)
            details_list.append(detail)

    if not details_list:
        raise HTTPException(status_code=404, detail="No colleges found for comparison")

    return CompareResponse(colleges=details_list)


@router.get("/{college_id}/branches")
def get_college_branches(
    college_id: int,
    db: Session = Depends(get_db)
):
    college = crud_college.get_college_by_id(db, college_id=college_id)
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    return crud_college.get_related_branches(db, college_id=college_id)


@router.get("/{college_id}/cutoffs", response_model=List[AcpcCutoffYearSchema])
def get_college_cutoffs(
    college_id: int,
    year: Optional[int] = Query(None, description="Academic year (e.g. 2026, 2025, 2024, 2023)"),
    db: Session = Depends(get_db)
):
    college = crud_college.get_college_by_id(db, college_id=college_id)
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    multi_years = crud_college.get_multi_year_cutoffs(college)
    if year:
        filtered = [y for y in multi_years if y["academic_year"] == year]
        return filtered
    return multi_years


@router.get("/{college_id}", response_model=CollegeDetailResponse)
def read_college_details(
    college_id: int,
    db: Session = Depends(get_db)
):
    college = crud_college.get_college_by_id(db, college_id=college_id)
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    detail = CollegeDetailResponse.model_validate(college)
    detail.multi_year_cutoffs = crud_college.get_multi_year_cutoffs(college)
    detail.branches = crud_college.get_related_branches(db, college_id=college.id)
    return detail


@router.get("/{college_id}/image-proxy")
def proxy_college_image(
    college_id: int,
    db: Session = Depends(get_db)
):
    college = crud_college.get_college_by_id(db, college_id=college_id)
    if not college:
        return get_fallback_image_response()

    target_url = college.image_url

    # Check verified exterior map first for known colleges
    c_name = (college.name or "").upper()
    c_code = (college.code or "").upper()
    c_acpc = (college.acpc_code or "").upper()

    for key, url in VERIFIED_EXTERIOR_MAP.items():
        if key in c_name or key == c_code or key == c_acpc:
            target_url = url
            break

    if not target_url or not target_url.startswith("http"):
        return get_fallback_image_response()

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
        }
        res = requests.get(target_url, headers=headers, timeout=5)
        if res.status_code == 200:
            content_type = res.headers.get("Content-Type", "image/jpeg")
            return Response(content=res.content, media_type=content_type)
    except Exception as e:
        print(f"Failed to proxy image for college {college_id}: {e}")

    return get_fallback_image_response()
