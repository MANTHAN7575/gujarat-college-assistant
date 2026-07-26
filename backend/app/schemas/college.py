from typing import Optional, List, Union, Dict, Any
from pydantic import BaseModel, ConfigDict


class CourseSchema(BaseModel):
    id: int
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
    id: int
    average_package: Optional[float] = None
    highest_package: Optional[float] = None
    placement_percentage: Optional[float] = None
    top_recruiters: Optional[str] = None
    placement_details: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class FacilitySchema(BaseModel):
    id: int
    hostel: bool = False
    library: bool = False
    wifi: bool = False
    sports: bool = False
    transport: bool = False
    cafeteria: bool = False
    medical: bool = False
    gym: bool = False
    facility_details: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class EventSchema(BaseModel):
    id: int
    tech_fest: Optional[str] = None
    cultural_fest: Optional[str] = None
    hackathons: Optional[str] = None
    workshops: Optional[str] = None
    event_details: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AdmissionSchema(BaseModel):
    id: int
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
    code: Optional[str] = None
    acpc_code: Optional[str] = None
    acronyms: Optional[List[str]] = []
    name: str
    city: Optional[str] = None
    district: Optional[str] = None
    college_type: Optional[str] = None
    primary_stream: Optional[str] = None
    ownership: Optional[str] = None
    university_affiliation: Optional[str] = None
    is_polytechnic: Optional[bool] = False
    naac_grade: Optional[str] = None
    nirf_rank: Optional[int] = None
    image_url: Optional[str] = None
    branches: Optional[List[Dict[str, Any]]] = None

    model_config = ConfigDict(from_attributes=True)


class PaginatedCollegeResponse(BaseModel):
    items: List[CollegeSummary]
    total: int
    page: int
    per_page: int
    pages: int

    model_config = ConfigDict(from_attributes=True)


class CollegeDetailResponse(BaseModel):
    college: CollegeSummary
    description: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    established_year: Optional[int] = None
    affiliation: Optional[str] = None
    university_affiliation: Optional[str] = None
    is_polytechnic: Optional[bool] = False
    naac_grade: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    courses: List[CourseSchema] = []
    placements: Optional[PlacementSchema] = None
    facilities: Optional[FacilitySchema] = None
    events: Optional[EventSchema] = None
    admissions: Optional[AdmissionSchema] = None
    branches: Optional[List[Dict[str, Any]]] = None
    multi_year_cutoffs: Optional[List[AcpcCutoffYearSchema]] = None

    model_config = ConfigDict(from_attributes=True)
