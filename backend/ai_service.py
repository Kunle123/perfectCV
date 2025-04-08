"""
AI Service for PerfectCV resume optimization
"""
import os
import json
from openai import OpenAI
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize the OpenAI client
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    logger.warning("OPENAI_API_KEY not found in environment variables. AI features will not work correctly!")

client = OpenAI(api_key=api_key)

def analyze_resume_against_job(resume_content, job_description):
    """
    Analyze a resume against a job description and return optimization suggestions
    
    Args:
        resume_content (dict): The parsed resume content
        job_description (str): The job description text
        
    Returns:
        dict: Optimized resume content and feedback
    """
    try:
        logger.info("Starting resume analysis against job description")
        
        # Check if API key is available
        if not os.environ.get("OPENAI_API_KEY") or os.environ.get("OPENAI_API_KEY").startswith("sk-your-key"):
            logger.warning("No valid OpenAI API key found - using mock AI response for testing")
            return generate_mock_optimization(resume_content, job_description)
        
        # Continue with actual OpenAI API call if we have a valid key
        # Convert resume content to a readable format for the AI
        resume_text = format_resume_for_ai(resume_content)
        
        # Prepare prompt for the AI
        prompt = f"""
        You are an expert resume consultant. Your task is to analyze this resume against the job description and provide optimization suggestions.
        
        RESUME:
        {resume_text}
        
        JOB DESCRIPTION:
        {job_description}
        
        Please provide:
        1. An optimized professional summary tailored to this job
        2. A list of the most relevant skills for this position
        3. Suggestions for how to better present experience to match job requirements
        4. A score from 0-100 indicating how well the resume matches the job description
        5. Specific feedback for improvement
        
        Format your response as a JSON object with the following structure:
        {{
            "optimized_summary": "string",
            "relevant_skills": ["skill1", "skill2", ...],
            "experience_suggestions": [{{
                "title": "string",
                "company": "string",
                "description": "string",
                "highlights": ["highlight1", "highlight2", ...]
            }}],
            "match_score": integer,
            "feedback": "string"
        }}
        """
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4-turbo",  # Use appropriate model
            messages=[
                {"role": "system", "content": "You are an expert resume optimizer that helps people tailor their resumes to specific job descriptions."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        # Extract and parse the response
        ai_response = response.choices[0].message.content
        optimization_data = json.loads(ai_response)
        
        # Format the final response
        return create_optimization_response(resume_content, optimization_data)
        
    except Exception as e:
        logger.error(f"Error in AI resume analysis: {str(e)}")
        # Return a mock response in case of error
        return generate_mock_optimization(resume_content, job_description)

def generate_mock_optimization(resume_content, job_description):
    """Generate a mock optimization response for testing without API key"""
    logger.info("Generating mock AI optimization response")
    
    # Extract skills from job description
    skills_in_job = []
    if "Python" in job_description:
        skills_in_job.append("Python")
    if "Flask" in job_description or "FastAPI" in job_description:
        skills_in_job.append("Flask" if "Flask" in job_description else "FastAPI")
    if "React" in job_description:
        skills_in_job.append("React")
    if "SQL" in job_description or "database" in job_description:
        skills_in_job.append("SQL")
    if "AWS" in job_description or "cloud" in job_description:
        skills_in_job.append("AWS")
    
    # Add more skills to reach at least 5
    additional_skills = ["JavaScript", "Git", "Docker", "RESTful APIs", "Agile Methodology"]
    for skill in additional_skills:
        if len(skills_in_job) < 5 and skill not in skills_in_job:
            skills_in_job.append(skill)
    
    # Generate a tailored summary
    if "Python" in job_description and "web" in job_description:
        summary = "Experienced software developer specializing in Python web applications with a strong background in modern front-end frameworks like React."
    else:
        summary = "Versatile software engineer with a proven track record in building efficient applications and adapting to new technologies."
    
    # Calculate a mock score based on skills match
    user_skills = resume_content.get("skills", [])
    matching_skills = [skill for skill in user_skills if skill in skills_in_job]
    match_score = min(85, int(len(matching_skills) / len(skills_in_job) * 100)) if skills_in_job else 70
    
    # Generate experience suggestions
    experience_suggestions = [
        {
            "title": "Software Engineer",
            "company": "Tech Company",
            "description": "Led development of scalable web applications using Python and modern front-end frameworks.",
            "highlights": [
                "Improved application performance by 30%",
                "Implemented CI/CD pipeline for faster deployments",
                "Collaborated with cross-functional teams to deliver features on time"
            ]
        }
    ]
    
    # Generate feedback
    if match_score < 60:
        feedback = "Your resume would benefit from highlighting more experience with the technologies mentioned in the job description, particularly in web development and database skills."
    elif match_score < 80:
        feedback = "Your resume shows good alignment with the job requirements. Consider emphasizing your experience with Python and adding more detail about your database and cloud expertise."
    else:
        feedback = "Your resume is well-matched to this position. For an even stronger application, consider adding specific metrics that demonstrate your impact and efficiency."
    
    # Create mock optimization data
    optimization_data = {
        "optimized_summary": summary,
        "relevant_skills": skills_in_job,
        "experience_suggestions": experience_suggestions,
        "match_score": match_score,
        "feedback": feedback
    }
    
    return create_optimization_response(resume_content, optimization_data)

def format_resume_for_ai(resume_content):
    """Format resume content as a readable text for the AI"""
    output = []
    
    # Contact information
    if 'contact' in resume_content:
        contact = resume_content['contact']
        output.append("# CONTACT INFORMATION")
        if 'name' in contact:
            output.append(f"Name: {contact['name']}")
        if 'email' in contact:
            output.append(f"Email: {contact['email']}")
        if 'phone' in contact:
            output.append(f"Phone: {contact['phone']}")
        if 'address' in contact:
            output.append(f"Address: {contact['address']}")
        output.append("")
    
    # Summary
    if 'summary' in resume_content:
        output.append("# PROFESSIONAL SUMMARY")
        output.append(resume_content['summary'])
        output.append("")
    
    # Experience
    if 'experience' in resume_content:
        output.append("# WORK EXPERIENCE")
        for job in resume_content['experience']:
            job_title = job.get('title', 'Unknown Position')
            company = job.get('company', 'Unknown Company')
            location = job.get('location', '')
            start_date = job.get('start_date', '')
            end_date = job.get('end_date', 'Present')
            description = job.get('description', '')
            
            output.append(f"{job_title} at {company}, {location}")
            output.append(f"{start_date} - {end_date}")
            output.append(description)
            output.append("")
    
    # Education
    if 'education' in resume_content:
        output.append("# EDUCATION")
        for edu in resume_content['education']:
            degree = edu.get('degree', 'Degree')
            institution = edu.get('institution', 'Institution')
            location = edu.get('location', '')
            graduation_date = edu.get('graduation_date', '')
            
            output.append(f"{degree} from {institution}, {location}")
            output.append(f"Graduated: {graduation_date}")
            output.append("")
    
    # Skills
    if 'skills' in resume_content:
        output.append("# SKILLS")
        output.append(", ".join(resume_content['skills']))
        output.append("")
    
    return "\n".join(output)

def create_optimization_response(original_content, optimization_data):
    """
    Create the final optimization response
    
    Args:
        original_content (dict): The original resume content
        optimization_data (dict): The AI-generated optimization data
        
    Returns:
        dict: The final formatted response
    """
    # Create optimized content based on original content and AI suggestions
    optimized_content = original_content.copy()
    
    # Update summary with optimized version
    if 'optimized_summary' in optimization_data:
        optimized_content['summary'] = optimization_data['optimized_summary']
    
    # Update skills with relevant skills from AI
    if 'relevant_skills' in optimization_data:
        optimized_content['skills'] = optimization_data['relevant_skills']
    
    # Add experience suggestions
    if 'experience_suggestions' in optimization_data:
        optimized_content['experience_suggestions'] = optimization_data['experience_suggestions']
    
    # Create the final response
    return {
        "optimized_content": optimized_content,
        "score": optimization_data.get('match_score', 0),
        "feedback": optimization_data.get('feedback', "No specific feedback provided.")
    } 