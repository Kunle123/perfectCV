"""
Document generator module for PDF and DOCX file generation.
"""
import os
import tempfile
from typing import Optional
import pdfkit
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

def generate_document_pdf(content: str, output_path: str, options: Optional[dict] = None) -> str:
    """
    Generate a PDF document from text content.
    
    Args:
        content: Text content to include in the PDF
        output_path: Path where the PDF will be saved
        options: Optional configuration for PDF generation
        
    Returns:
        Path to the generated PDF file
    """
    # Default options for PDF generation
    default_options = {
        'page-size': 'Letter',
        'margin-top': '0.75in',
        'margin-right': '0.75in',
        'margin-bottom': '0.75in',
        'margin-left': '0.75in',
        'encoding': 'UTF-8',
        'no-outline': None
    }
    
    # Merge with user options if provided
    if options:
        default_options.update(options)
    
    # Create HTML content
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: Arial, sans-serif;
                font-size: 12pt;
                line-height: 1.5;
            }}
            p {{
                margin-bottom: 10px;
            }}
        </style>
    </head>
    <body>
        {content.replace('\n', '<br>')}
    </body>
    </html>
    """
    
    # Generate PDF
    try:
        pdfkit.from_string(html_content, output_path, options=default_options)
        return output_path
    except Exception as e:
        # Fallback to simple text file if PDF generation fails
        with open(output_path, 'w') as f:
            f.write(content)
        return output_path

def generate_document_docx(content: str, output_path: str) -> str:
    """
    Generate a DOCX document from text content.
    
    Args:
        content: Text content to include in the DOCX
        output_path: Path where the DOCX will be saved
        
    Returns:
        Path to the generated DOCX file
    """
    # Create new Document
    doc = Document()
    
    # Set document properties
    doc.styles['Normal'].font.name = 'Arial'
    doc.styles['Normal'].font.size = Pt(12)
    
    # Set margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
    
    # Add content
    paragraphs = content.split('\n')
    for para_text in paragraphs:
        if para_text.strip():
            p = doc.add_paragraph(para_text)
    
    # Save document
    doc.save(output_path)
    return output_path
