#!/bin/bash
# Test script for the standalone CV parser

# Create a test directory
mkdir -p test_files

# Create a simple test DOCX file using python-docx
echo "Creating test DOCX file..."
pip install python-docx
python3 -c "
import docx

# Create a new document
doc = docx.Document()

# Add a heading
doc.add_heading('John Doe', 0)

# Add contact information
doc.add_paragraph('Email: john.doe@example.com')
doc.add_paragraph('Phone: (123) 456-7890')
doc.add_paragraph('LinkedIn: linkedin.com/in/johndoe')

# Add experience section
doc.add_heading('Experience', level=1)
p = doc.add_paragraph('Senior Developer - ABC Company')
p.add_run('\\nJan 2020 - Present')
doc.add_paragraph('• Developed and maintained web applications using Python and JavaScript')
doc.add_paragraph('• Led a team of 5 developers on a major project')

# Add education section
doc.add_heading('Education', level=1)
p = doc.add_paragraph('University of Example')
p.add_run('\\nBS in Computer Science, 2015-2019')

# Add skills section
doc.add_heading('Skills', level=1)
doc.add_paragraph('Python, JavaScript, Docker, AWS, Git')

# Save the document
doc.save('test_files/test_resume.docx')
print('Test DOCX file created successfully!')
"

echo "Installing dependencies..."
pip install python-docx PyPDF2 striprtf

echo "Testing the parser with the test DOCX file..."
python3 cv_parser_cli.py test_files/test_resume.docx

echo "Test complete!"
