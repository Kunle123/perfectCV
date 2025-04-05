FROM python:3.10-slim

WORKDIR /app

# Install minimal dependencies for parsing different file formats
RUN apt-get update && apt-get install -y \
    # For basic functionality
    python3-dev \
    # For DOC files (optional)
    antiword \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application
COPY resume_parser.py .
COPY cv_parser_cli.py .

# Make the CLI executable
RUN chmod +x cv_parser_cli.py

# Set the entrypoint
ENTRYPOINT ["python", "cv_parser_cli.py"]

# Default command (can be overridden)
CMD ["--help"]
