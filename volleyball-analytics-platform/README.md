# Volleyball Analytics Platform

AI-Powered Real-Time Volleyball Player Performance Analysis and Statistics Management System Using Computer Vision.

## Overview

The Volleyball Analytics Platform is an AI-powered system that uses computer vision to automatically detect players, track movements, recognize volleyball actions, and generate comprehensive match statistics in real-time — eliminating the need for manual data entry.

## Features

- **Real-time Player Detection & Tracking** - YOLOv8 + ByteTrack for multi-player tracking
- **Ball Detection & Trajectory Analysis** - Specialized ball detection with trajectory estimation
- **Jersey Number Recognition (OCR)** - PaddleOCR/EasyOCR for player identification
- **Pose Estimation** - MediaPipe/RTMPose for 33-keypoint skeletal tracking
- **Action Recognition** - 16+ volleyball actions (serve, spike, block, dig, set, etc.)
- **Automatic Statistics Generation** - Kills, digs, blocks, aces, errors, efficiency ratings
- **Heat Maps & Tactical Analysis** - Court coverage, attack zones, defensive patterns
- **Live Match Dashboard** - Real-time statistics, rally timeline, video replay sync
- **Automated Reports** - PDF/CSV match, player, and team reports

## Architecture

```
volleyball-analytics-platform/
├── backend/           # FastAPI (Python 3.11+) - API, Auth, Database
├── frontend/          # React 18 + TypeScript + Vite
├── ai-engine/         # AI/ML Services (Python, PyTorch)
├── mobile/            # React Native (future)
├── database/          # Migrations, seeds, schemas
├── infrastructure/    # Terraform, Helm, K8s, Docker, Monitoring
├── deployment/        # Docker Compose, K8s manifests, CI/CD
├── documentation/     # Architecture, API, Deployment, Runbooks
├── infrastructure/    # Docker, Nginx, Cloud, Monitoring, Terraform
├── shared/            # Shared types, constants, events, config
├── datasets/          # Training/validation data
├── models/            # Model registry, weights, configs
├── scripts/           # Utility scripts
├── tests/             # Cross-cutting E2E, contract tests
├── tools/             # Utility tools
├── .github/           # GitHub Actions, templates
├── .vscode/           # VS Code configuration
├── docker-compose.yml
├── .env.example
└── README.md
```

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | React + TypeScript + Vite | 18.2 / 5.4 / 5.x |
| Backend | FastAPI + SQLAlchemy 2.0 | 0.110 / 2.0 |
| AI Engine | PyTorch + Ultralytics | 2.3 / 8.2 |
| Database | PostgreSQL | 16 |
| Cache/Queue | Redis | 7.2 |
| Object Storage | MinIO / S3 | Latest |
| Orchestration | Kubernetes (EKS/GKE/AKS) | 1.28 |
| CI/CD | GitHub Actions + ArgoCD | Latest |
| Monitoring | Prometheus + Grafana + Loki | Latest |
| Tracing | Tempo | Latest |

## Quick Start

### Prerequisites
- Docker Desktop ≥ 24.0
- Python 3.11+
- Node.js 20 LTS
- Poetry 1.7+
- kubectl, helm, terraform (for deployment)

### Quick Start (Local Development)

```bash
# 1. Clone repository
git clone https://github.com/your-org/volleyball-analytics-platform.git
cd volleyball-analytics-platform

# 2. Configure environment
cp .env.example .env
# Edit .env with your local settings

# 3. Start infrastructure
docker-compose up -d

# 4. Backend setup
cd backend
poetry install
poetry run alembic upgrade head
poetry run uvicorn app.main:app --reload

# 5. Frontend setup (new terminal)
cd frontend
npm install
npm run dev

# 6. AI Engine (separate terminal)
cd ai-engine
poetry install
poetry run python -m inference.main
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Backend API | 8000 | REST API, WebSocket |
| Frontend | 5173 | Vite dev server |
| AI Inference | 8001 | AI Inference API |
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Cache, sessions, queues |
| MinIO | 9000/9001 | Object storage |
| Kafka | 9092 | Event streaming |

## Documentation

- [Architecture Overview](documentation/architecture/)
- [API Documentation](documentation/api/)
- [Backend Guide](documentation/backend/)
- [Frontend Guide](documentation/frontend/)
- [Database Schema](documentation/database/)
- [AI/ML Pipeline](documentation/ai/)
- [Deployment Guide](documentation/deployment/)
- [API Reference](documentation/api/)
- [Architecture Diagrams](documentation/diagrams/)
- [Runbooks](documentation/runbooks/)

## Development Workflow

1. **Create feature branch** from `develop`
2. **Implement** with tests
3. **Run CI checks** (lint, typecheck, tests)
4. **Create PR** with description
5. **Code review** (2 approvals required)
6. **Merge to develop** → auto-deploy to staging
7. **Release** → tag `vX.Y.Z` → auto-deploy to production

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Support

- Issues: [GitHub Issues](https://github.com/your-org/volleyball-analytics-platform/issues)
- Discussions: [GitHub Discussions](https://github.com/your-org/volleyball-analytics-platform/discussions)
- Email: support@volleyball-analytics.com