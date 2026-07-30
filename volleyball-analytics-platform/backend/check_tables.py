import sys
sys.path.append('.')

from app.models.core import Base
from app.models import *  # noqa: F403,F401

tables = list(Base.metadata.sorted_tables)
with open('table_order.txt', 'w') as f:
    f.write(f'Number of tables: {len(tables)}\n')
    for t in tables:
        f.write(f'{t.name}\n')