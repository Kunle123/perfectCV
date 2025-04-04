"""
OpenAI-powered cover letter generator service.
"""
import json
import logging
from typing import Dict, Any, List, Optional

from app.services.openai.client import create_json_chat_completion, create_chat_completion, OpenAIError

logger = logging.getLogger(__name__)

class CoverLetterGenerationError(Exception):
    """Exception raised for errors during cover letter generation."""
    pass

async def generate_cover_letter_with_openai(
    resume_data: Dict[str, Any],
    job_description: str,
    company_name: Optional[str] = None,
    hiring_manager: Optional[str] = None,
    additional_notes: Optional[str] = None
) -> Dict[str, Any]:
    """
    Use OpenAI to generate a personalized cover letter based on resume and job description.
    
    Args:
        resume_data: Parsed resume data
        job_description: Job description text
        company_name: Optional company name
        hiring_manager: Optional hiring manager name
        additional_notes: Optional additional notes or instructions
        
    Returns:
        Generated cover letter data
        
    Raises:
        CoverLetterGenerationError: If generation fails
    """
    try:
        # Extract user information
        user_name = resume_data.get("contact_info", {}).get("name", "")
        user_email = resume_data.get("contact_info", {}).get("email", "")
        user_phone = resume_data.get("contact_info", {}).get("phone", "")
        user_location = resume_data.get("contact_info", {}).get("location", "")
        
        # Extract experience
        experience = resume_data.get("sections", {}).get("experience", [])
        
        # Extract skills
        skills = resume_data.get("sections", {}).get("skills", [])
        
        # Prepare prompt
        prompt = f"""
        Generate a personalized cover letter based on the following information:
        
        Resume Information:
        - Name: {user_name}
        - Current/Recent Position: {experience[0].get('title', '') if experience else ''}
        - Key Skills: {', '.join(skills[:5]) if skills else ''}
        
        Job Description:
        {job_description}
        
        Company Name: {company_name or 'the company'}
        Hiring Manager: {hiring_manager or 'Hiring Manager'}
        
        Additional Notes:
        {additional_notes or ''}
        
        Guidelines:
        1. Create a professional, personalized cover letter
        2. Highlight 2-3 specific achievements from the resume that are most relevant to the job
        3. Explain why the candidate is a good fit for the position
        4. Keep the tone professional but conversational
        5. Include a strong closing paragraph
        6. Format with proper date, address, greeting, and signature
        
        Return the cover letter as a JSON object with the following structure:
        {{
            "date": "Current date in format Month Day, Year",
            "recipient": {{
                "name": "Hiring manager name or 'Hiring Manager'",
                "title": "Optional title if provided",
                "company": "Company name",
                "address": "Optional company address"
            }},
            "greeting": "Appropriate greeting",
            "introduction": "Introduction paragraph",
            "body_paragraphs": ["Array of body paragraphs"],
            "closing_paragraph": "Closing paragraph",
            "signature": "Appropriate signature with candidate name",
            "full_text": "The complete cover letter as a single string with proper formatting"
        }}
        """
        
        system_message = "You are a professional cover letter writer. Create personalized, compelling cover letters that highlight relevant experience and skills."
        
        response_text = await create_json_chat_completion(
            prompt=prompt,
            system_message=system_message,
            model="gpt-4",
            temperature=0.7  # Higher temperature for more creative writing
        )
        
        try:
            cover_letter_data = json.loads(response_text)
            return cover_letter_data
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {str(e)}")
            logger.error(f"Response text: {response_text}")
            raise CoverLetterGenerationError(f"Failed to generate cover letter: Invalid JSON response")
            
    except OpenAIError as e:
        logger.error(f"OpenAI error during cover letter generation: {str(e)}")
        raise CoverLetterGenerationError(f"Failed to generate cover letter with OpenAI: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error during cover letter generation: {str(e)}")
        raise CoverLetterGenerationError(f"Failed to generate cover letter: {str(e)}")

async def generate_cover_letter_variations(
    resume_data: Dict[str, Any],
    job_description: str,
    company_name: Optional[str] = None,
    tone: str = "professional"
) -> List[Dict[str, Any]]:
    """
    Generate multiple variations of cover letters with different tones or styles.
    
    Args:
        resume_data: Parsed resume data
        job_description: Job description text
        company_name: Optional company name
        tone: Desired tone (professional, enthusiastic, concise)
        
    Returns:
        List of cover letter variations
    """
    try:
        tones = {
            "professional": "formal and professional",
            "enthusiastic": "enthusiastic and passionate",
            "concise": "concise and direct"
        }
        
        tone_description = tones.get(tone, "professional")
        
        # Generate a single cover letter with the specified tone
        cover_letter = await generate_cover_letter_with_openai(
            resume_data=resume_data,
            job_description=job_description,
            company_name=company_name,
            additional_notes=f"Please use a {tone_description} tone for this cover letter."
        )
        
        return [cover_letter]
    except Exception as e:
        logger.error(f"Error generating cover letter variations: {str(e)}")
        return []
