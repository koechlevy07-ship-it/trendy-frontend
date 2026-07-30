# Volleyball Analytics Platform - AI Assistant Context

This file provides context for AI assistants working on the Volleyball Analytics Platform.

## Project Overview

The Volleyball Analytics Platform is an AI-powered computer vision system that automatically analyzes volleyball matches, tracking players, detecting actions, and generating statistics in real-time.

## Architecture Overview

- **Backend**: FastAPI + Python 3.11 + PostgreSQL + Redis
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **AI Engine**: PyTorch + Ultralytics YOLO + MediaPipe + ONNX Runtime
- **Database**: PostgreSQL 16 + Redis 7
- **Infrastructure**: Docker, Kubernetes, Terraform, ArgoCD

## Development Guidelines

### Code Style
- Python: Black (line-length=100), Ruff, MyPy strict
- TypeScript: ESLint (Airbnb), Prettier, TypeScript strict mode
- Git: Conventional commits (feat, fix, docs, refactor, etc.)

### Git Workflow
- Main branch: `main` (protected)
- Development branch: `develop`
- Feature branches: `feature/<description>`
- Hotfixes: `hotfix/<description>`
- PRs require 2 approvals + CI passing

### Testing Requirements
- Backend: pytest with ≥80% coverage
- Frontend: Vitest + Playwright
- AI Engine: pytest with GPU tests marked

### Code Review Checklist
- [ ] Self-reviewed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log/print statements
- [ ] No hardcoded secrets
- [ ] Performance considered
- [ ] Security considered

## Architecture Principles

1. **Modularity**: Each service is independently deployable
2. **Contract-first**: OpenAPI spec → generated clients
3. **Event-driven**: Kafka for async communication
4. **Observability**: Metrics, logs, traces everywhere
5. **Security by default**: mTLS, RBAC, secrets management

## Key Architectural Decisions

1. **Monorepo**: Single repo for all services (easier refactoring)
2. **Polyglot persistence**: PostgreSQL + Redis + S3 + Kafka
3. **GPU-accelerated inference**: NVIDIA GPU with TensorRT
4. **GitOps**: ArgoCD for deployment
5. **Contract-first APIs**: OpenAPI 3.1 + generated clients

## Key Directories

```
volleyball-analytics-platform/
├── backend/          # FastAPI backend
├── frontend/         # React + TypeScript + Vite
├── ai-engine/        # PyTorch + Ultralytics + ONNX
├── mobile/           # React Native (future)
├── database/         # Migrations, seeds
├── infrastructure/   # Terraform, Helm, K8s
├── deployment/       # Docker, K8s, CI/CD
├── documentation/    # Architecture, API, Runbooks
├── shared/           # Shared types, utils
├── ai-engine/        # AI/ML services
├── models/           # Model registry
├── datasets/         # Training data
├── scripts/          # Utility scripts
├── tests/            # Cross-cutting tests
└── deployment/       # Docker, K8s, CI/CD
```

## Key Commands

```bash
# Start development
make dev

# Run tests
make test

# Build all images
make docker-build

# Start services
make docker-up

# View logs
make docker-logs

# Run migrations
make migrate

# Create migration
make migrate-create

# Run linting
make lint

# Format code
make format
```

## Environment Variables

All secrets in `.env` (not committed). Template in `.env.example`.

Key variables:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `JWT_SECRET_KEY` - JWT signing key
- `MINIO_*` - MinIO credentials
- `AI_*` - AI engine settings

## Important Paths

- Backend API: `http://localhost:8000` (docs at `/docs`)
- Frontend: `http://localhost:5173`
- AI Engine: `http://localhost:8001`
- MinIO Console: `http://localhost:9001`
- API Docs: `http://localhost:8000/docs`

## Code Quality Commands

```bash
# Backend
cd backend && poetry run ruff check . --fix
cd backend && poetry run black .
cd backend && poetry run mypy .
cd backend && poetry run pytest -v

# Frontend
cd frontend && npm run lint
cd frontend && npm run format
cd frontend && npm run typecheck
cd frontend && npm run test

# AI Engine
cd ai-engine && poetry run ruff check . --fix
cd ai-engine && poetry run mypy .
cd ai-engine && poetry run pytest -v
```

## Git Workflow

1. Create feature branch from `develop`: `git checkout -b feat/feature-name`
2. Make changes with tests
3. Run `make lint` and `make test`
3. Push and create PR to `develop`
4. 2 approvals + CI passing → merge
5. Release: tag `vX.Y.Z` from `main`

## Security

- Never commit secrets
- Use `.env.example` for templates
- All secrets in Vault/Secrets Manager
- Rotate keys quarterly

## Monitoring

- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000`
- Loki: `http://localhost:3100`
- Tempo: `http://localhost:3200`

## Useful Commands

```bash
# View logs
make docker-logs

# View specific service logs
make docker-logs-backend
make docker-logs-frontend
make docker-logs-ai

# Database shell
make db-shell

# Redis CLI
make redis-cli

# Health check
make health

# Full cleanup
make clean
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8000 in use | `make docker-down` |
| DB connection failed | Check `docker-compose ps` |
| GPU not detected | `nvidia-smi`, check Docker GPU access |
| Migrations fail | Check DB connection, run `make migrate` |
| Frontend not loading | Check Vite dev server, port 5173 |

## Useful Links

- [Architecture Doc](documentation/architecture.md)
- [API Docs](http://localhost:8000/docs)
- [Frontend Repo](frontend/)
- [AI Engine Docs](ai-engine/docs/)
- [Deployment Guide](deployment/README.md)
- [Runbooks](documentation/runbooks/)