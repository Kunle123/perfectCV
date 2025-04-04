"""
OpenAI module initialization.
"""
from app.services.openai.client import create_chat_completion, create_json_chat_completion, create_embedding, OpenAIError
from app.services.openai.cover_letter_generator import generate_cover_letter_with_openai, generate_cover_letter_variations, CoverLetterGenerationError
from app.services.openai.skills_gap_analyzer import analyze_skills_gap_with_openai, incorporate_user_skills_with_openai, SkillsGapAnalysisError
