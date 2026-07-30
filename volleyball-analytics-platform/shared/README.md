# Shared Library

Shared code used by Backend, AI Engine, and Frontend.

## Structure

```
shared/
├── constants/        # Application constants
├── types/            # Shared TypeScript/Python types
├── events/           # Event definitions
├── config/           # Shared configuration
├── utils/            # Utility functions
├── validation/       # Validation schemas
└── README.md
```

## Usage

```python
# Python (Backend / AI Engine)
from shared.types import Player, Match, Event
from shared.events import Event, EventType
from shared.config import settings
from shared.utils import format_duration, calculate_efficiency

# TypeScript (Frontend)
import { Player, Match, Event } from '@shared/types'
import { EventType } from '@shared/events'
import { config } from '@shared/config'
import { formatDuration, calculateEfficiency } from '@shared/utils'
```

## Package Structure

### Python (shared)
```
shared/
├── pyproject.toml
├── shared/
│   ├── __init__.py
│   ├── constants.py
│   ├── types.py
│   ├── events.py
│   ├── config.py
│   ├── utils.py
│   └── validation.py
```

### TypeScript (shared)
```
shared/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── constants.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── player.ts
#       ├── match.ts
#       ├── event.ts
#       ├── team.ts
#       ├── statistics.ts
#       └── analytics.ts
#   ├── events/
#   │   ├── index.ts
#   │   ├── types.ts
#   │   └── factory.ts
#   ├── config.ts
#   ├── utils/
#   │   ├── index.ts
#   │   ├── formatting.ts
#   │   ├── calculations.ts
#   │   └── validation.ts
#   └── validation/
#       ├── index.ts
#       ├── schemas.ts
#       └── validators.ts
```

## Key Modules

### constants.py / constants.ts
Application-wide constants:
- Event types
- Position codes
- Court dimensions
- Scoring rules
- Zone definitions

### types.py / types/
Shared type definitions:
- Player, Team, Match, Set, Rally
- Event, Action, Statistics
- User, Organization, Tournament
- Analytics, Ratings, Predictions

### events.py / events/
Event system:
- Event definitions
- Event factory
- Serialization/deserialization
- Validation

### config.py / config.ts
Shared configuration:
- Environment-based settings
- Feature flags
- Constants

### utils.py / utils/
Common utilities:
- Formatting (dates, durations, numbers)
- Calculations (efficiency, percentages, rates)
- Geometry (court coordinates, distances)
- String manipulation

### validation.py / validation/
Validation schemas:
- Input validation
- Data sanitization
- Business rule validation

## Development

```bash
# Install Python package
cd shared
pip install -e .

# Install TypeScript package
cd shared
npm install
npm run build
```

## Versioning

Shared library follows semantic versioning. Changes require:
1. Update version in pyproject.toml / package.json
2. Update CHANGELOG.md
3. Tag release
4. Publish to internal registry