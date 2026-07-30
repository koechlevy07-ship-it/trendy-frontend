import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CourtConfiguration, CourtConfigurationDocument, ConfigurationType, ConfigurationStatus } from '../schemas/court-configuration.schema';
import { CreateCourtConfigurationDTO, UpdateCourtConfigurationDTO, CourtConfigurationSearchDTO } from '../dto/court-configuration.dto';

@Injectable()
export class CourtConfigurationValidator {
  constructor(
    @InjectModel('CourtConfiguration') private readonly configModel: Model<CourtConfigurationDocument>,
  ) {}

  async validateCreate(dto: CreateCourtConfigurationDTO): Promise<void> {
    // Validate configuration ID uniqueness
    const existingById = await this.configModel.findOne({ configurationId: dto.configurationId }).exec();
    if (existingById) {
      throw new ConflictException(`Configuration with ID '${dto.configurationId}' already exists`);
    }

    // Validate name
    if (dto.name.length < 3 || dto.name.length > 100) {
      throw new BadRequestException('Configuration name must be between 3 and 100 characters');
    }

    // Validate configuration type
    if (!Object.values(ConfigurationType).includes(dto.type)) {
      throw new BadRequestException(`Invalid configuration type: ${dto.type}`);
    }

    // Validate format
    if (!Object.values(ConfigurationFormat).includes(dto.format)) {
      throw new BadRequestException(`Invalid configuration format: ${dto.format}`);
    }

    // Validate status
    if (dto.status && !Object.values(ConfigurationStatus).includes(dto.status)) {
      throw new BadRequestException(`Invalid configuration status: ${dto.status}`);
    }

    // Validate dimensions
    if (dto.dimensions.length < 10 || dto.dimensions.length > 30) {
      throw new BadRequestException('Configuration length must be between 10 and 30 meters');
    }
    if (dto.dimensions.width < 5 || dto.dimensions.width > 20) {
      throw new BadRequestException('Configuration width must be between 5 and 20 meters');
    }
    if (dto.dimensions.height && (dto.dimensions.height < 2 || dto.dimensions.height > 20)) {
      throw new BadRequestException('Configuration height must be between 2 and 20 meters');
    }

    // Validate net configuration
    if (!Object.values(NetType).includes(dto.net.type)) {
      throw new BadRequestException(`Invalid net type: ${dto.net.type}`);
    }
    if (dto.net.height < 2.0 || dto.net.height > 3.0) {
      throw new BadRequestException('Net height must be between 2.0 and 3.0 meters');
    }

    // Validate schedule
    if (dto.schedule.startDate >= dto.schedule.endDate) {
      throw new BadRequestException('Schedule end date must be after start date');
    }
    if (dto.schedule.startDate < new Date()) {
      throw new BadRequestException('Schedule start date cannot be in the past');
    }

    // Validate AI metadata
    if (dto.aiMetadata) {
      if (dto.aiMetadata.confidenceThreshold < 0 || dto.aiMetadata.confidenceThreshold > 1) {
        throw new BadRequestException('AI confidence threshold must be between 0 and 1');
      }
    }
  }

  async validateUpdate(id: string, dto: UpdateCourtConfigurationDTO): Promise<void> {
    // Check if configuration exists
    const existing = await this.configModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException(`Configuration with ID ${id} not found`);
    }

    // Cannot modify archived configurations
    if (existing.status === 'archived') {
      throw new BadRequestException('Cannot update archived configuration');
    }

    // If name is being updated, check for duplicates
    if (dto.name && dto.name !== existing.name) {
      const existingByName = await this.configModel.findOne({
        name: dto.name,
        _id: { $ne: new Types.ObjectId(id) },
      }).exec();
      if (existingByName) {
        throw new ConflictException(`Configuration with name '${dto.name}' already exists`);
      }
    }

    // If type is being updated, validate
    if (dto.type && !Object.values(ConfigurationType).includes(dto.type)) {
      throw new BadRequestException(`Invalid configuration type: ${dto.type}`);
    }

    // If status is being updated, validate transition
    if (dto.status && dto.status !== existing.status) {
      this.validateStatusTransition(existing.status, dto.status);
    }

    // If dimensions are being updated, validate
    if (dto.dimensions) {
      if (dto.dimensions.length && (dto.dimensions.length < 10 || dto.dimensions.length > 30)) {
        throw new BadRequestException('Configuration length must be between 10 and 30 meters');
      }
      if (dto.dimensions.width && (dto.dimensions.width < 5 || dto.dimensions.width > 20)) {
        throw new BadRequestException('Configuration width must be between 5 and 20 meters');
      }
    }
  }

  private validateStatusTransition(from: string, to: string): void {
    const validTransitions: Record<string, string[]> = {
      'draft': ['active', 'archived'],
      'active': ['archived', 'deprecated'],
      'archived': [],
      'deprecated': [],
    };

    const validTargets = validTransitions[from] || [];
    if (!validTargets.includes(to)) {
      throw new BadRequestException(`Invalid status transition from ${from} to ${to}`);
    }
  }

  async validateSearch(filters: any): Promise<void> {
    if (filters.page && filters.page < 1) {
      throw new BadRequestException('Page must be >= 1');
    }
    if (filters.perPage && (filters.perPage < 1 || filters.perPage > 100)) {
      throw new BadRequestException('Per page must be between 1 and 100');
    }
  }
}