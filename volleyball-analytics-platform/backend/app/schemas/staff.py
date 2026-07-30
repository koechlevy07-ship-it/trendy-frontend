"""Staff schemas for Player & Staff Management Module (Chapter 10)."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
import enum

from pydantic import BaseModel, Field, ConfigDict, EmailStr

from app.schemas.base import BaseSchema


class StaffEmploymentType(str, enum.Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    VOLUNTEER = "volunteer"
    INTERN = "intern"


class StaffEmploymentStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_LEAVE = "on_leave"
    TERMINATED = "terminated"
    RETIRED = "retired"
    SUSPENDED = "suspended"


class StaffBase(BaseModel):
    """Base staff schema with common fields."""
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    middle_name: Optional[str] = Field(None, max_length=50)
    gender: Optional[str] = Field(None, pattern="^(male|female|other)$")
    date_of_birth: Optional[datetime] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, pattern="^[A-Z]{3}$")
    photo_url: Optional[str] = Field(None, max_length=500)
    emergency_contact_name: Optional[str] = Field(None, max_length=100)
    emergency_contact_phone: Optional[str] = Field(None, max_length=50)
    emergency_contact_relationship: Optional[str] = Field(None, max_length=50)
    bio: Optional[str] = None
    specializations: List[str] = Field(default_factory=list)


class StaffCreate(StaffBase):
    """Schema for creating a staff member."""
    organization_id: UUID
    club_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    role: str = Field(..., description="Staff role from StaffRole enum")
    employment_type: StaffEmploymentType = StaffEmploymentType.FULL_TIME
    hire_date: Optional[datetime] = None
    contract_end_date: Optional[datetime] = None
    licenses: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    qualifications: List[str] = Field(default_factory=list)
    medical_role: Optional[str] = None
    technical_role: Optional[str] = None
    referee_level: Optional[str] = None


class StaffUpdate(BaseModel):
    """Schema for updating a staff member."""
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    middle_name: Optional[str] = Field(None, max_length=50)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, pattern="^[A-Z]{3}$")
    photo_url: Optional[str] = Field(None, max_length=500)
    emergency_contact_name: Optional[str] = Field(None, max_length=100)
    emergency_contact_phone: Optional[str] = Field(None, max_length=50)
    emergency_contact_relationship: Optional[str] = Field(None, max_length=50)
    bio: Optional[str] = None
    specializations: Optional[List[str]] = None
    licenses: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    qualifications: Optional[List[str]] = None
    medical_role: Optional[str] = None
    technical_role: Optional[str] = None
    referee_level: Optional[str] = None
    is_active: Optional[bool] = None


class StaffResponse(StaffBase):
    """Staff response schema."""
    id: str
    organization_id: str
    club_id: Optional[str] = None
    user_id: Optional[str] = None
    role: str
    employment_type: StaffEmploymentType
    employment_status: StaffEmploymentStatus
    hire_date: Optional[datetime] = None
    termination_date: Optional[datetime] = None
    contract_end_date: Optional[datetime] = None
    licenses: List[str]
    certifications: List[str]
    qualifications: List[str]
    medical_role: Optional[str] = None
    technical_role: Optional[str] = None
    referee_level: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    
    full_name: str
    
    model_config = ConfigDict(from_attributes=True)


class StaffListResponse(BaseSchema):
    """Paginated staff list."""
    items: List[StaffResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)


class StaffAssignmentCreate(BaseModel):
    """Schema for creating a staff assignment."""
    staff_id: UUID
    organization_id: UUID
    club_id: Optional[UUID] = None
    team_id: Optional[UUID] = None
    season_id: Optional[UUID] = None
    role: str = Field(..., description="StaffRole enum value")
    employment_type: StaffEmploymentType = StaffEmploymentType.FULL_TIME
    start_date: datetime
    end_date: Optional[datetime] = None
    contract_type: StaffEmploymentType = StaffEmploymentType.FULL_TIME
    contract_end_date: Optional[datetime] = None
    responsibilities: List[str] = Field(default_factory=list)
    salary_band: Optional[str] = Field(None, max_length=50)
    reports_to_id: Optional[UUID] = None
    is_primary: bool = False


class StaffAssignmentUpdate(BaseModel):
    """Schema for updating a staff assignment."""
    end_date: Optional[datetime] = None
    contract_end_date: Optional[datetime] = None
    responsibilities: Optional[List[str]] = None
    salary_band: Optional[str] = None
    reports_to_id: Optional[UUID] = None
    is_active: Optional[bool] = None
    is_primary: Optional[bool] = None
    employment_status: Optional[StaffEmploymentStatus] = None


class StaffAssignmentResponse(BaseModel):
    """Staff assignment response schema."""
    id: str
    staff_id: str
    organization_id: str
    club_id: Optional[str] = None
    team_id: Optional[str] = None
    season_id: Optional[str] = None
    role: str
    employment_type: StaffEmploymentType
    employment_status: StaffEmploymentStatus
    start_date: datetime
    end_date: Optional[datetime] = None
    contract_type: StaffEmploymentType
    contract_end_date: Optional[datetime] = None
    responsibilities: List[str]
    salary_band: Optional[str] = None
    reports_to_id: Optional[str] = None
    is_active: bool
    is_primary: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class StaffAssignmentListResponse(BaseSchema):
    """Paginated staff assignment list."""
    items: List[StaffAssignmentResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)


class StaffMedicalInfoCreate(BaseModel):
    """Schema for creating staff medical info."""
    staff_id: UUID
    blood_type: Optional[str] = Field(None, pattern="^(A|B|AB|O)[+-]$")
    allergies: List[str] = Field(default_factory=list)
    chronic_conditions: List[str] = Field(default_factory=list)
    medications: List[str] = Field(default_factory=list)
    emergency_contact_name: Optional[str] = Field(None, max_length=100)
    emergency_contact_phone: Optional[str] = Field(None, max_length=50)
    emergency_contact_relationship: Optional[str] = Field(None, max_length=50)
    insurance_provider: Optional[str] = Field(None, max_length=100)
    insurance_policy_number: Optional[str] = Field(None, max_length=100)
    medical_notes: Optional[str] = None


class StaffMedicalInfoResponse(BaseModel):
    """Staff medical info response schema."""
    staff_id: str
    blood_type: Optional[str] = None
    allergies: List[str]
    chronic_conditions: List[str]
    medications: List[str]
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relationship: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None
    medical_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class StaffDocumentCreate(BaseModel):
    """Schema for creating a staff document."""
    staff_id: UUID
    organization_id: UUID
    document_type: str = Field(..., max_length=50)
    title: str = Field(..., max_length=200)
    file_url: str = Field(..., max_length=500)
    file_size: Optional[int] = None
    mime_type: Optional[str] = Field(None, max_length=100)
    issued_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    issued_by: Optional[str] = Field(None, max_length=200)


class StaffDocumentResponse(BaseModel):
    """Staff document response schema."""
    id: str
    staff_id: str
    organization_id: str
    document_type: str
    title: str
    file_url: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    issued_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    issued_by: Optional[str] = None
    is_verified: bool
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class StaffSearchParams(BaseModel):
    """Parameters for staff search."""
    query: Optional[str] = None
    organization_id: Optional[UUID] = None
    club_id: Optional[UUID] = None
    role: Optional[str] = None
    employment_status: Optional[StaffEmploymentStatus] = None
    is_active: Optional[bool] = None
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)


class StaffAssignmentSearchParams(BaseModel):
    """Parameters for staff assignment search."""
    staff_id: Optional[UUID] = None
    organization_id: Optional[UUID] = None
    club_id: Optional[UUID] = None
    team_id: Optional[UUID] = None
    season_id: Optional[UUID] = None
    role: Optional[str] = None
    employment_status: Optional[StaffEmploymentStatus] = None
    is_active: Optional[bool] = None
    is_primary: Optional[bool] = None
    start_date_from: Optional[datetime] = None
    start_date_to: Optional[datetime] = None
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)