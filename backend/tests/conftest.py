import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.db.base import Base
from app.main import app
from app.api.deps import get_db
from app.core.security import create_access_token
from app.models.user import User
from app.crud.user import user as crud_user
from app.schemas.user import UserCreate

# Set test environment
os.environ["ENV_FILE"] = "tests/.env.test"

# Use database URL from settings
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db():
    Base.metadata.create_all(bind=engine)
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture(scope="module")
def test_user(db):
    user_in = UserCreate(
        email="test@example.com",
        password="testpassword123",
        full_name="Test User",
        is_active=True,
        is_superuser=False,
        credits=10
    )
    user = crud_user.create(db, obj_in=user_in)
    return user

@pytest.fixture(scope="module")
def test_user_token(test_user):
    return create_access_token(subject=test_user.id)

@pytest.fixture(scope="module")
def authorized_client(client, test_user_token):
    client.headers = {
        **client.headers,
        "Authorization": f"Bearer {test_user_token}"
    }
    return client 