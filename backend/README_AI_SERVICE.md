# PerfectCV AI Service

This document explains the AI-powered resume optimization service in PerfectCV.

## Overview

The AI service analyzes a user's resume against a job description to provide tailored optimization suggestions. It helps users customize their resumes for specific job applications, improving their chances of getting interviews.

## Features

- **Resume Analysis**: Compares user resume with job description to identify gaps and opportunities
- **Tailored Summary**: Generates a customized professional summary for each job application
- **Skill Matching**: Identifies the most relevant skills to highlight based on the job requirements
- **Experience Optimization**: Suggests improvements for how to present work experience
- **Scoring System**: Provides a match score (0-100) indicating how well the resume fits the job
- **Feedback**: Offers specific recommendations for resume improvement

## Implementation

The AI service is implemented in `ai_service.py` and uses the OpenAI API to analyze resumes. Key components:

1. **analyze_resume_against_job()**: The main function that processes a resume against a job description
2. **format_resume_for_ai()**: Converts structured resume data into a format suitable for the AI
3. **create_optimization_response()**: Formats the AI response into the application's data structure
4. **generate_mock_optimization()**: Provides mock responses for testing without an API key

## Usage

```python
from ai_service import analyze_resume_against_job

# Resume content from database or user input
resume_content = {
    "contact": {...},
    "summary": "...",
    "experience": [...],
    "education": [...],
    "skills": [...]
}

# Job description text
job_description = "..."

# Get optimization suggestions
result = analyze_resume_against_job(resume_content, job_description)

# Access the results
optimized_content = result["optimized_content"]
score = result["score"]
feedback = result["feedback"]
```

## Configuration

The service requires an OpenAI API key which should be set in the `.env` file:

```
OPENAI_API_KEY=your_api_key_here
```

For development and testing without an API key, the service will fall back to a mock implementation that provides reasonable suggestions based on pattern matching.

## Development Mode

When no valid API key is available, the service automatically runs in development mode, using the `generate_mock_optimization()` function to create responses. This is useful for:

- Local development without API costs
- Testing the application flow
- CI/CD pipelines
- Demo environments

## Production Deployment

For production use:

1. Ensure a valid OpenAI API key is configured
2. Consider implementing rate limiting to control API costs
3. Add caching to prevent redundant API calls
4. Monitor API usage and costs 