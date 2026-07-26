#!/usr/bin/env python3
"""
Automated Real Campus Photo Scraper & Database Hydration Pipeline
Scrapes authentic main building and aerial drone campus photography for colleges in the database.
"""

import sys
import os
import time
import argparse
import requests
import re
from tqdm import tqdm
from sqlalchemy.orm import Session

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.college import College

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


def search_bing_campus_image(query: str) -> str:
    """Fetch high-resolution campus photo URL from Bing Image Search."""
    try:
        url = f"https://www.bing.com/images/search?q={requests.utils.quote(query)}&form=HDRSC2"
        resp = requests.get(url, headers=HEADERS, timeout=6)
        if resp.status_code == 200:
            urls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', resp.text)
            for u in urls:
                u_lower = u.lower()
                if u_lower.endswith(('.jpg', '.jpeg', '.png', '.webp')) and not any(
                    x in u_lower for x in ['.svg', 'logo', 'icon', 'youtube', 'facebook', 'avatar', 'banner', 'vector', 'transparent']
                ):
                    return u
    except Exception:
        pass
    return ""


def search_wikipedia_campus_image(college_name: str) -> str:
    """Fetch official main campus photo from Wikipedia API."""
    try:
        wiki_title = college_name.replace(" ", "_")
        url = f"https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles={requests.utils.quote(wiki_title)}"
        resp = requests.get(url, headers={"User-Agent": "GujaratCollegeAssistantBot/1.0"}, timeout=5)
        if resp.status_code == 200:
            pages = resp.json().get("query", {}).get("pages", {})
            for p in pages.values():
                src = p.get("original", {}).get("source")
                if src and src.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    return src
    except Exception:
        pass
    return ""


def scrape_real_campus_image(college: College) -> str:
    """Multi-source resolver for real campus images."""
    name = college.name or ""
    city = college.city or "Gujarat"

    # 1. Wikipedia API check for major universities
    wiki_img = search_wikipedia_campus_image(name)
    if wiki_img:
        return wiki_img

    # 2. Bing Image Search for authentic campus building / drone view
    query = f"{name} {city} Gujarat campus building photo"
    bing_img = search_bing_campus_image(query)
    if bing_img:
        return bing_img

    # 3. Alternative query
    query2 = f"{name} Gujarat main building photo"
    bing_img2 = search_bing_campus_image(query2)
    if bing_img2:
        return bing_img2

    return ""


def run_pipeline(limit: int = 100, force: bool = False):
    db: Session = SessionLocal()
    try:
        query = db.query(College)
        total_count = query.count()
        print(f"Starting Real Campus Photo Scraper Pipeline across {total_count} DB records (force={force})...")

        if limit > 0:
            colleges = query.limit(limit).all()
        else:
            colleges = query.all()

        updated_count = 0
        batch_size = 50

        for idx, col in enumerate(tqdm(colleges, desc="Scraping Campus Photos")):
            # Skip if image_url is already populated unless force is True
            if not force and col.image_url and col.image_url.startswith("http"):
                continue

            img_url = scrape_real_campus_image(col)
            if img_url:
                col.image_url = img_url
                updated_count += 1
                tqdm.write(f"[{idx+1}/{len(colleges)}] Updated {col.name} -> {img_url[:60]}...")
            else:
                tqdm.write(f"[{idx+1}/{len(colleges)}] Retained current for {col.name}")

            # Rate-limiting delay
            time.sleep(0.15)

            # Batch commit every 50 records
            if updated_count > 0 and updated_count % batch_size == 0:
                db.commit()
                tqdm.write(f"Batch committed {updated_count} updated records to PostgreSQL/SQLite database.")

        db.commit()
        print(f"\nSCRAPING PIPELINE COMPLETE! Total updated campus photos: {updated_count}/{len(colleges)}")

    except Exception as e:
        db.rollback()
        print(f"Error during scraping pipeline: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scrape real college campus photos for database records.")
    parser.add_argument("--limit", type=int, default=100, help="Limit number of colleges to process (0 for all)")
    parser.add_argument("--force", action="store_true", help="Force overwrite existing image_url records")
    args = parser.parse_args()

    run_pipeline(limit=args.limit, force=args.force)
