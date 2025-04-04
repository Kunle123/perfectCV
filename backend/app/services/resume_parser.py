import io
import re
from typing import Dict, Any, List, Optional
import docx
import pdfplumber
from fastapi import UploadFile, HTTPException
from datetime import datetime

class ResumeParseError(Exception):
    """Custom exception for resume parsing errors."""
    pass

async def parse_resume_file(content: bytes, filename: str) -> Dict[str, Any]:
    """
    Parse resume file content based on file extension.
    
    Args:
        content: The file content in bytes
        filename: The name of the file
        
    Returns:
        Dict containing parsed resume data
        
    Raises:
        ResumeParseError: If parsing fails
        ValueError: If file format is unsupported
    """
    try:
        file_extension = filename.split('.')[-1].lower()
        
        if file_extension == 'docx':
            return await parse_docx(content)
        elif file_extension == 'pdf':
            return await parse_pdf(content)
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
    except Exception as e:
        raise ResumeParseError(f"Failed to parse resume: {str(e)}")

def extract_sections(text: str) -> Dict[str, Any]:
    """
    Extract sections from resume text using common section headers.
    
    Args:
        text: The raw text content of the resume
        
    Returns:
        Dict containing extracted sections
    """
    # Common section headers and their variations
    section_patterns = {
        'summary': r'(?:summary|profile|objective|about)',
        'experience': r'(?:experience|work experience|employment|work history)',
        'education': r'(?:education|academic|qualification)',
        'skills': r'(?:skills|technical skills|core competencies)',
        'projects': r'(?:projects|portfolio|work samples)',
        'certifications': r'(?:certifications|certificates|qualifications)',
        'languages': r'(?:languages|language proficiency)',
        'references': r'(?:references|referees)'
    }
    
    sections = {key: [] for key in section_patterns.keys()}
    current_section = None
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check if line is a section header
        for section, pattern in section_patterns.items():
            if re.search(pattern, line.lower()):
                current_section = section
                break
                
        if current_section and line:
            sections[current_section].append(line)
            
    return sections

def extract_contact_info(text: str) -> Dict[str, str]:
    """
    Extract contact information from resume text.
    
    Args:
        text: The raw text content of the resume
        
    Returns:
        Dict containing contact information
    """
    contact_info = {
        'email': None,
        'phone': None,
        'location': None,
        'linkedin': None,
        'website': None
    }
    
    # Email pattern
    email_pattern = r'[\w\.-]+@[\w\.-]+\.\w+'
    email_match = re.search(email_pattern, text)
    if email_match:
        contact_info['email'] = email_match.group()
    
    # Phone pattern (various formats)
    phone_pattern = r'(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    phone_match = re.search(phone_pattern, text)
    if phone_match:
        contact_info['phone'] = phone_match.group()
    
    # LinkedIn pattern
    linkedin_pattern = r'(?:linkedin\.com/in/|linkedin:)\s*[\w-]+'
    linkedin_match = re.search(linkedin_pattern, text.lower())
    if linkedin_match:
        contact_info['linkedin'] = linkedin_match.group()
    
    # Website pattern
    website_pattern = r'(?:https?://)?(?:www\.)?[\w-]+\.[a-zA-Z]{2,}(?:/[\w-]*)*'
    website_match = re.search(website_pattern, text)
    if website_match:
        contact_info['website'] = website_match.group()
    
    return contact_info

def parse_experience(experience_lines: List[str]) -> List[Dict[str, Any]]:
    """
    Parse experience section into structured data.
    
    Args:
        experience_lines: List of lines from experience section
        
    Returns:
        List of parsed experience entries
    """
    experiences = []
    current_experience = {}
    
    for line in experience_lines:
        # Look for date patterns
        date_pattern = r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}\s*-\s*(?:Present|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4})'
        date_match = re.search(date_pattern, line)
        
        if date_match:
            # If we have a previous experience, save it
            if current_experience:
                experiences.append(current_experience)
            
            # Start new experience
            current_experience = {
                'title': '',
                'company': '',
                'date_range': date_match.group(),
                'description': []
            }
        elif current_experience:
            # If line looks like a title/company
            if not current_experience['title'] and ' - ' in line:
                title_company = line.split(' - ')
                current_experience['title'] = title_company[0].strip()
                if len(title_company) > 1:
                    current_experience['company'] = title_company[1].strip()
            else:
                current_experience['description'].append(line)
    
    # Add the last experience if exists
    if current_experience:
        experiences.append(current_experience)
    
    return experiences

