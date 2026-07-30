import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, UpdateQuery, PipelineStage } from 'mongoose';
import { Venue, VenueDocument } from '../schemas/venue.schema';
import { CreateVenueDTO, UpdateVenueDTO, VenueSearchDTO } from '../dto/venue.dto';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';

@Injectable()
export class VenueRepository {
  constructor(
    @InjectModel('Venue') private readonly venueModel: Model<VenueDocument>,
  ) {}

  async create(venue: Partial<VenueDocument>): Promise<VenueDocument> {
    const doc = new this.venueModel({
      ...venue,
      _id: new Types.ObjectId(),
      venueId: `vn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return doc.save();
  }

  async findById(id: string): Promise<VenueDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.venueModel.findById(id).exec();
  }

  async findByVenueId(venueId: string): Promise<VenueDocument | null> {
    return this.venueModel.findOne({ venueId }).exec();
  }

  async findByCode(code: string): Promise<VenueDocument | null> {
    return this.venueModel.findOne({ 'identity.shortName': code }).exec();
  }

  async findByRegistrationNumber(regNumber: string): Promise<VenueDocument | null> {
    return this.venueModel.findOne({ 'registration.registrationNumber': regNumber }).exec();
  }

  async findByName(name: string, tenantId?: string): Promise<VenueDocument[]> {
    const filter: any = { 'identity.name': { $regex: name, $options: 'i' } };
    if (tenantId) filter.tenantId = tenantId;
    return this.venueModel.find(filter).limit(100).exec();
  }

  async search(filters: VenueSearchDTO): Promise<PaginatedResult<VenueDocument>> {
    const filter: FilterQuery<VenueDocument> = {};

    if (filters.query) {
      filter.$text = { $search: filters.query };
    }
    if (filters.type) filter['identity.type'] = filters.type;
    if (filters.status) filter['operationalStatus.status'] = filters.status;
    if (filters.tenantId) filter.tenantId = filters.tenantId;
    if (filters.organizationId) filter['ownership.organizationId'] = new Types.ObjectId(filters.organizationId);
    if (filters.parentOrganizationId) filter['ownership.parentOrganizationId'] = new Types.ObjectId(filters.parentOrganizationId);

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const skip = (page - 1) * perPage;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.venueModel
        .find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.venueModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async update(id: string, update: Partial<VenueDocument>): Promise<VenueDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.venueModel
      .findByIdAndUpdate(id, { $set: { ...update, updatedAt: new Date() } }, { new: true })
      .exec();
  }

  async softDelete(id: string, deletedBy: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.venueModel.findByIdAndUpdate(id, {
      'archive.isArchived': true,
      'archive.archivedAt': new Date(),
      'archive.archivedBy': new Types.ObjectId(deletedBy),
      status: 'archived',
      updatedAt: new Date(),
    }).exec();
    return !!result;
  }

  async restore(id: string): Promise<VenueDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.venueModel.findByIdAndUpdate(id, {
      'archive.isArchived': false,
      'archive.archivedAt': null,
      'archive.archivedBy': null,
      status: 'draft',
      updatedAt: new Date(),
    }, { new: true }).exec();
  }

  async findByHierarchy(rootId: string, maxDepth: number = 5): Promise<any> {
    const root = await this.venueModel.findById(rootId).exec();
    if (!root) return null;

    const buildTree = async (orgId: Types.ObjectId, depth: number): Promise<any> => {
      if (depth >= maxDepth) return { venue: root, children: [] };

      const children = await this.venueModel
        .find({ 'ownership.parentOrganizationId': orgId })
        .exec();

      const childNodes = [];
      for (const child of children) {
        childNodes.push(await buildTree(child._id, depth + 1));
      }

      return { venue: root, children: childNodes };
    };

    return buildTree(root._id, 0);
  }

  async bulkInsert(venues: Partial<VenueDocument>[]): Promise<string[]> {
    const docs = venues.map(v => ({
      ...v,
      _id: new Types.ObjectId(),
      venueId: `vn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    const result = await this.venueModel.insertMany(docs);
    return result.map(r => r._id.toString());
  }

  async bulkUpdate(updates: { id: string; data: Partial<VenueDocument> }[]): Promise<number> {
    let count = 0;
    for (const update of updates) {
      if (!update.id || !Types.ObjectId.isValid(update.id)) continue;
      const result = await this.venueModel.findByIdAndUpdate(
        update.id,
        { $set: { ...update.data, updatedAt: new Date() } },
      ).exec();
      if (result) count++;
    }
    return count;
  }
}