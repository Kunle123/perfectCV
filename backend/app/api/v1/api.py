from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, resumes, job_descriptions, optimizations, career_tools, payments

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["resumes"])
api_router.include_router(job_descriptions.router, prefix="/job-descriptions", tags=["job-descriptions"])
api_router.include_router(optimizations.router, prefix="/optimizations", tags=["optimizations"])
api_router.include_router(career_tools.router, prefix="/career-tools", tags=["career-tools"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])