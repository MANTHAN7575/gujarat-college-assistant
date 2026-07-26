from sqlalchemy import text
from database import engine

# Get All Colleges
def get_all_colleges():

    with engine.connect() as connection:

        result = connection.execute(text("""
            SELECT id, name, city, college_type
            FROM colleges
            ORDER BY name
        """))

        colleges = []

        for row in result:
            colleges.append({
                "id": row.id,
                "name": row.name,
                "city": row.city,
                "college_type": row.college_type
            })

        return colleges


# Search Colleges
def search_colleges(keyword):

    with engine.connect() as connection:

        result = connection.execute(text("""
            SELECT id, name, city, college_type
            FROM colleges
            WHERE LOWER(name) LIKE LOWER(:keyword)
            ORDER BY name
        """), {
            "keyword": f"%{keyword}%"
        })

        colleges = []

        for row in result:
            colleges.append({
                "id": row.id,
                "name": row.name,
                "city": row.city,
                "college_type": row.college_type
            })

        return colleges


# Get College Details
def get_college_details(college_id):

    with engine.connect() as connection:

        college = connection.execute(text("""
            SELECT *
            FROM colleges
            WHERE id = :id
        """), {
            "id": college_id
        }).fetchone()

        if not college:
            return None

        courses = connection.execute(text("""
            SELECT *
            FROM courses
            WHERE college_id = :id
        """), {
            "id": college_id
        }).fetchall()

        placements = connection.execute(text("""
            SELECT *
            FROM placements
            WHERE college_id = :id
        """), {
            "id": college_id
        }).fetchone()

        facilities = connection.execute(text("""
            SELECT *
            FROM facilities
            WHERE college_id = :id
        """), {
            "id": college_id
        }).fetchone()

        return {
            "college": dict(college._mapping),
            "courses": [dict(course._mapping) for course in courses],
            "placements": dict(placements._mapping) if placements else {},
            "facilities": dict(facilities._mapping) if facilities else {}
        }