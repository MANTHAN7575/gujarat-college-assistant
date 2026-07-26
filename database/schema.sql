CREATE TABLE colleges (
    id SERIAL PRIMARY KEY,
    
    name VARCHAR(255) NOT NULL,
    
    city VARCHAR(100),
    
    district VARCHAR(100),
    
    state VARCHAR(100) DEFAULT 'Gujarat',
    
    college_type VARCHAR(100),
    
    ownership VARCHAR(100),
    
    affiliation VARCHAR(255),
    
    established_year INT,
    
    website VARCHAR(255),
    
    email VARCHAR(255),
    
    phone VARCHAR(50),
    
    address TEXT,
    
    description TEXT,
    
    nirf_rank INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    
    college_id INT REFERENCES colleges(id) ON DELETE CASCADE,
    
    course_name VARCHAR(255) NOT NULL,
    
    degree_type VARCHAR(100),
    
    duration VARCHAR(50),
    
    annual_fees DECIMAL(10,2),
    
    total_seats INT,
    
    eligibility TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE placements (
    id SERIAL PRIMARY KEY,
    
    college_id INT REFERENCES colleges(id) ON DELETE CASCADE,
    
    average_package DECIMAL(10,2),
    
    highest_package DECIMAL(10,2),
    
    placement_percentage DECIMAL(5,2),
    
    top_recruiters TEXT,
    
    placement_details TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE facilities (
    id SERIAL PRIMARY KEY,
    
    college_id INT REFERENCES colleges(id) ON DELETE CASCADE,
    
    hostel BOOLEAN DEFAULT FALSE,
    
    library BOOLEAN DEFAULT FALSE,
    
    wifi BOOLEAN DEFAULT FALSE,
    
    sports BOOLEAN DEFAULT FALSE,
    
    transport BOOLEAN DEFAULT FALSE,
    
    cafeteria BOOLEAN DEFAULT FALSE,
    
    medical BOOLEAN DEFAULT FALSE,
    
    gym BOOLEAN DEFAULT FALSE,
    
    facility_details TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    
    college_id INT REFERENCES colleges(id) ON DELETE CASCADE,
    
    tech_fest VARCHAR(255),
    
    cultural_fest VARCHAR(255),
    
    hackathons TEXT,
    
    workshops TEXT,
    
    event_details TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admissions (
    id SERIAL PRIMARY KEY,
    
    college_id INT REFERENCES colleges(id) ON DELETE CASCADE,
    
    admission_process TEXT,
    
    entrance_exams TEXT,
    
    cutoff_details TEXT,
    
    admission_contact TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    
    college_id INT REFERENCES colleges(id) ON DELETE CASCADE,
    
    student_name VARCHAR(255),
    
    rating DECIMAL(2,1),
    
    review_text TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chatbot_logs (
    id SERIAL PRIMARY KEY,
    
    user_query TEXT,
    
    detected_college VARCHAR(255),
    
    detected_intent VARCHAR(255),
    
    chatbot_response TEXT,
    
    response_source VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);