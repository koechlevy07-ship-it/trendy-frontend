"""Generate migration file using Alembic autogenerate with proper directive injection."""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from alembic.config import Config
from alembic.script import ScriptDirectory
from alembic.environment import EnvironmentContext
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
    
    # Now generate the revision using the proper API
    config = Config("alembic.ini")
    script_dir = ScriptDirectory.from_config(config)
    
    # Create a custom function that modifies the directive
    def process_revision_directives(context, revision, directives):
        if directives:
            directive = directives[0]
            # Replace the upgrade_ops with our generated ops
            directive.upgrade_ops = upgrade_ops
            directive.downgrade_ops = upgrade_ops.reverse()
    
    # Generate the migration file
    script = script_dir.generate_revision(
        "001", 
        "Initial schema: core domain models",
        refresh=True,
        head=script_dir.get_current_head(),
        process_revision_directives=process_revision_directives
    )
    print(f"Generated migration: {script.path}")