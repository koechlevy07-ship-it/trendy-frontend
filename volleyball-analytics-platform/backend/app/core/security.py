"""Security utilities for authentication and authorization."""

from datetime import datetime, timedelta
from typing import Optional, List
from uuid import UUID

from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr

from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = settings.JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES = 60
EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 900  # 15 minutes


class TokenData(BaseModel):
    user_id: str
    email: str
    role: str
    permissions: List[str] = []


class TokenPayload(BaseModel):
    sub: str
    email: str
    role: str
    permissions: List[str] = []
    exp: int
    iat: int
    type: str = "access"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def check_password_strength(password: str) -> tuple[bool, List[str], int]:
    """Check password strength.
    
    Returns:
        tuple: (is_valid, errors, score)
    """
    errors = []
    score = 0
    
    # Length checks
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    elif len(password) >= 12:
        score += 20
    elif len(password) >= 10:
        score += 15
    elif len(password) >= 8:
        score += 10
    
    # Character variety checks
    if any(c.islower() for c in password):
        score += 10
    else:
        errors.append("Password must contain at least one lowercase letter")
    
    if any(c.isupper() for c in password):
        score += 10
    else:
        errors.append("Password must contain at least one uppercase letter")
    
    if any(c.isdigit() for c in password):
        score += 10
    else:
        errors.append("Password must contain at least one digit")
    
    if any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        score += 20
    else:
        errors.append("Password must contain at least one special character")
    
    # Common patterns
    common_patterns = ["password", "123456", "qwerty", "abc123", "admin", "user"]
    if any(pattern in password.lower() for pattern in common_patterns):
        errors.append("Password contains common patterns")
        score = max(0, score - 30)
    
    # Repeated characters
    if any(password[i] == password[i+1] == password[i+2] for i in range(len(password)-2)):
        errors.append("Password contains repeated characters")
        score = max(0, score - 10)
    
    is_valid = len(errors) == 0
    return is_valid, errors, min(score, 100)


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access", "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create a refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh", "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_password_reset_token(email: str) -> str:
    """Create a password reset token."""
    data = {"sub": email, "type": "password_reset"}
    expire = datetime.utcnow() + timedelta(minutes=PASSWORD_RESET_TOKEN_EXPIRE_MINUTES)
    data.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password_reset_token(token: str) -> Optional[str]:
    """Verify a password reset token and return email."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "password_reset":
            return None
        return payload.get("sub")
    except (JWTError, jwt.ExpiredSignatureError):
        return None


def create_email_verification_token(email: str) -> str:
    """Create an email verification token."""
    data = {"sub": email, "type": "email_verification"}
    expire = datetime.utcnow() + timedelta(minutes=EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES)
    data.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_email_verification_token(token: str) -> Optional[str]:
    """Verify an email verification token and return email."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "email_verification":
            return None
        return payload.get("sub")
    except (JWTError, jwt.ExpiredSignatureError):
        return None


def decode_token(token: str) -> dict:
    """Decode and validate JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except JWTError:
        raise ValueError("Invalid token")


def create_token_pair(
    user_id: str,
    email: str,
    role: str,
    permissions: List[str] = None
) -> dict:
    """Create access and refresh token pair."""
    if permissions is None:
        permissions = []
    
    access_token_data = {
        "sub": user_id,
        "email": email,
        "role": role,
        "permissions": permissions,
    }
    
    access_token = create_access_token(access_token_data)
    refresh_token = create_refresh_token({"sub": user_id, "type": "refresh"})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session = None,
) -> dict:
    """Get current authenticated user from token."""
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
    
    return payload


def has_permission(permission: str):
    """Dependency to check if user has specific permission."""
    def permission_checker(token: str = Depends(oauth2_scheme)) -> dict:
        payload = decode_token(token)
        permissions = payload.get("permissions", [])
        if permission not in permissions and "admin" not in payload.get("permissions", []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{permission}' required",
            )
        return True
    return permission_checker


def require_role(*roles: str):
    """Dependency to check if user has required role(s)."""
    def role_checker(token: str = Depends(oauth2_scheme)) -> dict:
        payload = decode_token(token)
        user_role = payload.get("role")
        if user_role != "admin" and user_role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"One of roles {roles} required",
            )
        return payload
    return role_checker


# Role permission mapping
ROLE_PERMISSIONS = {
    "admin": [
        "users:create", "users:read", "users:update", "users:delete",
        "organizations:create", "organizations:read", "organizations:update", "organizations:delete",
        "teams:create", "teams:read", "teams:update", "teams:delete",
        "players:create", "players:read", "players:update", "players:delete",
        "coaches:create", "coaches:read", "coaches:update", "coaches:delete",
        "matches:create", "matches:read", "matches:update", "matches:delete",
        "statistics:read", "statistics:export",
        "reports:create", "reports:read", "reports:export",
        "cameras:configure", "cameras:read",
        "ai:configure", "ai:read",
        "settings:read", "settings:update",
        "admin:access",
    ],
    "org_admin": [
        "users:create", "users:read", "users:update",
        "teams:create", "teams:read", "teams:update", "teams:delete",
        "players:create", "players:read", "players:update", "players:delete",
        "coaches:create", "coaches:read", "coaches:update", "coaches:delete",
        "matches:create", "matches:read", "matches:update", "matches:delete",
        "statistics:read", "statistics:export",
        "reports:create", "reports:read", "reports:export",
        "cameras:configure", "cameras:read",
        "settings:read", "settings:update",
    ],
    "coach": [
        "players:read", "players:update",
        "matches:read", "matches:update",
        "statistics:read",
        "reports:read",
        "cameras:read",
    ],
    "assistant_coach": [
        "players:read",
        "matches:read",
        "statistics:read",
        "reports:read",
    ],
    "analyst": [
        "players:read",
        "matches:read",
        "statistics:read", "statistics:export",
        "reports:read", "reports:export",
    ],
    "statistician": [
        "players:read",
        "matches:read", "matches:update",
        "statistics:read", "statistics:export",
        "reports:read",
    ],
    "player": [
        "matches:read",
        "statistics:read",
        "reports:read",
    ],
    "viewer": [
        "matches:read",
        "statistics:read",
        "reports:read",
    ],
    "referee": [
        "matches:read", "matches:update",
    ],
}


def get_permissions_for_role(role: str) -> List[str]:
    """Get permissions for a role."""
    return ROLE_PERMISSIONS.get(role, [])


def user_has_permission(role: str, permission: str) -> bool:
    """Check if a role has a permission."""
    permissions = get_permissions_for_role(role)
    return permission in permissions or "admin" in permissions


# Export all
__all__ = [
    "pwd_context",
    "verify_password",
    "get_password_hash",
    "check_password_strength",
    "create_access_token",
    "create_refresh_token",
    "create_password_reset_token",
    "verify_password_reset_token",
    "create_email_verification_token",
    "verify_email_verification_token",
    "decode_token",
    "create_token_pair",
    "get_current_user",
    "has_permission",
    "require_role",
    "ROLE_PERMISSIONS",
    "get_permissions_for_role",
    "user_has_permission",
    "oauth2_scheme",
    "Token",
    "TokenData",
    "TokenPayload",
]