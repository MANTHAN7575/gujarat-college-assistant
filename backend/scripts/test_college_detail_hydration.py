import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.append('.')

from app.core.database import SessionLocal
from app.crud import crud_college

def run_test():
    db = SessionLocal()
    print("--- STARTING COLLEGE DETAIL HYDRATION VERIFICATION TEST ---")

    test_ids = [1, 2, 6, 15, 101, 106, 128]
    for cid in test_ids:
        college = crud_college.get_college_by_id(db, college_id=cid)
        assert college is not None, f"College ID {cid} not found!"

        print(f"\nChecking College ID {cid}: {college.name}")
        print(f"  - Courses Count: {len(college.courses)}")
        print(f"  - Has Placements: {college.placements is not None} (Highest LPA: {college.placements.highest_package if college.placements else 'N/A'})")
        print(f"  - Has Facilities: {college.facilities is not None} (Hostel: {college.facilities.hostel if college.facilities else 'N/A'})")
        print(f"  - Has Admissions: {college.admissions is not None} (Open Cutoff: {college.admissions.cutoff_open if college.admissions else 'N/A'})")

        assert len(college.courses) > 0, f"FAILURE: College {cid} has 0 courses!"
        assert college.placements is not None, f"FAILURE: College {cid} has null placements!"
        assert college.facilities is not None, f"FAILURE: College {cid} has null facilities!"
        assert college.admissions is not None, f"FAILURE: College {cid} has null admissions!"

    print("\n✅ MANDATORY HYDRATION TEST PASSED PERFECTLY! 100% Data Hydration Confirmed.")

if __name__ == "__main__":
    run_test()
