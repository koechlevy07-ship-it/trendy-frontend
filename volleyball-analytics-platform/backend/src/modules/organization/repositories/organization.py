"""Organization Repository - Chapter 11 Part 2"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorCollection
from pymongo import ASCENDING, DESCENDING, TEXT
from pymongo.errors import DuplicateKeyError

from src.modules.organization.models.organization import (
    Organization,
    Team,
    TeamSeasonRecord,
    TeamRosterEntry,
    TeamCoachingStaffEntry,
    TeamHistoricalRecord,
    OrganizationHistoricalRecord,
    OrganizationAuditLog,
    TeamSeasonRecord,
    COLLECTIONS,
)


class BaseRepository:
    """Base repository with common operations."""
    
    def __init__(self, db: AsyncIOMotorDatabase, collection_name: str):
        self.db = db
        self.collection: AsyncIOMotorCollection = db[collection_name]
    
    async def create_indexes(self):
        """Create indexes - to be implemented by subclasses."""
        pass
    
    async def get_by_id(self, id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": ObjectId(id)})
    
    async def find_one(self, filter: dict) -> Optional[dict]:
        return await self.collection.find_one(filter)
    
    async def find_many(self, filter: dict, skip: int = 0, limit: int = 100, sort: List[tuple] = None) -> List[dict]:
        cursor = self.collection.find(filter).skip(skip).limit(limit)
        if sort:
            cursor = cursor.sort(sort)
        return await cursor.to_list(length=limit)
    
    async def count(self, filter: dict) -> int:
        return await self.collection.count_documents(filter)
    
    async def insert_one(self, document: dict) -> str:
        document["_id"] = ObjectId()
        document["created_at"] = datetime.utcnow()
        document["updated_at"] = datetime.utcnow()
        result = await self.collection.insert_one(document)
        return str(result.inserted_id)
    
    async def update_one(self, id: str, update: dict) -> bool:
        update["updated_at"] = datetime.utcnow()
        result = await self.collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": update}
        )
        return result.modified_count > 0
    
    async def soft_delete(self, id: str, deleted_by: str) -> bool:
        result = await self.collection.update_one(
            {"_id": ObjectId(id)},
            {
                "$set": {
                    "deleted_at": datetime.utcnow(),
                    "deleted_by": deleted_by,
                    "is_deleted": True
                }
            }
        )
        return result.modified_count > 0
    
    async def restore(self, id: str, restored_by: str) -> bool:
        result = await self.collection.update_one(
            {"_id": ObjectId(id)},
            {
                "$set": {
                    "deleted_at": None,
                    "deleted_by": None,
                    "is_deleted": False
                }
            }
        )
        return result.modified_count > 0
    
    async def exists(self, filter: dict) -> bool:
        count = await self.collection.count_documents(filter, limit=1)
        return count > 0
    
    async def bulk_insert(self, documents: List[dict]) -> List[str]:
        for doc in documents:
            doc["_id"] = ObjectId()
            doc["created_at"] = datetime.utcnow()
            doc["updated_at"] = datetime.utcnow()
        result = await self.collection.insert_many(documents)
        return [str(id) for id in result.inserted_ids]
    
    async def bulk_update(self, updates: List[dict]) -> int:
        count = 0
        for update in updates:
            if "id" not in update:
                continue
            doc_id = update.pop("id")
            update["updated_at"] = datetime.utcnow()
            result = await self.collection.update_one(
                {"_id": ObjectId(doc_id)},
                {"$set": update}
            )
            count += result.modified_count
        return count


class OrganizationRepository(BaseRepository):
    """Repository for Organization collection."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        super().__init__(db, "organizations")
    
    async def create_indexes(self):
        await self.collection.create_index([("organization_id", ASCENDING)], unique=True)
        await self.collection.create_index([("organization_code", ASCENDING)], unique=True)
        await self.collection.create_index([("organization_name", TEXT), ("short_name", TEXT)])
        await self.collection.create_index([("registration_number", ASCENDING)], unique=True, sparse=True)
        await self.collection.create_index([("organization_type", ASCENDING), ("status", ASCENDING)])
        await self.collection.create_index([("tenant_id", ASCENDING), ("status", ASCENDING)])
        await self.collection.create_index([("parent_organization_id", ASCENDING)])
    
    async def get_by_organization_id(self, organization_id: str) -> Optional[dict]:
        return await self.collection.find_one({"organization_id": organization_id})
    
    async def get_by_code(self, code: str) -> Optional[dict]:
        return await self.collection.find_one({"organization_code": code})
    
    async def get_by_registration_number(self, reg_number: str) -> Optional[dict]:
        return await self.collection.find_one({"registration.registration_number": reg_number})
    
    async def find_by_name(self, name: str) -> List[dict]:
        cursor = self.collection.find({"organization_name": {"$regex": name, "$options": "i"}})
        return await cursor.to_list(length=100)
    
    async def search(
        self,
        query: str,
        organization_type: Optional[str] = None,
        status: Optional[str] = None,
        tenant_id: Optional[str] = None,
        page: int = 1,
        per_page: int = 20,
    ) -> List[dict]:
        filter = {}
        if query:
            filter["$text"] = {"$search": query}
        if organization_type:
            filter["organization_type"] = organization_type
        if status:
            filter["status"] = status
        if tenant_id:
            filter["tenant_id"] = tenant_id
        
        skip = (page - 1) * per_page
        cursor = self.collection.find(filter).skip(skip).limit(per_page).sort([("created_at", DESCENDING)])
        return await cursor.to_list(length=per_page)
    
    async def paginate(
        self,
        page: int = 1,
        per_page: int = 20,
        filters: Optional[dict] = None,
    ) -> List[dict]:
        filter = filters or {}
        skip = (page - 1) * per_page
        cursor = self.collection.find(filter).skip(skip).limit(per_page).sort([("created_at", DESCENDING)])
        return await cursor.to_list(length=per_page)
    
    async def bulk_insert(self, organizations: List[dict]) -> List[str]:
        return await self.bulk_insert(organizations)
    
    async def bulk_update(self, updates: List[dict]) -> int:
        count = 0
        for update in updates:
            if "id" not in update:
                continue
            org_id = update.pop("id")
            update["updated_at"] = datetime.utcnow()
            result = await self.collection.update_one(
                {"_id": ObjectId(org_id)},
                {"$set": update}
            )
            if result.modified_count > 0:
                count += 1
        return count


