"""Event publishing system for domain events."""

import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Any, Callable, Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime

logger = logging.getLogger(__name__)


@dataclass
class DomainEvent:
    """Represents a domain event."""
    event_type: str
    payload: Dict[str, Any]
    timestamp: datetime
    event_id: str


class EventHandler(ABC):
    """Abstract base class for event handlers."""

    @abstractmethod
    async def handle(self, event: DomainEvent) -> None:
        """Handle a domain event."""
        pass


class EventPublisher:
    """Event publisher for domain events."""

    def __init__(self):
        self._handlers: Dict[str, List[EventHandler]] = {}
        self._global_handlers: List[EventHandler] = []
        self._async_handlers: Dict[str, List[Callable]] = {}

    def register_handler(self, event_type: str, handler: EventHandler) -> None:
        """Register an event handler for a specific event type."""
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)

    def register_global_handler(self, handler: EventHandler) -> None:
        """Register a handler for all events."""
        self._global_handlers.append(handler)

    def register_async_handler(self, event_type: str, handler: Callable) -> None:
        """Register an async function handler for a specific event type."""
        if event_type not in self._async_handlers:
            self._async_handlers[event_type] = []
        self._async_handlers[event_type].append(handler)

    async def publish(self, event_type: str, payload: Dict[str, Any]) -> None:
        """Publish an event to all registered handlers."""
        event = DomainEvent(
            event_type=event_type,
            payload=payload,
            timestamp=datetime.utcnow(),
            event_id=f"{event_type}_{int(datetime.utcnow().timestamp() * 1000)}",
        )

        logger.debug(f"Publishing event: {event_type} with payload: {payload}")

        # Handle sync handlers
        handlers = self._handlers.get(event_type, [])
        for handler in handlers:
            try:
                await handler.handle(event)
            except Exception as e:
                logger.error(f"Error in handler {handler.__class__.__name__} for {event_type}: {e}")

        # Handle global handlers
        for handler in self._global_handlers:
            try:
                await handler.handle(event)
            except Exception as e:
                logger.error(f"Error in global handler {handler.__class__.__name__} for {event_type}: {e}")

        # Handle async function handlers
        async_handlers = self._async_handlers.get(event_type, [])
        tasks = []
        for handler in async_handlers:
            try:
                task = asyncio.create_task(handler(event))
                tasks.append(task)
            except Exception as e:
                logger.error(f"Error creating task for async handler {handler.__name__} for {event_type}: {e}")

        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)


class LoggingEventHandler(EventHandler):
    """Simple event handler that logs events."""

    def __init__(self, log_level: int = logging.INFO):
        self.log_level = log_level

    async def handle(self, event: DomainEvent) -> None:
        logger.log(self.log_level, f"Domain Event: {event.event_type} | Payload: {event.payload}")


# Global event publisher instance
event_publisher = EventPublisher()
event_publisher.register_global_handler(LoggingEventHandler())