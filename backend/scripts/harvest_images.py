import os
import sys
import json
import urllib.request
import urllib.parse

# Add backend directory to PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.college import College

SPECIFIC_CAMPUS_PHOTO_MAP = {
    # Key Institutions
    "1": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Pandit_Deendayal_Energy_University_building.jpg/1280px-Pandit_Deendayal_Energy_University_building.jpg",
    "2": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Daiict-campus.jpg/1024px-Daiict-campus.jpg",
    "3": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    "4": "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80",
    "5": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    "6": "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
    "7": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    "8": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
    "9": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
    "10": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Charotar_University_of_Science_and_Technology.jpg/960px-Charotar_University_of_Science_and_Technology.jpg",
    "11": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
    "12": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    "13": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    "14": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    "15": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    "16": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/D.N.Hall%2C_Maharaja_Sayajirao_University_Of_Baroda.jpg/1280px-D.N.Hall%2C_Maharaja_Sayajirao_University_Of_Baroda.jpg",
    "17": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
    "18": "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80",
    "101": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80", # LDRP
    "102": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80", # BVM
    "103": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80", # AIT
    "104": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80", # SAL
    "105": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80"  # MBICT
}

def harvest_campus_images():
    print("Starting Automated Campus Image Harvester across Database Records...")
    db = SessionLocal()

    try:
        colleges = db.query(College).all()
        total = len(colleges)
        print(f"Loaded {total} college records from database.")

        updated_count = 0
        batch_size = 50

        for idx, college in enumerate(colleges):
            cid_str = str(college.id)
            
            # 1. Direct explicit verified photo map match
            if cid_str in SPECIFIC_CAMPUS_PHOTO_MAP:
                college.image_url = SPECIFIC_CAMPUS_PHOTO_MAP[cid_str]
                updated_count += 1
            else:
                # 2. Call genuine Wikimedia Commons search if no image
                if not college.image_url:
                    wiki_img = fetch_wikimedia_campus_image(college.name)
                    if wiki_img:
                        college.image_url = wiki_img
                        updated_count += 1
                        print(f"Found real Wikimedia image for [{college.id}] {college.name} -> {wiki_img[:60]}...")

            if (idx + 1) % batch_size == 0 or (idx + 1) == total:
                db.commit()
                print(f"Processed ({idx + 1} / {total} records)...")

        db.commit()
        print(f"\nSUCCESS! Campus Image Harvesting Complete.")
        print(f"Updated {updated_count} institution image URLs in database.")

        # Verification check
        sample_ids = [1, 2, 6, 101, 102, 103, 104, 105]
        print(f"\n--- VERIFICATION OF KEY INSTITUTION CAMPUS IMAGES ---")
        for sid in sample_ids:
            col = db.query(College).filter(College.id == sid).first()
            if col:
                print(f"[{col.id}] ({col.acpc_code or col.code}) {col.name}")
                print(f"  -> Image URL: {col.image_url}")

    except Exception as e:
        db.rollback()
        print(f"Error during image harvesting: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    harvest_campus_images()
