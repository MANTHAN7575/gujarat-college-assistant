from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Numeric, Boolean, Float, JSON,
    ForeignKey, DateTime
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class College(Base):
    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), index=True, nullable=True)
    acpc_code = Column(String(50), index=True, nullable=True)
    acronyms = Column(JSON, nullable=True)
    name = Column(String(255), nullable=False, index=True)
    city = Column(String(100), index=True)
    district = Column(String(100))
    state = Column(String(100), default="Gujarat")
    college_type = Column(String(100))        # e.g., Private, Government, Grant-in-aid, Deemed
    primary_stream = Column(String(100), index=True, default="Engineering") # e.g. Commerce, Science, Arts, Medical, Law, Engineering
    ownership = Column(String(100))
    affiliation = Column(String(255))
    university_affiliation = Column(String(255), nullable=True)
    is_polytechnic = Column(Boolean, default=False, index=True)
    naac_grade = Column(String(50), nullable=True)
    established_year = Column(Integer)
    website = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    address = Column(Text)
    description = Column(Text)
    nirf_rank = Column(Integer)
    image_url = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    branches = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    courses = relationship("Course", back_populates="college", cascade="all, delete-orphan")
    placements = relationship("Placement", back_populates="college", uselist=False, cascade="all, delete-orphan")
    facilities = relationship("Facility", back_populates="college", uselist=False, cascade="all, delete-orphan")
    events = relationship("Event", back_populates="college", uselist=False, cascade="all, delete-orphan")
    admissions = relationship("Admission", back_populates="college", uselist=False, cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="college", cascade="all, delete-orphan")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id", ondelete="CASCADE"), nullable=False)
    course_name = Column(String(255), nullable=False)
    degree_type = Column(String(100))          # B.Tech, M.Tech, B.Com, B.Sc, BA, MBBS, LLB, MBA
    stream_category = Column(String(100), index=True) # Engineering, Commerce, Science, Arts, Medical, Law, Management, Polytechnic
    duration = Column(String(50))
    annual_fees = Column(Numeric(10, 2))
    total_seats = Column(Integer)
    eligibility = Column(Text)
    cutoff_rank_open = Column(Integer, nullable=True)
    cutoff_rank_sebc = Column(Integer, nullable=True)
    cutoff_rank_sc = Column(Integer, nullable=True)
    cutoff_rank_st = Column(Integer, nullable=True)
    cutoff_rank_ews = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    college = relationship("College", back_populates="courses")


class Placement(Base):
    __tablename__ = "placements"

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id", ondelete="CASCADE"), nullable=False)
    average_package = Column(Numeric(10, 2))
    highest_package = Column(Numeric(10, 2))
    placement_percentage = Column(Numeric(5, 2))
    top_recruiters = Column(Text)
    placement_details = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    college = relationship("College", back_populates="placements")


class Facility(Base):
    __tablename__ = "facilities"

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id", ondelete="CASCADE"), nullable=False)
    hostel = Column(Boolean, default=False)
    library = Column(Boolean, default=False)
    wifi = Column(Boolean, default=False)
    sports = Column(Boolean, default=False)
    transport = Column(Boolean, default=False)
    cafeteria = Column(Boolean, default=False)
    medical = Column(Boolean, default=False)
    gym = Column(Boolean, default=False)
    facility_details = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    college = relationship("College", back_populates="facilities")


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id", ondelete="CASCADE"), nullable=False)
    tech_fest = Column(String(255))
    cultural_fest = Column(String(255))
    hackathons = Column(Text)
    workshops = Column(Text)
    event_details = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    college = relationship("College", back_populates="events")


class Admission(Base):
    __tablename__ = "admissions"

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id", ondelete="CASCADE"), nullable=False)
    admission_process = Column(Text)
    entrance_exams = Column(Text)              # GUJCET, JEE Main, NEET, CAT, CMAT, CLAT
    cutoff_details = Column(Text)
    cutoff_open = Column(Integer, nullable=True)
    cutoff_sebc = Column(Integer, nullable=True)
    cutoff_sc = Column(Integer, nullable=True)
    cutoff_st = Column(Integer, nullable=True)
    cutoff_ews = Column(Integer, nullable=True)
    admission_contact = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    college = relationship("College", back_populates="admissions")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id", ondelete="CASCADE"), nullable=False)
    student_name = Column(String(255))
    rating = Column(Numeric(2, 1))
    review_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    college = relationship("College", back_populates="reviews")
