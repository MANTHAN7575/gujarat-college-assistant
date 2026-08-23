import os
import sys
import sqlite3

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine
from app.models.college import College

REAL_CAMPUS_URLS = {
    1: ("Pandit Deendayal Energy University (PDEU)", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Pandit_Deendayal_Energy_University_building.jpg/1280px-Pandit_Deendayal_Energy_University_building.jpg"),
    2: ("Dhirubhai Ambani Institute of Information and Communication Technology (DA-IICT)", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Daiict-campus.jpg/1024px-Daiict-campus.jpg"),
    10: ("CHARUSAT University", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Charotar_University_of_Science_and_Technology.jpg/960px-Charotar_University_of_Science_and_Technology.jpg"),
    16: ("Maharaja Sayajirao University of Baroda (MSU)", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/D.N.Hall%2C_Maharaja_Sayajirao_University_Of_Baroda.jpg/1280px-D.N.Hall%2C_Maharaja_Sayajirao_University_Of_Baroda.jpg")
}


def run_cleanup():
    print("--- RESTRICTING REAL WIKIMEDIA PHOTOS TO EXACT MATCHING COLLEGES ONLY ---")
    
    # 1. Update SQLite database directly
    sqlite_db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "gujarat_colleges.db")
    if os.path.exists(sqlite_db_path):
        conn = sqlite3.connect(sqlite_db_path)
        cur = conn.cursor()
        
        # Reset all image_url to NULL
        cur.execute("UPDATE colleges SET image_url = NULL;")
        
        # Assign the 4 verified URLs to their single exact college
        for col_id, (col_name, url) in REAL_CAMPUS_URLS.items():
            cur.execute("UPDATE colleges SET image_url = ? WHERE id = ?;", (url, col_id))
            print(f"Assigned verified image to ID {col_id}: {col_name}")
            
        conn.commit()
        
        # Verify counts in SQLite
        cur.execute("SELECT COUNT(*) FROM colleges;")
        total = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM colleges WHERE image_url IS NULL OR image_url = '';")
        null_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM colleges WHERE image_url IS NOT NULL AND image_url != '';")
        non_null_count = cur.fetchone()[0]
        
        print(f"\n[SQLite Verification]")
        print(f"Total Colleges: {total}")
        print(f"Colleges with image_url = NULL: {null_count}")
        print(f"Colleges with verified image_url: {non_null_count}")
        
        cur.execute("SELECT id, name, image_url FROM colleges WHERE image_url IS NOT NULL;")
        for r in cur.fetchall():
            print(f"  -> [{r[0]}] {r[1]} => {r[2]}")
            
        conn.close()

    # 2. Update via SQLAlchemy session (for PostgreSQL if available)
    try:
        db = SessionLocal()
        db.query(College).update({College.image_url: None})
        for col_id, (col_name, url) in REAL_CAMPUS_URLS.items():
            col = db.query(College).filter(College.id == col_id).first()
            if col:
                col.image_url = url
        db.commit()
        db.close()
        print("\nSQLAlchemy / Database engine sync completed.")
    except Exception as e:
        print(f"Note on DB engine session: {e}")

    print("\n--- CLEANUP FINISHED SUCCESSFULLY ---")


if __name__ == "__main__":
    run_cleanup()
