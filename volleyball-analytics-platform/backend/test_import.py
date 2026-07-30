import sys
sys.path.insert(0, '.')

from app.models.core import Base
from app.models import organization
from app.models import auth
from app.models import personnel
from app.models import competition
from app.models import match
from app.models import statistics
from app.models import ai_video
from app.models import reports

print('Tables registered:', list(Base.metadata.tables.keys()))