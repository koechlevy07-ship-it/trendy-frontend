"""Rate limiting middleware."""

import time
from typing import Dict, Tuple
from collections import defaultdict

from fastapi import Request, Response, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitingMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware."""
    
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[str, list] = {}
    
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Clean old entries
        cutoff = time.time() - 60
        self.requests = {
            ip: timestamps for ip, timestamps in self.requests.items()
            if any(t > cutoff for t in timestamps)
        }
        
        # Check rate limit
        if request.client:
            client_requests = self.requests.get(request.client.host, [])
            recent_requests = [t for t in client_requests if t > time.time() - 60]
            
            if len(recent_requests) >= self.requests_per_minute:
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded. Please try again later.",
                    headers={"Retry-After": "60"},
                )
            
            # Add current request
            recent_requests.append(time.time())
            self.requests[request.client.host] = recent_requests
        
        return await call_next(request)