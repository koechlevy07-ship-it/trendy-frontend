/**
 * Supporting Repositories - Chapter 11 Part 2
 * 
 * Repositories for OrganizationType, LeagueMembership, License, Facility, 
 * Hierarchy, Invitations, Branding, TeamSeason, Document, Administrator, AuditLog
 */

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, Document } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginationParams, PaginatedResult } from './base.repository';
import {
  OrganizationType,
  OrganizationTypeDocument,
  LeagueMembership,
  LeagueMembershipDocument,
  MembershipStatus,
  OrganizationLicense,
  OrganizationLicenseDocument,
  LicenseType,
  VerificationStatus,
  Facility,
  FacilityDocument,
  FacilityType,
  AvailabilityStatus,
  OrganizationHierarchy,
  OrganizationHierarchyDocument,
  HierarchyRelationshipType,
  HierarchyStatus,
  OrganizationInvitation,
  OrganizationInvitationDocument,
  TeamInvitation,
  TeamInvitationDocument,
  InvitationType,
  InvitationStatus,
  TeamBranding,
  TeamBrandingDocument,
  EntityType,
  TeamSeason,
  TeamSeasonDocument,
  OrganizationDocument as OrgDocument,
  OrganizationDocumentDocument,
  OrganizationAdministrator,
  OrganizationAdministratorDocument,
  OrganizationAuditLog,
  OrganizationAuditLogDocument,
} from '../schemas/organization.model';

// ============================================================================
// ORGANIZATION TYPE REPOSITORY
// ============================================================================

@Injectable()
export class OrganizationTypeRepository extends BaseRepository<OrganizationTypeDocument> {
  constructor(
    @InjectModel(OrganizationType.name) private readonly typeModel: Model<OrganizationTypeDocument>,
  ) {
    super(typeModel);
  }

  async createIndex(): Promise<void> {
    await this.typeModel.createIndexes();
  }

  async getByName(name: string): Promise<OrganizationTypeDocument | null> {
    return this.typeModel.findOne({ typeName: name }).exec();
  }

  async getByParent(parentType: string): Promise<OrganizationTypeDocument[]> {
    return this.typeModel.find({ parentType }).exec();
  }

  async getAllActive(): Promise<OrganizationTypeDocument[]> {
    return this.typeModel.find({ status: 'active' }).exec();
  }
}

// ============================================================================
// LEAGUE MEMBERSHIP REPOSITORY
// ============================================================================

export interface CreateMembershipDTO {
  membershipId: string;
  organizationId: string;
  leagueId: string;
  season: string;
  membershipStatus: MembershipStatus;
  joiningDate: Date;
  expiryDate?: Date;
  division?: string;
  approvedBy?: string;
}

@Injectable()
export class LeagueMembershipRepository extends BaseRepository<LeagueMembershipDocument> {
  constructor(
    @InjectModel(LeagueMembership.name)
    private readonly membershipModel: Model<LeagueMembershipDocument>,
  ) {
    super(membershipModel);
  }

  async createIndex(): Promise<void> {
    await this.membershipModel.createIndexes();
  }

