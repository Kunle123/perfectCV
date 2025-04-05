import os
import io
import re
import tempfile
from typing import Dict, Any, List

# Simple dependencies that are widely available
import docx  # For DOCX files

class ResumeParser:
    """
    A simplified resume parser that handles multiple file formats.
    This standalone version uses minimal dependencies to avoid conflicts.
    """
    
    def __init__(self):
        self.supported_formats = ['pdf', 'docx', 'doc', 'rtf']
    
    def parse_file(self, file_path: str) -> Dict[str, Any]:
        """
        Parse a resume file and extract its content.
        
        Args:
            file_path: Path to the resume file
            
        Returns:
            Dict containing parsed resume data
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        file_extension = file_path.split('.')[-1].lower()
        
        if file_extension not in self.supported_formats:
            raise ValueError(f"Unsupported file format: {file_extension}")
        
        with open(file_path, 'rb') as file:
            content = file.read()
            
        if file_extension == 'docx':
            return self._parse_docx(content)
        elif file_extension == 'pdf':
            return self._parse_pdf(content)
        elif file_extension == 'rtf':
            return self._parse_rtf(content)
        elif file_extension == 'doc':
            return self._parse_doc(content)
    
    def _parse_docx(self, content: bytes) -> Dict[str, Any]:
        """Parse DOCX file content."""
        try:
            doc = docx.Document(io.BytesIO(content))
            
            # Extract text from paragraphs
            text_content = []
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text_content.append(paragraph.text)
            
            raw_text = "\n".join(text_content)
            
            # Extract basic information
            return {
                "raw_text": raw_text,
                "contact_info": self._extract_contact_info(raw_text),
                "sections": self._extract_sections(raw_text)
            }
        except Exception as e:
            raise Exception(f"Failed to parse DOCX file: {str(e)}")
    
    def _parse_pdf(self, content: bytes) -> Dict[str, Any]:
        """
        Parse PDF file content.
        
        Note: This is a placeholder. In the standalone version, you'll need to install
        a PDF parsing library like PyPDF2 or pdfminer.six separately.
        """
        # This is a placeholder - in the actual implementation, you would use
        # a PDF parsing library like PyPDF2 or pdfminer.six
        return {
            "raw_text": "PDF parsing requires additional libraries. Please install PyPDF2 or pdfminer.six.",
            "contact_info": {},
            "sections": {}
        }
    
    def _parse_rtf(self, content: bytes) -> Dict[str, Any]:
        """
        Parse RTF file content.
        
        Note: This is a placeholder. In the standalone version, you'll need to install
        a RTF parsing library like striprtf separately.
        """
        # This is a placeholder - in the actual implementation, you would use
        # a RTF parsing library like striprtf
        return {
            "raw_text": "RTF parsing requires additional libraries. Please install striprtf.",
            "contact_info": {},
            "sections": {}
        }
    
    def _parse_doc(self, content: bytes) -> Dict[str, Any]:
        """
        Parse DOC file content.
        
        Note: This is a placeholder. In the standalone version, you'll need to install
        additional libraries or use external tools like antiword.
        """
        # This is a placeholder - in the actual implementation, you would use
        # a DOC parsing library or external tool
        return {
            "raw_text": "DOC parsing requires additional libraries or tools like antiword.",
            "contact_info": {},
            "sections": {}
        }
    
    def _extract_contact_info(self, text: str) -> Dict[str, str]:
        """Extract contact information from resume text."""
        contact_info = {
            'email': None,
            'phone': None,
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
    
    def _extract_sections(self, text: str) -> Dict[str, Any]:
        """Extract sections from resume text."""
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


# Example usage
if __name__ == "__main__":
    parser = ResumeParser()
    
    # Example: Parse a DOCX file
    # result = parser.parse_file("path/to/resume.docx")
    # print(result)
