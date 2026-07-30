"""Organization Type Repository - Chapter 11 Part 2"""

from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from src.modules.organization.repositories.base import BaseRepository


class OrganizationTypeRepository(BaseRepository):
    """Repository for OrganizationType collection."""
    
    def __init__(self, db):
        super().__init__(db, "organization_types")
    
    async def create_indexes(self):
        await self.collection.create_index([("type_name", 1)], unique=True)
        await self.collection.create_index([("parent_type", ASCENDING)])
        await self.collection.create_index([("status", ASCENDING)])
    
    async def get_by_name(self, name: str) -> Optional[dict]:
        return await self.collection.find_one({"type_name": name})
    
    async def get_by_parent(self, parent_type: str) -> List[dict]:
        cursor = self.collection.find({"parent_type": parent_type})
        return await cursor.to_list(length=100)
    
    async def get_all_active(self) -> List[dict]:
        cursor = self.collection.find({"status": "active"})
        return await cursor.to_list(length=100)


class LeagueMembershipRepository(BaseRepository):
    """Repository for LeagueMembership collection."""
    
    def __init__(self, db):
        super().__init__(db, "league_memberships")
    
    async def create_indexes(self):
        await self.collection.create_index([("organization_id", ASCENDING), ("league_id", ASCENDING), ("season", ASCENDING)], unique=True)
        await self.collection.create_index([("organization_id", ASCENDING)])
        await self.collection.create_index([("league_id", ASCENDING)])
        await self.collection.create_index([("season", ASCENDING)])
        await self.collection.create_index([("membership_status", ASCENDING)])
    
    async def create_membership(self, data: dict) -> str:
        """Create a new league membership."""
        data["_id"] = ObjectId()
        data["created_at"] = datetime.utcnow()
        data["updated_at"] = datetime.utcnow()
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)
    
    async def renew_membership(self, membership_id: str, new_expiry: datetime, renewed_by: str) -> bool:
        """Renew a league membership."""
        result = await self.collection.update_one(
            {"_id": ObjectId(membership_id)},
            {
                "$set": {
                    "expiry_date": new_expiry,
                    "membership_status": "active",
                    "updated_at": datetime.utcnow(),
                    "updated_by": renewed_by
                }
            }
        )
        return result.modified_count > 0
    
    async def terminate_membership(self, membership_id: str, terminated_by: str, reason: str = "") -> bool:
        """Terminate a league membership."""
        result = await self.collection.update_one(
            {"_id": ObjectId(membership_id)},
            {
                "$set": {
                    "membership_status": "terminated",
                    "terminated_at": datetime.utcnow(),
                    "terminated_by": terminated_by,
                    "termination_reason": reason,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    async def find_current_membership(self, organization_id: str, league_id: str, season: str) -> Optional[dict]:
        """Find current active membership for organization in league/season."""
        return await self.collection.find_one({
            "organization_id": organization_id,
            "league_id": league_id,
            "season": season,
            "membership_status": "active"
        })
    
    async def find_membership_history(self, organization_id: str) -> List[dict]:
        """Find all membership history for organization."""
        cursor = self.collection.find({"organization_id": organization_id}).sort([("joining_date", -1)])
        return await cursor.to_list(length=100)
    
    async def find_season_assignments(self, season_id: str) -> List[dict]:
        """Find all assignments for a season."""
        cursor = self.collection.find({"season_id": season_id})
        return await cursor.to_list(length=100)
    
    async def find_organization_assignments(self, organization_id: str) -> List[dict]:
        """Find all assignments for an organization."""
        cursor = self.collection.find({"organization_id": organization_id}).sort([("joining_date", -1)])
        return await cursor.to_list(length=100)
    
    async def get_expiring_memberships(self, days: int = 30) -> List[dict]:
        """Get memberships expiring within specified days."""
        from datetime import timedelta
        cutoff = datetime.utcnow() + timedelta(days=days)
        cursor = self.collection.find({
            "expiry_date": {"$lte": cutoff},
            "membership_status": "active"
        })
        return await cursor.to_list(length=100)


class LicenseRepository(BaseRepository):
    """Repository for License collection."""
    
    def __init__(self, db):
        super().__init__(db, "licenses")
    
    async def create_indexes(self):
        await self.collection.create_index([("license_id", ASCENDING)], unique=True)
        await self.collection.create_index([("organization_id", ASCENDING)])
        await self.collection.create_index([("license_type", ASCENDING)])
        await self.collection.create_index([("expiry_date", ASCENDING)])
        await self.collection.create_index([("verification_status", ASCENDING)])
    
    async def get_by_organization(self, organization_id: str) -> List[dict]:
        cursor = self.collection.find({"organization_id": organization_id})
        return await cursor.to_list(length=100)
    
    async def get_expiring_licenses(self, days: int = 30) -> List[dict]:
        """Get licenses expiring within specified days."""
        from datetime import timedelta
        cutoff = datetime.utcnow() + timedelta(days=days)
        cursor = self.collection.find({
            "expiry_date": {"$lte": cutoff},
            "verification_status": {"$in": ["verified", "pending"]}
        })
        return await cursor.to_list(length=100)
    
    async def find_by_license_number(self, license_number: str) -> Optional[dict]:
        return await self.collection.find_one({"license_number": license_number})
    
    async def find_by_issuing_authority(self, authority: str) -> List[dict]:
        cursor = self.collection.find({"issuing_authority": authority})
        return await cursor.to_list(length=100)
    
    async def update_verification(self, license_id: str, status: str, verified_by: str) -> bool:
        result = await self.collection.update_one(
            {"_id": ObjectId(license_id)},
            {
                "$set": {
                    "verification_status": status,
                    "verified_by": verified_by,
                    "verified_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0


class FacilityRepository(BaseRepository):
    """Repository for Facility collection."""
    
    def __init__(self, db):
        super().__init__(db, "facilities")
    
    async def create_indexes(self):
        await self.collection.create_index([("facility_id", ASCENDING)], unique=True)
        await self.collection.create_index([("organization_id", ASCENDING)])
        await self.collection.create_index([("facility_type", ASCENDING)])
        await self.collection.create_index([("availability_status", ASCENDING)])
        await self.collection.create_index([("facility_name", TEXT)])
    
    async def get_by_organization(self, organization_id: str) -> List[dict]:
        cursor = self.collection.find({"organization_id": organization_id})
        return await cursor.to_list(length=100)
    
    async def get_by_type(self, facility_type: str, organization_id: Optional[str] = None) -> List[dict]:
        filter_dict = {"facility_type": facility_type}
        if organization_id:
            filter_dict["organization_id"] = organization_id
        cursor = self.collection.find(filter_dict)
        return await cursor.to_list(length=100)
    
    async def get_available_facilities(
        self,
        facility_type: str,
        organization_id: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
    ) -> List[dict]:
        filter_dict = {"facility_type": facility_type, "availability_status": "available"}
        if organization_id:
            filter_dict["organization_id"] = organization_id
        
        cursor = self.collection.find(filter_dict)
        return await cursor.to_list(length=100)
    
    async def update_availability(self, facility_id: str, status: str) -> bool:
        result = await self.collection.update_one(
            {"_id": ObjectId(facility_id)},
            {"$set": {"availability_status": status, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0


class HierarchyRepository(BaseRepository):
    """Repository for Organization Hierarchy collection."""
    
    def __init__(self, db):
        super().__init__(db, "organization_hierarchy")
    
    async def create_indexes(self):
        await self.collection.create_index([("parent_organization_id", ASCENDING), ("child_organization_id", ASCENDING)], unique=True)
        await self.collection.create_index([("parent_organization_id", ASCENDING)])
        await self.collection.create_index([("child_organization_id", ASCENDING)])
        await self.collection.create_index([("relationship_type", ASCENDING)])
        await self.collection.create_index([("status", ASCENDING)])
    
    async def create_relationship(self, data: dict) -> str:
        """Create a new hierarchy relationship."""
        data["_id"] = ObjectId()
        data["created_at"] = datetime.utcnow()
        data["updated_at"] = datetime.utcnow()
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)
    
    async def remove_relationship(self, parent_id: str, child_id: str, removed_by: str) -> bool:
        result = await self.collection.update_one(
            {"parent_organization_id": parent_id, "child_organization_id": child_id},
            {
                "$set": {
                    "status": "removed",
                    "removed_at": datetime.utcnow(),
                    "removed_by": removed_by,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    async def find_children(self, parent_id: str, relationship_type: Optional[str] = None) -> List[dict]:
        filter_dict = {"parent_organization_id": parent_id, "status": "active"}
        if relationship_type:
            filter_dict["relationship_type"] = relationship_type
        cursor = self.collection.find(filter_dict)
        return await cursor.to_list(length=100)
    
    async def find_parents(self, child_id: str, relationship_type: Optional[str] = None) -> List[dict]:
        filter_dict = {"child_organization_id": child_id, "status": "active"}
        if relationship_type:
            filter_dict["relationship_type"] = relationship_type
        cursor = self.collection.find(filter_dict)
        return await cursor.to_list(length=100)
    
    async def build_hierarchy_tree(self, root_id: str, max_depth: int = 5) -> dict:
        """Build hierarchy tree from root organization."""
        root = await self.organization_repo.get_by_id(root_id)
        if not root:
            return {}
        
        def build_tree(org_id: str, depth: int) -> dict:
            if depth >= max_depth:
                return {"organization": org, "children": []}
            
            children_rels = self.find_children(org_id)
            children = []
            for rel in children_rels:
                child = self.organization_repo.get_by_id(rel["child_organization_id"])
                if child:
                    children.append(build_tree(child["_id"], depth + 1))
            
            return {"organization": org, "children": children}
        
        return build_tree(root_id, 0)
    
    async def validate_hierarchy(self, parent_id: str, child_id: str) -> bool:
        """Validate that adding this relationship won't create a cycle."""
        # Check if child is already an ancestor of parent
        current = parent_id
        visited = set()
        while current:
            if current == child_id:
                return False  # Cycle detected
            if current in visited:
                break
            visited.add(current)
            # Get parent of current
            parent_rel = await self.collection.find_one(
                {"child_organization_id": current, "status": "active"}
            )
            if parent_rel:
                current = parent_rel["parent_organization_id"]
            else:
                break
        return True


class InvitationRepository(BaseRepository):
    """Repository for Invitations (Organization & Team)."""
    
    def __init__(self, db):
        super().__init__(db, "invitations")
    
    async def create_indexes(self):
        await self.collection.create_index([("invitation_id", ASCENDING)], unique=True)
        await self.collection.create_index([("email", ASCENDING)])
        await self.collection.create_index([("invitation_type", ASCENDING)])
        await self.collection.create_index([("status", ASCENDING)])
        await self.collection.create_index([("expires_at", ASCENDING)])
        await self.collection.create_index([("organization_id", ASCENDING), ("status", ASCENDING)])
    
    async def create_invitation(self, data: dict) -> str:
        data["_id"] = ObjectId()
        data["invitation_id"] = str(ObjectId())
        data["created_at"] = datetime.utcnow()
        data["updated_at"] = datetime.utcnow()
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)
    
    async def get_by_invitation_id(self, invitation_id: str) -> Optional[dict]:
        return await self.collection.find_one({"invitation_id": invitation_id})
    
    async def get_by_email(self, email: str) -> List[dict]:
        cursor = self.collection.find({"email": email})
        return await cursor.to_list(length=100)
    
    async def accept_invitation(self, invitation_id: str, accepted_by: str) -> bool:
        result = await self.collection.update_one(
            {"invitation_id": invitation_id, "status": "pending"},
            {
                "$set": {
                    "status": "accepted",
                    "accepted_by": invitation_id,
                    "accepted_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    async def decline_invitation(self, invitation_id: str, declined_by: str) -> bool:
        result = await self.collection.update_one(
            {"invitation_id": invitation_id, "status": "pending"},
            {
                "$set": {
                    "status": "declined",
                    "declined_by": declined_by,
                    "declined_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    async def expire_invitations(self) -> int:
        result = await self.collection.update_many(
            {"status": "pending", "expires_at": {"$lt": datetime.utcnow()}},
            {"$set": {"status": "expired", "updated_at": datetime.utcnow()}}
        )
        return result.modified_count


class BrandingRepository(BaseRepository):
    """Repository for Branding assets."""
    
    def __init__(self, db):
        super().__init__(db, "branding")
    
    async def create_indexes(self):
        await self.collection.create_index([("entity_id", ASCENDING), ("entity_type", ASCENDING)], unique=True)
        await self.collection.create_index([("entity_type", ASCENDING)])
        await self.collection.create_index([("logo_url", ASCENDING)])
    
    async def get_branding(self, entity_id: str, entity_type: str) -> Optional[dict]:
        return await self.collection.find_one({"entity_id": entity_id, "entity_type": entity_type})
    
    async def upsert_branding(self, entity_id: str, entity_type: str, branding_data: dict) -> bool:
        result = await self.collection.update_one(
            {"entity_id": entity_id, "entity_type": entity_type},
            {
                "$set": {
                    **branding_data,
                    "entity_id": entity_id,
                    "entity_type": entity_type,
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        return result.modified_count > 0 or result.upserted_id is not None
    
    async def delete_branding(self, entity_id: str, entity_type: str) -> bool:
        result = await self.collection.delete_one({"entity_id": entity_id, "entity_type": entity_type})
        return result.deleted_count > 0


class AuditRepository(BaseRepository):
    """Repository for Audit Logs."""
    
    def __init__(self, db):
        super().__init__(db, "audit_logs")
    
    async def create_indexes(self):
        await self.collection.create_index([("user_id", ASCENDING)])
        await self.collection.create_index([("action", ASCENDING)])
        await self.collection.create_index([("entity_type", ASCENDING), ("entity_id", ASCENDING)])
        await self.collection.create_index([("timestamp", DESCENDING)])
        await self.collection.create_index([("correlation_id", ASCENDING)])
        await self.collection.create_index([("user_id", ASCENDING), ("timestamp", DESCENDING)])
    
    async def create_audit_log(self, data: dict) -> str:
        data["_id"] = ObjectId()
        data["timestamp"] = datetime.utcnow()
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)
    
    async def get_by_entity(self, entity_type: str, entity_id: str, limit: int = 100) -> List[dict]:
        cursor = self.collection.find({
            "entity_type": entity_type,
            "entity_id": entity_id
        }).sort([("timestamp", DESCENDING)]).limit(limit)
        return await cursor.to_list(length=limit)
    
    async def get_by_user(self, user_id: str, limit: int = 100) -> List[dict]:
        cursor = self.collection.find({"user_id": user_id}).sort([("timestamp", DESCENDING)]).limit(limit)
        return await cursor.to_list(length=limit)
    
    async def get_by_correlation_id(self, correlation_id: str) -> List[dict]:
        cursor = self.collection.find({"correlation_id": correlation_id}).sort([("timestamp", ASCENDING)])
        return await cursor.to_list(length=100)
    
    async def get_by_action(self, action: str, limit: int = 100) -> List[dict]:
        cursor = self.collection.find({"action": action}).sort([("timestamp", DESCENDING)]).limit(limit)
        return await cursor.to_list(length=limit)
    
    async def get_by_date_range(
        self,
        start_date: datetime,
        end_date: datetime,
        entity_type: Optional[str] = None,
        limit: int = 100
    ) -> List[dict]:
        filter_dict = {
            "timestamp": {"$gte": start_date, "$lte": end_date}
        }
        if entity_type:
            filter_dict["entity_type"] = entity_type
        cursor = self.collection.find(filter_dict).sort([("timestamp", DESCENDING)]).limit(limit)
        return await cursor.to_list(length=limit)