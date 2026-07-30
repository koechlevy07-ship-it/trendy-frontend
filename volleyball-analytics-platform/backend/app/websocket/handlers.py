"""WebSocket handlers for real-time communication."""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List, Set
import json
import asyncio
import json

from app.core.config import settings
from app.core.security import decode_token

router = APIRouter()


class ConnectionManager:
    """Manage WebSocket connections."""
    
    def __init__(self):
        self.active_connections: Dict[int, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, match_id: int):
        await websocket.accept()
        if match_id not in self.active_connections:
            self.active_connections[match_id] = set()
        self.active_connections[match_id].add(websocket)
    
    def disconnect(self, websocket: WebSocket, match_id: int):
        if match_id in self.active_connections:
            self.active_connections[match_id].discard(websocket)
            if not self.active_connections[match_id]:
                del self.active_connections[match_id]
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_text(json.dumps(message))
    
    async def broadcast(self, message: dict, match_id: int):
        if match_id in self.active_connections:
            for connection in self.active_connections[match_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    pass


manager = ConnectionManager()


async def get_current_user_ws(websocket: WebSocket, token: str = None):
    """Get current user from WebSocket token."""
    if not token:
        return None
    try:
        from app.core.security import decode_token
        payload = decode_token(token)
        return payload
    except Exception:
        return None


@router.websocket("/match/{match_id}")
async def websocket_match(
    websocket: WebSocket,
    match_id: int,
    token: str = None,
):
    """WebSocket endpoint for live match updates."""
    user = await get_current_user_ws(websocket, token)
    if not user:
        await websocket.close(code=4001)
        return
    
    await manager.connect(websocket, match_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
            data = json.loads(data)
            if data.get("type") == "ping":
                await manager.send_personal_message({"type": "pong"}, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, match_id)
    except Exception:
        manager.disconnect(websocket, match_id)