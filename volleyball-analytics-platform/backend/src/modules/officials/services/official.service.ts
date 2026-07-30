import { Injectable, Inject, forwardRef, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { Official, OfficialDocument, OfficialRole, OfficialLevel, OfficialStatus, AssignmentStatus } from '../schemas/official.schema';
import { CreateOfficialDTO, UpdateOfficialDTO, OfficialSearchDTO } from '../dto/official.dto';
import { OfficialRepository } from '../repositories/official.repository';
import { OfficialValidator } from '../validators/official.validator';

@Injectable()
export class OfficialService {
  constructor(
    @InjectModel(Official.name) private readonly officialModel: Model<OfficialDocument>,
    private readonly officialRepository: OfficialRepository,
    private readonly officialValidator: OfficialValidator,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateOfficialDTO): Promise<any> {
    await this.officialValidator.validateCreate(dto);

    const existingById = await this.officialModel.findOne({ officialId: dto.officialId }).exec();
    if (existingById) {
      throw new ConflictException(`Official with ID ${dto.officialId} already exists`);
    }

    const official = new this.officialModel({
      ...dto,
      _id: new Types.ObjectId(),
      officialId: dto.officialId || `off_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: dto.status || 'active',
      certifications: dto.certifications || [],
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
    };

    const saved = await official.save();

    this.eventEmitter.emit('official.created', {
      officialId: saved.officialId,
      name: `${saved.firstName} ${saved.lastName}`,
      role: saved.primaryRole,
      level: saved.level,
      createdBy: dto.createdBy || 'system',
    });

    return this.toResponseDTO(saved);
  }

  async findById(id: string): Promise<any> {
    const official = await this.officialModel.findById(id).exec();
    if (!official) {
      throw new NotFoundException(`Official with ID ${id} not found`);
    }
    return this.toResponseDTO(official);
  }

  async findByOfficialId(officialId: string) {
    return this.officialModel.findOne({ officialId }).exec();
  }

  async update(id: string, dto: any, updatedBy: string): Promise<any> {
    const official = await this.findById(id);
    if (!official) {
      throw new NotFoundException(`Official with ID ${id} not found`);
    }

    await this.officialValidator.validateUpdate(officialId, dto);

    // Apply updates
    Object.assign(official, dto);
    official.updatedBy = updatedBy;
    official.updatedAt = new Date();

    const saved = await official.save();

    this.eventEmitter.emit('official.updated', {
      officialId: saved.officialId,
      changes: dto,
      updatedBy,
    });

    return this.toResponseDTO(saved);
  }

  async archive(id: string, archivedBy: string, reason?: string): Promise<void> {
    const official = await this.findById(id);
    if (official.status === 'archived') {
      throw new ConflictException('Official is already archived');
    }

    await this.officialModel.findByIdAndUpdate(id, {
      status: 'archived',
      'archive.isArchived': true,
      'archive.archivedAt': new Date(),
      'archive.archivedBy': deletedBy,
      'archive.archiveReason': reason,
      updatedAt: new Date(),
    }).exec();

    this.eventEmitter.emit('official.archived', {
      officialId: official.officialId,
      archivedBy,
      reason,
    });
  }

  async restore(id: string): Promise<any> {
    const official = await this.officialModel.findById(id);
    if (!official) {
      throw new NotFoundException(`Official with ID ${id} not found`);
    }

    if (!official.isArchived) {
      throw new BadRequestException('Only archived officials can be restored');
    }

    official.status = 'active';
    official.isArchived = false;
    official.archivedAt = null;
    official.archivedBy = null;
    official.updatedAt = new Date();
    await official.save();

    return this.toResponseDTO(official);
  }

  async assignToMatch(matchId: string, assignment: {
    officialId: string;
    role: string;
    isPrimary: boolean;
    assignedBy: string;
  }): Promise<any> {
    // This would integrate with the match module
    return this.officialRepository.assignOfficial(matchId, assignment);
  }

  async confirmAssignment(matchId: string, assignmentId: string, confirmedBy: string): Promise<any> {
    return this.officialRepository.confirmAssignment(matchId, assignmentId, confirmedBy);
  }

  async declineAssignment(matchId: string, assignmentId: string, declinedBy: string, reason: string): Promise<any> {
    return this.officialRepository.declineAssignment(matchId, assignmentId, declinedBy, reason);
  }

  async replaceOfficial(matchId: string, oldOfficialId: string, newOfficialId: string, replacedBy: string, reason?: string): Promise<any> {
    return this.officialRepository.replaceOfficial(matchId, oldOfficialId, newOfficialId, replacedBy, reason);
  }

  async getAssignmentsByOfficial(officialId: string): Promise<any[]> {
    return this.officialRepository.getAssignmentsByOfficial(officialId);
  }

  async getAssignmentsByDateRange(startDate: Date, endDate: Date, role?: string): Promise<any[]> {
    return this.officialRepository.findAssignmentsByDateRange(startDate, endDate, role);
  }

  async getAssignmentsByDate(date: Date): Promise<any[]> {
    return this.officialRepository.findAssignmentsByDate(date);
  }

  async getAssignmentsByRole(role: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    return this.officialRepository.findAssignmentsByRole(role, startDate, endDate);
  }

  async getOfficialStatistics(officialId: string): Promise<any> {
    const official = await this.officialModel.findById(officialId).exec();
    if (!official) throw new NotFoundException(`Official with ID ${officialId} not found`);

    return {
      officialId: official.officialId,
      name: `${official.firstName} ${official.lastName}`,
      statistics: official.statistics,
      assignmentsCount: official.assignments?.length || 0,
      upcomingAssignments: official.assignments?.filter(a => new Date(a.date) >= new Date() && a.assignmentStatus === 'confirmed').length || 0,
      pastAssignments: official.assignments?.filter(a => new Date(a.date) < new Date()).length || 0,
      certifications: official.certifications?.length || 0,
      activeCertifications: official.certifications?.filter(c => c.status === 'active').length || 0,
      expiringCertifications: official.certifications?.filter(c => 
        c.expiryDate && new Date(c.expiryDate) > new Date() && new Date(c.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ).length || 0,
    };
  }

  async getAvailableOfficials(date: Date, role?: string, federation?: string): Promise<any[]> {
    return this.officialRepository.findAvailableOfficials(date, role, federation);
  }

  async assignOfficial(matchId: string, assignment: {
    officialId: string;
    role: string;
    assignedBy: string;
  }): Promise<any> {
    return this.officialRepository.assignOfficial(matchId, assignment);
  }

  async confirmAssignment(matchId: string, assignmentId: string, confirmedBy: string): Promise<any> {
    return this.officialRepository.confirmAssignment(matchId, assignmentId, confirmedBy);
  }

  async declineAssignment(matchId: string, assignmentId: string, declinedBy: string, reason: string): Promise<any> {
    return this.officialRepository.declineAssignment(matchId, assignmentId, declinedBy, reason);
  }

  async replaceOfficial(matchId: string, oldOfficialId: string, newOfficialId: string, replacedBy: string, reason?: string): Promise<any> {
    return this.officialRepository.replaceOfficial(matchId, oldOfficialId, newOfficialId, replacedBy, reason);
  }

  async getAssignmentsByOfficial(officialId: string): Promise<any[]> {
    return this.officialRepository.getAssignmentsByOfficial(officialId);
  }

  async getAssignmentsByDateRange(startDate: Date, endDate: Date, role?: string): Promise<any[]> {
    return this.officialRepository.findAssignmentsByDateRange(startDate, endDate, role);
  }

  async getAssignmentsByDate(date: Date): Promise<any[]> {
    return this.officialRepository.findAssignmentsByDate(date);
  }

  async getAssignmentsByRole(role: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    return this.officialRepository.findAssignmentsByRole(role, startDate, endDate);
  }

  async activateOfficial(id: string): Promise<any> {
    const official = await this.officialModel.findById(id);
    if (!official) throw new NotFoundException(`Official with ID ${id} not found`);
    
    if (official.status === 'active') {
      throw new ConflictException('Official is already active');
    }

    official.status = 'active';
    official.updatedAt = new Date();
    await official.save();

    return this.toResponseDTO(official);
  }

  async suspendOfficial(id: string): Promise<any> {
    const official = await this.officialModel.findById(id);
    if (!official) throw new NotFoundException(`Official with ID ${id} not found`);
    
    official.status = 'suspended';
    official.updatedAt = new Date();
    await official.save();

    return this.toResponseDTO(official);
  }

  async retireOfficial(id: string): Promise<any> {
    const official = await this.officialModel.findById(id);
    if (!official) throw new NotFoundException(`Official with ID ${id} not found`);
    
    official.status = 'retired';
    official.updatedAt = new Date();
    await official.save();

    return this.toResponseDTO(official);
  }

  async addCertification(officialId: string, certification: any): Promise<any> {
    const official = await this.officialModel.findById(officialId);
    if (!official) throw new NotFoundException(`Official not found`);

    official.certifications.push({
      ...certification,
      _id: new Types.ObjectId(),
      issuedDate: new Date(),
    });
    official.updatedAt = new Date();
    await official.save();

    return this.toResponseDTO(official);
  }

  async updateCertification(officialId: string, certId: string, update: any): Promise<any> {
    const official = await this.officialModel.findById(officialId);
    if (!official) throw new NotFoundException(`Official not found`);

    const cert = official.certifications.id(certId);
    if (!cert) throw new NotFoundException('Certification not found');

    Object.assign(cert, update);
    official.updatedAt = new Date();
    await official.save();

    return this.toResponseDTO(official);
  }

  async removeCertification(officialId: string, certId: string): Promise<any> {
    const official = await this.officialModel.findById(officialId);
    if (!official) throw new NotFoundException(`Official not found`);

    official.certifications.pull(certId);
    official.updatedAt = new Date();
    await official.save();

    return this.toResponseDTO(official);
  }

  async addAvailability(officialId: string, availability: any): Promise<any> {
    const official = await this.officialModel.findById(officialId);
    if (!official) throw new NotFoundException(`Official not found`);

    official.availability.push({
      ...availability,
      _id: new Types.ObjectId(),
    });
    official.updatedAt = new Date();
    await official.save();

    return this.toResponseDTO(official);
  }

  async removeAvailability(officialId: string, availabilityId: string): Promise<any> {
    const official = await this.officialModel.findById(officialId);
    if (!official) throw new NotFoundException(`Official not found`);

    official.availability.pull(availabilityId);
    official.updatedAt = new Date();
    await official.save();

    return this.toResponseDTO(official);
  }

  async updateAvailability(officialId: string, availabilityId: string, update: any): Promise<any> {
    const official = await this.officialModel.findById(officialId);
    if (!official) throw new NotFoundException(`Official not found`);

    const avail = official.availability.id(availabilityId);
    if (!avail) throw new NotFoundException('Availability not found');

    Object.assign(avail, update);
    official.updatedAt = new Date();
    await official.save();

    return this.toResponseDTO(official);
  }

  async addDocument(officialId: string, document: any): Promise<any> {
    const official = await this.officialModel.findById(officialId);
    if (!official) throw new NotFoundException(`Official not found`);

    official.documents.push({
      ...document,
      _id: new Types.ObjectId(),
      uploadedAt: new Date(),
    });
    official.updatedAt = new Date();
    await official.save();

    return this.toResponseDTO(official);
  }

  async removeDocument(officialId: string, documentId: string): Promise<any> {
    const official = await this.officialModel.findById(officialId);
    if (!official) throw new NotFoundException(`Official not found`);

    official.documents.pull(documentId);
    official.updatedAt = new Date();
    await official.save();

    return this.toResponseDTO(official);
  }

  async updatePreferences(officialId: string, preferences: any): Promise<any> {
    const official = await this.officialModel.findById(officialId);
    if (!official) throw new NotFoundException(`Official not found`);

    official.preferences = { ...official.preferences, ...preferences };
    official.updatedAt = new Date();
    await official.save();

    return this.toResponseDTO(official);
  }

  async addDocument(officialId: string, document: any): Promise<any> {
    const official = await this.officialModel.findById(officialId);
    if (!official) throw new NotFoundException(`Official not found`);

    official.documents.push({
      ...document,
      _id: new Types.ObjectId(),
      uploadedAt: new Date(),
    });
    official.updatedAt = new Date();
    await official.save();

    return this.toResponseDTO(official);
  }

  async removeDocument(officialId: string, documentId: string): Promise<any> {
    const official = await this.officialModel.findById(officialId);
    if (!official) throw new NotFoundException(`Official not found`);

    official.documents.pull(documentId);
    official.updatedAt = new Date();
    await official.save();

    return this.toResponseDTO(official);
  }

  private toResponseDTO(official: any): any {
    return {
      id: official._id.toString(),
      officialId: official.officialId,
      firstName: official.firstName,
      lastName: official.lastName,
      middleName: official.middleName,
      displayName: official.displayName,
      primaryRole: official.primaryRole,
      secondaryRoles: official.secondaryRoles,
      level: official.level,
      status: official.status,
      dateOfBirth: official.dateOfBirth,
      nationality: official.nationality,
      federation: official.federation,
      contact: official.contact,
      certifications: official.certifications,
      assignments: official.assignments,
      availability: official.availability,
      statistics: official.statistics,
      preferences: official.preferences,
      documents: official.documents,
      createdAt: official.createdAt,
      updatedAt: official.updatedAt,
      createdBy: official.createdBy,
      updatedBy: official.updatedBy,
    };
  }
}