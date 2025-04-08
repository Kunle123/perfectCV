# Set environment variables
$env:ENV_FILE = '.env.development'
$env:PYTHONPATH = '.'

# Activate virtual environment if it exists
if (Test-Path "venv/Scripts/Activate.ps1") {
    . ./venv/Scripts/Activate.ps1
}

# Install requirements if needed
if (Test-Path "requirements.txt") {
    pip install -r requirements.txt
}

# Run the FastAPI server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 --log-level info 