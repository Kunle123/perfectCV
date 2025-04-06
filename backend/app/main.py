from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from starlette.responses import JSONResponse
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PerfectCV API",
    description="AI-powered CV optimization API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Log CORS origins for debugging
logger.info(f"CORS Origins: {settings.CORS_ORIGINS_LIST}")

# Add CORS middleware with specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS_LIST,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Add a middleware to explicitly set CORS headers for all responses
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    # For preflight OPTIONS requests, return an empty 200 response with CORS headers
    if request.method == "OPTIONS":
        response = Response()
        response.headers["Access-Control-Allow-Origin"] = "https://perfect-cv-snowy.vercel.app"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.status_code = 200
        return response
        
    # For all other requests, process normally but ensure CORS headers are set
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "https://perfect-cv-snowy.vercel.app"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

# Add a middleware to log request headers
@app.middleware("http")
async def log_request_headers(request: Request, call_next):
    # Log request headers
    logger.info(f"Request path: {request.url.path}")
    logger.info(f"Request method: {request.method}")
    logger.info(f"Request headers: {dict(request.headers)}")
    
    # Process the request
    response = await call_next(request)
    
    # Log response headers
    logger.info(f"Response status: {response.status_code}")
    logger.info(f"Response headers: {dict(response.headers)}")
    
    return response

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to PerfectCV API"}

# Test endpoint for CORS debugging
@app.get("/test-cors")
async def test_cors():
    return {"message": "CORS test successful"}
