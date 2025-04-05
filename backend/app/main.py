from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from starlette.responses import JSONResponse

app = FastAPI(
    title="PerfectCV API",
    description="AI-powered CV optimization API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS middleware with specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://perfect-cv-snowy.vercel.app"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    expose_headers=["Content-Type", "Authorization"],
    max_age=86400,  # 24 hours for preflight cache
) 

# Add explicit OPTIONS handler for preflight requests
@app.options("/{rest_of_path:path}")
async def options_handler(request: Request):
    response = JSONResponse(content={})
    return response

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to PerfectCV API"}
