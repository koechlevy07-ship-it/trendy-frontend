"""Write migration file directly from autogenerate operations."""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy import create_engine

from app.core.config import settings
from app.models.core import Base
from app.models import *  # noqa: F403,F401

# Create an in-memory SQLite engine for dialect
sync_url = "sqlite:///:memory:"
engine = create_engine(sync_url)

# Create a migration context
with engine.connect() as conn:
    context = MigrationContext.configure(conn)
    ops = Operations(context)
    
    # Get the upgrade operations
    upgrade_ops = compare_metadata(context, Base.metadata)
    
    # Now create a migration script file
    template = '''"""Initial schema: core domain models

Revision ID: 001
Revises: 
Create Date: 2026-07-15 22:51:06.619379

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
{upgrade_ops}


def downgrade() -> None:
{downgrade_ops}
'''
    
    # Convert operations to Python code
    def format_ops(ops_list, indent=4):
        lines = []
        for op in ops_list:
            if hasattr(op, 'ops'):
                # Nested operations
                for sub in op.ops:
                    lines.append(' ' * indent + str(sub))
            else:
                lines.append(' ' * indent + str(op))
        return lines
    
    upgrade_lines = format_ops(upgrade_ops)
    downgrade_ops_rev = upgrade_ops.reverse()
    downgrade_lines = format_ops(downgrade_ops_rev)
    
    migration_content = template.format(
        upgrade_ops='\n'.join(upgrade_lines) if upgrade_lines else '    pass',
        downgrade_ops='\n'.join(downgrade_lines) if downgrade_lines else '    pass'
    )
    
    # Write the migration file
    output_path = os.path.join(
        os.path.dirname(__file__), 
        'alembic', 'versions', '001_initial_schema_core_domain_models.py'
    )
    with open(output_path, 'w') as f:
        f.write(migration_content)
    
    print(f"Generated migration: {output_path}")