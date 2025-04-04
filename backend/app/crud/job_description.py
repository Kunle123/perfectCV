from typing import List, Optional
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.resume import JobDescription
from app.schemas.resume import JobDescriptionCreate, JobDescriptionUpdate

class CRUDJobDescription(CRUDBase[JobDescription, JobDescriptionCreate, JobDescriptionUpdate]):
    def get_multi_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[JobDescription]:
        return (
            db.query(self.model)
            .filter(JobDescription.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

job_description = CRUDJobDescription(JobDescription) 