import sys
sys.path.insert(0, '.')
from app.api.v1.endpoints import organizations
print('router:', organizations.router)
print('routes count:', len(organizations.router.routes))
for r in organizations.router.routes:
    print(f'  {r.methods} {r.path}')