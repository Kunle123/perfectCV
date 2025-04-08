import re
from typing import List, Optional
import os
from pydantic_settings import BaseSettings
from pydantic import field_validator

def process_env_template(template_str: str) -> str:
    """Process environment variable templates in the format ${{VAR_NAME}}"""
    def replace_var(match):
        var_name = match.group(1)
        return os.getenv(var_name, "")
    
    return re.sub(r'\$\{\{([A-Za-z0-9_]+)\}\}', replace_var, template_str)

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
        
        # Always include the Vercel domain for safety
        vercel_domain = "https://perfect-cv-snowy.vercel.app"
        if vercel_domain not in origins:
            origins.append(vercel_domain)
            
        return origins

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./dev.db" if os.getenv("ENV_FILE") == ".env.development" else "postgresql://postgres:postgres@europe-west4-drams3a.railway.app:7878/railway?sslmode=require"
    )
    
    # Database connection settings
    SQLALCHEMY_ECHO: bool = os.getenv("SQLALCHEMY_ECHO", "false").lower() == "true"
    SQLALCHEMY_POOL_SIZE: int = int(os.getenv("SQLALCHEMY_POOL_SIZE", "5"))
    SQLALCHEMY_MAX_OVERFLOW: int = int(os.getenv("SQLALCHEMY_MAX_OVERFLOW", "10"))
    SQLALCHEMY_POOL_TIMEOUT: int = int(os.getenv("SQLALCHEMY_POOL_TIMEOUT", "30"))
    SQLALCHEMY_POOL_RECYCLE: int = int(os.getenv("SQLALCHEMY_POOL_RECYCLE", "1800"))
    
    # Railway specific settings
    RAILWAY_TCP_PROXY_DOMAIN: Optional[str] = os.getenv("RAILWAY_TCP_PROXY_DOMAIN")
    RAILWAY_TCP_PROXY_PORT: Optional[str] = os.getenv("RAILWAY_TCP_PROXY_PORT")
    
    @property
    def DATABASE_PUBLIC_URL(self) -> str:
        """Construct the public database URL using Railway's proxy settings"""
        if self.RAILWAY_TCP_PROXY_DOMAIN and self.RAILWAY_TCP_PROXY_PORT:
            # Extract credentials from the original DATABASE_URL
            match = re.match(r'postgresql://([^:]+):([^@]+)@', self.DATABASE_URL)
            if match:
                user, password = match.groups()
                return f"postgresql://{user}:{password}@{self.RAILWAY_TCP_PROXY_DOMAIN}:{self.RAILWAY_TCP_PROXY_PORT}/railway?sslmode=require"
        return self.DATABASE_URL

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
    PORT: int = int(os.getenv("PORT", "8080"))  # Default to Railway's port
    HOST: str = os.getenv("HOST", "0.0.0.0")

    model_config = {
        "case_sensitive": True,
        "env_file": os.getenv("ENV_FILE", ".env"),
        "extra": "allow"  # Allow extra fields in the settings
    }

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