  async createMembership(data: CreateMembershipDTO): Promise<string> {
    const doc = new this.membershipModel({
      ...data,
      _id: new Types.ObjectId(),
      organizationId: new Types.ObjectId(data.organizationId),
      leagueId: new Types.ObjectId(data.leagueId),
      approvedBy: data.approvedBy ? new Types.ObjectId(data.approvedBy) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const result = await doc.save();
    return result._id.toString();
  }

  async renewMembership(
    membershipId: string,
    newExpiry: Date,
    renewedBy: string,
  ): Promise<boolean> {
    const result = await this.membershipModel
      .findByIdAndUpdate(membershipId, {
        $set: {
          expiryDate: newExpiry,
          membershipStatus: MembershipStatus.ACTIVE,
          updatedAt: new Date(),
          updatedBy: new Types.ObjectId(renewedBy),
        },
      })
      .exec();
    return !!result;
  }

  async terminateMembership(
    membershipId: string,
    terminatedBy: string,
    reason: string = '',
  ): Promise<boolean> {
    const result = await this.membershipModel
      .findByIdAndUpdate(membershipId, {
        $set: {
          membershipStatus: MembershipStatus.TERMINATED,
          terminatedAt: new Date(),
          terminatedBy: new Types.ObjectId(terminatedBy),
          terminationReason: reason,
          updatedAt: new Date(),
        },
      })
      .exec();
    return !!result;
  }

  async findCurrentMembership(
    organizationId: string,
    leagueId: string,
    season: string,
  ): Promise<LeagueMembershipDocument | null> {
    return this.membershipModel
      .findOne({
        organizationId: new Types.ObjectId(organizationId),
        leagueId: new Types.ObjectId(leagueId),
        season,
        membershipStatus: MembershipStatus.ACTIVE,
      })
      .exec();
  }

  async findMembershipHistory(organizationId: string): Promise<LeagueMembershipDocument[]> {
    return this.membershipModel
      .find({ organizationId: new Types.ObjectId(organizationId) })
      .sort({ joiningDate: -1 })
      .exec();
  }

  async findSeasonAssignments(seasonId: string): Promise<LeagueMembershipDocument[]> {
    return this.membershipModel
      .find({ season: seasonId })
      .exec();
  }

  async findOrganizationAssignments(organizationId: string): Promise<LeagueMembershipDocument[]> {
    return this.membershipModel
      .find({ organizationId: new Types.ObjectId(organizationId) })
      .sort({ joiningDate: -1 })
      .exec();
  }

  async getExpiringMemberships(days: number = 30): Promise<LeagueMembershipDocument[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return this.membershipModel
      .find({
        expiryDate: { $lte: cutoff },
        membershipStatus: MembershipStatus.ACTIVE,
      })
      .exec();
  }
}

// ============================================================================
// LICENSE REPOSITORY
// ============================================================================

@Injectable()
export class LicenseRepository extends BaseRepository<OrganizationLicenseDocument> {
  constructor(
    @InjectModel(OrganizationLicense.name)
    private readonly licenseModel: Model<OrganizationLicenseDocument>,
  ) {
    super(licenseModel);
  }

  async createIndex(): Promise<void> {
    await this.licenseModel.createIndexes();
  }

  async getByOrganization(organizationId: string): Promise<OrganizationLicenseDocument[]> {
    return this.licenseModel
      .find({ organizationId: new Types.ObjectId(organizationId) })
      .exec();
  }

  async getExpiringLicenses(days: number = 30): Promise<OrganizationLicenseDocument[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return this.licenseModel
      .find({
        expiryDate: { $lte: cutoff },
        verificationStatus: { $in: [VerificationStatus.VERIFIED, VerificationStatus.PENDING] },
      })
      .exec();
  }

  async findByLicenseNumber(licenseNumber: string): Promise<OrganizationLicenseDocument | null> {
    return this.licenseModel.findOne({ licenseNumber }).exec();
  }

  async findByIssuingAuthority(authority: string): Promise<OrganizationLicenseDocument[]> {
    return this.licenseModel.find({ issuingAuthority: authority }).exec();
  }

  async updateVerification(
    licenseId: string,
    status: VerificationStatus,
    verifiedBy: string,
  ): Promise<boolean> {
    const result = await this.licenseModel
      .findByIdAndUpdate(licenseId, {
        $set: {
          verificationStatus: status,
          verifiedBy: new Types.ObjectId(verifiedBy),
          verifiedAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .exec();
    return !!result;
  }
}

// ============================================================================
// FACILITY REPOSITORY
// ============================================================================

@Injectable()
export class FacilityRepository extends BaseRepository<FacilityDocument> {
  constructor(
    @InjectModel(Facility.name) private readonly facilityModel: Model<FacilityDocument>,
  ) {
    super(facilityModel);
  }

  async createIndex(): Promise<void> {
    await this.facilityModel.createIndexes();
  }

  async getByOrganization(organizationId: string): Promise<FacilityDocument[]> {
    return this.facilityModel
      .find({ organizationId: new Types.ObjectId(organizationId) })
      .exec();
  }

  async getByType(
    facilityType: FacilityType,
    organizationId?: string,
  ): Promise<FacilityDocument[]> {
    const filter: FilterQuery<FacilityDocument> = { facilityType };
    if (organizationId) {
      filter.organizationId = new Types.ObjectId(organizationId);
    }
    return this.facilityModel.find(filter).exec();
  }

  async getAvailableFacilities(
    facilityType: FacilityType,
    organizationId?: string,
    startTime?: Date,
    endTime?: Date,
  ): Promise<FacilityDocument[]> {
    const filter: FilterQuery<FacilityDocument> = {
      facilityType,
      availabilityStatus: AvailabilityStatus.AVAILABLE,
    };
    if (organizationId) {
      filter.organizationId = new Types.ObjectId(organizationId);
    }
    return this.facilityModel.find(filter).exec();
  }

  async updateAvailability(facilityId: string, status: AvailabilityStatus): Promise<boolean> {
    const result = await this.facilityModel
      .findByIdAndUpdate(facilityId, {
        $set: { availabilityStatus: status, updatedAt: new Date() },
      })
      .exec();
    return !!result;
  }
}

// ============================================================================
// HIERARCHY REPOSITORY
// ============================================================================

@Injectable()
export class HierarchyRepository extends BaseRepository<OrganizationHierarchyDocument> {
  constructor(
    @InjectModel(OrganizationHierarchy.name)
    private readonly hierarchyModel: Model<OrganizationHierarchyDocument>,
    @InjectModel(OrganizationType.name)
    private readonly organizationModel: Model<OrganizationTypeDocument>,
  ) {
    super(hierarchyModel);
  }

  async createIndex(): Promise<void> {
    await this.hierarchyModel.createIndexes();
  }

  async createRelationship(data: {
    parentOrganizationId: string;
    childOrganizationId: string;
    relationshipType: HierarchyRelationshipType;
    effectiveDate: Date;
  }): Promise<string> {
    const doc = new this.hierarchyModel({
      ...data,
      _id: new Types.ObjectId(),
      parentOrganizationId: new Types.ObjectId(data.parentOrganizationId),
      childOrganizationId: new Types.ObjectId(data.childOrganizationId),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const result = await doc.save();
    return result._id.toString();
  }

  async removeRelationship(
    parentId: string,
    childId: string,
    removedBy: string,
  ): Promise<boolean> {
    const result = await this.hierarchyModel
      .findOneAndUpdate(
        { parentOrganizationId: new Types.ObjectId(parentId), childOrganizationId: new Types.ObjectId(childId) },
        {
          $set: {
            status: HierarchyStatus.REMOVED,
            removedAt: new Date(),
            removedBy: new Types.ObjectId(removedBy),
            updatedAt: new Date(),
          },
        },
      )
      .exec();
    return !!result;
  }

  async findChildren(
    parentId: string,
    relationshipType?: HierarchyRelationshipType,
  ): Promise<OrganizationHierarchyDocument[]> {
    const filter: FilterQuery<OrganizationHierarchyDocument> = {
      parentOrganizationId: new Types.ObjectId(parentId),
      status: HierarchyStatus.ACTIVE,
    };
    if (relationshipType) {
      filter.relationshipType = relationshipType;
    }
    return this.hierarchyModel.find(filter).exec();
  }

  async findParents(
    childId: string,
    relationshipType?: HierarchyRelationshipType,
  ): Promise<OrganizationHierarchyDocument[]> {
    const filter: FilterQuery<OrganizationHierarchyDocument> = {
      childOrganizationId: new Types.ObjectId(childId),
      status: HierarchyStatus.ACTIVE,
    };
    if (relationshipType) {
      filter.relationshipType = relationshipType;
    }
    return this.hierarchyModel.find(filter).exec();
  }

  async validateHierarchy(parentId: string, childId: string): Promise<boolean> {
    // Check if child is already an ancestor of parent (cycle detection)
    let current = parentId;
    const visited = new Set<string>();
    
    while (current && !visited.has(current)) {
      if (current === childId) {
        return false; // Cycle detected
      }
      visited.add(current);
      
      const parentRel = await this.hierarchyModel
        .findOne({ childOrganizationId: new Types.ObjectId(current), status: HierarchyStatus.ACTIVE })
        .exec();
      
      if (parentRel) {
        current = parentRel.parentOrganizationId.toString();
      } else {
        break;
      }
    }
    return true;
  }

  async buildHierarchyTree(rootId: string, maxDepth: number = 5): Promise<any> {
    const root = await this.organizationModel.findById(rootId).exec();
    if (!root) return {};

    async function buildTree(orgId: string, depth: number): Promise<any> {
      if (depth >= maxDepth) {
        return { organization: orgId, children: [] };
      }

      const childrenRels = await this.findChildren(orgId);
      const children = [];
      for (const rel of childrenRels) {
        const child = await this.organizationModel.findById(rel.childOrganizationId).exec();
        if (child) {
          children.push(await buildTree(child._id.toString(), depth + 1));
        }
      }

      return { organization: orgId, children };
    }

    return buildTree(rootId, 0);
  }
}

// ============================================================================
// INVITATION REPOSITORY
// ============================================================================

export interface CreateInvitationDTO {
  organizationId: string;
  email: string;
  role: string;
  invitationType: InvitationType;
  invitedBy: string;
  expiresAt: Date;
}

@Injectable()
export class InvitationRepository extends BaseRepository<OrganizationInvitationDocument> {
  constructor(
    @InjectModel(OrganizationInvitation.name)
    private readonly orgInvitationModel: Model<OrganizationInvitationDocument>,
    @InjectModel(TeamInvitation.name)
    private readonly teamInvitationModel: Model<TeamInvitationDocument>,
  ) {
    super(orgInvitationModel);
  }

  async createIndex(): Promise<void> {
    await this.orgInvitationModel.createIndexes();
    await this.teamInvitationModel.createIndexes();
  }

  async createOrganizationInvitation(data: CreateInvitationDTO): Promise<OrganizationInvitationDocument> {
    const doc = new this.orgInvitationModel({
      ...data,
      _id: new Types.ObjectId(),
      invitationId: new Types.ObjectId().toString(),
      organizationId: new Types.ObjectId(data.organizationId),
      invitedBy: new Types.ObjectId(data.invitedBy),
      invitedAt: new Date(),
      expiresAt: data.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return doc.save();
  }

  async createTeamInvitation(
    teamId: string,
    organizationId: string,
    data: Omit<CreateInvitationDTO, 'organizationId'>,
  ): Promise<TeamInvitationDocument> {
    const doc = new this.teamInvitationModel({
      ...data,
      _id: new Types.ObjectId(),
      invitationId: new Types.ObjectId().toString(),
      teamId: new Types.ObjectId(teamId),
      organizationId: new Types.ObjectId(organizationId),
      invitedBy: new Types.ObjectId(data.invitedBy),
      invitedAt: new Date(),
      expiresAt: data.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return doc.save();
  }

  async getByInvitationId(invitationId: string): Promise<OrganizationInvitationDocument | null> {
    return this.orgInvitationModel.findOne({ invitationId }).exec();
  }

  async getByEmail(email: string): Promise<OrganizationInvitationDocument[]> {
    return this.orgInvitationModel.find({ email }).exec();
  }

  async acceptInvitation(invitationId: string, acceptedBy: string): Promise<boolean> {
    const result = await this.orgInvitationModel
      .findOneAndUpdate(
        { invitationId, status: InvitationStatus.PENDING },
        {
          $set: {
            status: InvitationStatus.ACCEPTED,
            acceptedBy: new Types.ObjectId(acceptedBy),
            acceptedAt: new Date(),
            updatedAt: new Date(),
          },
        },
      )
      .exec();
    return !!result;
  }

  async declineInvitation(invitationId: string, declinedBy: string): Promise<boolean> {
    const result = await this.orgInvitationModel
      .findOneAndUpdate(
        { invitationId, status: InvitationStatus.PENDING },
        {
          $set: {
            status: InvitationStatus.DECLINED,
            declinedBy: new Types.ObjectId(declinedBy),
            declinedAt: new Date(),
            updatedAt: new Date(),
          },
        },
      )
      .exec();
    return !!result;
  }

  async expireInvitations(): Promise<number> {
    const result = await this.orgInvitationModel
      .updateMany(
        { status: InvitationStatus.PENDING, expiresAt: { $lt: new Date() } },
        { $set: { status: InvitationStatus.EXPIRED, updatedAt: new Date() } },
      )
      .exec();
    return result.modifiedCount;
  }
}

// ============================================================================
// BRANDING REPOSITORY
// ============================================================================

@Injectable()
export class BrandingRepository extends BaseRepository<TeamBrandingDocument> {
  constructor(
    @InjectModel(TeamBranding.name) private readonly brandingModel: Model<TeamBrandingDocument>,
  ) {
    super(brandingModel);
  }

  async createIndex(): Promise<void> {
    await this.brandingModel.createIndexes();
  }

  async getBranding(entityId: string, entityType: EntityType): Promise<TeamBrandingDocument | null> {
    return this.brandingModel
      .findOne({ entityId: new Types.ObjectId(entityId), entityType })
      .exec();
  }

  async upsertBranding(
    entityId: string,
    entityType: EntityType,
    brandingData: Partial<TeamBrandingDocument>,
  ): Promise<boolean> {
    const result = await this.brandingModel
      .updateOne(
        { entityId: new Types.ObjectId(entityId), entityType },
        {
          $set: {
            ...brandingData,
            entityId: new Types.ObjectId(entityId),
            entityType,
            updatedAt: new Date(),
          },
        },
        { upsert: true },
      )
      .exec();
    return result.modifiedCount > 0 || result.upsertedCount > 0;
  }

  async deleteBranding(entityId: string, entityType: EntityType): Promise<boolean> {
    const result = await this.brandingModel
      .deleteOne({ entityId: new Types.ObjectId(entityId), entityType })
      .exec();
    return result.deletedCount > 0;
  }
}

// ============================================================================
// TEAM SEASON REPOSITORY
// ============================================================================

@Injectable()
export class TeamSeasonRepository extends BaseRepository<TeamSeasonDocument> {
  constructor(
    @InjectModel(TeamSeason.name) private readonly seasonModel: Model<TeamSeasonDocument>,
  ) {
    super(seasonModel);
  }

  async createIndex(): Promise<void> {
    await this.seasonModel.createIndexes();
  }
}

// ============================================================================
// ORGANIZATION DOCUMENT REPOSITORY
// ============================================================================

@Injectable()
export class OrganizationDocumentRepository extends BaseRepository<OrganizationDocumentDocument> {
  constructor(
    @InjectModel(OrgDocument.name)
    private readonly docModel: Model<OrganizationDocumentDocument>,
  ) {
    super(docModel);
  }

  async createIndex(): Promise<void> {
    await this.docModel.createIndexes();
  }
}

// ============================================================================
// ORGANIZATION ADMINISTRATOR REPOSITORY
// ============================================================================

@Injectable()
export class OrganizationAdministratorRepository extends BaseRepository<OrganizationAdministratorDocument> {
  constructor(
    @InjectModel(OrganizationAdministrator.name)
    private readonly adminModel: Model<OrganizationAdministratorDocument>,
  ) {
    super(adminModel);
  }

  async createIndex(): Promise<void> {
    await this.adminModel.createIndexes();
  }
}

// ============================================================================
// AUDIT LOG REPOSITORY
// ============================================================================

export interface CreateAuditLogDTO {
  userId?: string;
  userRole?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedFields?: string[];
  correlationId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  ipAddress?: string;
  device?: string;
  userAgent?: string;
  result?: string;
  errorMessage?: string;
}

@Injectable()
export class AuditRepository extends BaseRepository<OrganizationAuditLogDocument> {
  constructor(
    @InjectModel(OrganizationAuditLog.name)
    private readonly auditModel: Model<OrganizationAuditLogDocument>,
  ) {
    super(auditModel);
  }

  async createIndex(): Promise<void> {
    await this.auditModel.createIndexes();
  }

  async createAuditLog(data: CreateAuditLogDTO): Promise<OrganizationAuditLogDocument> {
    const doc = new this.auditModel({
      ...data,
      _id: new Types.ObjectId(),
      auditId: new Types.ObjectId().toString(),
      userId: data.userId ? new Types.ObjectId(data.userId) : undefined,
      entityId: new Types.ObjectId(data.entityId),
      timestamp: new Date(),
    });
    return doc.save();
  }

  async getByEntity(
    entityType: string,
    entityId: string,
    limit: number = 100,
  ): Promise<OrganizationAuditLogDocument[]> {
    return this.auditModel
      .find({ entityType, entityId: new Types.ObjectId(entityId) })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async getByUser(userId: string, limit: number = 100): Promise<OrganizationAuditLogDocument[]> {
    return this.auditModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async getByCorrelationId(correlationId: string): Promise<OrganizationAuditLogDocument[]> {
    return this.auditModel
      .find({ correlationId })
      .sort({ timestamp: 1 })
      .exec();
  }

  async getByAction(action: string, limit: number = 100): Promise<OrganizationAuditLogDocument[]> {
    return this.auditModel
      .find({ action })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async getByDateRange(
    startDate: Date,
    endDate: Date,
    entityType?: string,
    limit: number = 100,
  ): Promise<OrganizationAuditLogDocument[]> {
    const filter: FilterQuery<OrganizationAuditLogDocument> = {
      timestamp: { $gte: startDate, $lte: endDate },
    };
    if (entityType) {
      filter.entityType = entityType;
    }
    return this.auditModel
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }
}