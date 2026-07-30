"""User endpoints."""

from typing import List, Optional
from uuid import UUID
from datetime import datetime
from enum import Enum

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_active_user, require_role
from app.core.database import get_db
from app.models.user import User, UserRole, UserStatus
from app.models.organization import Team
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserListResponse

router = APIRouter()


@router.post("", response_model=UserResponse, status_code=201)
async def create_user(
    user_data: dict,  # Would use UserCreate schema
    session: AsyncSession = Depends(get_db),
    current_user = Depends(require_role("admin", "org_admin")),
):
    """Create a new user (admin only)."""
    from app.models.user import User, UserRole, UserStatus
    from sqlalchemy import select
    from uuid import UUID
    from app.core.security import get_password_hash
    
    # Check if email or username already exists
    existing = await session.execute(
        select(User).where(
            (User.email == user_data["email"]) | (User.username == user_data["username"])
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email or username already exists")
    
    user = User(
        email=user_data["email"],
        username=user_data["username"],
        full_name=user_data["full_name"],
        hashed_password=get_password_hash(user_data["password"]),
        role=UserRole(user_data.get("role", "viewer")),
        organization_id=user_data.get("organization_id"),
        team_id=user_data.get("team_id"),
        phone=user_data.get("phone"),
        avatar_url=user_data.get("avatar_url"),
    )
    
    session.add(user)
    await session.commit()
    await session.refresh(user)
    
    return user


@router.get("", response_model=list)
async def list_users(
    skip: int = 0,
    limit: int = 20,
    role: Optional[str] = None,
    organization_id: Optional[str] = None,
    team_id: Optional[str] = None,
    is_active: Optional[bool] = True,
    search: Optional[str] = None,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user),
):
    """List users with filtering and pagination."""
    from sqlalchemy import select, func, or_
    from app.models.user import User
    
    query = select(User)
    
    if role:
        query = query.where(User.role == role)
    if organization_id:
        query = query.where(User.organization_id == team_id)
    if team_id:
        query = query.where(User.team_id == team_id)
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    if search:
        query = query.where(
            or_(
                User.full_name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
                User.username.ilike(f"%{search}%"),
            )
        )
    
    query = query.offset(skip).limit(limit).order_by(User.created_at.desc())
    
    result = await session.execute(query)
    users = result.scalars().all()
    
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "username": u.username,
            "full_name": u.full_name,
            "role": u.role.value,
            "organization_id": str(u.organization_id) if u.organization_id else None,
            "team_id": str(u.team_id) if u.team_id else None,
            "is_active": u.is_active,
            "is_superuser": u.is_superuser,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]


@router.get("/me", response_model=dict)
async def get_current_user_info(
    current_user = Depends(get_current_active_user),
):
    """Get current user profile."""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role.value,
        "organization_id": str(current_user.organization_id) if current_user.organization_id else None,
        "team_id": str(current_user.team_id) if current_user.team_id else None,
        "phone": current_user.phone,
        "avatar_url": current_user.avatar_url,
        "is_active": current_user.is_active,
        "is_superuser": current_user.is_superuser,
        "email_verified": current_user.email_verified,
        "last_login": current_user.last_login.isoformat() if current_user.last_login else None,
        "created_at": current_user.created_at.isoformat(),
        "updated_at": current_user.updated_at.isoformat(),
    }


@router.put("/me", response_model=dict)
async def update_current_user(
    user_data: dict,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user),
):
    """Update current user's profile."""
    from app.models.user import User
    from app.core.security import get_password_hash, verify_password
    
    # Update allowed fields
    if "full_name" in user_data:
        current_user.full_name = user_data["full_name"]
    if "phone" in user_data:
        current_user.phone = user_data["phone"]
    if "avatar_url" in user_data:
        current_user.avatar_url = user_data["avatar_url"]
    
    if "password" in user_data:
        if not verify_password(user_data.get("current_password", ""), current_user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password incorrect")
        current_user.hashed_password = get_password_hash(user_data["password"])
    
    current_user.updated_at = datetime.utcnow()
    await session.commit()
    await session.refresh(current_user)
    
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role.value,
        "phone": current_user.phone,
        "avatar_url": current_user.avatar_url,
        "is_active": current_user.is_active,
    }


@router.put("/{user_id}", response_model=dict)
async def update_user(
    user_id: str,
    user_data: dict,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(require_role("admin", "org_admin")),
):
    """Update user (admin only)."""
    from app.models.user import User
    from uuid import UUID
    
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_data
    for field, value in user_data.items():
        if hasattr(current_user, field) and field not in ["id", "created_at", "hashed_password"]:
            setattr(current_user, field, value)
    
    current_user.updated_at = datetime.utcnow()
    await session.commit()
    await session.refresh(current_user)
    
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role.value,
        "is_active": current_user.is_active,
    }


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: str,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(require_role("admin")),
):
    """Deactivate a user (soft delete)."""
    from app.models.user import User
    
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    user.is_active = False
    user.status = "inactive"
    await session.commit()
    
    return None