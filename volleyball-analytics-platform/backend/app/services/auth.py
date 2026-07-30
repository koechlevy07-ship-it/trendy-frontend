"""
Authentication service for business logic.
"""
from typing import Optional, List
from uuid import UUID
from datetime import datetime, timedelta
import secrets

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import Depends

from app.core.config import settings
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    create_password_reset_token,
    verify_password_reset_token,
    create_email_verification_token,
    verify_email_verification_token,
    check_password_strength,
    get_permissions_for_role,
    decode_token,
)
from app.models.user import User, UserRole, UserStatus
from app.models.reports import AuditLog, AuditAction
from app.core.database import get_db


class AuthService:
    """Authentication service for user management."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def register_user(
        self,
        email: str,
        username: str,
        full_name: str,
        password: str,
        role: str = "viewer",
        organization_id: Optional[UUID] = None,
        team_id: Optional[UUID] = None,
    ) -> User:
        """Register a new user."""
        # Check if email already exists
        result = await self.session.execute(select(User).where(User.email == email))
        if result.scalar_one_or_none():
            raise ValueError("Email already registered")
        
        # Check if username already exists
        result = await self.session.execute(select(User).where(User.username == username))
        if result.scalar_one_or_none():
            raise ValueError("Username already taken")
        
        # Validate password strength
        is_valid, errors, score = check_password_strength(password)
        if not is_valid:
            raise ValueError(f"Password does not meet requirements: {', '.join(errors)}")
        
        # Validate role
        try:
            user_role = UserRole(role)
        except ValueError:
            raise ValueError(f"Invalid role: {role}")
        
        # Create user
        hashed_password = get_password_hash(password)
        user = User(
            email=email,
            username=username,
            full_name=full_name,
            password_hash=hashed_password,
            role=user_role,
            organization_id=organization_id,
            team_id=team_id,
            status=UserStatus.PENDING_VERIFICATION,
        )
        
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        
        # Log audit
        await self._log_audit(
            action=AuditAction.CREATE,
            resource_type="user",
            resource_id=user.id,
            new_values={"email": email, "username": username, "role": role},
        )
        
        return user

    async def change_password(
        self,
        user_id: UUID,
        current_password: str,
        new_password: str,
    ) -> bool:
        """Change user password."""
        user = await self.session.get(User, user_id)
        if not user:
            raise ValueError("User not found")
        
        if not verify_password(current_password, user.password_hash):
            raise ValueError("Current password is incorrect")
        
        # Validate new password strength
        is_valid, errors, score = check_password_strength(new_password)
        if not is_valid:
            raise ValueError(f"New password does not meet requirements: {', '.join(errors)}")
        
        # Check password history (simplified - in production, check against stored history)
        if verify_password(new_password, user.password_hash):
            raise ValueError("New password must be different from current password")
        
        # Update password
        user.password_hash = get_password_hash(new_password)
        user.updated_at = datetime.utcnow()
        
        await self.session.commit()
        
        # Log audit
        await self._log_audit(
            action=AuditAction.UPDATE,
            resource_type="user",
            resource_id=user_id,
            new_values={"password_changed": True},
        )
        
        return True

    async def request_password_reset(self, email: str) -> str:
        """Request password reset token."""
        result = await self.session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            # Return token anyway to prevent email enumeration
            return create_password_reset_token(email)
        
        token = create_password_reset_token(email)
        
        # Log audit
        await self._log_audit(
            action=AuditAction.UPDATE,
            resource_type="user",
            resource_id=user.id,
            new_values={"password_reset_requested": True},
        )
        
        return token

    async def confirm_password_reset(self, token: str, new_password: str) -> bool:
        """Confirm password reset with token."""
        email = verify_password_reset_token(token)
        if not email:
            raise ValueError("Invalid or expired reset token")
        
        result = await self.session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            raise ValueError("User not found")
        
        # Validate new password
        is_valid, errors, score = check_password_strength(new_password)
        if not is_valid:
            raise ValueError(f"Password does not meet requirements: {', '.join(errors)}")
        
        # Update password
        user.password_hash = get_password_hash(new_password)
        user.updated_at = datetime.utcnow()
        
        await self.session.commit()
        
        # Log audit
        await self._log_audit(
            action=AuditAction.UPDATE,
            resource_type="user",
            resource_id=user.id,
            new_values={"password_reset": True},
        )
        
        return True

    async def request_email_verification(self, email: str) -> str:
        """Request email verification token."""
        result = await self.session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            return create_email_verification_token(email)
        
        token = create_email_verification_token(email)
        
        # Log audit
        await self._log_audit(
            action=AuditAction.UPDATE,
            resource_type="user",
            resource_id=user.id,
            new_values={"email_verification_requested": True},
        )
        
        return token

    async def confirm_email_verification(self, token: str) -> bool:
        """Confirm email verification with token."""
        email = verify_email_verification_token(token)
        if not email:
            raise ValueError("Invalid or expired verification token")
        
        result = await self.session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            raise ValueError("User not found")
        
        if user.email_verified:
            raise ValueError("Email already verified")
        
        user.email_verified = True
        user.status = UserStatus.ACTIVE
        user.updated_at = datetime.utcnow()
        
        await self.session.commit()
        
        # Log audit
        await self._log_audit(
            action=AuditAction.UPDATE,
            resource_type="user",
            resource_id=user.id,
            new_values={"email_verified": True},
        )
        
        return True

    async def refresh_access_token(self, refresh_token: str) -> Optional[dict]:
        """Refresh access token using refresh token."""
        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                return None
            
            user_id = payload.get("sub")
            if not user_id:
                return None
            
            result = await self.session.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            
            if not user or not user.is_active:
                return None
            
            permissions = get_permissions_for_role(user.role.value)
            
            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": str(user.id), "email": user.email, "role": user.role.value},
                expires_delta=access_token_expires,
            )
            new_refresh_token = create_refresh_token(data={"sub": str(user.id)})
            
            return {
                "access_token": access_token,
                "refresh_token": new_refresh_token,
                "token_type": "bearer",
                "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            }
        except ValueError:
            return None

    async def logout_user(self, user_id: UUID) -> bool:
        """Logout user (revoke sessions)."""
        # In production, revoke all sessions for user
        await self._log_audit(
            action=AuditAction.LOGOUT,
            resource_type="user",
            resource_id=user_id,
        )
        return True

    async def _log_audit(
        self,
        action: AuditAction,
        resource_type: str,
        resource_id: UUID,
        old_values: dict = None,
        new_values: dict = None,
    ) -> None:
        """Log audit entry."""
        audit_log = AuditLog(
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            old_values=old_values,
            new_values=new_values,
        )
        self.session.add(audit_log)
        await self.session.flush()


def get_auth_service(session: AsyncSession = Depends(get_db)) -> AuthService:
    """Dependency to get auth service."""
    return AuthService(session)