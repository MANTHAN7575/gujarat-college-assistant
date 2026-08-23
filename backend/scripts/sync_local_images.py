import os
import sys
import sqlite3

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.college import College


def sync_images():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    static_dir = os.path.join(base_dir, "static", "campus_images")
    os.makedirs(static_dir, exist_ok=True)
    
    files = os.listdir(static_dir)
    print(f"Files found on disk in backend/static/campus_images: {len(files)}")
    
    # 1. Update SQLite database
    sqlite_path = os.path.join(os.path.dirname(base_dir), "gujarat_colleges.db")
    if os.path.exists(sqlite_path):
        conn = sqlite3.connect(sqlite_path)
        cur = conn.cursor()
        
        # Reset all image_url to NULL
        cur.execute("UPDATE colleges SET image_url = NULL;")
        
        updated = 0
        for f in files:
            if f.endswith(('.jpg', '.jpeg', '.png', '.webp')):
                col_id_str = f.split('.')[0]
                if col_id_str.isdigit():
                    col_id = int(col_id_str)
                    rel_path = f"/static/campus_images/{f}"
                    cur.execute("UPDATE colleges SET image_url = ? WHERE id = ?;", (rel_path, col_id))
                    updated += 1
                    
        conn.commit()
        
        cur.execute("SELECT COUNT(*) FROM colleges;")
        total = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM colleges WHERE image_url IS NOT NULL AND image_url != '';")
        with_img = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM colleges WHERE image_url IS NULL OR image_url = '';")
        null_count = cur.fetchone()[0]
        
        print("\n=======================================================")
        print("DATABASE & LOCAL FILE STORAGE SYNCHRONIZATION")
        print(f"Total Colleges: {total}")
        print(f"Colleges with Verified Local Image (/static/campus_images/): {with_img}")
        print(f"Colleges with Honest NULL (Stream Category Banner): {null_count}")
        print("=======================================================\n")
        
        cur.execute("SELECT id, name, image_url FROM colleges WHERE image_url IS NOT NULL ORDER BY id;")
        for r in cur.fetchall():
            file_abs = os.path.join(base_dir, r[2].lstrip("/"))
            file_size_kb = os.path.getsize(file_abs) / 1024 if os.path.exists(file_abs) else 0
            print(f"  [{r[0]:3d}] {r[1]} -> {r[2]} ({file_size_kb:.1f} KB)")
            
        conn.close()

    # 2. Update SQLAlchemy session
    try:
        db = SessionLocal()
        db.query(College).update({College.image_url: None})
        for f in files:
            if f.endswith(('.jpg', '.jpeg', '.png', '.webp')):
                col_id_str = f.split('.')[0]
                if col_id_str.isdigit():
                    col_id = int(col_id_str)
                    col = db.query(College).filter(College.id == col_id).first()
                    if col:
                        col.image_url = f"/static/campus_images/{f}"
        db.commit()
        db.close()
    except Exception as e:
        print(f"SQLAlchemy sync note: {e}")


if __name__ == "__main__":
    sync_images()
