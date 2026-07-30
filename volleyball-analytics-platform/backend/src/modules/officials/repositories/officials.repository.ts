import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Official, OfficialDocument, OfficialRole, OfficialLevel, OfficialStatus } from '../schemas/official.schema';

export interface OfficialSearchFilters {
  query?: string;
  role?: string;
  level?: string;
  status?: string;
  federation?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

@Injectable()
export class OfficialsRepository {
  constructor(
    @InjectModel('Official') private readonly officialModel: Model<OfficialDocument>,
  ) {}

  async create(official: Partial<any>): Promise<any> {
    const doc = new this.officialModel({
      ...official,
      _id: new Types.ObjectId(),
      officialId: `off_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: official.status || 'active',
      certifications: [],
      assignments: [],
      availability: [],
      statistics: {
        totalMatches: 0,
        matchesAsFirstReferee: 0,
        matchesAsSecondReferee: 0,
        matchesAsLineJudge: 0,
        matchesAsScorer: 0,
        averageRating: 0,
        challengesHandled: 0,
        challengesOverturned: 0,
      },
      preferences: {
        preferredRoles: [],
        preferredCompetitions: [],
        maxMatchesPerWeek: 2,
        maxTravelDistance: 100,
        languages: ['en'],
      },
      documents: {},
      audit: { version: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return doc.save();
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.officialModel.findById(id).exec();
  }

  async findByOfficialId(officialId: string) {
    return this.officialModel.findOne({ officialId }).exec();
  }

  async update(id: string, update: Partial<any>): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.officialModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async softDelete(id: string, deletedBy: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.officialModel.findByIdAndUpdate(id, {
      'archive.isArchived': true,
      'archive.archivedAt': new Date(),
      'archive.archivedBy': new Types.ObjectId(deletedBy),
      status: 'retired',
      updatedAt: new Date(),
    }).exec();
    return !!result;
  }

  async restore(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.officialModel
      .findByIdAndUpdate(id, {
        'archive.isArchived': false,
        'archive.archivedAt': null,
        'archive.archivedBy': null,
        status: 'active',
        updatedAt: new Date(),
      }, { new: true })
      .exec();
  }

  async search(filters: OfficialSearchFilters): Promise<any> {
    const filter: any = {};

    if (filters.query) {
      filter.$text = { $search: filters.query };
    }
    if (filters.role) filter.primaryRole = filters.role;
    if (filters.level) filter.level = filters.level;
    if (filters.status) filter.status = filters.status;
    if (filters.federation) filter.federation = filters.federation;

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const skip = (filters.page - 1) * filters.perPage;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.officialModel
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.officialModel.countDocuments(filter).exec(),
    });

    return {
      data,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async findByRole(role: string): Promise<any[]> {
    return this.officialModel
      .find({ primaryRole: role, status: 'active' })
      .sort({ lastName: 1, firstName: 1 })
      .exec();
  }

  async findByLevel(level: string): Promise<any[]> {
    return this.officialModel
      .find({ level, status: 'active' })
      .sort({ lastName: 1, firstName: 1 })
      .exec();
  }

  async findByFederation(federation: string): Promise<any[]> {
    return this.officialModel
      .find({ federation, status: 'active' })
      .sort({ level: -1, lastName: 1, firstName: 1 })
      .exec();
  }

  async findAvailableOfficials(
    date: Date,
    role?: string,
    federation?: string,
  ): Promise<any[]> {
    const query: any = {
      status: 'active',
      'availability.date': date,
      'availability.available': true,
    };

    if (role) {
      query.$or = [
        { primaryRole: role },
        { secondaryRoles: role },
      ];
    }

    if (federation) {
      query.federation = federation;
    }

    return this.officialModel.find(query).exec();
  }

  async findAssignmentsByOfficial(officialId: string) {
    return this.officialModel
      .findById(officialId)
      .select('assignments')
      .exec()
      .then(doc => doc?.assignments || []);
  }

  async findAssignmentsByDateRange(
    startDate: Date,
    endDate: Date,
    role?: string,
  ): Promise<any[]> {
    const query: any = {
      'assignments.date': { $gte: startDate, $lte: endDate },
    };
    if (role) {
      query['assignments.role'] = role;
    }

    const officials = await this.officialModel
      .find(query)
      .select('assignments firstName lastName officialId')
      .exec();

    const assignments = [];
    for (const official of officials) {
      for (const assignment of official.assignments) {
        if (assignment.date >= startDate && assignment.date <= endDate) {
          if (!role || assignment.role === role) {
            assignments.push({
              ...assignment,
              officialId: official.officialId,
              officialName: `${official.firstName} ${official.lastName}`,
            });
          }
        }
      }
    }

    return assignments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getAssignmentsByOfficial(officialId: string): Promise<any[]> {
    return this.officialRepository.findAssignmentsByOfficial(officialId);
  }

  async getAssignmentsByDateRange(
    startDate: Date,
    endDate: Date,
    role?: string,
  ): Promise<any[]> {
    return this.officialRepository.findAssignmentsByDateRange(
      startDate,
      endDate,
      role,
    );
  }

  async getAssignmentsByDate(date: Date): Promise<any[]> {
    return this.officialRepository.findAssignmentsByDate(date);
  }

  async getAssignmentsByRole(role: string, startDate?: Date, endDate?: Date) {
    return this.officialRepository.findAssignmentsByRole(role, startDate, endDate);
  }

  async getOfficialStatistics(officialId: string): Promise<any> {
    const official = await this.officialModel.findById(officialId).exec();
    if (!official) throw new NotFoundException(`Official not found`);

    return {
      officialId: official.officialId,
      name: `${official.firstName} ${official.lastName}`,
      statistics: official.statistics,
      assignmentsCount: official.assignments?.length || 0,
      upcomingAssignments: official.assignments?.filter(
        a => new Date(a.date) >= new Date() && a.assignmentStatus === 'confirmed'
      ).length || 0,
      pastAssignments: official.assignments?.filter(
        a => new Date(a.date) < new Date()
      ).length || 0,
      certifications: official.certifications?.length || 0,
      activeCertifications: official.certifications?.filter(c => c.status === 'active').length || 0,
      expiringCertifications: official.certifications?.filter(c =>
        c.expiryDate && new Date(c.expiryDate) > new Date() && new Date(c.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ).length || 0,
    };
  }
}