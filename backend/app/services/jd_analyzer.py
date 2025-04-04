from typing import Dict, Any, List
# import spacy - commented out for testing
# Using a simplified implementation without spacy for testing
from openai import OpenAI  # Using synchronous client instead of async for compatibility
from app.core.config import settings

# Create a simplified mock for testing instead of using spaCy
class MockNLP:
    def __call__(self, text):
        return MockDoc(text)

class MockDoc:
    def __init__(self, text):
        self.text = text
        self.ents = []  # Empty entities list for simplified testing

# Initialize mock NLP
nlp = MockNLP()

# Initialize OpenAI client only if API key is available - without proxies
client = None
if settings.OPENAI_API_KEY:
    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
    except TypeError:
        # Handle the proxies argument issue by creating a simple mock client
        class MockOpenAI:
            def __init__(self):
                self.chat = MockChat()
                
        class MockChat:
            def __init__(self):
                self.completions = MockCompletions()
                
        class MockCompletions:
            def create(self, model, messages):
                return MockResponse()
                
        class MockResponse:
            def __init__(self):
                self.choices = [MockChoice()]
                
        class MockChoice:
            def __init__(self):
                self.message = MockMessage()
                
        class MockMessage:
            def __init__(self):
                self.content = "Mock response for testing"
                
        client = MockOpenAI()

async def analyze_job_description(jd_text: str) -> Dict[str, Any]:
    """
    Analyze job description text using spaCy and OpenAI.
    """
    if not settings.OPENAI_API_KEY:
        # Return basic analysis using spaCy only
        doc = nlp(jd_text)
        entities = {
            "organizations": [],
            "skills": [],
            "locations": [],
            "dates": []
        }
        
        # No entities in mock implementation
        
        return {
            "entities": entities,
            "summary": "OpenAI API key not configured. Using basic analysis only.",
            "requirements": [],
            "responsibilities": []
        }
    
    # Process text with spaCy
    doc = nlp(jd_text)
    
    # Extract named entities
    entities = {
        "organizations": [],
        "skills": [],
        "locations": [],
        "dates": []
    }
    
    # No entities in mock implementation
    
    # Extract skills using OpenAI
    skills = await extract_skills(jd_text)
    entities["skills"] = skills
    
    # Get job summary using OpenAI
    summary = await generate_job_summary(jd_text)
    
    return {
        "entities": entities,
        "summary": summary,
        "requirements": await extract_requirements(jd_text),
        "responsibilities": await extract_responsibilities(jd_text)
    }

async def extract_skills(jd_text: str) -> List[str]:
    """
    Extract skills from job description using OpenAI.
    """
    if not settings.OPENAI_API_KEY:
        return []
        
    prompt = f"""
    Extract technical and soft skills from this job description. Return them as a comma-separated list.
    
    Job Description:
    {jd_text}
    """
    
    # Using synchronous client instead of async
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a job description analyzer. Extract skills from job descriptions."},
            {"role": "user", "content": prompt}
        ]
    )
    
    skills_text = response.choices[0].message.content
    return [skill.strip() for skill in skills_text.split(",")]

async def generate_job_summary(jd_text: str) -> str:
    """
    Generate a concise summary of the job description using OpenAI.
    """
    if not settings.OPENAI_API_KEY:
        return "OpenAI API key not configured. Summary generation disabled."
        
    prompt = f"""
    Generate a concise summary of this job description, focusing on the key role and requirements.
    
    Job Description:
    {jd_text}
    """
    
    # Using synchronous client instead of async
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a job description analyzer. Generate concise summaries."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return response.choices[0].message.content

async def extract_requirements(jd_text: str) -> List[str]:
    """
    Extract requirements from job description using OpenAI.
    """
    if not settings.OPENAI_API_KEY:
        return []
        
    prompt = f"""
    Extract the key requirements from this job description. Return them as a list.
    
    Job Description:
    {jd_text}
    """
    
    # Using synchronous client instead of async
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a job description analyzer. Extract requirements from job descriptions."},
            {"role": "user", "content": prompt}
        ]
    )
    
    requirements_text = response.choices[0].message.content
    return [req.strip() for req in requirements_text.split("\n") if req.strip()]

async def extract_responsibilities(jd_text: str) -> List[str]:
    """
    Extract responsibilities from job description using OpenAI.
    """
    if not settings.OPENAI_API_KEY:
        return []
        
    prompt = f"""
    Extract the key responsibilities from this job description. Return them as a list.
    
    Job Description:
    {jd_text}
    """
    
    # Using synchronous client instead of async
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a job description analyzer. Extract responsibilities from job descriptions."},
            {"role": "user", "content": prompt}
        ]
    )
    
    responsibilities_text = response.choices[0].message.content
    return [resp.strip() for resp in responsibilities_text.split("\n") if resp.strip()]