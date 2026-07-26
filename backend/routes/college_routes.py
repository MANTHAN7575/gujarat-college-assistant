from flask import Blueprint, jsonify, request

from services.college_service import (
    get_all_colleges,
    search_colleges,
    get_college_details
)

college_bp = Blueprint('college_bp', __name__)

# Get All Colleges
@college_bp.route('/api/colleges', methods=['GET'])
def colleges():

    data = get_all_colleges()

    return jsonify(data)


# Search Colleges
@college_bp.route('/api/search', methods=['GET'])
def search():

    keyword = request.args.get('keyword', '')

    data = search_colleges(keyword)

    return jsonify(data)


# Get College Details
@college_bp.route('/api/college/<int:college_id>', methods=['GET'])
def college_details(college_id):

    data = get_college_details(college_id)

    if not data:
        return jsonify({
            "error": "College not found"
        }), 404

    return jsonify(data)