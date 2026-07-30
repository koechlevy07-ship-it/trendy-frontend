"""Add organization hierarchy fields (parent_organization_id, time_zone)

Revision ID: 002
Revises: 001
Create Date: 2026-07-15 23:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add parent_organization_id self-referential FK
    op.add_column('organizations',
        sa.Column('parent_organization_id', postgresql.UUID(as_uuid=True), nullable=True)
    )
    op.create_index('ix_organizations_parent', 'organizations', ['parent_organization_id'])
    op.create_foreign_key(
        'fk_organizations_parent',
        'organizations', 'organizations',
        ['parent_organization_id'], ['id']
    )

    # Add time_zone column
    op.add_column('organizations',
        sa.Column('time_zone', sa.String(50), nullable=True)
    )


def downgrade() -> None:
    op.drop_constraint('fk_organizations_parent', 'organizations', type_='foreignkey')
    op.drop_index('ix_organizations_parent', table_name='organizations')
    op.drop_column('organizations', 'parent_organization_id')
    op.drop_column('organizations', 'time_zone')
