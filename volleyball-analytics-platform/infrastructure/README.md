# Volleyball Analytics Platform - Infrastructure

## Infrastructure Overview

This directory contains all infrastructure-as-code definitions, deployment configurations, and operational tooling for the Volleyball Analytics Platform.

## Structure

```
infrastructure/
├── docker/                   # Docker configurations
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── Dockerfile.ai-engine
│   └── docker-compose.base.yml
├── nginx/
│   ├── nginx.conf
│   ├── conf.d/
│   │   ├── upstream.conf
│   │   ├── ssl.conf
│   │   └── rate-limit.conf
│   └── ssl/
├── cloud/
│   ├── aws/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── modules/
│   ├── azure/
│   └── gcp/
├── monitoring/
│   ├── prometheus/
│   │   ├── prometheus.yml
│   │   ├── rules/
│   │   └── alerts/
│   ├── grafana/
│   │   ├── dashboards/
│   │   └── datasources/
│   ├── loki/
│   │   └── loki-config.yml
│   ├── tempo/
│   │   └── tempo-config.yml
│   └── alertmanager/
│       └── alertmanager.yml
├── logging/
│   ├── fluentd/
│   │   └── fluent.conf
│   └── logrotate/
├── terraform/
│   ├── modules/
│   │   ├── vpc/
│   │   ├── eks/
│   │   ├── rds/
│   │   ├── elasticache/
│   │   ├── s3/
│   │   ├── iam/
│   │   ├── kms/
│   │   ├── cloudfront/
│   │   ├── route53/
│   │   └── monitoring/
│   ├── environments/
│   │   ├── dev/
│   │   ├── staging/
│   │   └── prod/
│   └── main.tf
├── kubernetes/
│   ├── base/
│   │   ├── namespace.yaml
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   ├── configmap.yaml
│   │   ├── secret.yaml
│   │   ├── hpa.yaml
│   │   └── pdb.yaml
│   ├── overlays/
│   │   ├── dev/
│   │   ├── staging/
│   │   └── prod/
│   └── kustomization.yaml
├── monitoring/
│   ├── prometheus/
│   ├── grafana/
│   ├── loki/
│   ├── tempo/
│   └── alertmanager/
├── logging/
│   ├── fluentd/
│   └── logrotate/
├── ci-cd/
│   ├── github-actions/
│   │   ├── ci.yml
│   │   ├── cd-staging.yml
│   │   ├── cd-production.yml
│   │   └── security-scan.yml
│   └── argocd/
└── scripts/
    ├── setup-cluster.sh
    ├── deploy.sh
    ├── rollback.sh
    ├── backup.sh
    └── migrate.sh
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- kubectl, helm, terraform
- AWS CLI / Azure CLI / gcloud
- kubectl, helm

### Local Development
```bash
# Start all services
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d

# View logs
docker-compose logs -f backend
```

### Production Deployment
```bash
# Deploy to Kubernetes
cd infrastructure/kubernetes/overlays/prod
kubectl apply -k .

