from typing import List, Optional
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.resume import Resume
from app.schemas.resume import ResumeCreate, ResumeUpdate

class CRUDResume(CRUDBase[Resume, ResumeCreate, ResumeUpdate]):
    def get_multi_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Resume]:
        return (
            db.query(self.model)
            .filter(Resume.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

resume = CRUDResume(Resume) 