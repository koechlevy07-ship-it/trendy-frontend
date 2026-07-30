import sys
sys.path.append('.')

from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy import create_engine

# Use SQLite for offline generation (no database needed)
sync_url = "sqlite:///:memory:"

from app.core.config import settings
from app.models.core import Base
from app.models import *  # noqa: F403,F401

# Create an engine for the dialect (no connection needed)
engine = create_engine(sync_url)

# Create a migration context for offline mode
with engine.connect() as conn:
    context = MigrationContext.configure(conn)
    ops = Operations(context)

    # Get the upgrade operations
    upgrade_ops = compare_metadata(context, Base.metadata)

    # Print the operations
    with open('ops_output.txt', 'w') as f:
        for op in upgrade_ops:
            f.write(str(op) + '\n')
            if hasattr(op, 'ops'):
                for sub in op.ops:
                    f.write('    ' + str(sub) + '\n')

print("Done, check ops_output.txt")