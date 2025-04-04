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

echo -e "${GREEN}Starting PerfectCV tests...${NC}"

# Check for required commands
if ! command_exists python3; then
    error_exit "python3 is required but not installed"
fi

# Check if we're in the right directory
if [ ! -d "tests" ]; then
    error_exit "Please run this script from the backend directory"
fi

# Clean up test database if it exists
if [ -f "test.db" ]; then
    echo -e "${YELLOW}Cleaning up test database...${NC}"
    rm test.db
fi

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo -e "${GREEN}Activating virtual environment...${NC}"
    source venv/bin/activate || error_exit "Failed to activate virtual environment"
else
    error_exit "Virtual environment not found. Please run start_dev.sh first"
fi

# Check if key packages are installed
if ! package_installed "pytest" || ! package_installed "pytest-cov"; then
    echo -e "${YELLOW}Installing test dependencies...${NC}"
    python3 -m pip install -r requirements.txt || error_exit "Failed to install requirements"
    python3 -m pip install -e . || error_exit "Failed to install package in editable mode"
else
    echo -e "${GREEN}Test dependencies are already installed${NC}"
fi

# Run tests with coverage
echo -e "${GREEN}Running tests...${NC}"
python3 -m pytest --cov=app tests/ -v

# Check test results
if [ $? -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
else
    echo -e "${RED}Some tests failed. Please check the output above.${NC}"
    exit 1
fi 