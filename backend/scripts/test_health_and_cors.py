import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.append('.')

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_test():
    print("--- STARTING FASTAPI BACKEND SERVER HEALTH & CORS VERIFICATION ---")

    # 1. Test /health endpoint
    res_health = client.get("/health")
    assert res_health.status_code == 200, f"/health returned status {res_health.status_code}"
    print(f"✅ /health -> 200 OK: {res_health.json()}")

    # 2. Test root / endpoint
    res_root = client.get("/")
    assert res_root.status_code == 200
    print(f"✅ / -> 200 OK: {res_root.json()}")

    # 3. Test CORS preflight request from Vite frontend (http://localhost:5173)
    res_cors = client.options(
        "/api/v1/colleges/",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET"
        }
    )
    assert res_cors.status_code in [200, 204]
    print(f"✅ CORS Preflight for http://localhost:5173 -> {res_cors.status_code} OK")

    print("\n🎉 BACKEND HEALTH & CORS VERIFICATION PASSED 100%!")

if __name__ == "__main__":
    run_test()
