from typing import List, Optional
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
# Fix the import to avoid circular dependency
from app.models.optimization import Optimization
from app.schemas.resume import OptimizationCreate, OptimizationUpdate

class CRUDOptimization(CRUDBase[Optimization, OptimizationCreate, OptimizationUpdate]):
    def get_multi_by_resume(
        self, db: Session, *, resume_id: int, skip: int = 0, limit: int = 100
    ) -> List[Optimization]:
        return (
            db.query(self.model)
            .filter(Optimization.resume_id == resume_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_multi_by_job_description(
        self, db: Session, *, job_description_id: int, skip: int = 0, limit: int = 100
    ) -> List[Optimization]:
        return (
            db.query(self.model)
            .filter(Optimization.job_description_id == job_description_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

optimization = CRUDOptimization(Optimization)
