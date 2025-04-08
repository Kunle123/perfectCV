"""
Test script for CV upload and optimization
"""
import requests
import json
import sys
import argparse

API_URL = "http://127.0.0.1:5000/api/v1"
TOKEN = None  # Will be populated after login

def login(email="test@example.com", password="password123"):
    """Login to get access token"""
    print("\n=== Login to get access token ===")
    url = f"{API_URL}/auth/login"
    data = {
        "username": email,
        "password": password
    }
    
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            global TOKEN
            TOKEN = response.json()["access_token"]
            print(f"✅ Login successful! Token: {TOKEN[:10]}...")
            return True
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def upload_resume(title="My Resume", content=None):
    """Upload a resume"""
    if not TOKEN:
        print("❌ Not logged in. Please login first.")
        return None
        
    print("\n=== Uploading Resume ===")
    url = f"{API_URL}/resumes/upload"
    
    if content is None:
        content = {
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
        }
    
    data = {
        "title": title,
        "content": content
    }
    
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Print the request for debugging
    print(f"Request URL: {url}")
    print(f"Request Headers: {headers}")
    print(f"Request Data: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"Response Status: {response.status_code}")
        print(f"Response Text: {response.text}")
        
        if response.status_code in [200, 201]:
            resume_data = response.json()
            print(f"✅ Resume uploaded! Resume ID: {resume_data['id']}")
            print(f"Title: {resume_data['title']}")
            return resume_data
        else:
            print(f"❌ Resume upload failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def create_job_description(title="Software Engineer", company="Great Company", description=None):
    """Create a job description"""
    if not TOKEN:
        print("❌ Not logged in. Please login first.")
        return None
        
    print("\n=== Creating Job Description ===")
    url = f"{API_URL}/job-descriptions"
    
    if description is None:
        description = """
        We are looking for a skilled Software Engineer to join our team!
        
        Responsibilities:
        - Develop high-quality web applications using Python and React
        - Collaborate with team members on project planning and implementation
        - Write clean, maintainable, and efficient code
        - Debug and fix issues in existing applications
        
        Requirements:
        - 2+ years of experience in software development
        - Proficiency in Python programming
        - Experience with React.js or similar frontend frameworks
        - Knowledge of database technologies (SQL, NoSQL)
        - Version control systems (Git)
        - Strong problem-solving skills
        - Good communication skills
        
        Nice to have:
        - Experience with FastAPI or Flask
        - Knowledge of Docker and containerization
        - CI/CD experience
        - AWS or other cloud platform experience
        """
    
    data = {
        "title": title,
        "company": company,
        "description": description
    }
    
    headers = {
        "Authorization": f"Bearer {TOKEN}"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code in [200, 201]:
            job_data = response.json()
            print(f"✅ Job description created! Job ID: {job_data['id']}")
            print(f"Title: {job_data['title']}")
            print(f"Company: {job_data['company']}")
            return job_data
        else:
            print(f"❌ Job description creation failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def optimize_resume(resume_id, job_description_id):
    """Optimize a resume based on a job description"""
    if not TOKEN:
        print("❌ Not logged in. Please login first.")
        return None
        
    print("\n=== Optimizing Resume ===")
    url = f"{API_URL}/optimizations/optimize-resume"
    
    data = {
        "resume_id": resume_id,
        "job_description_id": job_description_id
    }
    
    headers = {
        "Authorization": f"Bearer {TOKEN}"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code in [200, 201]:
            optimization_data = response.json()
            print(f"✅ Resume optimized! Optimization ID: {optimization_data['id']}")
            print(f"Score: {optimization_data['score']}")
            print(f"Feedback: {optimization_data['feedback']}")
            
            print("\nOptimized Resume Summary:")
            print(f"- {optimization_data['optimized_content']['summary']}")
            
            print("\nKey Skills:")
            for skill in optimization_data['optimized_content']['skills']:
                print(f"- {skill}")
                
            print("\nExperience Highlights:")
            for exp in optimization_data['optimized_content']['experience']:
                print(f"- {exp['title']} at {exp['company']}")
                for highlight in exp.get('highlights', []):
                    print(f"  * {highlight}")
            
            return optimization_data
        else:
            print(f"❌ Resume optimization failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def run_full_test():
    """Run a full test of the CV optimization flow"""
    print("\n======= RUNNING FULL TEST =======")
    
    # Step 1: Login
    print("\nStep 1: Login")
    if not login():
        print("❌ Test failed at login step")
        return
    
    # Step 2: Upload Resume
    print("\nStep 2: Upload Resume")
    resume = upload_resume()
    if not resume or 'id' not in resume:
        print("❌ Test failed at resume upload step")
        return
    
    resume_id = resume['id']
    print(f"Resume ID: {resume_id}")
    
    # Step 3: Create Job Description
    print("\nStep 3: Create Job Description")
    job = create_job_description()
    if not job or 'id' not in job:
        print("❌ Test failed at job description creation step")
        return
    
    job_id = job['id']
    print(f"Job Description ID: {job_id}")
    
    # Step 4: Optimize Resume
    print("\nStep 4: Optimize Resume")
    optimization = optimize_resume(resume_id, job_id)
    if not optimization:
        print("❌ Test failed at resume optimization step")
        return
    
    print("✅ Full test completed successfully!")
    print("\n===============================")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test CV upload and optimization")
    parser.add_argument("--email", help="Email for login")
    parser.add_argument("--password", help="Password for login")
    parser.add_argument("--step", choices=["login", "upload", "job", "optimize", "all"], 
                       default="all", help="Which step to run")
    args = parser.parse_args()
    
    if args.step == "login":
        if args.email and args.password:
            login(args.email, args.password)
        else:
            login()
    elif args.step == "upload":
        if login():
            upload_resume()
    elif args.step == "job":
        if login():
            create_job_description()
    elif args.step == "optimize":
        if login():
            resume = upload_resume()
            job = create_job_description()
            if resume and job:
                optimize_resume(resume['id'], job['id'])
    else:  # default to "all"
        if args.email and args.password:
            login(args.email, args.password)
        else:
            run_full_test() 