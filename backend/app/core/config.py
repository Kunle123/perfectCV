from typing import List, Optional
import os
from pydantic import BaseSettings, validator

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "PerfectCV"
    
    # CORS
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:3001,http://localhost:3002,https://perfect-cv-snowy.vercel.app"
    )

    @property
    def CORS_ORIGINS_LIST(self) -> List[str]:
        # Process each origin, supporting explicit origins
        origins = []
        for origin in self.CORS_ORIGINS.split(","):
            origin = origin.strip()
            if origin:
                origins.append(origin)
        return origins

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./perfectcv.db")

    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "your-openai-api-key")

    # Stripe
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "your-stripe-secret-key")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "your-stripe-webhook-secret")

    # Server
    PORT: int = int(os.getenv("PORT", "8001"))
    HOST: str = os.getenv("HOST", "0.0.0.0")

    class Config:
        case_sensitive = True
        env_file = os.getenv("ENV_FILE", ".env")

# Create test settings if in test environment
if os.getenv("ENV_FILE") == "tests/.env.test":
    settings = Settings(
        CORS_ORIGINS="http://localhost:3000,http://localhost:8000",
        DATABASE_URL="sqlite:///./test.db",
        JWT_SECRET_KEY="test_secret_key_for_development_only",
        OPENAI_API_KEY="test_key",
        STRIPE_SECRET_KEY="test_key",
        STRIPE_WEBHOOK_SECRET="test_key"
    )
else:
    settings = Settings() 