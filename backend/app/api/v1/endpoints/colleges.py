import math
from typing import List, Optional, Union, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.crud import crud_college
from app.models.college import College
from app.schemas.college import CollegeSummary, CollegeDetailResponse, PaginatedCollegeResponse, AcpcCutoffYearSchema
from app.schemas.compare import CompareRequest, CompareResponse

router = APIRouter()


@router.get("/", response_model=Union[PaginatedCollegeResponse, List[CollegeSummary]])
def read_colleges(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    stream: Optional[str] = Query(None, description="Filter by stream (e.g., Engineering, Medical, Law)"),
    db: Session = Depends(get_db)
):
    query = db.query(College)
    if stream:
        query = query.filter(College.primary_stream.ilike(f"%{stream}%"))
    
    total = query.count()
    skip = (page - 1) * per_page
    pages = math.ceil(total / per_page) if per_page > 0 and total > 0 else 1
    items = query.order_by(College.name).offset(skip).limit(per_page).all()
    
    return PaginatedCollegeResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        pages=pages
    )


@router.get("/search", response_model=Union[PaginatedCollegeResponse, List[CollegeSummary]])
def search_colleges(
    keyword: str = Query("", description="Keyword or acronym (e.g. LDRP, PDEU, BJMC, Law)"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    if not keyword.strip():
        all_colleges = crud_college.get_all_colleges(db, limit=1000)
    else:
        all_colleges = crud_college.search_colleges(db, keyword=keyword, limit=1000)

    total = len(all_colleges)
    skip = (page - 1) * per_page
    pages = math.ceil(total / per_page) if per_page > 0 and total > 0 else 1
    items = all_colleges[skip:skip + per_page]

    return PaginatedCollegeResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        pages=pages
    )


@router.get("/featured", response_model=List[CollegeSummary])
def get_featured_colleges(
    limit: int = Query(6, description="Number of top NIRF colleges to fetch"),
    db: Session = Depends(get_db)
):
    return db.query(College).filter(College.nirf_rank.isnot(None)).order_by(College.nirf_rank.asc()).limit(limit).all()


@router.get("/stream/{stream_name}", response_model=Union[PaginatedCollegeResponse, List[CollegeSummary]])
def get_colleges_by_stream(
    stream_name: str,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    query = db.query(College).filter(College.primary_stream.ilike(f"%{stream_name}%"))
    total = query.count()
    skip = (page - 1) * per_page
    pages = math.ceil(total / per_page) if per_page > 0 and total > 0 else 1
    items = query.order_by(College.name).offset(skip).limit(per_page).all()

    return PaginatedCollegeResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        pages=pages
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
            detail = CollegeDetailResponse(
                college=college,
                description=college.description,
                website=college.website,
                email=college.email,
                phone=college.phone,
                address=college.address,
                established_year=college.established_year,
                affiliation=college.affiliation,
                university_affiliation=college.university_affiliation,
                is_polytechnic=college.is_polytechnic,
                naac_grade=college.naac_grade,
                latitude=college.latitude,
                longitude=college.longitude,
                courses=college.courses or [],
                placements=college.placements,
                facilities=college.facilities,
                events=college.events,
                admissions=college.admissions,
                branches=crud_college.get_related_branches(db, college_id=college.id),
                multi_year_cutoffs=crud_college.get_multi_year_cutoffs(college)
            )
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

    return CollegeDetailResponse(
        college=college,
        description=college.description,
        website=college.website,
        email=college.email,
        phone=college.phone,
        address=college.address,
        established_year=college.established_year,
        affiliation=college.affiliation,
        university_affiliation=college.university_affiliation,
        is_polytechnic=college.is_polytechnic,
        naac_grade=college.naac_grade,
        latitude=college.latitude,
        longitude=college.longitude,
        courses=college.courses or [],
        placements=college.placements,
        facilities=college.facilities,
        events=college.events,
        admissions=college.admissions,
        branches=crud_college.get_related_branches(db, college_id=college.id),
        multi_year_cutoffs=crud_college.get_multi_year_cutoffs(college)
    )
