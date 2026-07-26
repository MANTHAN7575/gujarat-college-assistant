import os
import json
import sys

# Add backend directory to PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.models.college import College, Course, Placement, Facility, Event, Admission, Review
from app.models.chat import ChatLog


def seed_database():
    print("Dropping old database schema to ensure zero duplicate records...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    json_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "data_collection",
        "gujarat_colleges.json"
    )

    if not os.path.exists(json_path):
        print(f"Error: Dataset file not found at {json_path}")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        colleges_data = json.load(f)

    print(f"Loaded {len(colleges_data)} unique institutions from JSON dataset.")

    try:
        for c_data in colleges_data:
            college = College(
                id=c_data.get("id"),
                code=c_data.get("code"),
                acpc_code=c_data.get("acpc_code"),
                acronyms=c_data.get("acronyms", []),
                name=c_data.get("name"),
                city=c_data.get("city"),
                district=c_data.get("district"),
                state=c_data.get("state", "Gujarat"),
                college_type=c_data.get("college_type"),
                primary_stream=c_data.get("primary_stream", "Engineering"),
                ownership=c_data.get("ownership"),
                affiliation=c_data.get("affiliation"),
                university_affiliation=c_data.get("university_affiliation"),
                is_polytechnic=c_data.get("is_polytechnic", False),
                naac_grade=c_data.get("naac_grade"),
                established_year=c_data.get("established_year"),
                website=c_data.get("website"),
                email=c_data.get("email"),
                phone=c_data.get("phone"),
                address=c_data.get("address"),
                description=c_data.get("description"),
                nirf_rank=c_data.get("nirf_rank"),
                image_url=c_data.get("image_url")
            )
            db.add(college)
            db.flush()  # Assigns college.id

            # Add courses
            for course_item in c_data.get("courses", []):
                course = Course(
                    college_id=college.id,
                    course_name=course_item.get("course_name"),
                    degree_type=course_item.get("degree_type"),
                    duration=course_item.get("duration"),
                    annual_fees=course_item.get("annual_fees"),
                    total_seats=course_item.get("total_seats"),
                    eligibility=course_item.get("eligibility")
                )
                db.add(course)

            # Add placements
            p_data = c_data.get("placements", {})
            if p_data:
                placement = Placement(
                    college_id=college.id,
                    average_package=p_data.get("average_package"),
                    highest_package=p_data.get("highest_package"),
                    placement_percentage=p_data.get("placement_percentage"),
                    top_recruiters=p_data.get("top_recruiters"),
                    placement_details=p_data.get("placement_details")
                )
                db.add(placement)

            # Add facilities
            f_data = c_data.get("facilities", {})
            if f_data:
                facility = Facility(
                    college_id=college.id,
                    hostel=f_data.get("hostel", False),
                    library=f_data.get("library", False),
                    wifi=f_data.get("wifi", False),
                    sports=f_data.get("sports", False),
                    transport=f_data.get("transport", False),
                    cafeteria=f_data.get("cafeteria", False),
                    medical=f_data.get("medical", False),
                    gym=f_data.get("gym", False),
                    facility_details=f_data.get("facility_details")
                )
                db.add(facility)

            # Add events
            e_data = c_data.get("events", {})
            if e_data:
                event = Event(
                    college_id=college.id,
                    tech_fest=e_data.get("tech_fest"),
                    cultural_fest=e_data.get("cultural_fest"),
                    hackathons=e_data.get("hackathons"),
                    workshops=e_data.get("workshops"),
                    event_details=e_data.get("event_details")
                )
                db.add(event)

            # Add admissions
            a_data = c_data.get("admissions", {})
            if a_data:
                admission = Admission(
                    college_id=college.id,
                    admission_process=a_data.get("admission_process"),
                    entrance_exams=a_data.get("entrance_exams"),
                    cutoff_details=a_data.get("cutoff_details"),
                    admission_contact=a_data.get("admission_contact")
                )
                db.add(admission)

        db.commit()
        print("Database purged and re-seeded successfully with acpc_code, acronyms, and expanded metadata!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
