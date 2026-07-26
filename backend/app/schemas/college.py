from typing import Optional, List, Union, Dict, Any
from pydantic import BaseModel, ConfigDict


class CourseSchema(BaseModel):
    id: Optional[int] = None
    college_id: Optional[int] = None
    course_name: str
    degree_type: Optional[str] = None
    stream_category: Optional[str] = None
    duration: Optional[str] = None
    annual_fees: Optional[float] = None
    total_seats: Optional[int] = None
    eligibility: Optional[str] = None
    cutoff_rank_open: Optional[int] = None
    cutoff_rank_sebc: Optional[int] = None
    cutoff_rank_sc: Optional[int] = None
    cutoff_rank_st: Optional[int] = None
    cutoff_rank_ews: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class AcpcCutoffItem(BaseModel):
    course_name: str
    category: str
    round_number: str = "Round 1"
    opening_rank: Optional[int] = None
    closing_rank: Optional[int] = None


class AcpcCutoffYearSchema(BaseModel):
    academic_year: int
    is_pending: bool = False
    status_message: Optional[str] = None
    cutoffs: List[AcpcCutoffItem] = []


class PlacementSchema(BaseModel):
    id: Optional[int] = None
    average_package: Optional[float] = None
    highest_package: Optional[float] = None
    placement_percentage: Optional[float] = None
    top_recruiters: Optional[str] = None
    placement_details: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class FacilitySchema(BaseModel):
    id: Optional[int] = None
    hostel: Optional[bool] = False
    library: Optional[bool] = False
    wifi: Optional[bool] = False
    sports: Optional[bool] = False
    gym: Optional[bool] = False
    cafeteria: Optional[bool] = False
    transport: Optional[bool] = False
    medical: Optional[bool] = False
    facility_details: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AdmissionSchema(BaseModel):
    id: Optional[int] = None
    admission_process: Optional[str] = None
    entrance_exams: Optional[str] = None
    cutoff_details: Optional[str] = None
    cutoff_open: Optional[int] = None
    cutoff_sebc: Optional[int] = None
    cutoff_sc: Optional[int] = None
    cutoff_st: Optional[int] = None
    cutoff_ews: Optional[int] = None
    admission_contact: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CollegeSummary(BaseModel):
    id: int
    name: str
    code: Optional[str] = None
    acpc_code: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    primary_stream: Optional[str] = None
    college_type: Optional[str] = None
    ownership: Optional[str] = None
    university_affiliation: Optional[str] = None
    acronyms: Optional[List[str]] = None
    nirf_rank: Optional[int] = None
    naac_grade: Optional[str] = None
    is_polytechnic: bool = False
    annual_fees: Optional[float] = None
    highest_lpa: Optional[float] = None
    campus_photo_url: Optional[str] = None
    branches: Optional[List[Dict[str, Any]]] = None

    model_config = ConfigDict(from_attributes=True)


class CollegePaginatedResponse(BaseModel):
    items: List[CollegeSummary]
    total: int
    page: int
    per_page: int
    total_pages: int


# Export PaginatedCollegeResponse alias for backward compatibility
PaginatedCollegeResponse = CollegePaginatedResponse


class CollegeDetailResponse(BaseModel):
    id: int
    name: str
    code: Optional[str] = None
    acpc_code: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    primary_stream: Optional[str] = None
    college_type: Optional[str] = None
    ownership: Optional[str] = None
    university_affiliation: Optional[str] = None
    acronyms: Optional[List[str]] = None
    nirf_rank: Optional[int] = None
    naac_grade: Optional[str] = None
    established_year: Optional[int] = None
    is_polytechnic: bool = False
    description: Optional[str] = None
    website: Optional[str] = None
    campus_photo_url: Optional[str] = None
    courses: List[CourseSchema] = []
    placements: Optional[PlacementSchema] = None
    facilities: Optional[FacilitySchema] = None
    admissions: Optional[AdmissionSchema] = None
    branches: Optional[List[Dict[str, Any]]] = None
    multi_year_cutoffs: Optional[List[Dict[str, Any]]] = None

    model_config = ConfigDict(from_attributes=True)
