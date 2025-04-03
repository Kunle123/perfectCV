from typing import Dict, Any, List
from sentence_transformers import SentenceTransformer
from openai import AsyncOpenAI
from app.core.config import settings

# Initialize OpenAI client
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

# Initialize sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

async def optimize_resume(resume_data: Dict[str, Any], jd_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Optimize resume content based on job description.
    """
    # Extract key information from job description
    jd_skills = jd_data.get("entities", {}).get("skills", [])
    jd_requirements = jd_data.get("requirements", [])
    jd_responsibilities = jd_data.get("responsibilities", [])
    
    # Get resume sections
    resume_sections = resume_data.get("sections", {})
    
    # Optimize each section
    optimized_sections = {
        "summary": await optimize_summary(
            resume_sections.get("summary", ""),
            jd_data.get("summary", "")
        ),
        "experience": await optimize_experience(
            resume_sections.get("experience", []),
            jd_skills,
            jd_requirements,
            jd_responsibilities
        ),
        "education": resume_sections.get("education", []),
        "skills": await optimize_skills(
            resume_sections.get("skills", []),
            jd_skills
        )
    }
    
    return {
        "sections": optimized_sections,
        "original": resume_data,
        "job_description": jd_data
    }

async def optimize_summary(resume_summary: str, jd_summary: str) -> str:
    """
    Optimize resume summary to better match job description.
    """
    prompt = f"""
    Rewrite this resume summary to better align with the job description.
    
    Resume Summary:
    {resume_summary}
    
    Job Description Summary:
    {jd_summary}
    
    Make the summary more relevant to the job while maintaining truthfulness.
    """
    
    response = await client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a resume optimization expert. Rewrite summaries to better match job descriptions."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return response.choices[0].message.content

async def optimize_experience(
    experience: List[Dict[str, Any]],
    jd_skills: List[str],
    jd_requirements: List[str],
    jd_responsibilities: List[str]
) -> List[Dict[str, Any]]:
    """
    Optimize experience section to highlight relevant skills and achievements.
    """
    optimized_experience = []
    
    for exp in experience:
        # Calculate relevance score for each bullet point
        bullets = exp.get("bullets", [])
        optimized_bullets = []
        
        for bullet in bullets:
            # Calculate similarity scores
            bullet_embedding = model.encode(bullet)
            jd_embeddings = model.encode(jd_skills + jd_requirements + jd_responsibilities)
            
            # Get maximum similarity score
            similarities = [model.cosine_similarity(bullet_embedding, jd_emb) for jd_emb in jd_embeddings]
            max_similarity = max(similarities)
            
            if max_similarity > 0.3:  # Threshold for relevance
                # Optimize relevant bullet points
                optimized_bullet = await optimize_bullet(
                    bullet,
                    jd_skills,
                    jd_requirements,
                    jd_responsibilities
                )
                optimized_bullets.append(optimized_bullet)
            else:
                optimized_bullets.append(bullet)
        
        exp["bullets"] = optimized_bullets
        optimized_experience.append(exp)
    
    return optimized_experience

async def optimize_bullet(
    bullet: str,
    jd_skills: List[str],
    jd_requirements: List[str],
    jd_responsibilities: List[str]
) -> str:
    """
    Optimize a single bullet point to better match job requirements.
    """
    prompt = f"""
    Rewrite this resume bullet point to better highlight relevant skills and achievements.
    
    Original Bullet:
    {bullet}
    
    Job Skills:
    {', '.join(jd_skills)}
    
    Job Requirements:
    {', '.join(jd_requirements)}
    
    Job Responsibilities:
    {', '.join(jd_responsibilities)}
    
    Make the bullet point more relevant to the job while maintaining truthfulness.
    """
    
    response = await client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a resume optimization expert. Rewrite bullet points to better match job requirements."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return response.choices[0].message.content

async def optimize_skills(resume_skills: List[str], jd_skills: List[str]) -> List[str]:
    """
    Optimize skills section to better match job requirements.
    """
    # Calculate similarity scores for each skill
    skill_embeddings = model.encode(resume_skills)
    jd_embeddings = model.encode(jd_skills)
    
    # Sort skills by relevance
    skill_scores = []
    for i, skill_emb in enumerate(skill_embeddings):
        similarities = [model.cosine_similarity(skill_emb, jd_emb) for jd_emb in jd_embeddings]
        max_similarity = max(similarities)
        skill_scores.append((resume_skills[i], max_similarity))
    
    # Sort by similarity score
    skill_scores.sort(key=lambda x: x[1], reverse=True)
    
    # Return sorted skills
    return [skill for skill, _ in skill_scores] 