import sys
sys.path.append('.')

from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy import create_engine

from app.core.config import settings
from app.models.core import Base
from app.models import *  # noqa: F403,F401

sync_url = 'sqlite:///:memory:'
engine = create_engine(sync_url)

with engine.connect() as conn:
    context = MigrationContext.configure(conn)
    ops = Operations(context)
    upgrade_ops = compare_metadata(context, Base.metadata)
    
    with open('debug_ops.txt', 'w') as f:
        f.write('Type: ' + str(type(upgrade_ops)) + '\n')
        f.write('Dir: ' + str([x for x in dir(upgrade_ops) if not x.startswith('_')]) + '\n')
        f.write('Ops: ' + str(upgrade_ops) + '\n')
        if hasattr(upgrade_ops, 'ops'):
            f.write('Has .ops: ' + str(len(upgrade_ops.ops)) + ' operations\n')
            for i, op in enumerate(upgrade_ops.ops):
                f.write(f'  Op {i}: {type(op).__name__} - {op}\n')
                if hasattr(op, 'ops'):
                    for j, sub in enumerate(op.ops):
                        f.write(f'    Sub {j}: {type(sub).__name__} - {sub}\n')