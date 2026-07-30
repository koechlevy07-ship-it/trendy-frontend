"""
Authentication endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta
from typing import Annotated, Optional
from uuid import UUID

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    create_token_pair,
    create_password_reset_token,
    verify_password_reset_token,
    create_email_verification_token,
    verify_email_verification_token,
    decode_token,
    check_password_strength,
    get_permissions_for_role,
    require_role,
    oauth2_scheme,
)
from app.models.user import User, UserRole, UserStatus
from app.models.reports import AuditLog, AuditAction
from app.schemas.auth import (
    Token,
    UserLogin,
    UserRegister,
    UserResponse,
    PasswordChange,
    PasswordResetRequest,
    PasswordResetConfirm,
    EmailVerificationRequest,
    EmailVerificationConfirm,
    RefreshTokenRequest,
    MessageResponse,
    PermissionResponse,
    RolePermissionsResponse,
)

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: AsyncSession = Depends(get_db),
) -> User:
    """Get current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except ValueError:
        raise credentials_exception
    
    user = await session.get(User, user_id)
    if user is None:
        raise credentials_exception
    
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User inactive")
    
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Get current active user."""
    if current_user.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    return current_user


@router.post("/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: AsyncSession = Depends(get_db),
) -> Token:
    """User login - returns access and refresh tokens."""
    # Find user by email
    result = await session.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User inactive or not verified")
    
    # Create tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value},
        expires_delta=access_token_expires,
    )
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    # Update last login
    user.last_login = datetime.utcnow()
    await session.commit()
    
    # Log audit
    audit = AuditLog(
        user_id=user.id,
        action=AuditAction.LOGIN,
        resource_type="user",
        resource_id=user.id,
        status="success",
    )
    session.add(audit)
    await session.commit()
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    session: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Register a new user."""
    # Check if email already exists
    result = await session.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Check if username already exists
    result = await session.execute(select(User).where(User.username == user_data.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )
    
    # Check password strength
    is_valid, errors, score = check_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password does not meet requirements: {', '.join(errors)}",
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        password_hash=hashed_password,
        role=UserRole(user_data.role),
        organization_id=user_data.organization_id,
        team_id=user_data.team_id,
        status=UserStatus.PENDING_VERIFICATION,
    )
    
    session.add(user)
    await session.commit()
    await session.refresh(user)
    
    # Log audit
    audit = AuditLog(
        action=AuditAction.CREATE,
        resource_type="user",
        resource_id=user.id,
        new_values={"email": user.email, "username": user.username, "role": user.role.value},
    )
    session.add(audit)
    await session.commit()
    
    return UserResponse.model_validate(user)


@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: RefreshTokenRequest,
    session: AsyncSession = Depends(get_db),
) -> Token:
    """Refresh access token using refresh token."""
    try:
        payload = decode_token(request.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token type")
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user = await session.get(User, user_id)
    if not user or user.status != "active":
        raise HTTPException(status_code=401, detail="User not found or inactive")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value},
        expires_delta=access_token_expires,
    )
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/logout")
async def logout(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> dict:
    """Logout - client should discard tokens."""
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> UserResponse:
    """Get current user profile."""
    return UserResponse.model_validate(current_user)


@router.post("/change-password", response_model=dict)
async def change_password(
    password_data: PasswordChange,
    current_user: Annotated[User, Depends(get_current_active_user)],
    session: AsyncSession = Depends(get_db),
) -> dict:
    """Change user password."""
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    
    # Validate new password
    is_valid, errors, score = check_password_strength(password_data.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"New password does not meet requirements: {', '.join(errors)}",
        )
    
    if password_data.new_password != password_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match",
        )
    
    # Check if new password is different from current
    if verify_password(password_data.new_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password",
        )
    
    # Update password
    current_user.password_hash = get_password_hash(password_data.new_password)
    await session.commit()
    
    return {"message": "Password changed successfully"}


@router.post("/password/reset/request", response_model=dict)
async def request_password_reset(
    request: PasswordResetRequest,
    session: AsyncSession = Depends(get_db),
) -> dict:
    """Request password reset token."""
    token = create_password_reset_token(request.email)
    
    # In production, send email with reset link
    # For now, return token for testing
    return {
        "message": "If the email exists, a password reset link has been sent",
        "reset_token": token,  # Remove in production
    }


@router.post("/password/reset/confirm", response_model=dict)
async def confirm_password_reset(
    request: PasswordResetConfirm,
    session: AsyncSession = Depends(get_db),
) -> dict:
    """Confirm password reset with token."""
    email = verify_password_reset_token(request.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )
    
    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found",
        )
    
    # Validate new password
    is_valid, errors, score = check_password_strength(request.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password does not meet requirements: {', '.join(errors)}",
        )
    
    if request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match",
        )
    
    # Update password
    user.password_hash = get_password_hash(request.new_password)
    await session.commit()
    
    return {"message": "Password has been reset successfully"}


@router.post("/email/verify/request", response_model=dict)
async def request_email_verification(
    request: EmailVerificationRequest,
    session: AsyncSession = Depends(get_db),
) -> dict:
    """Request email verification token."""
    token = create_email_verification_token(request.email)
    
    # In production, send email with verification link
    # For now, return token for testing
    return {
        "message": "If the email exists, a verification link has been sent",
        "verification_token": token,  # Remove in production
    }


@router.post("/email/verify/confirm", response_model=dict)
async def confirm_email_verification(
    request: EmailVerificationConfirm,
    session: AsyncSession = Depends(get_db),
) -> dict:
    """Confirm email verification with token."""
    email = verify_email_verification_token(request.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )
    
    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found",
        )
    
    if user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified",
        )
    
    user.email_verified = True
    user.status = UserStatus.ACTIVE
    await session.commit()
    
    return {"message": "Email verified successfully"}


@router.get("/permissions/me", response_model=list[str])
async def get_my_permissions(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> list[str]:
    """Get current user's permissions."""
    permissions = get_permissions_for_role(current_user.role.value)
    return permissions


@router.get("/roles/{role}/permissions", response_model=list[str])
async def get_role_permissions(
    role: str,
) -> list[str]:
    """Get permissions for a role."""
    permissions = get_permissions_for_role(role)
    return permissions


# Add missing imports
from datetime import datetime