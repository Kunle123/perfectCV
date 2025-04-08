"""
Simple Flask server for testing authentication
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import json
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import logging
from ai_service import analyze_resume_against_job
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create a new Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('JWT_SECRET', 'dev_secret_key_for_testing')

# Enable CORS with proper configuration
CORS(app, 
     resources={r"/api/*": {"origins": "*"}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "Accept"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Database setup
DB_PATH = os.environ.get('DB_PATH', 'test.db')

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            password TEXT NOT NULL
        )
        ''')
        conn.commit()

# Initialize the database
init_db()

# Helper functions
def get_user_by_email(email):
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        return cursor.fetchone()

def create_user(email, full_name, password):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        hashed_password = generate_password_hash(password)
        cursor.execute(
            "INSERT INTO users (email, full_name, password) VALUES (?, ?, ?)",
            (email, full_name, hashed_password)
        )
        conn.commit()
        user_id = cursor.lastrowid
        return user_id

def generate_token(user_id):
    expiration = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    payload = {
        'sub': str(user_id),
        'exp': expiration
    }
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
    return token

# API endpoints
@app.route('/')
def home():
    return jsonify({"message": "Simple auth server is running"})

@app.route('/api/v1/auth/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    
    # Validate input
    if not email or not password or not full_name:
        return jsonify({"detail": "Email, password and full name are required"}), 400
    
    # Check if user already exists
    existing_user = get_user_by_email(email)
    if existing_user:
        return jsonify({"detail": "Email already registered"}), 400
    
    # Create new user
    try:
        user_id = create_user(email, full_name, password)
        token = generate_token(user_id)
        
        return jsonify({
            "id": user_id,
            "email": email,
            "full_name": full_name,
            "is_active": True,
            "is_superuser": False,
            "credits": 0,
            "access_token": token,
            "token_type": "bearer"
        }), 201
    except Exception as e:
        return jsonify({"detail": str(e)}), 500

@app.route('/api/v1/auth/login', methods=['POST'])
def login():
    # Handle different content types (JSON or form data)
    if request.is_json:
        data = request.json
    elif request.content_type and 'application/x-www-form-urlencoded' in request.content_type:
        data = request.form
    else:
        # Try to parse request body manually
        try:
            data = request.get_json(force=True)
        except Exception:
            data = {}
    
    # Log request details for debugging
    logger.info(f"Login request content type: {request.content_type}")
    logger.debug(f"Login request data: {data}")
    
    # Get login credentials
    email = data.get('username') or data.get('email')  # Support both username and email
    password = data.get('password')
    
    # Validate input
    if not email or not password:
        logger.warning(f"Login failed: Missing email or password")
        return jsonify({"detail": "Email and password are required"}), 400
    
    # Check if user exists
    user = get_user_by_email(email)
    if not user:
        logger.warning(f"Login failed: User not found - {email}")
        return jsonify({"detail": "Incorrect email or password"}), 401
    
    # Verify password
    if not check_password_hash(user['password'], password):
        logger.warning(f"Login failed: Incorrect password - {email}")
        return jsonify({"detail": "Incorrect email or password"}), 401
    
    # Generate token
    token = generate_token(user['id'])
    logger.info(f"Login successful: {email}")
    
    return jsonify({
        "id": user['id'],
        "email": user['email'],
        "full_name": user['full_name'],
        "is_active": True,
        "is_superuser": False,
        "credits": 0,
        "access_token": token,
        "token_type": "bearer"
    })

@app.route('/api/v1/auth/me', methods=['GET', 'OPTIONS'])
def get_current_user():
    # Get and validate token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        logger.warning("User authentication failed: No authorization header")
        return jsonify({"detail": "Not authenticated"}), 401
    
    token = auth_header.split(' ')[1]
    try:
        # Decode the token
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = payload.get('sub')
        
        if not user_id:
            logger.warning("User authentication failed: Invalid token - no user ID")
            return jsonify({"detail": "Invalid token"}), 401
            
        # Get user from database
        user = None
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            user = cursor.fetchone()
            
        if not user:
            logger.warning(f"User authentication failed: User not found - ID {user_id}")
            return jsonify({"detail": "User not found"}), 404
            
        # Return user data
        logger.info(f"User authenticated: {user['email']}")
        return jsonify({
            "id": user['id'],
            "email": user['email'],
            "full_name": user['full_name'],
            "is_active": True,
            "is_superuser": False,
            "credits": 0
        })
    except jwt.ExpiredSignatureError:
        logger.warning("User authentication failed: Token expired")
        return jsonify({"detail": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        logger.warning("User authentication failed: Invalid token")
        return jsonify({"detail": "Invalid token"}), 401
    except Exception as e:
        logger.error(f"Error in get_current_user: {str(e)}")
        return jsonify({"detail": "Server error"}), 500

@app.route('/api/v1/resumes/upload', methods=['POST'])
def upload_resume():
    """Handle resume file upload"""
    logger.info("Resume upload endpoint hit")
    # Get and validate token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"detail": "Not authenticated"}), 401
    
    token = auth_header.split(' ')[1]
    try:
        # Decode the token
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = payload.get('sub')
        
        if not user_id:
            return jsonify({"detail": "Invalid token"}), 401
            
        # In a real app, we would process the file upload here
        # For our test, we'll just return a mock response
        
        logger.info(f"Request JSON: {request.json}")
        
        # Check if request has the required data
        if not request.json or 'title' not in request.json:
            return jsonify({"detail": "Missing required data"}), 400
            
        title = request.json.get('title')
        content = request.json.get('content', {})
        
        # Create a mock resume response
        resume_id = 1  # In a real app, this would be from the database
        
        response_data = {
            "id": resume_id,
            "user_id": user_id,
            "title": title,
            "content": content,
            "status": "uploaded",
            "created_at": datetime.datetime.utcnow().isoformat()
        }
        
        logger.info(f"Resume uploaded successfully: ID={resume_id}, Title={title}")
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error in upload_resume: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"detail": "Server error"}), 500
        
@app.route('/api/v1/job-descriptions', methods=['POST'])
def create_job_description():
    """Create a job description"""
    logger.info("Job description creation endpoint hit")
    # Get and validate token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"detail": "Not authenticated"}), 401
    
    token = auth_header.split(' ')[1]
    try:
        # Decode the token
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = payload.get('sub')
        
        if not user_id:
            return jsonify({"detail": "Invalid token"}), 401
            
        # Check if request has the required data
        if not request.json or 'title' not in request.json or 'description' not in request.json:
            return jsonify({"detail": "Missing required data"}), 400
            
        title = request.json.get('title')
        company = request.json.get('company', '')
        description = request.json.get('description')
        
        # Create a mock job description response
        job_id = 1  # In a real app, this would be from the database
        
        response_data = {
            "id": job_id,
            "user_id": user_id,
            "title": title,
            "company": company,
            "description": description,
            "created_at": datetime.datetime.utcnow().isoformat()
        }
        
        logger.info(f"Job description created successfully: ID={job_id}, Title={title}")
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error in create_job_description: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"detail": "Server error"}), 500
        
@app.route('/api/v1/optimizations/optimize-resume', methods=['POST'])
def optimize_resume():
    """Optimize resume based on job description"""
    logger.info("Resume optimization endpoint hit")
    # Get and validate token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"detail": "Not authenticated"}), 401
    
    token = auth_header.split(' ')[1]
    try:
        # Decode the token
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = payload.get('sub')
        
        if not user_id:
            return jsonify({"detail": "Invalid token"}), 401
            
        # Check if request has the required data
        if not request.json or 'resume_id' not in request.json or 'job_description_id' not in request.json:
            return jsonify({"detail": "Missing required data"}), 400
            
        resume_id = request.json.get('resume_id')
        job_description_id = request.json.get('job_description_id')
        
        # In a real app, we would retrieve the resume and job description from the database
        # For our test server, we'll use in-memory data instead
        
        # Get resume content - in a real app this would come from database
        resume_content = get_resume_by_id(resume_id, user_id)
        if not resume_content:
            return jsonify({"detail": "Resume not found"}), 404
            
        # Get job description - in a real app this would come from database
        job_description = get_job_description_by_id(job_description_id, user_id)
        if not job_description:
            return jsonify({"detail": "Job description not found"}), 404
            
        # Use AI service to optimize the resume
        logger.info(f"Optimizing resume {resume_id} for job description {job_description_id}")
        optimization_result = analyze_resume_against_job(
            resume_content['content'], 
            job_description['description']
        )
        
        # Create the response
        response_data = {
            "id": 1,  # In a real app, this would be from the database
            "resume_id": resume_id,
            "job_description_id": job_description_id,
            "user_id": user_id,
            "optimized_content": optimization_result["optimized_content"],
            "score": optimization_result["score"],
            "feedback": optimization_result["feedback"],
            "created_at": datetime.datetime.utcnow().isoformat()
        }
        
        logger.info(f"Resume optimization completed with score: {optimization_result['score']}")
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error in optimize_resume: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"detail": "Server error"}), 500

# Helper functions for in-memory data storage
# In a real app, these would interact with the database
def get_resume_by_id(resume_id, user_id):
    """Get resume by ID - mock implementation"""
    # This is just a mock implementation for testing
    # In a real app, this would retrieve from the database
    return {
        "id": resume_id,
        "user_id": user_id,
        "title": "My Resume",
        "content": {
            "contact": {
                "name": "John Doe",
                "email": "john.doe@example.com",
                "phone": "123-456-7890",
                "address": "123 Main St, City, State"
            },
            "summary": "Experienced software developer with a passion for creating efficient and scalable applications.",
            "experience": [
                {
                    "title": "Software Engineer",
                    "company": "Tech Company",
                    "location": "City, State",
                    "start_date": "2020-01",
                    "end_date": "Present",
                    "description": "Developed web applications using Python and React."
                },
                {
                    "title": "Junior Developer",
                    "company": "Small Startup",
                    "location": "City, State",
                    "start_date": "2018-06",
                    "end_date": "2019-12",
                    "description": "Built and maintained websites for clients."
                }
            ],
            "education": [
                {
                    "degree": "BS Computer Science",
                    "institution": "University",
                    "location": "City, State",
                    "graduation_date": "2018"
                }
            ],
            "skills": ["Python", "JavaScript", "React", "Node.js", "SQL", "Git"]
        },
        "status": "uploaded",
        "created_at": datetime.datetime.utcnow().isoformat()
    }

def get_job_description_by_id(job_id, user_id):
    """Get job description by ID - mock implementation"""
    # This is just a mock implementation for testing
    # In a real app, this would retrieve from the database
    return {
        "id": job_id,
        "user_id": user_id,
        "title": "Software Engineer",
        "company": "Great Company",
        "description": """
        We are looking for a skilled Software Engineer to join our team. The ideal candidate has:
        
        - 3+ years of experience with Python development
        - Experience with web frameworks such as Flask or FastAPI
        - Strong understanding of databases and SQL
        - Experience with front-end technologies (React preferred)
        - Knowledge of cloud services (AWS, Azure, or GCP)
        - Good understanding of software development principles
        - Ability to work in an agile environment
        
        Responsibilities:
        - Develop and maintain web applications
        - Write clean, efficient, and well-documented code
        - Participate in code reviews
        - Troubleshoot and debug applications
        - Collaborate with cross-functional teams
        """,
        "created_at": datetime.datetime.utcnow().isoformat()
    }

if __name__ == '__main__':
    print("Starting simple authentication server on http://127.0.0.1:5000")
    print("Endpoints:")
    print("  - POST /api/v1/auth/register")
    print("  - POST /api/v1/auth/login")
    print("  - GET /api/v1/auth/me")
    print("  - POST /api/v1/resumes/upload")
    print("  - POST /api/v1/job-descriptions")
    print("  - POST /api/v1/optimizations/optimize-resume")
    app.run(debug=True, host='127.0.0.1', port=5000) 