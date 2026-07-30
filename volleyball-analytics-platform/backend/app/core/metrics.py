"""Prometheus metrics collection."""

from prometheus_client import Counter, Histogram, Gauge, CollectorRegistry, generate_latest
from typing import Dict, Any
import time

# Custom registry for isolation
REGISTRY = CollectorRegistry()

# Request metrics
REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"],
    registry=REGISTRY
)

REQUEST_DURATION = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "endpoint"],
    registry=REGISTRY
)

# Error metrics
ERROR_COUNT = Counter(
    "http_errors_total",
    "Total HTTP errors",
    ["method", "endpoint", "error_type"],
    registry=REGISTRY
)

# Active users gauge
ACTIVE_USERS = Gauge(
    "active_users",
    "Number of currently active users",
    registry=REGISTRY
)

# Database metrics
DB_QUERY_DURATION = Histogram(
    "db_query_duration_seconds",
    "Database query duration in seconds",
    ["query_type"],
    registry=REGISTRY
)

DB_CONNECTIONS = Gauge(
    "db_connections_active",
    "Active database connections",
    registry=REGISTRY
)

# AI inference metrics
AI_INFERENCE_COUNT = Counter(
    "ai_inference_total",
    "Total AI inferences performed",
    ["model", "status"],
    registry=REGISTRY
)

AI_INFERENCE_DURATION = Histogram(
    "ai_inference_duration_seconds",
    "AI inference duration in seconds",
    ["model"],
    registry=REGISTRY
)

# Business metrics
PLAYERS_REGISTERED = Counter(
    "players_registered_total",
    "Total players registered",
    registry=REGISTRY
)

STAFF_REGISTERED = Counter(
    "staff_registered_total",
    "Total staff registered",
    registry=REGISTRY
)

MATCHES_PROCESSED = Counter(
    "matches_processed_total",
    "Total matches processed",
    registry=REGISTRY
)

FACE_EMBEDDINGS_GENERATED = Counter(
    "face_embeddings_generated_total",
    "Total face embeddings generated",
    registry=REGISTRY
)


def get_metrics() -> str:
    """Get all metrics in Prometheus format."""
    return generate_latest(REGISTRY)


def record_request(method: str, endpoint: str, status_code: int, duration: float):
    """Record HTTP request metrics."""
    REQUEST_COUNT.labels(method=method, endpoint=endpoint, status=status_code).inc()
    REQUEST_DURATION.labels(method=method, endpoint=endpoint).observe(duration)


def record_error(method: str, endpoint: str, error_type: str):
    """Record HTTP error metrics."""
    ERROR_COUNT.labels(method=method, endpoint=endpoint, error_type=error_type).inc()


def record_db_query(query_type: str, duration: float):
    """Record database query duration."""
    DB_QUERY_DURATION.labels(query_type=query_type).observe(duration)


def record_ai_inference(model: str, status: str, duration: float):
    """Record AI inference metrics."""
    AI_INFERENCE_COUNT.labels(model=model, status=status).inc()
    AI_INFERENCE_DURATION.labels(model=model).observe(duration)


def increment_players_registered():
    PLAYERS_REGISTERED.inc()


def increment_staff_registered():
    STAFF_REGISTERED.inc()


def increment_matches_processed():
    MATCHES_PROCESSED.inc()


def increment_face_embeddings_generated():
    FACE_EMBEDDINGS_GENERATED.inc()


def set_active_users(count: int):
    ACTIVE_USERS.set(count)


def set_db_connections(count: int):
    DB_CONNECTIONS.set(count)