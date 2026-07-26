import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.append('.')

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_test():
    print("--- STARTING DYNAMIC MULTI-YEAR ACPC CUTOFFS TEST ---")

    # 1. Query full multi-year cutoffs for college ID 1
    res = client.get("/api/v1/colleges/1/cutoffs")
    assert res.status_code == 200, f"GET /api/v1/colleges/1/cutoffs failed with {res.status_code}"
    data = res.json()
    assert isinstance(data, list) and len(data) == 4, f"Expected 4 academic years (2023-2026), got {len(data)}"
    print(f"✅ Full multi-year endpoint returned {len(data)} academic years (2023, 2024, 2025, 2026)")

    # 2. Query 2025 past year cutoffs
    res_2025 = client.get("/api/v1/colleges/1/cutoffs?year=2025")
    assert res_2025.status_code == 200
    data_2025 = res_2025.json()
    assert len(data_2025) == 1
    year_obj_2025 = data_2025[0]
    assert year_obj_2025["academic_year"] == 2025
    assert year_obj_2025["is_pending"] is False
    assert len(year_obj_2025["cutoffs"]) > 0
    print(f"✅ Year 2025 cutoffs verified: {len(year_obj_2025['cutoffs'])} rank records found")

    # 3. Query 2026 pending year cutoffs
    res_2026 = client.get("/api/v1/colleges/1/cutoffs?year=2026")
    assert res_2026.status_code == 200
    data_2026 = res_2026.json()
    assert len(data_2026) == 1
    year_obj_2026 = data_2026[0]
    assert year_obj_2026["academic_year"] == 2026
    assert year_obj_2026["is_pending"] is True
    assert "Official Round 1 & Round 2" in year_obj_2026["status_message"]
    print(f"✅ Year 2026 pending state verified: status_message -> '{year_obj_2026['status_message']}'")

    print("\n🎉 ALL MULTI-YEAR ACPC CUTOFF TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    run_test()
