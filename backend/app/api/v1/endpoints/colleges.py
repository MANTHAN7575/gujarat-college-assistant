from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
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


@router.get("/", response_model=CollegePaginatedResponse)
def read_colleges(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query across college names, cities, codes"),
    stream: Optional[str] = Query(None, description="Filter by primary stream (e.g. Engineering, Medical, Commerce)"),
    city: Optional[str] = Query(None, description="Filter by city"),
    is_polytechnic: Optional[bool] = Query(None, description="Filter diploma / polytechnic institutions"),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * per_page
    query = db.query(College)

    if search and search.strip():
        clean_search = search.strip()
        matched = crud_college.search_colleges(db, keyword=clean_search, limit=500)
        matched_ids = [c.id for c in matched]
        query = query.filter(College.id.in_(matched_ids))

    if stream and stream.strip() and stream.lower() != "all":
        query = query.filter(func.lower(College.primary_stream).like(f"%{stream.strip().lower()}%"))

    if city and city.strip() and city.lower() != "all":
        query = query.filter(func.lower(College.city) == city.strip().lower())

    if is_polytechnic is not None:
        query = query.filter(College.is_polytechnic == is_polytechnic)

    total = query.count()
    pages = (total + per_page - 1) // per_page if total > 0 else 1

    items = query.order_by(College.name).offset(skip).limit(per_page).all()

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


@router.post("/compare/", response_model=CompareResponse)
def compare_colleges(
    request: CompareRequest,
    db: Session = Depends(get_db)
):
    details_list = []
    for c_id in request.college_ids:
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
