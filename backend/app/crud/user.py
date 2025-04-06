from typing import Optional, Dict, Any, Union
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password
from app.core.logging import logger

class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        try:
            stmt = select(User).where(User.email == email)
            result = db.execute(stmt)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error getting user by email: {str(e)}")
            return None

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        try:
            db_obj = User(
                email=obj_in.email,
                hashed_password=get_password_hash(obj_in.password),
                full_name=obj_in.full_name,
                is_active=obj_in.is_active,
                is_superuser=obj_in.is_superuser,
                credits=obj_in.credits,
                stripe_customer_id=obj_in.stripe_customer_id
            )
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating user: {str(e)}")
            raise

    def update(
        self,
        db: Session,
        *,
        db_obj: User,
        obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        try:
            if isinstance(obj_in, dict):
                update_data = obj_in
            else:
                update_data = obj_in.model_dump(exclude_unset=True)
            if update_data.get("password"):
                hashed_password = get_password_hash(update_data["password"])
                del update_data["password"]
                update_data["hashed_password"] = hashed_password
            for field in update_data:
                setattr(db_obj, field, update_data[field])
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating user: {str(e)}")
            raise

    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        try:
            user = self.get_by_email(db, email=email)
            if not user:
                return None
            if not verify_password(password, user.hashed_password):
                return None
            return user
        except Exception as e:
            logger.error(f"Error authenticating user: {str(e)}")
            return None

user = CRUDUser(User) 