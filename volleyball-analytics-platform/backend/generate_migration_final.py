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
    
    # The upgrade_ops is a list of tuples: ('add_table', Table(...)) or ('add_index', Index(...))
    # We need to convert these to op.create_table() and op.create_index() calls
    
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
    
    upgrade_lines = []
    downgrade_lines = []
    
    for op_tuple in upgrade_ops:
        op_type = op_tuple[0]
        obj = op_tuple[1]
        
        if op_type == 'add_table':
            table = obj
            # Build create_table call
            cols = []
            for col in table.columns:
                col_def = f"sa.Column('{col.name}', {col.type}"
                if col.nullable is not None:
                    col_def += f", nullable={col.nullable}"
                if col.default is not None:
                    col_def += f", default={col.default}"
                if col.server_default is not None:
                    col_def += f", server_default={col.server_default}"
                if col.primary_key:
                    col_def += ", primary_key=True"
                if col.foreign_keys:
                    for fk in col.foreign_keys:
                        col_def += f", sa.ForeignKey('{fk.column.table.name}.{fk.column.name}')"
                col_def += ")"
                cols.append(col_def)
            
            # Add constraints
            for constraint in table.constraints:
                if hasattr(constraint, 'columns') and len(constraint.columns) > 1:
                    col_names = [c.name for c in constraint.columns]
                    if hasattr(constraint, 'name') and constraint.name:
                        cols.append(f"sa.{constraint.__class__.__name__}({col_names}, name='{constraint.name}')")
                    else:
                        cols.append(f"sa.{constraint.__class__.__name__}({col_names})")
            
            cols_str = ',\n        '.join(cols)
            upgrade_lines.append(f"    op.create_table(\n        '{table.name}',\n        {cols_str}\n    )")
            downgrade_lines.insert(0, f"    op.drop_table('{table.name}')")
            
        elif op_type == 'add_index':
            index = obj
            cols = [c.name for c in index.columns]
            unique = index.unique
            upgrade_lines.append(f"    op.create_index('{index.name}', '{index.table.name}', {cols}, unique={unique})")
            downgrade_lines.insert(0, f"    op.drop_index('{index.name}', table_name='{index.table.name}')")
    
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