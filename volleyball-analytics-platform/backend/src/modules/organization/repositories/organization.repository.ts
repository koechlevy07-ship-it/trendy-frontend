/**
 * Organization Repository - Chapter 11 Part 2
 * 
 * Repository for Organization collection with all required persistence operations.
 * Encapsulates all MongoDB operations for organizations.
 */

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, UpdateQuery, Document } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginationParams, PaginatedResult } from './base.repository';
import {
  Organization,
  OrganizationDocument,
  OrganizationType,
  OrganizationStatus,
  OrganizationRegistration,
  OrganizationAddress,
  OrganizationContact,
  OrganizationBranding,
  AIMetadata,
} from '../schemas/organization.model';

export interface OrganizationSearchFilters {
  query?: string;
  type?: OrganizationType;
  status?: OrganizationStatus;
  tenantId: string;
  parentOrganizationId?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrganizationRegistrationDTO {
  name: string;
  shortName: string;
  displayName: string;
  type: OrganizationType;
  registrationNumber: string;
  registrationDate: Date;
  registrationAuthority: string;
  taxIdentificationNumber?: string;
  businessLicenseNumber?: string;
  address: OrganizationAddress;
  contact: OrganizationContact;
  branding?: Partial<OrganizationBranding>;
  aiMetadata?: Partial<AIMetadata>;
  parentOrganizationId?: string;
  governingBodyId?: string;
  governingBodyName?: string;
  affiliationDate?: Date;
  governanceTier?: number;
  tenantId: string;
  dataRegion?: string;
}

@Injectable()
export class OrganizationRepository extends BaseRepository<OrganizationDocument> {
  constructor(
    @InjectModel(Organization.name) private readonly organizationModel: Model<OrganizationDocument>,
  ) {
    super(organizationModel);
  }

  async createIndex(): Promise<void> {
    await this.organizationModel.createIndexes();
  }

  async getByOrganizationId(organizationId: string): Promise<OrganizationDocument | null> {
    return this.organizationModel.findOne({ organizationId }).exec();
  }

  async getByCode(code: string): Promise<OrganizationDocument | null> {
    return this.organizationModel.findOne({ organizationCode: code }).exec();
  }

  async getByRegistrationNumber(regNumber: string): Promise<OrganizationDocument | null> {
    return this.organizationModel
      .findOne({ 'registration.registrationNumber': regNumber })
      .exec();
  }

  async findByName(name: string): Promise<OrganizationDocument[]> {
    return this.organizationModel
      .find({ organizationName: { $regex: name, $options: 'i' } })
      .limit(100)
      .exec();
  }

  async search(filters: OrganizationSearchFilters): Promise<OrganizationDocument[]> {
    const filter: FilterQuery<OrganizationDocument> = {};

    if (filters.query) {
      filter.$text = { $search: filters.query };
    }
    if (filters.type) {
      filter.type = filters.type;
    }
    if (filters.status) {
      filter.status = filters.status;
    }
    if (filters.tenantId) {
      filter.tenantId = filters.tenantId;
    }
    if (filters.parentOrganizationId) {
      filter.parentOrganizationId = new Types.ObjectId(filters.parentOrganizationId);
    }

    const { page = 1, perPage = 20 } = filters;
    const skip = (page - 1) * perPage;

    return this.organizationModel
      .find(filter)
      .skip(skip)
      .limit(perPage)
      .sort({ createdAt: -1 })
      .exec();
  }

  async paginate(
    filters: OrganizationSearchFilters,
  ): Promise<PaginatedResult<OrganizationDocument>> {
    const filter: FilterQuery<OrganizationDocument> = {};

    if (filters.query) {
      filter.$text = { $search: filters.query };
    }
    if (filters.type) {
      filter.type = filters.type;
    }
    if (filters.status) {
      filter.status = filters.status;
    }
    if (filters.tenantId) {
      filter.tenantId = filters.tenantId;
    }
    if (filters.parentOrganizationId) {
      filter.parentOrganizationId = new Types.ObjectId(filters.parentOrganizationId);
    }

    const { page = 1, perPage = 20, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
    const skip = (page - 1) * perPage;

    const [data, total] = await Promise.all([
      this.organizationModel
        .find(filter)
        .skip(skip)
        .limit(perPage)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .exec(),
      this.organizationModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async bulkInsert(organizations: Partial<OrganizationDocument>[]): Promise<string[]> {
    const docs = organizations.map((org) => ({
      ...org,
      _id: new Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    const result = await this.organizationModel.insertMany(docs as any);
    return result.map((r) => r._id.toString());
  }

  async bulkUpdate(updates: Array<{ id: string; data: UpdateQuery<OrganizationDocument> }>): Promise<number> {
    let count = 0;
    for (const update of updates) {
      if (!update.id) continue;
      const result = await this.organizationModel
        .findByIdAndUpdate(update.id, { ...update.data, updatedAt: new Date() })
        .exec();
      if (result) count++;
    }
    return count;
  }

  async findByHierarchy(rootId: string, maxDepth: number = 5): Promise<any> {
    const root = await this.organizationModel.findById(rootId).exec();
    if (!root) return null;

    async function buildTree(orgId: Types.ObjectId, depth: number): Promise<any> {
      if (depth >= maxDepth) {
        return { organization: orgId, children: [] };
      }

      const children = await this.organizationModel
        .find({ parentOrganizationId: orgId })
        .exec();

      const childNodes = [];
      for (const child of children) {
        childNodes.push(await buildTree(child._id, depth + 1));
      }

      return { organization: root, children: childNodes };
    }

    return buildTree(root._id, 0);
  }

  async getStatistics(tenantId: string): Promise<{
    totalOrganizations: number;
    byType: Record<OrganizationType, number>;
    byStatus: Record<OrganizationStatus, number>;
    totalTeams: number;
    totalFacilities: number;
  }> {
    const [totalOrganizations, byType, byStatus] = await Promise.all([
      this.organizationModel.countDocuments({ tenantId }).exec(),
      this.organizationModel.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]).exec(),
      this.organizationModel.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]).exec(),
    ]);

    const typeMap = byType.reduce((acc, item) => {
      acc[item._id as OrganizationType] = item.count;
      return acc;
    }, {} as Record<OrganizationType, number>);

    const statusMap = byStatus.reduce((acc, item) => {
      acc[item._id as OrganizationStatus] = item.count;
      return acc;
    }, {} as Record<OrganizationStatus, number>);

    return {
      totalOrganizations,
      byType: typeMap,
      byStatus: statusMap,
      totalTeams: 0, // Would need TeamRepository
      totalFacilities: 0, // Would need FacilityRepository
    };
  }
}