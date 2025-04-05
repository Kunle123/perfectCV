FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for psycopg2 and textract
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    libpq-dev \
    # Dependencies for textract
    antiword \
    poppler-utils \
    tesseract-ocr \
    libtesseract-dev \
    libxslt1-dev \
    unrtf \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies with specific pydantic version
# Pin pip version to be compatible with textract 1.6.5
RUN pip install --upgrade pip==24.0
RUN pip install pydantic==1.10.8
RUN pip install psycopg2-binary
RUN pip install --no-cache-dir -r requirements.txt

# Make spaCy optional by creating a mock module
RUN mkdir -p /usr/local/lib/python3.10/site-packages/spacy
RUN echo "def load(model_name): return type('obj', (object,), {'vocab': type('obj', (object,), {})})" > /usr/local/lib/python3.10/site-packages/spacy/__init__.py

# Copy the rest of the application
COPY . .

EXPOSE 8080

CMD ["python", "run.py"]
