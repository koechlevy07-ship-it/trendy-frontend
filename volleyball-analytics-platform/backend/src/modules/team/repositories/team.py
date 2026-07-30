"""Team Repository - Chapter 11 Part 2"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorCollection
from pymongo import ASCENDING, DESCENDING, TEXT

from src.modules.organization.models.organization import (
    Team,
    TeamSeasonRecord,
    TeamRosterEntry,
    TeamCoachingStaffEntry,
    TeamSeasonRecord,
    TeamBranding,
    TeamAIMetadata,
    COLLECTIONS,
)


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
    
    async def get_by_team_id(self, team_id: str) -> Optional[dict]:
        """Get team by team_id."""
        return await self.collection.find_one({"team_id": team_id})
    
    async def get_by_organization(self, organization_id: str) -> List[dict]:
        """Get all teams for an organization."""
        cursor = self.collection.find({"organization_id": organization_id})
        return await cursor.to_list(length=100)
    
    async def get_by_category(self, organization_id: str, category: str) -> List[dict]:
        """Get teams by category."""
        cursor = self.collection.find({
            "organization_id": organization_id,
            "category": category
        })
        return await cursor.to_list(length=100)
    
    async def get_by_gender(self, organization_id: str, gender: str) -> List[dict]:
        """Get teams by gender."""
        cursor = self.collection.find({
            "organization_id": organization_id,
            "gender": gender
        })
        return await cursor.to_list(length=100)
    
    async def get_active_teams(self, organization_id: str) -> List[dict]:
        """Get active teams for an organization."""
        cursor = self.collection.find({
            "organization_id": organization_id,
            "status": "active"
        })
        return await cursor.to_list(length=100)
    
    async def get_by_league(self, league_id: str) -> List[dict]:
        """Get teams in a league."""
        cursor = self.collection.find({"league": league_id})
        return await cursor.to_list(length=100)
    
    async def get_by_season(self, season_id: str) -> List[dict]:
        """Get teams in a season."""
        cursor = self.collection.find({"season": season_id})
        return await cursor.to_list(length=100)
    
    async def search(
        self,
        query: str,
        organization_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[dict]:
        """Search teams by name."""
        filter_dict = {"$text": {"$search": query}}
        if organization_id:
            filter_dict["organization_id"] = organization_id
        
        cursor = self.collection.find(filter_dict).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
    
    async def get_by_jersey(self, team_id: str, jersey_number: int) -> Optional[dict]:
        """Get player by jersey number."""
        result = await self.db.players.find_one({
            "team_id": team_id,
            "jersey_number": jersey_number
        })
        return result
    
    async def get_roster(self, team_id: str) -> List[dict]:
        """Get team roster."""
        cursor = self.db.players.find({
            "team_id": team_id,
            "is_active": True
        }).sort([("jersey_number", ASCENDING)])
        return await cursor.to_list(length=100)
    
    async def get_active_roster(self, team_id: str) -> List[dict]:
        """Get active roster for a team."""
        return await self.get_roster(team_id)
    
    async def add_roster_entry(self, team_id: str, entry: dict) -> bool:
        """Add roster entry to team."""
        entry["player_id"] = str(ObjectId())
        entry["join_date"] = entry.get("join_date", datetime.utcnow())
        entry["is_active"] = entry.get("is_active", True)
        entry["season_ids"] = entry.get("season_ids", [])
        entry["added_by"] = entry.get("added_by", "system")
        
        result = await self.collection.update_one(
            {"_id": ObjectId(team_id)},
            {
                "$push": {"active_roster": entry},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        return result.modified_count > 0
    
    async def remove_roster_entry(self, team_id: str, player_id: str, leave_date: Optional[datetime] = None) -> bool:
        """Remove player from roster."""
        leave = leave_date or datetime.utcnow()
        result = await self.collection.update_one(
            {"_id": ObjectId(team_id)},
            {
                "$set": {
                    "active_roster.$[elem].is_active": False,
                    "active_roster.$[elem].leave_date": leave,
                    "updated_at": datetime.utcnow()
                }
            },
            array_filters=[{"elem.player_id": player_id}]
        )
        
        # Also update historical roster
        await self.collection.update_one(
            {"_id": ObjectId(team_id)},
            {
                "$push": {"historical_roster": {
                    "player_id": player_id,
                    "leave_date": leave,
                    "is_historical": True
                }}
            }
        )
        return True
    
    async def set_captain(self, team_id: str, player_id: str, is_captain: bool) -> bool:
        """Set/unset player as captain."""
        result = await self.db.players.update_one(
            {"team_id": team_id, "player_id": player_id},
            {"$set": {"is_captain": is_captain, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0
    
    async def set_libero(self, team_id: str, player_id: str, is_libero: bool) -> bool:
        """Set/unset player as libero."""
        result = await self.db.players.update_one(
            {"team_id": team_id, "player_id": player_id},
            {"$set": {"is_libero": is_libero, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0
    
    async def add_coaching_staff(self, team_id: str, staff_data: dict) -> bool:
        """Add coaching staff to team."""
        staff_data["staff_id"] = str(ObjectId())
        staff_data["start_date"] = staff_data.get("start_date", datetime.utcnow())
        staff_data["is_active"] = staff_data.get("is_active", True)
        
        result = await self.collection.update_one(
            {"_id": ObjectId(team_id)},
            {
                "$push": {"coaching_staff": staff_data},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        return result.modified_count > 0
    
    async def remove_coaching_staff(self, team_id: str, staff_id: str, end_date: Optional[datetime] = None) -> bool:
        """Remove coaching staff from team."""
        end = end_date or datetime.utcnow()
        result = await self.collection.update_one(
            {"_id": ObjectId(team_id)},
            {
                "$set": {
                    "coaching_staff.$[elem].end_date": end,
                    "coaching_staff.$[elem].is_active": False,
                    "updated_at": datetime.utcnow()
                }
            },
            array_filters=[{"elem.staff_id": staff_id}]
        )
        return result.modified_count > 0
    
    async def add_season_record(self, team_id: str, season_data: dict) -> bool:
        """Add season record to team."""
        season_data["id"] = str(ObjectId())
        season_data["is_archived"] = False
        season_data["matches_played"] = season_data.get("matches_played", 0)
        season_data["wins"] = season_data.get("wins", 0)
        season_data["losses"] = season_data.get("losses", 0)
        season_data["draws"] = season_data.get("draws", 0)
        
        result = await self.collection.update_one(
            {"_id": ObjectId(team_id)},
            {
                "$push": {"season_history": season_data},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        return result.modified_count > 0
    
    async def archive_season(self, team_id: str, season_id: str, archived_by: str) -> bool:
        """Archive a season record."""
        result = await self.collection.update_one(
            {"_id": ObjectId(team_id), "season_history.id": season_id},
            {
                "$set": {
                    "season_history.$.is_archived": True,
                    "season_history.$.archived_at": datetime.utcnow(),
                    "season_history.$.archived_by": archived_by,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    async def get_season_stats(self, team_id: str, season_id: str) -> Optional[dict]:
        """Get season statistics for team."""
        team = await self.get_by_id(team_id)
        if not team:
            return None
        for season in team.get("season_history", []):
            if season.get("id") == season_id or season.get("season_id") == season_id:
                return season
        return None
    
    async def get_all_seasons(self, team_id: str) -> List[dict]:
        """Get all season records for team."""
        team = await self.get_by_id(team_id)
        if not team:
            return []
        return team.get("season_history", [])
    
    async def get_current_season(self, team_id: str) -> Optional[dict]:
        """Get current season record."""
        team = await self.get_by_id(team_id)
        if not team:
            return None
        current_season_id = team.get("current_season_id")
        if not current_season_id:
            return None
        return await self.get_season_stats(team_id, current_season_id)
    
    async def register_face_embedding(self, team_id: str, player_id: str, embedding_data: dict) -> bool:
        """Register face embedding for player."""
        # This would typically go to a separate face_embeddings collection
        # For now, store in player document
        result = await self.db.players.update_one(
            {"_id": ObjectId(player_id), "team_id": team_id},
            {
                "$set": {
                    "ai_metadata.face_embedding": embedding_data.get("embedding"),
                    "ai_metadata.embedding_version": embedding_data.get("version", 1),
                    "ai_metadata.feature_vector_reference": embedding_data.get("reference"),
                    "ai_metadata.capture_date": datetime.utcnow(),
                    "ai_metadata.camera_source": embedding_data.get("camera_source"),
                    "ai_metadata.quality_score": embedding_data.get("quality"),
                    "ai_metadata.algorithm_version": embedding_data.get("algorithm"),
                    "ai_metadata.status": "active",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    async def get_active_face_embedding(self, team_id: str, player_id: str) -> Optional[dict]:
        """Get active face embedding for player."""
        player = await self.db.players.find_one({
            "_id": ObjectId(player_id),
            "team_id": team_id
        })
        if not player:
            return None
        return player.get("ai_metadata", {}).get("face_embedding")
    
    async def deactivate_old_embeddings(self, player_id: str, current_version: int) -> int:
        """Deactivate old embeddings."""
        # This would typically be handled in the embeddings collection
        return 0


# Export all repositories
REPOSITORIES = {
    "organization": OrganizationRepository,
    "team": TeamRepository,
    # Add other repositories here as needed
}