import sys
sys.path.append('.')

from app.models.core import Base
from app.models import *  # noqa: F403,F401

print('Tables:', list(Base.metadata.tables.keys()))
print('All models compile successfully!')

with open('compile_check.txt', 'w') as f:
    f.write('Tables: ' + str(list(Base.metadata.tables.keys())) + '\n')
    f.write('All models compile successfully!\n')