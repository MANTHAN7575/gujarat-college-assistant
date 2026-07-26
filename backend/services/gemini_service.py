import google.generativeai as genai

from config import Config

genai.configure(api_key=Config.GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.5-flash")


def generate_ai_response(user_query, college_data):

    prompt = f"""
    You are Gujarat College Assistant.

    Use ONLY the provided college information.

    If information is unavailable, say:
    "Information currently unavailable."

    USER QUESTION:
    {user_query}

    COLLEGE DATA:
    {college_data}

    Give a helpful student-friendly response.
    """

    response = model.generate_content(prompt)

    return response.text