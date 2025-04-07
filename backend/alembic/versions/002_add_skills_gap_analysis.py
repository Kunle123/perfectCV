"""add skills gap analysis

Revision ID: 002
Revises: 001
Create Date: 2024-04-06 23:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create skillsgapanalysis table
    op.create_table(
        'skillsgapanalysis',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('resume_id', sa.Integer(), nullable=False),
        sa.Column('job_description_id', sa.Integer(), nullable=False),
        sa.Column('missing_skills', sa.JSON(), nullable=True),
        sa.Column('enhancement_opportunities', sa.JSON(), nullable=True),
        sa.Column('implicit_skills', sa.JSON(), nullable=True),
        sa.Column('user_added_skills', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.ForeignKeyConstraint(['resume_id'], ['resume.id'], ),
        sa.ForeignKeyConstraint(['job_description_id'], ['jobdescription.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_skillsgapanalysis_id'), 'skillsgapanalysis', ['id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_skillsgapanalysis_id'), table_name='skillsgapanalysis')
    op.drop_table('skillsgapanalysis') 