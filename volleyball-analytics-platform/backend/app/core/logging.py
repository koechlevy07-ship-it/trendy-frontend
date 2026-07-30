"""Structured logging configuration for the Volleyball Analytics Platform."""

import logging
import logging.config
import sys
from datetime import datetime
from typing import Any, Dict, Optional
import json
import uuid

from app.core.config import settings


class JSONFormatter(logging.Formatter):
    """JSON formatter for structured logging."""

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add correlation ID if present
        if hasattr(record, "correlation_id") and record.correlation_id:
            log_data["correlation_id"] = record.correlation_id

        # Add user info if present
        if hasattr(record, "user_id") and record.user_id:
            log_data["user_id"] = record.user_id

        # Add extra fields
        for key, value in record.__dict__.items():
            if key not in [
                "name", "msg", "args", "created", "filename", "funcName",
                "levelname", "levelno", "lineno", "module", "msecs",
                "message", "msg", "name", "pathname", "process",
                "processName", "relativeCreated", "thread", "threadName",
                "exc_info", "exc_text", "stack_info", "correlation_id",
                "user_id"
            ]:
                log_data[key] = value

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data, default=str)


class SensitiveDataFilter(logging.Filter):
    """Filter to remove sensitive data from logs."""

    SENSITIVE_KEYS = {
        "password", "token", "secret", "key", "authorization",
        "credit_card", "ssn", "passport", "national_id",
        "face_embedding", "biometric", "fingerprint"
    }

    def filter(self, record: logging.LogRecord) -> bool:
        # Filter message
        if hasattr(record, "msg") and isinstance(record.msg, str):
            for key in self.SENSITIVE_KEYS:
                if key.lower() in record.msg.lower():
                    record.msg = "[REDACTED]"
                    break

        # Filter extra fields
        for key in list(record.__dict__.keys()):
            if key.lower() in self.SENSITIVE_KEYS:
                record.__dict__[key] = "[REDACTED]"

        return True


def setup_logging():
    """Configure application logging."""
    
    log_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json": {
                "()": "app.core.logging.JSONFormatter",
            },
            "standard": {
                "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "detailed": {
                "format": "%(asctime)s [%(levelname)s] %(name)s:%(lineno)d - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "filters": {
            "sensitive_data": {
                "()": "app.core.logging.SensitiveDataFilter",
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "standard" if not settings.LOG_JSON else "json",
                "stream": "ext://sys.stdout",
                "filters": ["sensitive_data"],
            },
            "file": {
                "class": "logging.handlers.RotatingFileHandler",
                "formatter": "json",
                "filename": settings.LOG_FILE,
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
                "filters": ["sensitive_data"],
            },
            "error_file": {
                "class": "logging.handlers.RotatingFileHandler",
                "formatter": "json",
                "filename": settings.LOG_FILE.replace(".log", "_error.log"),
                "maxBytes": 10485760,
                "backupCount": 5,
                "level": "ERROR",
                "filters": ["sensitive_data"],
            },
            "audit_file": {
                "class": "logging.handlers.RotatingFileHandler",
                "formatter": "json",
                "filename": settings.LOG_FILE.replace(".log", "_audit.log"),
                "maxBytes": 10485760,
                "backupCount": 10,
                "level": "INFO",
                "filters": ["sensitive_data"],
            },
        },
        "loggers": {
            "": {  # Root logger
                "handlers": ["console", "file", "error_file"],
                "level": settings.LOG_LEVEL,
                "propagate": False,
            },
            "audit": {  # Audit logger
                "handlers": ["audit_file"],
                "level": "INFO",
                "propagate": False,
            },
            "security": {  # Security events logger
                "handlers": ["audit_file"],
                "level": "WARNING",
                "propagate": False,
            },
            "performance": {  # Performance logger
                "handlers": ["console", "file"],
                "level": "INFO",
                "propagate": False,
            },
            "uvicorn": {
                "handlers": ["console", "file"],
                "level": "INFO",
                "propagate": False,
            },
            "uvicorn.access": {
                "handlers": ["file"],
                "level": "INFO",
                "propagate": False,
            },
            "sqlalchemy.engine": {
                "handlers": ["file"],
                "level": "WARNING",
                "propagate": False,
            },
        },
    }

    logging.config.dictConfig(log_config)

    # Set third-party loggers to WARNING to reduce noise
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.pool").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance."""
    return logging.getLogger(name)


def get_audit_logger() -> logging.Logger:
    """Get the audit logger for audit events."""
    return logging.getLogger("audit")


def get_security_logger() -> logging.Logger:
    """Get the security logger for security events."""
    return logging.getLogger("security")


def get_performance_logger() -> logging.Logger:
    """Get the performance logger for performance metrics."""
    return logging.getLogger("performance")


class LogContext:
    """Context manager for adding contextual information to logs."""
    
    def __init__(self, logger: logging.Logger, **kwargs):
        self.logger = logger
        self.context = kwargs
        self.old_extra = getattr(logger, "_extra", {})
    
    def __enter__(self):
        self.logger._extra = {**self.old_extra, **self.context}
        return self.logger
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.logger._extra = self.old_extra


def log_with_context(logger: logging.Logger, level: int, message: str, **context) -> None:
    """Log a message with additional context."""
    extra = {k: v for k, v in context.items() if k not in {"exc_info", "stack_info"}}
    logger.log(level, message, extra=extra, exc_info=context.get("exc_info"), stack_info=context.get("stack_info"))


def audit_log(
    action: str,
    entity_type: str,
    entity_id: str,
    user_id: str = None,
    user_role: str = None,
    old_values: dict = None,
    new_values: dict = None,
    result: str = "success",
    ip_address: str = None,
    correlation_id: str = None,
    remarks: str = None,
) -> None:
    """Log an audit event."""
    audit_logger = get_audit_logger()
    
    log_data = {
        "action": action,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "user_id": user_id,
        "user_role": user_role,
        "old_values": old_values,
        "new_values": new_values,
        "result": result,
        "ip_address": ip_address,
        "correlation_id": correlation_id,
        "remarks": remarks,
    }
    
    # Remove None values
    log_data = {k: v for k, v in log_data.items() if v is not None}
    
    audit_logger.info("AUDIT", extra=log_data)


def security_log(
    event_type: str,
    user_id: str = None,
    ip_address: str = None,
    details: dict = None,
    severity: str = "warning",
) -> None:
    """Log a security event."""
    security_logger = get_security_logger()
    
    log_data = {
        "event_type": event_type,
        "user_id": user_id,
        "ip_address": ip_address,
        "details": details or {},
        "severity": severity,
    }
    
    log_level = getattr(logging, severity.upper(), logging.WARNING)
    security_logger.log(log_level, f"SECURITY: {event_type}", extra=log_data)