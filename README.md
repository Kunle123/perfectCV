# PerfectCV

A modern web application that helps job seekers optimize their resumes based on job descriptions using AI.

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

## Prerequisites

- Docker and Docker Compose
- Node.js 16 or higher (for local frontend development)
- Python 3.11 or higher (for local backend development)

## Quick Start with Docker

1. Clone the repository:

```bash
git clone https://github.com/yourusername/perfectcv.git
cd perfectcv
```

2. Create a `.env` file in the root directory with the following variables:

```env
# Backend
DATABASE_URL=postgresql://postgres:postgres@db:5432/perfectcv
SECRET_KEY=your-secret-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Frontend
VITE_API_URL=http://localhost:8000
VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
```

3. Start the services:

```bash
docker-compose up -d
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Local Development

### Frontend

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

### Backend

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create a virtual environment and activate it:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Set up the database:

```bash
alembic upgrade head
```

5. Start the development server:

```bash
uvicorn app.main:app --reload
```

## Project Structure

```
perfectcv/
├── frontend/           # React frontend application
├── backend/           # FastAPI backend application
├── docker/            # Docker configuration files
│   ├── frontend/     # Frontend Docker configuration
│   └── backend/      # Backend Docker configuration
└── docker-compose.yml # Docker Compose configuration
```

## API Documentation

The API documentation is available at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
