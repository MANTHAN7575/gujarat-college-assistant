import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.append('.')

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_test():
    print("--- STARTING SEARCH API 422 RESOLUTION VERIFICATION ---")

    # 1. Test /api/v1/colleges/search with `keyword=ldrp`
    res_search1 = client.get("/api/v1/colleges/search?page=1&per_page=20&keyword=ldrp")
    assert res_search1.status_code == 200, f"/search?keyword=ldrp returned {res_search1.status_code}: {res_search1.text}"
    data1 = res_search1.json()
    assert "items" in data1 and len(data1["items"]) > 0
    print(f"✅ 1. GET /api/v1/colleges/search?keyword=ldrp -> 200 OK (Found {len(data1['items'])} matching institutions)")

    # 2. Test /api/v1/colleges/search with `query=nirma`
    res_search2 = client.get("/api/v1/colleges/search?page=1&per_page=20&query=nirma")
    assert res_search2.status_code == 200, f"/search?query=nirma returned {res_search2.status_code}: {res_search2.text}"
    data2 = res_search2.json()
    assert "items" in data2 and len(data2["items"]) > 0
    print(f"✅ 2. GET /api/v1/colleges/search?query=nirma -> 200 OK (Found {len(data2['items'])} matching institutions)")

    # 3. Test /api/v1/colleges/stream/Engineering
    res_stream = client.get("/api/v1/colleges/stream/Engineering?page=1&per_page=20")
    assert res_stream.status_code == 200, f"/stream/Engineering returned {res_stream.status_code}: {res_stream.text}"
    data3 = res_stream.json()
    assert "items" in data3 and len(data3["items"]) > 0
    print(f"✅ 3. GET /api/v1/colleges/stream/Engineering -> 200 OK (Found {len(data3['items'])} Engineering colleges)")

    print("\n🎉 SEARCH API 422 UNPROCESSABLE CONTENT RESOLVED 100%!")

if __name__ == "__main__":
    run_test()
