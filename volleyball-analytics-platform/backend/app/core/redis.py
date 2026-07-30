"""Redis connection and caching utilities."""

import json
import uuid
from datetime import datetime, timedelta
from typing import Any, Optional, Union, List
from functools import wraps

import redis.asyncio as redis
from redis.asyncio import Redis

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class RedisManager:
    """Redis connection and operations manager."""
    
    def __init__(self):
        self._client: Optional[redis.Redis] = None
        self._pubsub: Optional[redis.client.PubSub] = None
    
    async def initialize(self) -> None:
        """Initialize Redis connection."""
        self._client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=settings.REDIS_MAX_CONNECTIONS,
        )
        logger.info("Redis connection initialized")
    
    async def close(self) -> None:
        """Close Redis connection."""
        if self._client:
            await self._client.close()
            logger.info("Redis connection closed")
    
    @property
    def client(self) -> redis.Redis:
        """Get Redis client."""
        if not self._client:
            raise RuntimeError("Redis not initialized. Call initialize() first.")
        return self._client
    
    # Cache operations
    async def get(self, key: str) -> Optional[str]:
        """Get value from cache."""
        return await self.client.get(key)
    
    async def set(
        self,
        key: str,
        value: Union[str, int, float, bool, dict, list],
        expire: int = 3600,
    ) -> bool:
        """Set value in cache with expiration."""
        if isinstance(value, (dict, list)):
            value = json.dumps(value)
        return await self.client.set(key, value, ex=expire)
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        return await self.client.delete(key) > 0
    
    async def exists(self, key: str) -> bool:
        """Check if key exists."""
        return await self.client.exists(key) > 0
    
    async def expire(self, key: str, seconds: int) -> bool:
        """Set expiration on key."""
        return await self.client.expire(key, seconds)
    
    async def increment(self, key: str, amount: int = 1) -> int:
        """Increment a counter."""
        return await self.client.incrby(key, amount)
    
    # Hash operations
    async def hset(self, name: str, key: str, value: str) -> int:
        """Set hash field."""
        return await self.client.hset(name, key, value)
    
    async def hget(self, name: str, key: str) -> Optional[str]:
        """Get hash field."""
        return await self.client.hget(name, key)
    
    async def hgetall(self, name: str) -> dict:
        """Get all hash fields."""
        return await self.client.hgetall(name)
    
    async def hdel(self, name: str, *keys: str) -> int:
        """Delete hash fields."""
        return await self.client.hdel(name, *keys)
    
    # List operations
    async def lpush(self, key: str, *values: str) -> int:
        """Push to list head."""
        return await self.client.lpush(key, *values)
    
    async def rpush(self, key: str, *values: str) -> int:
        """Push to list tail."""
        return await self.client.rpush(key, *values)
    
    async def lpop(self, key: str) -> Optional[str]:
        """Pop from list head."""
        return await self.client.lpop(key)
    
    async def rpop(self, key: str) -> Optional[str]:
        """Pop from list tail."""
        return await self.client.rpop(key)
    
    async def lrange(self, key: str, start: int = 0, end: int = -1) -> list:
        """Get list range."""
        return await self.client.lrange(key, start, end)
    
    # Pub/Sub
    async def publish(self, channel: str, message: str) -> int:
        """Publish message to channel."""
        return await self.client.publish(channel, message)
    
    async def subscribe(self, *channels: str):
        """Subscribe to channels."""
        self._pubsub = self.client.pubsub()
        await self._pubsub.subscribe(*channels)
        return self._pubsub
    
    # Cache decorators
    def cache(self, key: str, expire: int = 3600):
        """Decorator to cache function results."""
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                cache_key = f"{func.__name__}:{hash(str(args) + str(sorted(kwargs.items())))}"
                
                # Try cache first
                cached = await self.get(key)
                if cached is not None:
                    return json.loads(cached)
                
                # Execute function
                result = await func(*args, **kwargs)
                
                # Cache result
                await self.set(key, result, expire=expire)
                return result
            return wrapper
        return decorator
    
    # Session management
    async def create_session(self, user_id: str, data: dict, expire: int = 86400) -> str:
        """Create user session."""
        session_id = f"session:{uuid.uuid4()}"
        session_data = {
            "user_id": user_id,
            "data": data,
            "created_at": datetime.utcnow().isoformat(),
        }
        await self.set(f"session:{session_id}", session_data, expire)
        return session_id
    
    async def get_session(self, session_id: str) -> Optional[dict]:
        """Get session data."""
        return await self.get(f"session:{session_id}")
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete session."""
        return await self.delete(f"session:{session_id}")
    
    # Rate limiting
    async def check_rate_limit(
        self,
        key: str,
        limit: int,
        window: int,
    ) -> tuple[bool, int]:
        """
        Check rate limit using sliding window.
        Returns (allowed, remaining_requests).
        """
        key = f"ratelimit:{key}"
        current = await self.client.get(key)
        
        if current is None:
            await self.set(key, 1, expire=window)
            return True, limit - 1
        
        current = int(current)
        if current >= limit:
            return False, 0
        
        await self.increment(key)
        return True, limit - current - 1


# Global Redis manager instance
redis_manager = RedisManager()


async def init_redis() -> None:
    """Initialize Redis connection."""
    await redis_manager.initialize()


async def close_redis() -> None:
    """Close Redis connection."""
    await redis_manager.close()


async def get_redis() -> RedisManager:
    """Dependency to get Redis manager."""
    return redis_manager