# Or using ArgoCD
kubectl apply -k infrastructure/kubernetes/overlays/prod
```

## Infrastructure Components

### Kubernetes (EKS/GKE/AKS)
- **Control Plane**: Managed Kubernetes (EKS/GKE/AKS)
- **Node Groups**: 
  - System: t3.medium (2-3 nodes)
  - General: t3.large (3-10 nodes, auto-scaling)
  - GPU: g5.xlarge/g5.2xlarge (1-5 nodes, auto-scaling)
- **Networking**: VPC with public/private subnets, NAT gateways
- **Storage**: EBS volumes, EFS for shared storage
- **Networking**: ALB Ingress, Network Policies

### Data Layer
- **PostgreSQL**: Aurora/RDS Multi-AZ (Primary + Read Replica)
- **Redis**: ElastiCache Redis Cluster (Multi-AZ)
- **Object Storage**: S3/MinIO for videos, models, exports
- **Cache**: Redis Cluster for caching & sessions
- **Message Queue**: Kafka/MSK for event streaming

### Monitoring Stack
- **Prometheus**: Metrics collection (30d retention)
- **Grafana**: Dashboards & alerting
- **Loki**: Log aggregation (30d retention)
- **Tempo**: Distributed tracing
- **Alertmanager**: Alert routing & deduplication

### CI/CD Pipeline
- **GitHub Actions**: CI/CD pipelines
- **ArgoCD**: GitOps deployment
- **Image Registry**: GHCR/ECR
- **Security**: Trivy, Snyk, Cosign

## Environment Configuration

### Environments
| Environment | Purpose | Domain | Replicas |
|-------------|---------|--------|----------|
| Development | Development | dev.volley.ai | 1-2 |
| Staging | QA/Testing | staging.volley.ai | 2-3 |
| Production | Live | app.volley.ai | 3-10 (auto-scale) |

### Environment Variables
```bash
# Required
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
REDIS_URL=redis://redis:6379/0
JWT_SECRET_KEY=change-me-in-production
JWT_ALGORITHM=RS256

# AI Engine
AI_INFERENCE_URL=http://ai-engine:8001
MODEL_REGISTRY_URI=s3://models/

# Storage
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=xxx
MINIO_SECRET_KEY=xxx
MINIO_BUCKET=volleyball-videos

# Monitoring
PROMETHEUS_URL=http://prometheus:9090
GRAFANA_URL=http://grafana:3000
```

## Kubernetes Resources

### Resource Quotas (Production)
```yaml
# namespace quotas
requests:
  cpu: "4"
  memory: 16Gi
limits:
  cpu: "16"
  memory: 64Gi
```

### Resource Requests/Limits
| Service | CPU Request | CPU Limit | Memory Request | Memory Limit | GPU |
|---------|-------------|-----------|----------------|--------------|-----|
| Backend API | 500m | 2000m | 512Mi | 2Gi | No |
| Frontend | 100m | 500m | 128Mi | 512Mi | No |
| AI Inference | 2000m | 4000m | 4Gi | 8Gi | 1x A10G |
| AI Training | 8000m | 16000m | 16Gi | 32Gi | 4x A100 |
| PostgreSQL | 1000m | 4000m | 4Gi | 16Gi | No |
| Redis | 500m | 2000m | 2Gi | 8Gi | No |

## Security

### Network Policies
```yaml
# Default deny all
# Explicit allow rules for:
# - Frontend -> Backend API
# - Backend -> AI Engine (gRPC/HTTP)
# - Backend -> PostgreSQL
# - Backend -> Redis
# - AI Engine -> Model Storage
# - Monitoring -> All services
```

### Secrets Management
- **Development**: `.env` files (gitignored)
- **Staging/Production**: HashiCorp Vault / AWS Secrets Manager
- **Rotation**: Automated rotation every 90 days

## Monitoring & Alerting

### Key Metrics
| Metric | Warning | Critical |
|--------|---------|----------|
| API Latency (p99) | > 500ms | > 1s |
| Error Rate | > 1% | > 5% |
| CPU Usage | > 70% | > 90% |
| Memory Usage | > 80% | > 95% |
| Disk Usage | > 70% | > 90% |
| GPU Memory | > 80% | > 95% |
| Queue Depth | > 100 | > 1000 |

### Key Alerts
- **Critical**: API down, DB unreachable, GPU OOM
- **Warning**: High latency, queue backup, disk space
- **Info**: New deployment, scaling events

## Backup & Disaster Recovery

| Component | RPO | RTO | Method |
|-----------|-----|-----|--------|
| PostgreSQL | 1 min | 15 min | Continuous WAL + Daily snapshots |
| Redis | 1 hour | 30 min | AOF + RDB snapshots |
| Object Storage | 1 hour | 1 hour | Cross-region replication |
| Kubernetes | N/A | 30 min | Velero backups |
| ML Models | 1 day | 1 hour | MLflow + S3 versioning |

---

*Last Updated: July 15, 2026 | Version 1.0*