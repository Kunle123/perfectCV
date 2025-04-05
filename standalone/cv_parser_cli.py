#!/usr/bin/env python3
"""
CV Parser CLI - A standalone command-line tool for parsing resumes in multiple formats.
This tool supports PDF, DOCX, DOC, and RTF formats.
"""

import os
import sys
import json
import argparse
from resume_parser import ResumeParser

def main():
    parser = argparse.ArgumentParser(description='Parse resume files in various formats')
    parser.add_argument('file', help='Path to the resume file (PDF, DOCX, DOC, or RTF)')
    parser.add_argument('--output', '-o', help='Output file path (default: stdout)')
    parser.add_argument('--format', '-f', choices=['json', 'text'], default='json',
                        help='Output format (default: json)')
    
    args = parser.parse_args()
    
    # Check if file exists
    if not os.path.exists(args.file):
        print(f"Error: File not found: {args.file}", file=sys.stderr)
        return 1
    
    # Check file extension
    file_extension = args.file.split('.')[-1].lower()
    supported_formats = ['pdf', 'docx', 'doc', 'rtf']
    
    if file_extension not in supported_formats:
        print(f"Error: Unsupported file format: {file_extension}", file=sys.stderr)
        print(f"Supported formats: {', '.join(supported_formats)}", file=sys.stderr)
        return 1
    
    try:
        # Parse the resume
        resume_parser = ResumeParser()
        result = resume_parser.parse_file(args.file)
        
        # Format the output
        if args.format == 'json':
            output = json.dumps(result, indent=2)
        else:  # text format
            output = f"Resume Content:\n\n{result['raw_text']}\n\n"
            output += "Contact Information:\n"
            for key, value in result['contact_info'].items():
                if value:
                    output += f"  {key}: {value}\n"
            
            output += "\nSections:\n"
            for section, content in result['sections'].items():
                if content:
                    output += f"\n{section.upper()}:\n"
                    if isinstance(content, list):
                        output += "\n".join(f"  - {item}" for item in content)
                    else:
                        output += f"  {content}"
                    output += "\n"
        
        # Output the result
        if args.output:
            with open(args.output, 'w') as f:
                f.write(output)
            print(f"Results written to {args.output}")
        else:
            print(output)
        
        return 0
    
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main())
