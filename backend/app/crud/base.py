from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.base_class import Base
from app.core.logging import logger

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        """
        CRUD object with default methods to Create, Read, Update, Delete (CRUD).
        **Parameters**
        * `model`: A SQLAlchemy model class
        * `schema`: A Pydantic model (schema) class
        """
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        try:
            stmt = select(self.model).where(self.model.id == id)
            result = db.execute(stmt)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error getting {self.model.__name__} by id: {str(e)}")
            return None

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        try:
            stmt = select(self.model).offset(skip).limit(limit)
            result = db.execute(stmt)
            return list(result.scalars().all())
        except Exception as e:
            logger.error(f"Error getting multiple {self.model.__name__}s: {str(e)}")
            return []

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        try:
            obj_in_data = jsonable_encoder(obj_in)
            db_obj = self.model(**obj_in_data)
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating {self.model.__name__}: {str(e)}")
            raise

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        try:
            obj_data = jsonable_encoder(db_obj)
            if isinstance(obj_in, dict):
                update_data = obj_in
            else:
                update_data = obj_in.model_dump(exclude_unset=True)
            for field in obj_data:
                if field in update_data:
                    setattr(db_obj, field, update_data[field])
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating {self.model.__name__}: {str(e)}")
            raise

    def remove(self, db: Session, *, id: int) -> Optional[ModelType]:
        try:
            stmt = select(self.model).where(self.model.id == id)
            result = db.execute(stmt)
            obj = result.scalar_one_or_none()
            if obj:
                db.delete(obj)
                db.commit()
            return obj
        except Exception as e:
            db.rollback()
            logger.error(f"Error removing {self.model.__name__}: {str(e)}")
            raise 