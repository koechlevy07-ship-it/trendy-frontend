import sys
sys.path.append('.')

from app.models.core import Base
from app.models import *  # noqa: F403,F401

from sqlalchemy import create_engine
engine = create_engine('sqlite:///:memory:')
Base.metadata.create_all(engine)
print('Tables created successfully in SQLite!')
print('Tables:', [t for t in engine.table_names()])

with open('sqlite_test.txt', 'w') as f:
    f.write('Tables created successfully in SQLite!\n')
    f.write('Tables: ' + str([t for t in engine.table_names()]) + '\n')