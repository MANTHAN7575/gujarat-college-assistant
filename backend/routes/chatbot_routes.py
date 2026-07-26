from flask import Blueprint, request, jsonify

from rapidfuzz import process

from sqlalchemy import text

from database import engine

from services.gemini_service import generate_ai_response

chatbot_bp = Blueprint("chatbot_bp", __name__)

conversation_memory = {
    "last_college": None,
    "last_intent": None
}

# Detect College Name
def detect_college(user_query):

    colleges = [
        "Pandit Deendayal Energy University",
        "Dhirubhai Ambani Institute of Information and Communication Technology",
        "Nirma University",
        "LD College of Engineering",
        "VGEC",
        "CHARUSAT",
        "Ganpat University",
        "Silver Oak University",
        "LJ University",
        "Marwadi University",
        "Adani University"
    ]

    query = user_query.lower()

    match = process.extractOne(
        query,
        colleges,
        score_cutoff=50
    )

    if match:

        return match[0]

    return None


# Detect Intent
def detect_intent(user_query):

    query = user_query.lower()

    placement_keywords = [
        "placement",
        "package",
        "salary",
        "job"
    ]

    fees_keywords = [
        "fees",
        "cost",
        "price"
    ]

    hostel_keywords = [
        "hostel",
        "facility",
        "wifi",
        "gym"
    ]

    recommendation_keywords = [
        "recommend",
        "suggest",
        "best college",
        "good college",
        "%"
    ]

    for word in placement_keywords:
        if word in query:
            return "placements"

    for word in fees_keywords:
        if word in query:
            return "fees"

    for word in hostel_keywords:
        if word in query:
            return "facilities"

    for word in recommendation_keywords:
        if word in query:
            return "recommendation"

    # Conversational follow-up understanding

    if "what about" in query or "how about" in query:

     if "placement" in query:
        return "placements"

    if "hostel" in query:
        return "facilities"

    if "fees" in query:
        return "fees"

    return "general"

import re


def extract_percentage(user_query):

    match = re.search(r'(\d{2})\s*%', user_query)

    if match:

        return int(match.group(1))

    return None

@chatbot_bp.route("/api/chat", methods=["POST"])
def chat():

    data = request.json

    user_query = data.get("message", "")

    detected_college = detect_college(user_query)

    detected_intent = detect_intent(user_query)

# Use memory if college not mentioned
    if not detected_college:

     detected_college = conversation_memory["last_college"]

# Update memory
    if detected_college:

     conversation_memory["last_college"] = detected_college

     conversation_memory["last_intent"] = detected_intent
    
    percentage = extract_percentage(user_query)

    context_data = {}

    with engine.connect() as connection:

        # Recommendation Logic
        if detected_intent == "recommendation":

            if percentage and percentage < 70:

                result = connection.execute(text("""
                    SELECT
                        name,
                        city,
                        college_type
                    FROM colleges
                    LIMIT 5
                """))

            else:

                result = connection.execute(text("""
                    SELECT
                        name,
                        city,
                        college_type
                    FROM colleges
                    LIMIT 5
                """))

            recommendations = [
                dict(row._mapping)
                for row in result
            ]

            context_data = {
                "recommendations": recommendations,
                "percentage": percentage
            }

        # College Specific Queries
        elif detected_college:

            # PLACEMENT QUERIES
            if detected_intent == "placements":

                result = connection.execute(text("""
                    SELECT
                        colleges.name,

                        placements.average_package,
                        placements.highest_package,
                        placements.placement_percentage,
                        placements.top_recruiters

                    FROM colleges

                    LEFT JOIN placements
                    ON colleges.id = placements.college_id

                    WHERE LOWER(colleges.name)
                    LIKE LOWER(:college)
                """), {
                    "college": f"%{detected_college}%"
                })

            # FEES QUERIES
            elif detected_intent == "fees":

                result = connection.execute(text("""
                    SELECT
                        colleges.name,
                        courses.course_name,
                        courses.annual_fees

                    FROM colleges

                    LEFT JOIN courses
                    ON colleges.id = courses.college_id

                    WHERE LOWER(colleges.name)
                    LIKE LOWER(:college)
                """), {
                    "college": f"%{detected_college}%"
                })

            # FACILITY QUERIES
            elif detected_intent == "facilities":

                result = connection.execute(text("""
                    SELECT
                        colleges.name,

                        facilities.hostel,
                        facilities.library,
                        facilities.wifi,
                        facilities.gym,
                        facilities.sports

                    FROM colleges

                    LEFT JOIN facilities
                    ON colleges.id = facilities.college_id

                    WHERE LOWER(colleges.name)
                    LIKE LOWER(:college)
                """), {
                    "college": f"%{detected_college}%"
                })

            # GENERAL INFO
            else:

                result = connection.execute(text("""
                    SELECT
                        name,
                        city,
                        description,
                        college_type

                    FROM colleges

                    WHERE LOWER(name)
                    LIKE LOWER(:college)
                """), {
                    "college": f"%{detected_college}%"
                })

            college = result.fetchone()

            if college:

                context_data = dict(college._mapping)

        # General Queries
        else:

            result = connection.execute(text("""
                SELECT
                    name,
                    city,
                    college_type
                FROM colleges
                LIMIT 5
            """))

            colleges = [
                dict(row._mapping)
                for row in result
            ]

            context_data = {
                "colleges": colleges
            }

    ai_response = generate_ai_response(
        user_query,
        context_data
    )

    return jsonify({
        "response": ai_response,
        "intent": detected_intent,
        "college": detected_college
    })