# Volleyball Analytics Platform - Deployment

Deployment configurations and scripts.

## Structure

```
deployment/
├── docker-compose.yml           # Local development
├── docker-compose.override.yml  # Local overrides (gitignored)
├── docker-compose.prod.yml      # Production
├── docker-compose.staging.yml   # Staging
├── Dockerfile.backend           # Backend container
├── Dockerfile.frontend          # Frontend container
├── Dockerfile.ai-engine         # AI Engine container
├── nginx/
│   ├── nginx.conf
│   ├── conf.d/
│   │   └── default.conf
│   └── ssl/
├── kubernetes/
│   ├── base/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   ├── configmap.yaml
│   │   └── secret.yaml
│   ├── overlays/
│   │   ├── dev/
│   │   ├── staging/
│   │   └── prod/
│   └── kustomization.yaml
├── scripts/
│   ├── deploy.sh
│   ├── rollback.sh
│   ├── health-check.sh
│   └── migrate.sh
├── helm/
│   ├── Chart.yaml
│   ├── values.yaml
│   ├── values-dev.yaml
#       values-staging.yaml
#       values-prod.yaml
#       templates/
└── README.md
```

## Quick Start

```bash
# Local development
docker-compose up -d

# Production deploy
cd deployment
./scripts/deploy.sh production

# Rollback
./scripts/rollback.sh v1.2.3
```

## Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | localhost | Local development |
| Staging | staging.volley.ai | Pre-production testing |
| Production | app.volley.ai | Live platform |

## Kubernetes Deployment

```bash
# Deploy to staging
kubectl apply -k infrastructure/kubernetes/overlays/staging

# Deploy to production
kubectl apply -k infrastructure/kubernetes/overlays/prod

# Check status
kubectl get pods -n volleyball-prod
```

## Helm Deployment

```bash
# Install
helm install volley-platform ./helm -f ./helm/values-prod.yaml

# Upgrade
helm upgrade volley-platform ./helm -f ./helm/values-prod.yaml

# Rollback
helm rollback volley-platform 3
```

## Monitoring

- **Prometheus**: http://monitoring.volley.local:9090
- **Grafana**: http://monitoring.volley.local:3000
- **Alertmanager**: http://monitoring.volley.local:9093
- **Loki**: http://loki.volley.local:3100

## Secrets Management

Secrets stored in:
- **Development**: `.env` files (gitignored)
- **Staging/Production**: HashiCorp Vault / AWS Secrets Manager / Azure Key Vault
- **Kubernetes**: Sealed Secrets / External Secrets Operator

## Backup & Recovery

```bash
# Backup database
./scripts/backup.sh

# Restore database
./scripts/restore.sh backup_20240115.sql

# Verify backup
./scripts/verify-backup.sh backup_20240115.sql
```

## CI/CD

GitHub Actions workflows in `.github/workflows/`:
- `ci.yml` - Continuous integration
- `cd-staging.yml` - Staging deployment
- `cd-production.yml` - Production deployment
- `security-scan.yml` - Security scanning