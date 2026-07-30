"""User schemas."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import EmailStr, Field, ConfigDict
from pydantic.networks import HttpUrl

from app.schemas.base import BaseSchema


class UserBase(BaseSchema):
    """Base user schema."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = None
    avatar_url: Optional[HttpUrl] = None


class UserCreate(UserBase):
    """Schema for creating a user."""
    password: str = Field(..., min_length=8, max_length=128)
    role: str = "viewer"
    organization_id: Optional[UUID] = None
    team_id: Optional[UUID] = None


class UserUpdate(BaseSchema):
    """Schema for updating a user."""
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = None
    avatar_url: Optional[HttpUrl] = None
    role: Optional[str] = None
    team_id: Optional[UUID] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None


class UserResponse(UserBase):
    """User response schema."""
    id: str
    role: str
    is_active: bool
    is_superuser: bool
    organization_id: Optional[str] = None
    team_id: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[HttpUrl] = None
    is_superuser: bool
    last_login: Optional[datetime] = None
    email_verified: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserInDB(BaseSchema):
    """User with sensitive fields for internal use."""
    id: str
    email: str
    username: str
    full_name: str
    password_hash: str
    role: str
    organization_id: Optional[str] = None
    team_id: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    is_superuser: bool
    last_login: Optional[datetime] = None
    email_verified: bool
    failed_login_attempts: int
    locked_until: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseSchema):
    """Token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 900  # 15 minutes


class TokenPayload(BaseSchema):
    """JWT token payload."""
    sub: str
    email: str
    role: str
    permissions: List[str] = []


class TokenData(BaseSchema):
    """Token payload data."""
    sub: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    permissions: List[str] = []
    exp: Optional[int] = None
    type: str = "access"


class UserLogin(BaseSchema):
    """User login request."""
    email: EmailStr
    password: str


class UserRegister(BaseSchema):
    """User registration request."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)
    role: str = "viewer"
    organization_id: Optional[UUID] = None
    team_id: Optional[UUID] = None


class PasswordChange(BaseSchema):
    """Password change request."""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


class PasswordResetRequest(BaseSchema):
    """Password reset request."""
    email: EmailStr


class PasswordResetConfirm(BaseSchema):
    """Password reset confirmation."""
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)


class EmailVerificationRequest(BaseSchema):
    """Email verification request."""
    email: EmailStr


class EmailVerificationConfirm(BaseSchema):
    """Email verification confirmation."""
    token: str


class RefreshTokenRequest(BaseSchema):
    """Refresh token request."""
    refresh_token: str


class TokenRefreshResponse(Token):
    """Token refresh response."""
    pass


class AuthErrorResponse(BaseSchema):
    """Auth error response."""
    detail: str


class MessageResponse(BaseSchema):
    """Generic message response."""
    message: str


class PermissionResponse(BaseSchema):
    """Permission response."""
    permissions: List[str]


class RolePermissionsResponse(BaseSchema):
    """Role permissions response."""
    role: str
    permissions: List[str]


class SessionInfo(BaseSchema):
    """Session information."""
    session_id: str
    user_id: str
    created_at: datetime
    expires_at: datetime
    device_info: Optional[dict] = None
    ip_address: Optional[str] = None
    is_current: bool = False


class SessionsResponse(BaseSchema):
    """Sessions list response."""
    sessions: List[SessionInfo]