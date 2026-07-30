"""Write proper migration file using model definitions directly."""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.models.core import Base
from app.models import *  # noqa: F403,F401

# Get all tables in dependency order
from sqlalchemy import inspect
from sqlalchemy.util import topological as topo

# Get table names in dependency order
tables = list(Base.metadata.tables.values())

# Sort tables by foreign key dependencies
sorted_tables = topo.sort(tables)

# Generate the migration
output = '''"""Initial schema: core domain models

Revision ID: 001
Revises: 
Create Date: 2026-07-15 22:52:00.000000

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
'''

for table in sorted_tables:
    output += f"    op.create_table(\n        '{table.name}',\n"
    
    # Columns
    for col in table.columns:
        # Build column definition
        col_type = str(col.type).replace('UUID()', 'postgresql.UUID(as_uuid=True)').replace('JSONB()', 'postgresql.JSONB(astext_type=sa.Text())')
        
        # Handle enums
        if hasattr(col.type, 'enums'):
            enum_name = f"{table.name}_{col.name}_enum"
            col_type = f"sa.Enum({', '.join(repr(e) for e in col.type.enums)}, name='{enum_name}')"
        elif 'Enum' in str(col.type):
            # It's an enum column
            enum_name = f"{table.name}_{col.name}_enum"
            col_type = f"sa.Enum(*{col.type.enums}, name='{enum_name}')"
        else:
            col_type = col_type.replace('DATETIME', 'sa.DateTime(timezone=True)').replace('VARCHAR', 'sa.String').replace('INTEGER', 'sa.Integer').replace('BIGINT', 'sa.BigInteger').replace('FLOAT', 'sa.Float').replace('BOOLEAN', 'sa.Boolean').replace('TEXT', 'sa.Text').replace('DATE', 'sa.Date')
        
        # Build column args
        args = []
        if not col.nullable:
            args.append('nullable=False')
        if col.primary_key:
            args.append('primary_key=True')
        if col.default is not None:
            if hasattr(col.default, 'arg'):
                if callable(col.default.arg):
                    args.append(f'default={col.default.arg.__name__}')
                else:
                    args.append(f'default={repr(col.default.arg)}')
            else:
                args.append(f'default={col.default}')
        if col.server_default is not None:
            args.append(f'server_default=sa.text({repr(str(col.server_default))})')
        if col.foreign_keys:
            for fk in col.foreign_keys:
                args.append(f"sa.ForeignKey('{fk.column.table.name}.{fk.column.name}')")
        
        args_str = ', '.join(args)
        if args_str:
            args_str = ', ' + args_str
        
        output += f"        sa.Column('{col.name}', {col_type}{args_str}),\n"
    
    # Constraints
    for constraint in table.constraints:
        if constraint.__class__.__name__ in ['UniqueConstraint', 'PrimaryKeyConstraint', 'CheckConstraint', 'ForeignKeyConstraint']:
            # These are handled inline or separately
            pass
    
    output += "    )\n"
    
    # Indexes
    for index in table.indexes:
        if not index.primary_key:
            cols = [c.name for c in index.columns]
            unique = index.unique
            output += f"    op.create_index('{index.name}', '{table.name}', {cols}, unique={unique})\n"
    
    output += "\n"

output += '''
def downgrade() -> None:
    # Drop tables in reverse order
'''

for table in reversed(sorted_tables):
    output += f"    op.drop_table('{table.name}')\n"

with open(os.path.join(os.path.dirname(__file__), 'alembic', 'versions', '001_initial_schema.py'), 'w') as f:
    f.write(output)

print("Generated 001_initial_schema.py")