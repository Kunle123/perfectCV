#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print error and exit
error_exit() {
    echo -e "${RED}Error: $1${NC}"
    exit 1
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a package is installed
package_installed() {
    python3 -m pip freeze | grep -q "^$1=="
}

echo -e "${GREEN}Starting PerfectCV development environment...${NC}"

# Check for required commands
if ! command_exists python3; then
    error_exit "python3 is required but not installed"
fi

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    error_exit "Please run this script from the project root directory"
fi

# Navigate to backend directory
cd backend || error_exit "Failed to change to backend directory"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found. Creating from template...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}Created .env file from template${NC}"
    else
        error_exit ".env file not found and no template available"
    fi
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv || error_exit "Failed to create virtual environment"
fi

# Activate virtual environment
echo -e "${GREEN}Activating virtual environment...${NC}"
source venv/bin/activate || error_exit "Failed to activate virtual environment"

# Check if key packages are installed
if ! package_installed "fastapi" || ! package_installed "uvicorn" || ! package_installed "sqlalchemy"; then
    echo -e "${YELLOW}Installing required packages...${NC}"
    python3 -m pip install -r requirements.txt || error_exit "Failed to install requirements"
    python3 -m pip install -e . || error_exit "Failed to install package in editable mode"
else
    echo -e "${GREEN}Required packages are already installed${NC}"
fi

# Check if alembic is installed
if ! command_exists alembic; then
    error_exit "Alembic is not installed. Please check your requirements.txt"
fi

# Run database migrations
echo -e "${GREEN}Running database migrations...${NC}"
alembic upgrade head || error_exit "Failed to run database migrations"

# Start the development server
echo -e "${GREEN}Starting development server...${NC}"
echo -e "${GREEN}Server will be available at http://localhost:8000${NC}"
echo -e "${GREEN}API documentation will be available at http://localhost:8000/docs${NC}"
python3 -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0 