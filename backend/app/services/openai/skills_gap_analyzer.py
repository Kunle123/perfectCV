"""
OpenAI-powered skills gap analyzer service.
"""
import json
import logging
from typing import Dict, Any, List, Optional

from app.services.openai.client import create_json_chat_completion, OpenAIError

logger = logging.getLogger(__name__)

class SkillsGapAnalysisError(Exception):
    """Exception raised for errors during skills gap analysis."""
    pass

async def analyze_skills_gap_with_openai(
    resume_data: Dict[str, Any],
    job_description: str
) -> Dict[str, Any]:
    """
    Use OpenAI to analyze the skills gap between a resume and job description.
    
    Args:
        resume_data: Parsed resume data
        job_description: Job description text
        
    Returns:
        Skills gap analysis data
        
    Raises:
        SkillsGapAnalysisError: If analysis fails
    """
    try:
        # Extract skills from resume
        resume_skills = resume_data.get("sections", {}).get("skills", [])
        
        # Extract experience
        experience = resume_data.get("sections", {}).get("experience", [])
        experience_text = ""
        for job in experience:
            title = job.get("title", "")
            company = job.get("company", "")
            description = job.get("description", "")
            experience_text += f"- {title} at {company}: {description}\n"
        
        # Prepare prompt
        prompt = f"""
        Analyze the skills gap between the candidate's resume and the job description.
        
        Resume Skills:
        {', '.join(resume_skills) if resume_skills else 'No skills explicitly listed'}
        
        Resume Experience:
        {experience_text}
        
        Job Description:
        {job_description}
        
        Please identify:
        1. Skills explicitly required in the job description that are missing from the resume
        2. Skills that are mentioned in the resume but could be enhanced or better articulated
        3. Implicit skills needed for the job that aren't clearly demonstrated in the resume
        
        For each identified gap, provide:
        - A description of the skill
        - Why it's important for the position
        - How the candidate might address this gap (e.g., training, rewording existing experience)
        
        Return the analysis as a JSON object with the following structure:
        {{
            "missing_skills": [
                {{
                    "skill": "Name of the missing skill",
                    "importance": "High/Medium/Low",
                    "description": "Description of the skill",
                    "reason": "Why it's important for the position",
                    "suggestion": "How to address this gap"
                }}
            ],
            "enhancement_opportunities": [
                {{
                    "skill": "Name of the skill to enhance",
                    "current_level": "How it's currently presented in the resume",
                    "desired_level": "How it should be presented",
                    "suggestion": "Specific suggestion for enhancement"
                }}
            ],
            "implicit_skills": [
                {{
                    "skill": "Name of the implicit skill",
                    "description": "Description of the skill",
                    "evidence_needed": "What evidence would demonstrate this skill",
                    "suggestion": "How to demonstrate this skill"
                }}
            ],
            "summary": "Overall summary of the skills gap analysis"
        }}
        """
        
        system_message = "You are an expert career coach specializing in skills gap analysis. Provide detailed, actionable insights to help candidates improve their resumes for specific job applications."
        
        response_text = await create_json_chat_completion(
            prompt=prompt,
            system_message=system_message,
            model="gpt-4",
            temperature=0.3  # Lower temperature for more analytical response
        )
        
        try:
            analysis_data = json.loads(response_text)
            return analysis_data
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {str(e)}")
            logger.error(f"Response text: {response_text}")
            raise SkillsGapAnalysisError(f"Failed to analyze skills gap: Invalid JSON response")
            
    except OpenAIError as e:
        logger.error(f"OpenAI error during skills gap analysis: {str(e)}")
        raise SkillsGapAnalysisError(f"Failed to analyze skills gap with OpenAI: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error during skills gap analysis: {str(e)}")
        raise SkillsGapAnalysisError(f"Failed to analyze skills gap: {str(e)}")

async def incorporate_user_skills_with_openai(
    resume_data: Dict[str, Any],
    user_skills: Dict[str, str]
) -> Dict[str, Any]:
    """
    Use OpenAI to incorporate user-provided skills into a resume.
    
    Args:
        resume_data: Parsed resume data
        user_skills: Dictionary of skill names and descriptions provided by the user
        
    Returns:
        Updated resume data with incorporated skills
        
    Raises:
        SkillsGapAnalysisError: If incorporation fails
    """
    try:
        # Create a copy of the resume data to avoid modifying the original
        updated_resume = resume_data.copy()
        
        # Extract existing skills
        existing_skills = updated_resume.get("sections", {}).get("skills", [])
        
        # Prepare prompt
        skills_text = ""
        for skill, description in user_skills.items():
            skills_text += f"- {skill}: {description}\n"
        
        prompt = f"""
        Incorporate the following user-provided skills into the resume:
        
        User-Provided Skills:
        {skills_text}
        
        Existing Resume Skills:
        {', '.join(existing_skills) if existing_skills else 'No skills explicitly listed'}
        
        Resume Experience:
        {json.dumps(updated_resume.get("sections", {}).get("experience", []), indent=2)}
        
        Please:
        1. Add the new skills to the skills section
        2. Modify relevant experience bullet points to highlight these skills
        3. If appropriate, add a new "Skills Summary" section at the top of the resume
        
        Return the updated resume as a JSON object with the same structure as the original resume data.
        """
        
        system_message = "You are an expert resume writer specializing in skills integration. Update resumes to effectively incorporate and highlight new skills."
        
        response_text = await create_json_chat_completion(
            prompt=prompt,
            system_message=system_message,
            model="gpt-4",
            temperature=0.3  # Lower temperature for more precise editing
        )
        
        try:
            updated_resume_data = json.loads(response_text)
            return updated_resume_data
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {str(e)}")
            logger.error(f"Response text: {response_text}")
            raise SkillsGapAnalysisError(f"Failed to incorporate user skills: Invalid JSON response")
            
    except OpenAIError as e:
        logger.error(f"OpenAI error during skills incorporation: {str(e)}")
        raise SkillsGapAnalysisError(f"Failed to incorporate user skills with OpenAI: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error during skills incorporation: {str(e)}")
        raise SkillsGapAnalysisError(f"Failed to incorporate user skills: {str(e)}")
