import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CourtLayout, CourtLayoutDocument } from '../schemas/court-layout.schema';
import { CreateCourtLayoutDTO, UpdateCourtLayoutDTO, CourtLayoutSearchDTO } from '../dto/court-layout.dto';

@Injectable()
export class CourtLayoutValidator {
  constructor(
    @InjectModel('CourtLayout') private readonly layoutModel: Model<CourtLayoutDocument>,
  ) {}

  async validateCreate(dto: CreateCourtLayoutDTO): Promise<void> {
    // Validate unique layoutId
    const existingById = await this.layoutModel.findOne({ layoutId: dto.layoutId }).exec();
    if (existingById) {
      throw new ConflictException(`Layout with ID '${dto.layoutId}' already exists`);
    }

    // Validate layoutId format
    if (!/^[a-zA-Z0-9_-]{1,50}$/.test(dto.layoutId)) {
      throw new BadRequestException('Layout ID must contain only alphanumeric characters, hyphens, and underscores');
    }

    // Validate name
    if (!dto.name || dto.name.trim().length === 0) {
      throw new BadRequestException('Layout name is required');
    }
    if (dto.name.length > 100) {
      throw new BadRequestException('Layout name must be 100 characters or less');
    }

    // Validate code
    if (!dto.code || dto.code.trim().length === 0) {
      throw new BadRequestException('Layout code is required');
    }
    if (dto.code.length > 20) {
      throw new BadRequestException('Layout code must be 20 characters or less');
    }

    // Validate venueId
    if (!Types.ObjectId.isValid(dto.venueId)) {
      throw new BadRequestException('Invalid venue ID');
    }

    // Validate phaseId if provided
    if (dto.phaseId && !Types.ObjectId.isValid(dto.phaseId)) {
      throw new BadRequestException('Invalid phase ID');
    }

    // Validate type
    if (!Object.values(CourtLayoutType).includes(dto.type)) {
      throw new BadRequestException(`Invalid layout type: ${dto.type}`);
    }

    // Validate status
    if (dto.status && !Object.values(CourtLayoutStatus).includes(dto.status)) {
      throw new BadRequestException(`Invalid layout status: ${dto.status}`);
    }

    // Validate order
    if (dto.order !== undefined && (dto.order < 0 || dto.order > 999)) {
      throw new BadRequestException('Order must be between 0 and 999');
    }

    // Validate rules
    if (dto.rules) {
      if (dto.rules.matchesPerPairing && (dto.rules.matchesPerPairing < 1 || dto.rules.matchesPerPairing > 10)) {
        throw new BadRequestException('Matches per pairing must be between 1 and 10');
      }
      if (dto.rules.homeAndAway !== undefined && typeof dto.rules.homeAndAway !== 'boolean') {
        throw new BadRequestException('homeAndAway must be a boolean');
      }
    }

    // Validate schedule
    if (dto.schedule) {
      if (dto.schedule.startDate && dto.schedule.endDate) {
        const start = new Date(dto.schedule.startDate);
        const end = new Date(dto.schedule.endDate);
        if (start >= end) {
          throw new BadRequestException('Schedule start date must be before end date');
        }
        if (start < new Date()) {
          throw new BadRequestException('Start date cannot be in the past');
        }
      }
      if (dto.schedule.matchDays && dto.schedule.matchDays.length > 0) {
        const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        for (const day of dto.schedule.matchDays) {
          if (!validDays.includes(day.toLowerCase())) {
            throw new BadRequestException(`Invalid match day: ${day}`);
          }
        }
      }
    }

    // Validate qualification
    if (dto.qualification) {
      if (dto.qualification.teamsAdvancing < 1 || dto.qualification.teamsAdvancing > 100) {
        throw new BadRequestException('Teams advancing must be between 1 and 100');
      }
      if (dto.qualification.qualificationMethod && !['points', 'sets_ratio', 'points_ratio', 'head_to_head'].includes(dto.qualification.qualificationMethod)) {
        throw new BadRequestException('Invalid qualification method');
      }
    }
  }

  async validateUpdate(layoutId: string, dto: UpdateCourtLayoutDTO): Promise<void> {
    const existing = await this.layoutModel.findById(layoutId).exec();
    if (!existing) {
      throw new NotFoundException(`Layout with ID ${layoutId} not found`);
    }

    // Cannot modify archived layouts
    if (existing.status === 'archived') {
      throw new BadRequestException('Cannot modify archived layout');
    }

    // If name is being updated, check for duplicates
    if (dto.name && dto.name !== existing.name) {
      const existingByName = await this.layoutModel.findOne({
        name: dto.name,
        _id: { $ne: new Types.ObjectId(layoutId) },
      }).exec();
      if (existingByName) {
        throw new ConflictException(`Layout with name '${dto.name}' already exists`);
      }
    }

    // If code is being updated, check for duplicates
    if (dto.code && dto.code !== existing.code) {
      const existingByCode = await this.layoutModel.findOne({
        code: dto.code,
        _id: { $ne: new Types.ObjectId(layoutId) },
      }).exec();
      if (existingByCode) {
        throw new ConflictException(`Layout with code '${dto.code}' already exists`);
      }
    }

    // Validate status transition
    if (dto.status && dto.status !== existing.status) {
      this.validateStatusTransition(existing.status, dto.status);
    }

    // If type is being updated, validate
    if (dto.type && dto.type !== existing.type) {
      if (!Object.values(CourtLayoutType).includes(dto.type)) {
        throw new BadRequestException(`Invalid layout type: ${dto.type}`);
      }
    }

    // If phaseId is being updated, validate
    if (dto.phaseId !== undefined && dto.phaseId !== existing.phaseId?.toString()) {
      if (dto.phaseId && !Types.ObjectId.isValid(dto.phaseId)) {
        throw new BadRequestException('Invalid phase ID');
      }
    }
  }

  private validateStatusTransition(from: string, to: string): void {
    const validTransitions: Record<string, string[]> = {
      'pending': ['scheduled', 'in_progress', 'cancelled'],
      'scheduled': ['in_progress', 'completed', 'cancelled'],
      'in_progress': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': [],
      'archived': [],
    };

    const validTargets = validTransitions[from] || [];
    if (!validTargets.includes(to)) {
      throw new BadRequestException(`Invalid status transition from ${from} to ${to}`);
    }
  }

  async validateSearch(query: any): Promise<void> {
    if (query.page && query.page < 1) {
      throw new BadRequestException('Page must be >= 1');
    }
    if (query.perPage && (query.perPage < 1 || query.perPage > 100)) {
      throw new BadRequestException('Per page must be between 1 and 100');
    }
    if (query.sortOrder && !['asc', 'desc'].includes(query.sortOrder)) {
      throw new BadRequestException('Sort order must be asc or desc');
    }
  }
}