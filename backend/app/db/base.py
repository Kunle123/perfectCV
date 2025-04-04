# Import all the models, so that Base has them before being imported by Alembic
from app.db.base_class import Base
from app.models.user import User
from app.models.resume import Resume
from app.models.job_description import JobDescription
from app.models.optimization import Optimization
from app.models.cover_letter import CoverLetter
from app.models.skills_gap_analysis import SkillsGapAnalysis
