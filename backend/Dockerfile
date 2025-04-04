FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies with specific pydantic version
RUN pip install --upgrade pip
RUN pip install pydantic==1.10.8
RUN pip install psycopg2-binary
RUN pip install --no-cache-dir -r requirements.txt

# Make spaCy optional by creating a mock module
RUN mkdir -p /usr/local/lib/python3.10/site-packages/spacy
RUN echo "def load(model_name): return type('obj', (object,), {'vocab': type('obj', (object,), {})})" > /usr/local/lib/python3.10/site-packages/spacy/__init__.py

# Copy the rest of the application
COPY . .

EXPOSE 8000

CMD ["python", "run.py"]
