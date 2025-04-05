# Standalone CV Parser - Deployment and Usage Instructions

This document provides instructions for deploying and using the standalone CV parser solution, which supports multiple file formats (PDF, DOCX, DOC, RTF).

## Overview

The standalone CV parser is a simplified solution that focuses specifically on parsing resume files in different formats. It avoids the dependency conflicts that were causing issues in the main application's Docker build.

## Option 1: Local Installation

### Prerequisites
- Python 3.6+
- pip (Python package manager)

### Installation Steps

1. Clone the repository (if you haven't already):
   ```bash
   git clone https://github.com/Kunle123/perfectCV.git
   cd perfectCV/standalone
   ```

2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Make the CLI script executable:
   ```bash
   chmod +x cv_parser_cli.py
   ```

### Usage

Parse a resume file and output the results in JSON format:
```bash
python cv_parser_cli.py path/to/your/resume.docx
```

Parse a resume file and output the results in text format:
```bash
python cv_parser_cli.py path/to/your/resume.pdf --format text
```

Save the parsing results to a file:
```bash
python cv_parser_cli.py path/to/your/resume.rtf --output results.json
```

## Option 2: Docker Deployment

### Prerequisites
- Docker

### Building the Docker Image

1. Clone the repository (if you haven't already):
   ```bash
   git clone https://github.com/Kunle123/perfectCV.git
   cd perfectCV/standalone
   ```

2. Build the Docker image:
   ```bash
   docker build -t cv-parser .
   ```

### Usage with Docker

Parse a resume file using Docker:
```bash
docker run -v $(pwd):/data cv-parser /data/your_resume.docx
```

Parse a resume file and save the output to a file:
```bash
docker run -v $(pwd):/data cv-parser /data/your_resume.pdf --output /data/results.json
```

## Testing

To test the parser with a sample resume file:
```bash
./test_parser.sh
```

This script will create a sample DOCX resume file and run the parser on it.

## Supported File Formats

- PDF (.pdf)
- Microsoft Word (.docx, .doc)
- Rich Text Format (.rtf)

## Troubleshooting

If you encounter any issues:

1. Ensure all dependencies are installed correctly
2. Check that the file format is supported
3. Verify that the file path is correct

For PDF parsing, you may need to install additional system dependencies depending on your operating system.

## Integration with Main Application

This standalone parser can be used as a separate service alongside the main perfectCV application. It provides the file format support functionality without the dependency conflicts that were causing issues in the main application's Docker build.
