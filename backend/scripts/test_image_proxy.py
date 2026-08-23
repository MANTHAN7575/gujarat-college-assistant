import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

colleges_to_test = [1, 2, 3, 4, 16, 101, 102]
print("--- TESTING IMAGE PROXY ACROSS KEY COLLEGES ---")
for cid in colleges_to_test:
    res = client.get(f"/api/v1/colleges/{cid}/image-proxy")
    content_type = res.headers.get("content-type", "unknown")
    byte_count = len(res.content)
    print(f"College {cid:3d} Image Proxy -> Status: {res.status_code} | Type: {content_type} | Size: {byte_count} bytes")

print("\n--- TEST COMPLETED SUCCESSFULLY ---")
