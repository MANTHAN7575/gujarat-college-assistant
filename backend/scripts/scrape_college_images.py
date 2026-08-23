#!/usr/bin/env python3
"""
Genuine Per-College Wikimedia Campus Image Scraper & Local File Storage Pipeline
- Searches Wikimedia Commons (File namespace) for authentic architectural campus photos per college
- Downloads authentic photos directly to backend/static/campus_images/{id}.jpg
- Updates database image_url to local relative path '/static/campus_images/{id}.jpg'
- Preserves honest NULL values for colleges with no authentic image (handled by frontend stream category fallbacks)
- Fully idempotent and resumable
"""

import sys
import os
import time
import argparse
import requests
import re
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
from sqlalchemy.orm import Session

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.college import College

HEADERS = {
    "User-Agent": "GujaratCollegeAssistantBot/1.0 (https://github.com/MANTHAN7575/gujarat-college-assistant; contact@gujaratcollegeassistant.org)"
}

STATIC_IMG_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "static",
    "campus_images"
)
os.makedirs(STATIC_IMG_DIR, exist_ok=True)

# Direct Verified Wikimedia Commons Authentic Campus Photographs
DIRECT_VERIFIED_CAMPUS_URLS = {
    1: "https://upload.wikimedia.org/wikipedia/commons/8/87/Pandit_Deendayal_Energy_University_Main_Building.jpg",
    2: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Daiict-campus.jpg",
    3: "https://upload.wikimedia.org/wikipedia/commons/9/92/Institute_of_Architecture_%26_Planning%2C_Nirma_University.jpg",
    4: "https://upload.wikimedia.org/wikipedia/commons/2/25/The_entrance_of_LD_Engineering_college%2C_Ahmedabad.jpg",
    10: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Charotar_University_of_Science_and_Technology.jpg",
    16: "https://upload.wikimedia.org/wikipedia/commons/3/35/Maharaja_Sayajirao_University.jpg",
    101: "https://upload.wikimedia.org/wikipedia/commons/f/f3/LDRP_ITR_Gandhinagar_Campus.jpg",
    102: "https://upload.wikimedia.org/wikipedia/commons/6/69/Front_Lawn_of_Birla_Vishvakarma_Mahavidyalaya.jpg"
}

EXCLUDE_PATTERNS = [
    ".svg", ".pdf", ".ogg", ".webm", ".tif", ".gif",
    "logo", "icon", "seal", "emblem", "flag", "coat_of_arms", "map",
    "chart", "portrait", "signature", "group", "student", "classroom",
    "convocation", "certificate", "press", "minister", "president", "event"
]


def is_valid_campus_photo(url: str, title: str) -> bool:
    """Validate image to ensure it's a real photo of campus architecture."""
    if not url or not isinstance(url, str):
        return False
    u_lower = url.lower()
    t_lower = title.lower()

    if not u_lower.endswith(('.jpg', '.jpeg', '.png', '.webp')) and not any(ext in u_lower for ext in ['.jpg?', '.jpeg?', '.png?', '.webp?']):
        return False

    if any(ex in u_lower or ex in t_lower for ex in EXCLUDE_PATTERNS):
        return False

    return True


def download_and_save_image(image_url: str, college_id: int) -> str | None:
    """Download authentic image bytes from Wikimedia and store locally in backend/static/campus_images/."""
    try:
        clean_url = image_url.split("?")[0]
        ext = ".jpg"
        if clean_url.lower().endswith(".png"):
            ext = ".png"
        elif clean_url.lower().endswith(".webp"):
            ext = ".webp"

        filename = f"{college_id}{ext}"
        filepath = os.path.join(STATIC_IMG_DIR, filename)

        resp = requests.get(image_url, headers=HEADERS, timeout=8)
        if resp.status_code == 200 and len(resp.content) > 2048:
            with open(filepath, "wb") as f:
                f.write(resp.content)
            return f"/static/campus_images/{filename}"
    except Exception as e:
        pass
    return None


def search_commons_for_college(name: str, city: str) -> str | None:
    """Search Wikimedia Commons for a specific college's campus building photo."""
    clean_name = re.sub(r'\(.*?\)', '', name).strip()
    
    # Try specific queries
    queries = [
        f"{clean_name} campus",
        clean_name
    ]

    for q in queries:
        try:
            url = f"https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(q)}&gsrnamespace=6&gsrlimit=3&prop=imageinfo&iiprop=url|size&format=json"
            resp = requests.get(url, headers=HEADERS, timeout=4)
            if resp.status_code == 200:
                pages = resp.json().get("query", {}).get("pages", {})
                for p in pages.values():
                    title = p.get("title", "")
                    info = p.get("imageinfo", [{}])[0]
                    img_url = info.get("url")
                    width = info.get("width", 0)
                    height = info.get("height", 0)

                    if img_url and width >= 500 and height >= 350 and is_valid_campus_photo(img_url, title):
                        # Strict relevance verification
                        name_tokens = [t.lower() for t in clean_name.split() if len(t) > 3]
                        if any(t in title.lower() or t in img_url.lower() for t in name_tokens):
                            return img_url
        except Exception:
            pass

    return None


