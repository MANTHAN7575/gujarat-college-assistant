#!/usr/bin/env python3
"""
Database Image Scrub & Strict Domain Rescraper Pipeline
Cleans dirty non-college images (anime, products, memes, blogs) and re-scrapes verified university campus photography from Wikipedia & trusted education domains (.ac.in, .edu.in, wikipedia.org, shiksha.com, collegedunia.com, unsplash.com).
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

BLACKLIST_KEYWORDS = [
    "dragonball", "undertale", "anime", "flashlight", "product", "game", "wallpaper",
    "avatar", "meme", "fandom", "wikia", "amazon", "ebay", "pinterest", "etsy",
    "biketo", "exblog", "poki", "wallpapercave", "quickmeme", "butai", "kitchensanctuary",
    "savingdinner", "pxhere", "vecteezy", "blogspot", "tumblr", "squarespace-cdn", "m.media-amazon",
    "cat-", "xb1.com", "thefinancialbrand", "pixabay"
]

EXCLUDED_IMAGE_TYPES = ["classroom", "lab", "interior", "bench", "desk", "library", "canteen", "student", "seminar", "people", "group", "lecture", "icon", "logo"]


def is_blacklisted_url(url: str) -> bool:
    """Return True if image URL contains random non-college keywords or domains."""
    if not url:
        return True
    u_lower = url.lower()
    for bad in BLACKLIST_KEYWORDS:
        if bad in u_lower:
            return True
    for bad_type in EXCLUDED_IMAGE_TYPES:
        if bad_type in u_lower:
            return True
    return False


def fetch_wikipedia_campus_photo(college_name: str) -> str:
    """Fetch official main campus photo from Wikipedia API."""
    try:
        wiki_title = college_name.replace(" ", "_")
        url = f"https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles={requests.utils.quote(wiki_title)}"
        resp = requests.get(url, headers={"User-Agent": "GujaratCollegeAssistant/1.0"}, timeout=5)
        if resp.status_code == 200:
            pages = resp.json().get("query", {}).get("pages", {})
            for p in pages.values():
                src = p.get("original", {}).get("source")
                if src and not is_blacklisted_url(src):
                    return src
    except Exception:
        pass
    return ""


def search_bing_education_domain_photo(college_name: str, city: str) -> str:
    """Fetch high-res campus photo from trusted education domains."""
    try:
        query = f"{college_name} {city} Gujarat campus building facade site:wikipedia.org OR site:ac.in OR site:edu.in OR site:shiksha.com OR site:collegedunia.com OR site:unsplash.com"
        url = f"https://www.bing.com/images/search?q={requests.utils.quote(query)}&form=HDRSC2"
        resp = requests.get(url, headers=HEADERS, timeout=6)
        if resp.status_code == 200:
            urls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', resp.text)
            for u in urls:
                if not is_blacklisted_url(u) and u.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    return u
    except Exception:
        pass
    return ""


def resolve_clean_campus_photo(college: College) -> str:
    """Scrape authentic exterior campus photography."""
    name = college.name or ""
    city = college.city or "Gujarat"

    # 1. Wikipedia API check
    wiki_img = fetch_wikipedia_campus_photo(name)
    if wiki_img:
        return wiki_img

    # 2. Strict Education Domain Search
    edu_img = search_bing_education_domain_photo(name, city)
    if edu_img:
        return edu_img

    return ""


def safe_str(s: str) -> str:
    """Sanitize string for Windows console print."""
    return s.encode('ascii', 'ignore').decode('ascii')


def run_pipeline(limit: int = 100, force: bool = False):
    db: Session = SessionLocal()
    try:
        query = db.query(College)
        total_count = query.count()
        print(f"Starting Database Image Scrub & Rescraper Pipeline across {total_count} DB records (force={force})...")

        colleges = query.limit(limit).all() if limit > 0 else query.all()

        scrubbed_count = 0
        updated_count = 0
        batch_size = 50

        for idx, col in enumerate(tqdm(colleges, desc="Scrubbing & Rescraping Campus Photos")):
            # Step 1: Scrub blacklisted / dirty URLs from DB
            if col.image_url and is_blacklisted_url(col.image_url):
                col.image_url = None
                scrubbed_count += 1

            # Step 2: Rescrape if image_url is missing or force is True
            if force or not col.image_url:
                clean_photo = resolve_clean_campus_photo(col)
                if clean_photo:
                    col.image_url = clean_photo
                    updated_count += 1
                    tqdm.write(safe_str(f"[{idx+1}/{len(colleges)}] Rescraped {col.name} -> {clean_photo[:65]}..."))
                else:
                    tqdm.write(safe_str(f"[{idx+1}/{len(colleges)}] Retained clean/fallback for {col.name}"))

            # Batch commit every 50 records
            if (updated_count + scrubbed_count) > 0 and (idx + 1) % batch_size == 0:
                db.commit()

        db.commit()
        print(f"\nCLEANUP & RESCRAPE COMPLETE! Scrubbed dirty records: {scrubbed_count}, Newly hydrated photos: {updated_count}")

    except Exception as e:
        db.rollback()
        print(f"Error during cleanup pipeline: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scrub random scraped images & rescrape from trusted education domains.")
    parser.add_argument("--limit", type=int, default=100, help="Limit number of colleges to process (0 for all)")
    parser.add_argument("--force", action="store_true", help="Force scrub and rescrape all records")
    args = parser.parse_args()

    run_pipeline(limit=args.limit, force=args.force)