class TeamRepository(BaseRepository):
    """Repository for Team collection."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        super().__init__(db, "teams")
    
    async def create_indexes(self):
        await self.collection.create_index([("team_id", ASCENDING)], unique=True)
        await self.collection.create_index([("organization_id", ASCENDING)])
        await self.collection.create_index([("team_name", TEXT), ("short_name", TEXT)])
        await self.collection.create_index([("category", ASCENDING), ("gender", ASCENDING)])
        await self.collection.create_index([("status", ASCENDING)])
        await self.collection.create_index([("league", ASCENDING), ("season", ASCENDING)])
        await self.collection.create_index([("organization_id", ASCENDING), ("status", ASCENDING)])
    
    async def get_by_id(self, team_id: str) -> Optional[dict]:
        return await self.collection.find_one({"team_id": team_id})
    
    async def get_by_team_id(self, team_id: str) -> Optional[dict]:
        return await self.collection.find_one({"team_id": team_id})
    
    async def get_by_organization(self, organization_id: str) -> List[dict]:
        cursor = self.collection.find({"organization_id": organization_id})
        return await cursor.to_list(length=100)
    
    async def get_by_jersey(self, organization_id: str, jersey_number: int) -> Optional[dict]:
        return await self.collection.find_one({
            "organization_id": organization_id,
            "jersey_number": jersey_number
        })
    
    async def get_by_position(self, organization_id: str, position: str) -> List[dict]:
        return await self.collection.find({
            "organization_id": organization_id,
            "position": position
        }).to_list(length=100)
    
    async def get_starters(self, organization_id: str) -> List[dict]:
        cursor = self.collection.find({
            "organization_id": organization_id,
            "is_libero": False,
            "is_active": True
        })
        return await cursor.to_list(length=100)
    
    async def find_by_role(self, organization_id: str, role: str) -> List[dict]:
        cursor = self.collection.find({
            "organization_id": organization_id,
            "role": role
        })
        return await cursor.to_list(length=100)
    
    async def search(
        self,
        query: str,
        organization_id: Optional[str] = None,
        page: int = 1,
        per_page: int = 20,
    ) -> List[dict]:
        filter = {}
        if query:
            filter["$text"] = {"$search": query}
        if organization_id:
            filter["organization_id"] = organization_id
        
        skip = (page - 1) * per_page
        cursor = self.collection.find(filter).skip(skip).limit(per_page)
        return await cursor.to_list(length=per_page)
    
    async def paginate(
        self,
        page: int = 1,
        per_page: int = 20,
        filters: Optional[dict] = None,
    ) -> List[dict]:
        filter = filters or {}
        skip = (page - 1) * per_page
        cursor = self.collection.find(filter).skip(skip).limit(per_page).sort([("created_at", DESCENDING)])
        return await cursor.to_list(length=per_page)


class TeamRepository(BaseRepository):
    """Repository for Team collection - Player/Team management."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        super().__init__(db, "teams")
    
    async def create_indexes(self):
        await self.collection.create_index([("team_id", ASCENDING)], unique=True)
        await self.collection.create_index([("organization_id", ASCENDING)])
        await self.collection.create_index([("jersey_number", ASCENDING)])
        await self.collection.create_index([("position", ASCENDING)])
        await self.collection.create_index([("is_active", ASCENDING)])
    
    async def get_by_team(self, team_id: str) -> List[dict]:
        """Get all players in a team."""
        cursor = self.collection.find({"team_id": team_id})
        return await cursor.to_list(length=100)
    
    async def get_by_jersey(self, team_id: str, jersey_number: int) -> Optional[dict]:
        """Get player by team and jersey number."""
        result = await self.collection.find_one({
            "team_id": team_id,
            "jersey_number": jersey_number
        })
        return result
    
    async def get_with_user(self, player_id: str) -> Optional[dict]:
        """Get player with user profile."""
        pipeline = [
            {"$match": {"_id": ObjectId(player_id)}},
            {"$lookup": {
                "from": "users",
                "localField": "user_id",
                "foreignField": "_id",
                "as": "user"
            }},
            {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}}
        ]
        cursor = self.collection.aggregate(pipeline)
        return await cursor.to_list(length=1)
    
    async def get_by_position(self, team_id: str, position: str) -> List[dict]:
        """Get players by position."""
        cursor = self.collection.find({
            "team_id": team_id,
            "position": position
        })
        return await cursor.to_list(length=100)
    
    async def get_starters(self, team_id: str) -> List[dict]:
        """Get starting players (non-libero)."""
        cursor = self.collection.find({
            "team_id": team_id,
            "is_libero": False,
            "is_active": True
        })
        return await cursor.to_list(length=100)
    
    async def find_by_email(self, email: str) -> Optional[dict]:
        """Find player by email."""
        cursor = self.collection.aggregate([
            {"$lookup": {
                "from": "users",
                "localField": "user_id",
                "foreignField": "_id",
                "as": "user"
            }},
            {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
            {"$match": {"user.email": email}}
        ])
        result = await cursor.to_list(length=1)
        return result[0] if result else None
    
    async def find_by_national_id(self, national_id: str) -> Optional[dict]:
        """Find player by national ID."""
        cursor = self.collection.aggregate([
            {"$lookup": {
                "from": "users",
                "localField": "user_id",
                "foreignField": "_id",
                "as": "user"
            }},
            {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
            {"$match": {"user.national_id": national_id}}
        ])
        result = await cursor.to_list(length=1)
        return result[0] if result else None
    
    async def find_by_passport(self, passport: str) -> Optional[dict]:
        """Find player by passport number."""
        cursor = self.collection.aggregate([
            {"$lookup": {
                "from": "users",
                "localField": "user_id",
                "foreignField": "_id",
                "as": "user"
            }},
            {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
            {"$match": {"user.passport_number": passport}}
        ])
        result = await cursor.to_list(length=1)
        return result[0] if result else None
    
    async def search(
        self,
        query: str,
        team_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[dict]:
        """Search players by name."""
        from sqlalchemy import or_
        stmt = select(self.model).where(
            or_(
                self.model.first_name.ilike(f"%{query}%"),
                self.model.last_name.ilike(f"%{query}%"),
            )
        )
        if team_id:
            stmt = stmt.where(self.model.team_id == team_id)
        stmt = stmt.offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def paginate(
        self,
        page: int = 1,
        per_page: int = 20,
        filters: Optional[dict] = None,
    ) -> List[dict]:
        filter = filters or {}
        skip = (page - 1) * per_page
        cursor = self.collection.find(filter).skip(skip).limit(per_page).sort([("created_at", DESCENDING)])
        return await cursor.to_list(length=per_page)
    
    async def bulk_insert(self, data_list: List[dict]) -> List[dict]:
        """Bulk insert players."""
        return await self.bulk_create(data_list)
    
    async def bulk_update(self, updates: List[dict]) -> int:
        """Bulk update players."""
        count = 0
        for data in updates:
            if "id" not in data:
                continue
            stmt = (
                update(self.model)
                .where(self.model.id == data["id"])
                .values(**{k: v for k, v in data.items() if k != "id"})
            )
            await self.session.execute(stmt)
            count += 1
        await self.session.flush()
        return count


class StaffRepository(BaseRepository):
    """Repository for Staff entity."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        super().__init__(db, "staff")
    
    async def create_indexes(self):
        await self.collection.create_index([("staff_id", ASCENDING)], unique=True)
        await self.collection.create_index([("organization_id", ASCENDING)])
        await self.collection.create_index([("role", ASCENDING)])
        await self.collection.create_index([("employment_status", ASCENDING)])
        await self.collection.create_index([("organization_id", ASCENDING), ("role", ASCENDING)])
    
    async def get_by_organization(self, org_id: str) -> List[dict]:
        cursor = self.collection.find({"organization_id": org_id})
        return await cursor.to_list(length=100)
    
    async def get_by_role(self, role: str, org_id: Optional[str] = None) -> List[dict]:
        filter = {"role": role}
        if org_id:
            filter["organization_id"] = org_id
        cursor = self.collection.find(filter)
        return await cursor.to_list(length=100)
    
    async def get_by_employment_status(self, status: str, org_id: Optional[str] = None) -> List[dict]:
        filter = {"employment_status": status}
        if org_id:
            filter["organization_id"] = org_id
        cursor = self.collection.find(filter)
        return await cursor.to_list(length=100)
    
    async def search(self, query: str, org_id: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[dict]:
        from sqlalchemy import or_
        filter = {
            "or_": [
                "first_name.ilike(f'%{query}%')",
                "last_name.ilike(f'%{query}%')",
                "email.ilike(f'%{query}%')"
            ]
        }
        if org_id:
            filter["organization_id"] = org_id
        cursor = self.collection.find(filter).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
    
    async def find_by_role(self, role: str, org_id: str) -> List[dict]:
        return await self.get_by_role(role, org_id)
    
    async def find_by_organization(self, org_id: str) -> List[dict]:
        return await self.get_by_organization(org_id)
    
    async def get_assignments(self, staff_id: str) -> List[dict]:
        return await self.assignment_repo.get_history(staff_id)
    
    async def get_current_assignment(self, staff_id: str) -> Optional[dict]:
        return await self.assignment_repo.find_current(staff_id)
    
    async def get_assignment_history(self, staff_id: str) -> List[dict]:
        return await self.assignment_repo.find_history(staff_id)
    
    async def find_season_assignments(self, season_id: str) -> List[dict]:
        return await self.assignment_repo.find_season_assignments(season_id)
    
    async def find_organization_assignments(self, organization_id: str) -> List[dict]:
        return await self.assignment_repo.find_organization_assignments(organization_id)
    
    async def assign_medical(self, staff_id: str, team_id: str, medical_role: str, start_date: datetime, end_date: Optional[datetime] = None, responsibilities: Optional[List[str]] = None) -> MedicalAssignment:
        """Assign medical staff to team/player."""
        assignment_data = {
            "staff_id": staff_id,
            "organization_id": (await self.get_by_id(staff_id))["organization_id"],
            "team_id": team_id,
            "player_id": None,
            "medical_role": medical_role,
            "is_primary": False,
            "start_date": start_date,
            "end_date": end_date,
            "responsibilities": responsibilities or [],
            "created_by": "system",
        }
        return await self.medical_assignment_repo.create(assignment_data)
    
    async def get_medical_assignments(self, staff_id: str) -> List[dict]:
        return await self.medical_assignment_repo.get_by_staff(staff_id)
    
    async def get_technical_assignments(self, staff_id: str) -> List[dict]:
        return await self.technical_assignment_repo.get_by_staff(staff_id)
    
    async def assign_technical(self, staff_id: str, team_id: str, technical_role: str, start_date: datetime, end_date: Optional[datetime] = None, responsibilities: Optional[List[str]] = None) -> TechnicalAssignment:
        """Assign technical staff to team."""
        assignment_data = {
            "staff_id": staff_id,
            "organization_id": (await self.get_by_id(staff_id))["organization_id"],
            "team_id": team_id,
            "competition_id": None,
            "technical_role": technical_role,
            "is_primary": False,
            "start_date": start_date,
            "end_date": end_date,
            "responsibilities": responsibilities or [],
            "created_by": "system",
        }
        return await self.technical_assignment_repo.create(assignment_data)
    
    async def assign_referee(self, staff_id: str, match_id: str, role: str, referee_level: Optional[str] = None, assigned_by: str = "system") -> RefereeAssignment:
        """Assign referee to match."""
        from app.models.staff import RefereeAssignment
        assignment = RefereeAssignment(
            staff_id=staff_id,
            match_id=match_id,
            organization_id=(await self.get_by_id(staff_id))["organization_id"],
            role=role,
            referee_level=referee_level,
            assigned_by=assigned_by,
        )
        return await self.referee_assignment_repo.create(assignment)
    
    async def confirm_referee_assignment(self, assignment_id: str, confirmed_by: str) -> Optional[RefereeAssignment]:
        """Confirm a referee assignment."""
        return await self.referee_assignment_repo.confirm_assignment(assignment_id, confirmed_by)
    
    async def get_referee_assignments(self, staff_id: str) -> List[dict]:
        return await self.referee_assignment_repo.get_by_staff(staff_id)
    
    async def get_referee_assignments_by_match(self, match_id: str) -> List[dict]:
        return await self.referee_assignment_repo.get_by_match(match_id)
    
    async def get_referee_assignments_by_organization(self, organization_id: str) -> List[dict]:
        return await self.referee_assignment_repo.get_by_organization(organization_id)
    
    async def assign_coach(self, staff_id: str, team_id: str, organization_id: str, role: str, is_head_coach: bool = False, season_id: Optional[str] = None, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, responsibilities: Optional[List[str]] = None) -> CoachAssignment:
        """Assign coach to team."""
        assignment_data = {
            "staff_id": staff_id,
            "team_id": team_id,
            "organization_id": organization_id,
            "season_id": season_id,
            "role": role,
            "is_head_coach": is_head_coach,
            "start_date": start_date or datetime.utcnow(),
            "end_date": end_date,
            "responsibilities": responsibilities or [],
            "created_by": "system",
        }
        return await self.coach_assignment_repo.create(assignment_data)
    
    async def get_coach_assignments(self, staff_id: str) -> List[dict]:
        return await self.coach_assignment_repo.get_by_staff(staff_id)
    
    async def get_head_coach(self, team_id: str) -> Optional[dict]:
        return await self.coach_assignment_repo.get_head_coach(team_id)
    
    async def get_coach_assignments_by_role(self, team_id: str, role: str) -> List[dict]:
        return await self.coach_assignment_repo.get_by_role(team_id, role)
    
    async def get_coach_assignments_by_season(self, season_id: str) -> List[dict]:
        return await self.coach_assignment_repo.get_by_season(season_id)
    
    async def get_coach_assignments_by_organization(self, organization_id: str) -> List[dict]:
        return await self.coach_assignment_repo.get_by_organization(organization_id)


# =============================================================================
# REGISTRY
# ============================================================================

def get_repositories(db: AsyncIOMotorDatabase) -> Dict[str, BaseRepository]:
    """Get all repositories initialized with database connection."""
    return {
        "organization": OrganizationRepository(db),
        "team": TeamRepository(db),
        "staff": StaffRepository(db),
        "assignment": StaffAssignmentRepository(db),
        "medical_assignment": MedicalAssignmentRepository(db),
        "technical_assignment": TechnicalAssignmentRepository(db),
        "referee_assignment": RefereeAssignmentRepository(db),
        "coach_assignment": CoachAssignmentRepository(db),
        "player_registration": PlayerRegistrationRepository(db),
        "career_history": CareerHistoryRepository(db),
        "face_embedding": FaceEmbeddingRepository(db),
        "staff_medical": StaffMedicalInfoRepository(db),
        "staff_document": StaffDocumentRepository(db),
        "medical_assignment": MedicalAssignmentRepository(db),
        "technical_assignment": TechnicalAssignmentRepository(db),
        "referee_assignment": RefereeAssignmentRepository(db),
        "coach_assignment": CoachAssignmentRepository(db),
    }