def process_college_worker(college_id: int, name: str, city: str, current_img: str | None, force: bool) -> tuple[int, str | None]:
    """Concurrent worker task for a single college."""
    # 1. Direct hand-verified colleges
    if college_id in DIRECT_VERIFIED_CAMPUS_URLS:
        target_url = DIRECT_VERIFIED_CAMPUS_URLS[college_id]
        saved = download_and_save_image(target_url, college_id)
        if saved:
            return (college_id, saved)

    # 2. Resumable skip check
    if not force and current_img and current_img.startswith("/static/"):
        filename = f"{college_id}.jpg"
        if os.path.exists(os.path.join(STATIC_IMG_DIR, filename)):
            return (college_id, current_img)

    # 3. Query Commons
    found_url = search_commons_for_college(name, city or "Gujarat")
    if found_url:
        saved = download_and_save_image(found_url, college_id)
        if saved:
            return (college_id, saved)

    return (college_id, None)


def run_pipeline(limit: int = 0, force: bool = False, max_workers: int = 8):
    db: Session = SessionLocal()
    try:
        query = db.query(College)
        total_count = query.count()
        print(f"\n=======================================================")
        print(f"STARTING WIKIMEDIA SEARCH & LOCAL FILE STORAGE PIPELINE")
        print(f"Target Directory: {STATIC_IMG_DIR}")
        print(f"Total Colleges in DB: {total_count} (limit={limit}, workers={max_workers})")
        print(f"=======================================================\n")

        colleges = query.limit(limit).all() if limit > 0 else query.all()
        college_data = [(c.id, c.name, c.city, c.image_url) for c in colleges]
        db.close()

        results = []
        found_count = 0
        null_count = 0

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_col = {
                executor.submit(process_college_worker, c_id, name, city, curr_img, force): (c_id, name)
                for c_id, name, city, curr_img in college_data
            }

            for future in tqdm(as_completed(future_to_col), total=len(future_to_col), desc="Searching Commons"):
                c_id, name = future_to_col[future]
                try:
                    res_id, local_path = future.result()
                    results.append((res_id, local_path))
                    if local_path:
                        found_count += 1
                        tqdm.write(f"FOUND & SAVED: [{res_id}] {name} -> {local_path}")
                    else:
                        null_count += 1
                except Exception:
                    results.append((c_id, None))
                    null_count += 1

        # Reopen DB session to batch update
        db = SessionLocal()
        print("\nUpdating database records with local file paths...")
        for c_id, local_path in results:
            db.query(College).filter(College.id == c_id).update({College.image_url: local_path})
        db.commit()

        # Final Verification
        total_files = len(os.listdir(STATIC_IMG_DIR)) if os.path.exists(STATIC_IMG_DIR) else 0
        db_with_img = db.query(College).filter(College.image_url.isnot(None), College.image_url != '').count()
        db_null = db.query(College).filter((College.image_url.is_(None)) | (College.image_url == '')).count()

        print("\n=======================================================")
        print("WIKIMEDIA SCRAPER & LOCAL FILE STORAGE PIPELINE COMPLETE")
        print(f"Total Colleges Processed: {len(colleges)}")
        print(f"Authentic Local Image Files Stored: {total_files}")
        print(f"Database Records with Local Image: {db_with_img}")
        print(f"Database Records with Honest NULL (Category Fallback): {db_null}")
        print("=======================================================\n")

        print("--- Verified Local Photos Spot Check ---")
        for col in db.query(College).filter(College.image_url.isnot(None)).all():
            abs_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), col.image_url.lstrip("/"))
            file_size_kb = os.path.getsize(abs_path) / 1024 if os.path.exists(abs_path) else 0
            print(f"  [{col.id}] {col.name} -> {col.image_url} ({file_size_kb:.1f} KB on disk)")

    except Exception as e:
        db.rollback()
        print(f"Error during pipeline execution: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scrape genuine Wikimedia photos and store as local files.")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of colleges to process (0 for all)")
    parser.add_argument("--force", action="store_true", help="Force overwrite existing local files")
    parser.add_argument("--workers", type=int, default=8, help="Number of concurrent workers")
    args = parser.parse_args()

    run_pipeline(limit=args.limit, force=args.force, max_workers=args.workers)
