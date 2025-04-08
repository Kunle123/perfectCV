# PerfectCV

A modern web application that helps job seekers optimise their resumes based on job descriptions using AI.

## Features

- Resume upload and parsing
- Job description analysis
- AI-powered resume optimisation
- Credit-based system for optimisation
- User authentication
- Payment integration with Stripe
- Dark/light mode support
- Responsive design

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- Chakra UI
- React Router
- Axios
- React Dropzone

### Backend

- FastAPI
- PostgreSQL
- Redis
- SQLAlchemy
- Alembic
- spaCy
- Stripe

## AI Architecture

PerfectCV uses AI to optimize resumes for specific job applications:

### Components

- **Resume Analysis**: Processes the user's resume and extracts key information
- **Job Description Analysis**: Parses job descriptions to identify requirements and keywords
- **Optimization Engine**: Matches resume content against job requirements
- **Recommendation System**: Generates tailored suggestions for improvement

### AI Integration

- **OpenAI API**: Powers the resume optimization with GPT-4 Turbo
- **Prompt Engineering**: Custom prompts designed for resume optimization
- **Error Handling**: Graceful fallback to mock responses for development/testing
- **JSON Response Format**: Structured data for consistent frontend rendering

### Development & Testing

- Development mode with mock AI responses for testing without API costs
- Configurable via .env files for easy switching between development and production modes
- See `backend/README_AI_SERVICE.md` for detailed documentation

## Windows Development Setup

### Prerequisites
- Python 3.10 or higher
- Git

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/Kunle123/perfectcv.git
cd perfectcv
```

2. Set up the development environment:
```bash
setup_dev.bat
```

3. Check if the environment is set up correctly:
```bash
check_env.bat
```

4. If you encounter path issues, run:
```bash
fix_path.bat
```

5. Start the development server:
```bash
start_server.bat
```

6. Run tests:
```bash
run_tests.bat
```

### Troubleshooting

If you encounter issues:

1. Clean the environment and start fresh:
```bash
clean_env.bat
setup_dev.bat
```

2. Make sure you're running the commands from the project root directory

3. Ensure Python 3.10 or higher is installed and in your PATH

4. Check if the virtual environment is activated (you should see `(venv)` at the beginning of your command prompt)

5. If you see "ModuleNotFoundError" errors, try running:
```bash
fix_path.bat
```

6. If you still have issues, try manually installing the required packages:
```bash
cd backend
python -m pip install fastapi uvicorn sqlalchemy pydantic pydantic-settings
```

## Project Structure
- `backend/` - FastAPI backend
- `frontend/` - React frontend
- `tests/` - Test files
- `venv/` - Python virtual environment (created by setup script)

## Environment Variables
The following environment variables are set automatically:
- `ENV_FILE=tests/.env.test` - Test environment configuration
- `PYTHONPATH` - Set to the backend directory

## Deployment

### Backend Deployment (Render.com)
1. Create a new Web Service on Render.com
2. Connect your GitHub repository
3. Set the build command: `cd backend && pip install -r requirements.txt`
4. Set the start command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add the following environment variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET_KEY` - A secure secret key for JWT tokens
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret

### Frontend Deployment (Netlify)
1. Create a new site on Netlify
2. Connect your GitHub repository
3. Set the build command: `cd frontend && npm install && npm run build`
4. Set the publish directory: `frontend/dist`
5. Add the following environment variables:
   - `VITE_API_URL` - The URL of your backend API
   - `VITE_STRIPE_PUBLIC_KEY` - Your Stripe public key

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# PerfectCV API Test Environment

This is a simple test environment for testing the PerfectCV API authentication flow.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the proxy server:
   ```
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000/test_login.html
   ```

## How to Use

1. Enter your email and password in the form
2. Click "Test Login"
3. Watch the logs section for detailed information about the login process
4. Check if the token is stored in localStorage

## Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Check the terminal running the proxy server for errors
3. Make sure the API server is running and accessible
4. Try clearing your browser's localStorage

## Files

- `proxy-server.js`: Node.js proxy server that handles CORS issues
- `test_login.html`: HTML test page for testing the login functionality
- `package.json`: Node.js dependencies
