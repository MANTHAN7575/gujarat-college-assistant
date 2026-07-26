import re
from typing import Optional, Dict, Any, List


def extract_rag_entities(query: str) -> Dict[str, Any]:
    """
    Parses user queries for college names, ACPC codes, and academic years.
    Differentiates 4-digit years (2020-2030) from college ACPC codes.
    """
    query_lower = query.strip().lower()

    # 1. Year vs ACPC Code Disambiguation
    four_digit_matches = re.findall(r'\b\d{4}\b', query_lower)
    is_academic_year = False
    detected_year = None
    
    for match in four_digit_matches:
        val = int(match)
        if 2020 <= val <= 2030:
            if any(k in query_lower for k in ['cutoff', 'year', 'neet', 'gujcet', 'admission', 'fees', 'merit', 'round', 'out', 'date']):
                is_academic_year = True
                detected_year = val
                break

    is_explicit_code = (
        "code 2026" in query_lower or
        "acpc code 2026" in query_lower or
        "code: 2026" in query_lower or
        ("acpc 2026" in query_lower and "code" in query_lower)
    )

    return {
        "is_academic_year": is_academic_year,
        "year": detected_year,
        "is_explicit_code": is_explicit_code,
        "raw_query": query
    }
