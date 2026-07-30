import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Venue, VenueDocument, VenueType, VenueStatus, CertificationStatus } from '../schemas/venue.schema';
import { CreateVenueDTO, UpdateVenueDTO, VenueSearchDTO } from '../dto/venue.dto';

@Injectable()
export class VenueValidator {
  constructor(
    @InjectModel('Venue') private readonly venueModel: Model<any>,
  ) {}

  async validateCreate(dto: any): Promise<void> {
    // Check for duplicate venue name
    const existingByName = await this.venueModel.findOne({
      'identity.name': dto.identity.name,
    }).exec();
    if (existingByName) {
      throw new ConflictException(`Venue with name '${dto.identity.name}' already exists`);
    }

    // Check for duplicate venue code
    if (dto.identity.code) {
      const existingByCode = await this.venueModel.findOne({
        'identity.code': dto.identity.code,
      }).exec();
      if (existingByCode) {
        throw new ConflictException(`Venue with code '${dto.identity.code}' already exists`);
      }
    }

    // Validate venue type
    if (!Object.values(VenueType).includes(dto.identity.type)) {
      throw new BadRequestException(`Invalid venue type: ${dto.identity.type}`);
    }

    // Validate status
    if (dto.identity.status && !Object.values(VenueStatus).includes(dto.identity.status)) {
      throw new BadRequestException(`Invalid venue status: ${dto.identity.status}`);
    }

    // Validate country code (2-letter ISO)
    if (dto.address.country.length !== 2 || !/^[A-Z]{2}$/i.test(dto.address.country)) {
      throw new BadRequestException('Country must be a 2-letter ISO code');
    }

    // Validate dates
    if (dto.certifications) {
      for (const cert of dto.certifications) {
        if (cert.expiryDate && new Date(cert.expiryDate) <= new Date()) {
          throw new BadRequestException(`Certification ${cert.name} has expired`);
        }
      }
    }

    // Validate camera infrastructure
    if (dto.cameraInfrastructure) {
      if (dto.cameraInfrastructure.streamingConfig) {
        if (dto.cameraInfrastructure.streamingConfig.bitrate < 500 || dto.cameraInfrastructure.streamingConfig.bitrate > 50000) {
          throw new BadRequestException('Stream bitrate must be between 500 and 50000 kbps');
        }
        if (dto.cameraInfrastructure.streamingConfig.fps < 1 || dto.cameraInfrastructure.streamingConfig.fps > 120) {
          throw new BadRequestException('Stream FPS must be between 1 and 120');
        }
      }
    }

    // Validate AI metadata
    if (dto.aiMetadata) {
      if (dto.aiMetadata.confidenceThreshold < 0 || dto.aiMetadata.confidenceThreshold > 1) {
        throw new BadRequestException('AI confidence threshold must be between 0 and 1');
      }
    }
  }

  async validateUpdate(id: string, dto: any): Promise<void> {
    const venue = await this.venueModel.findById(id).exec();
    if (!venue) {
      throw new NotFoundException(`Venue with ID ${id} not found`);
    }

    // Check if venue is archived
    if (venue.archive?.isArchived) {
      throw new BadRequestException('Cannot update archived venue');
    }

    // If name is being updated, check for duplicates
    if (dto.identity?.name && dto.identity.name !== venue.identity.name) {
      const existingByName = await this.venueModel.findOne({
        'identity.name': dto.identity.name,
        _id: { $ne: venue._id },
      }).exec();
      if (existingByName) {
        throw new ConflictException(`Venue with name '${dto.identity.name}' already exists`);
      }
    }

    // If shortName is being updated, check for duplicates
    if (dto.identity?.shortName && dto.identity.shortName !== venue.identity.shortName) {
      const existing = await this.venueModel.findOne({
        'identity.shortName': dto.identity.shortName,
        _id: { $ne: venue._id },
      }).exec();
      if (existing) {
        throw new ConflictException(`Venue with code '${dto.identity.shortName}' already exists`);
      }
    }

    // Validate status transition
    if (dto.identity?.status) {
      this.validateStatusTransition(venue.operationalStatus.status, dto.identity.status);
    }
  }

  async validateSearch(query: any): Promise<void> {
    if (query.page && query.page < 1) {
      throw new BadRequestException('Page must be >= 1');
    }
    if (query.perPage && (query.perPage < 1 || query.perPage > 100)) {
      throw new BadRequestException('Per page must be between 1 and 100');
    }
  }

  private validateStatusTransition(from: VenueStatus, to: VenueStatus): void {
    const validTransitions: Record<string, string[]> = {
      [VenueStatus.DRAFT]: [VenueStatus.UNDER_CONSTRUCTION, VenueStatus.ARCHIVED],
      [VenueStatus.UNDER_CONSTRUCTION]: [VenueStatus.READY_FOR_CERTIFICATION, VenueStatus.ARCHIVED],
      [VenueStatus.READY_FOR_CERTIFICATION]: [VenueStatus.CERTIFIED, VenueStatus.ARCHIVED],
      [VenueStatus.CERTIFIED]: [VenueStatus.OPERATIONAL, VenueStatus.UNDER_MAINTENANCE, VenueStatus.ARCHIVED],
      [VenueStatus.OPERATIONAL]: [VenueStatus.UNDER_MAINTENANCE, VenueStatus.ARCHIVED],
      [VenueStatus.UNDER_MAINTENANCE]: [VenueStatus.OPERATIONAL, VenueStatus.ARCHIVED],
      [VenueStatus.ARCHIVED]: [],
    };

    const validTargets = validTransitions[from] || [];
    if (!validTransitions[from]?.includes(to)) {
      throw new BadRequestException(`Invalid status transition from ${from} to ${to}`);
    }
  }
}