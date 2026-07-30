.PHONY: help dev build test lint format typecheck migrate clean docker-build docker-up docker-down docker-logs

.DEFAULT_GOAL := help

help:
	@echo "Volleyball Analytics Platform - Development Commands"
	@echo ""
	@echo "Usage:"
	@echo "  make <target>"
	@echo ""
	@echo "Targets:"
	@echo "  dev             Start all services in development mode"
	@echo "  build           Build all Docker images"
	@echo "  test            Run all tests"
	@echo "  lint            Run all linters"
	@echo "  format          Format code"
	@echo "  typecheck       Run type checking"
	@echo "  migrate         Run database migrations"
	@echo "  migrate-create  Create new migration"
	@echo "  docker-build    Build all Docker images"
	@echo "  docker-up       Start all services"
	@echo "  docker-down     Stop all services"
	@echo "  docker-logs     View service logs"
	@echo "  clean           Clean build artifacts"

dev:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
	@echo "Services starting... Backend: http://localhost:8000, Frontend: http://localhost:5173, AI: http://localhost:8001"

build:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml build

test:
	@echo "Running backend tests..."
	cd backend && poetry run pytest -v --cov=app --cov-report=term-missing
	@echo "Running frontend tests..."
	cd frontend && npm run test
	@echo "Running AI engine tests..."
	cd ai-engine && poetry run pytest -v

lint:
	@echo "Linting backend..."
	cd backend && poetry run ruff check .
	@echo "Linting frontend..."
	cd frontend && npm run lint
	@echo "Linting AI engine..."
	 cd ai-engine && poetry run ruff check .

format:
	@echo "Formatting backend..."
	cd backend && poetry run black . && poetry run ruff check . --fix
	@echo "Formatting frontend..."
	cd frontend && npm run format

typecheck:
	@echo "Type checking backend..."
	cd backend && poetry run mypy .
	@echo "Type checking frontend..."
	cd frontend && npm run typecheck

migrate:
	cd backend && poetry run alembic upgrade head

migrate-create:
	@read -p "Enter migration message: " msg; \
	cd backend && poetry run alembic revision --autogenerate -m "$$msg"

docker-build:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml build

docker-up:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
	@echo "Services starting..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:5173"
	@echo "AI Engine: http://localhost:8001"
	@echo "API Docs: http://localhost:8000/docs"
	@echo "MinIO Console: http://localhost:9001"

docker-down:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml down

docker-down-v:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml down -v

docker-logs:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml logs -f

docker-logs-backend:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml logs -f backend

docker-logs-frontend:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml logs -f frontend

docker-logs-ai:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml logs -f ai-engine

docker-ps:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml ps

docker-restart:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml restart

clean:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml down -v
	docker system prune -f
	rm -rf backend/.venv frontend/node_modules ai-engine/.venv
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true

db-shell:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml exec postgres psql -U volley -d volley

redis-cli:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml exec redis redis-cli

backend-shell:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml exec backend bash

frontend-shell:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml exec frontend sh

ai-shell:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml exec ai-engine bash

db-migrate:
	cd backend && poetry run alembic upgrade head

db-migrate-create:
	@read -p "Enter migration message: " msg; \
	cd backend && poetry run alembic revision --autogenerate -m "$$msg"

db-downgrade:
	cd backend && poetry run alembic downgrade -1

db-history:
	cd backend && poetry run alembic history

seed-db:
	cd backend && poetry run python -m database.seeds.seed

backup-db:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml exec -T postgres pg_dump -U volley volley > backup_$(date +%Y%m%d_%H%M%S).sql

restore-db:
	@read -p "Enter backup file: " file; \
	docker-compose -f docker-compose.yml -f docker-compose.override.yml exec -T postgres psql -U volley -d volley < $$file

logs:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml logs -f --tail=100

logs-backend:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml logs -f backend

logs-frontend:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml logs -f frontend

logs-ai:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml logs -f ai-engine

status:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml ps

health:
	curl -f http://localhost:8000/health || echo "Backend: DOWN"
	curl -f http://localhost:8001/health || echo "AI Engine: DOWN"
	curl -f http://localhost:5173 || echo "Frontend: DOWN"
	curl -f http://localhost:9000/minio/health/live || echo "MinIO: DOWN"

setup:
	cp -n .env.example .env || true
	cd backend && poetry install
	cd frontend && npm install
	cd ai-engine && poetry install
	docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
	sleep 10
	cd backend && poetry run alembic upgrade head
	@echo "Setup complete!"