def parse_education(education_lines: List[str]) -> List[Dict[str, Any]]:
    """
    Parse education section into structured data.
    
    Args:
        education_lines: List of lines from education section
        
    Returns:
        List of parsed education entries
    """
    education = []
    current_education = {}
    
    for line in education_lines:
        # Look for degree patterns
        degree_pattern = r'(?:Bachelor|Master|PhD|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|B\.?E\.?|M\.?E\.?|B\.?Tech|M\.?Tech)'
        degree_match = re.search(degree_pattern, line)
        
        if degree_match:
            # If we have a previous education, save it
            if current_education:
                education.append(current_education)
            
            # Start new education
            current_education = {
                'degree': degree_match.group(),
                'institution': '',
                'date_range': '',
                'details': []
            }
        elif current_education:
            # If line looks like an institution
            if not current_education['institution'] and ',' in line:
                institution_date = line.split(',')
                current_education['institution'] = institution_date[0].strip()
                if len(institution_date) > 1:
                    current_education['date_range'] = institution_date[1].strip()
            else:
                current_education['details'].append(line)
    
    # Add the last education if exists
    if current_education:
        education.append(current_education)
    
    return education

async def parse_docx(content: bytes) -> Dict[str, Any]:
    """
    Parse DOCX file content.
    
    Args:
        content: The file content in bytes
        
    Returns:
        Dict containing parsed resume data
    """
    try:
        doc = docx.Document(io.BytesIO(content))
        
        # Extract text from paragraphs
        text_content = []
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text_content.append(paragraph.text)
        
        raw_text = "\n".join(text_content)
        
        # Extract sections and contact info
        sections = extract_sections(raw_text)
        contact_info = extract_contact_info(raw_text)
        
        # Parse experience and education
        experiences = parse_experience(sections['experience'])
        education = parse_education(sections['education'])
        
        return {
            "raw_text": raw_text,
            "contact_info": contact_info,
            "sections": {
                "summary": sections['summary'][0] if sections['summary'] else "",
                "experience": experiences,
                "education": education,
                "skills": sections['skills'],
                "projects": sections['projects'],
                "certifications": sections['certifications'],
                "languages": sections['languages'],
                "references": sections['references']
            }
        }
    except Exception as e:
        raise ResumeParseError(f"Failed to parse DOCX file: {str(e)}")

async def parse_pdf(content: bytes) -> Dict[str, Any]:
    """
    Parse PDF file content.
    
    Args:
        content: The file content in bytes
        
    Returns:
        Dict containing parsed resume data
    """
    try:
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            text_content = []
            for page in pdf.pages:
                text_content.append(page.extract_text())
        
        raw_text = "\n".join(text_content)
        
        # Extract sections and contact info
        sections = extract_sections(raw_text)
        contact_info = extract_contact_info(raw_text)
        
        # Parse experience and education
        experiences = parse_experience(sections['experience'])
        education = parse_education(sections['education'])
        
        return {
            "raw_text": raw_text,
            "contact_info": contact_info,
            "sections": {
                "summary": sections['summary'][0] if sections['summary'] else "",
                "experience": experiences,
                "education": education,
                "skills": sections['skills'],
                "projects": sections['projects'],
                "certifications": sections['certifications'],
                "languages": sections['languages'],
                "references": sections['references']
            }
        }
    except Exception as e:
        raise ResumeParseError(f"Failed to parse PDF file: {str(e)}") 