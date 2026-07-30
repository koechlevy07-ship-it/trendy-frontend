# Backend Service

FastAPI-based backend API for the Volleyball Analytics Platform.

## Structure

```
backend/
├── app/
│   ├── api/              # API routes (v1)
│   ├── core/             # Core configuration, security, database
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   ├── repositories/     # Data access layer
│   ├── websocket/        # WebSocket handlers
│   └── main.py           # Application entry point
├── alembic/              # Database migrations
├── tests/                # Unit and integration tests
├── pyproject.toml        # Poetry configuration
├── Dockerfile            # Container image
└── README.md
```

## Quick Start

```bash
cd backend
poetry install
poetry run alembic upgrade head
poetry run uvicorn app.main:app --reload --port 8000
```

## API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Spec**: http://localhost:8000/openapi.json

## Architecture

### Layered Architecture

```
API Routes (api/) → Services → Repositories → Database
                    ↓
              WebSocket Handlers
                    ↓
              AI Engine (via HTTP/gRPC)
```

### Key Modules

| Module | Responsibility |
|--------|----------------|
| `api/` | REST endpoints, request/response validation |
| `core/` | Config, security, database, logging |
| `models/` | SQLAlchemy ORM models |
| `schemas/` | Pydantic request/response models |
| `services/` | Business logic, orchestration |
| `repositories/` | Data access, queries |
| `websocket/` | Real-time communication |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/register` | User registration |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Current user profile |
| PUT | `/api/v1/users/me` | Update profile |
| GET | `/api/v1/users` | List users (admin) |

### Teams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/teams` | List teams |
| POST | `/api/v1/teams` | Create team |
| GET | `/api/v1/teams/{id}` | Get team |
| PUT | `/api/v1/teams/{id}` | Update team |
| DELETE | `/api/v1/teams/{id}` | Delete team |
| GET | `/api/v1/teams/{id}/roster` | Team roster |
| POST | `/api/v1/teams/{id}/roster` | Add player |

### Players
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/players` | List players |
| POST | `/api/v1/players` | Create player |
| GET | `/api/v1/players/{id}` | Get player |
| PUT | `/api/v1/players/{id}` | Update player |
| DELETE | `/api/v1/players/{id}` | Delete player |

### Matches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/matches` | List matches |
| POST | `/api/v1/matches` | Create match |
| GET | `/api/v1/matches/{id}` | Get match |
| PUT | `/api/v1/matches/{id}` | Update match |
| POST | `/api/v1/matches/{id}/start` | Start match |
| POST | `/api/v1/matches/{id}/pause` | Pause match |
| POST | `/api/v1/matches/{id}/resume` | Resume match |
| POST | `/api/v1/matches/{id}/end` | End match |
| GET | `/api/v1/matches/{id}/events` | Match events |
| GET | `/api/v1/matches/{id}/stats` | Match statistics |
| GET | `/api/v1/matches/{id}/rallies` | Rally data |

### Statistics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/statistics/players/{id}` | Player stats |
| GET | `/api/v1/statistics/teams/{id}` | Team stats |
| GET | `/api/v1/statistics/matches/{id}` | Match stats |
| GET | `/api/v1/statistics/leaderboard` | Leaderboards |

### Videos
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/videos/upload` | Upload video |
| GET | `/api/v1/videos/{id}` | Get video |
| POST | `/api/v1/videos/{id}/process` | Start AI processing |
| GET | `/api/v1/videos/{id}/status` | Processing status |
| GET | `/api/v1/videos/{id}/stream` | Stream video |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/reports/generate` | Generate report |
| GET | `/api/v1/reports` | List reports |
| GET | `/api/v1/reports/{id}` | Get report |
| GET | `/api/v1/reports/{id}/download` | Download report |

### WebSocket
| Endpoint | Description |
|----------|-------------|
| `/ws/match/{match_id}` | Live match updates |
| `/ws/stats/{match_id}` | Real-time statistics |

## Development

```bash
# Install dependencies
poetry install

# Run migrations
poetry run alembic upgrade head

# Run server
poetry run uvicorn app.main:app --reload --port 8000

# Run tests
poetry run pytest -v --cov=app --cov-report=html

# Type checking
poetry run mypy .

# Linting
poetry run ruff check .
poetry run black --check .

# Format code
poetry run black .
poetry run ruff check --fix .
```

## Environment Variables

See `.env.example` for required variables.

## Docker

```bash
# Build
docker build -t volleyball-backend .

# Run
docker run -p 8000:8000 --env-file .env volleyball-backend
```

## Testing

```bash
# Unit tests
pytest tests/unit -v

# Integration tests
pytest tests/integration -v

# E2E tests
pytest tests/e2e -v

# Coverage
pytest --cov=app --cov-report=html
```

## API Documentation

Auto-generated at:
- Swagger UI: `/docs`
- ReDoc: `/redoc`
- OpenAPI JSON: `/openapi.json`

## Health Check

`GET /health` - Returns service status and dependencies.