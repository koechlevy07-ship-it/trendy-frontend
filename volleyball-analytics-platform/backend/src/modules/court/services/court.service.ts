/**
 * Court Service - Chapter 13 Part 1
 * 
 * Business logic for court management
 */

import { Injectable, Inject, forwardRef, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { Court, CourtDocument, CourtStatus, CourtType, CourtSurface, CourtOrientation, CourtStatus, SetStatus, MatchEventType, NetType, SafetyZoneType } from '../schemas/court.schema';
import { CreateCourtDTO, UpdateCourtDTO, CourtSearchDTO, CourtResponseDTO, CourtSummaryDTO } from '../dto/court.dto';
import { CourtValidator } from '../validators/court.validator';
import { FixtureRepository } from '../../competition/repositories/fixture.repository';
import { VenueService } from '../../venue/services/venue.service';

@Injectable()
export class CourtService {
  constructor(
    @InjectModel('Court') private readonly courtModel: Model<CourtDocument>,
    @InjectModel('Fixture') private readonly fixtureModel: Model<any>,
    private readonly courtValidator: CourtValidator,
    private readonly fixtureRepository: FixtureRepository,
    @Inject(forwardRef(() => VenueService))
    private readonly venueService: VenueService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateCourtDTO, createdBy: string): Promise<CourtResponseDTO> {
    await this.courtValidator.validateCreate(dto);

    // Verify venue exists and is operational
    const venue = await this.venueService.findById(dto.venue.venueId);
    if (venue.operationalStatus.status !== 'operational') {
      throw new BadRequestException(`Venue must be operational to create courts`);
    }

    // Check if court ID is unique
    const existing = await this.courtModel.findOne({ courtId: dto.identity.courtId }).exec();
    if (existing) {
      throw new ConflictException(`Court with ID '${dto.identity.courtId}' already exists`);
    }

    const court = new this.courtModel({
      ...dto,
      _id: new Types.ObjectId(),
      courtId: dto.identity.courtId,
      identity: {
        ...dto.identity,
        courtId: dto.identity.courtId,
      },
      venue: {
        venueId: new Types.ObjectId(dto.venue.venueId),
        venueName: dto.venue.venueName,
      },
      operationalStatus: {
        status: CourtStatus.DRAFT,
      },
      availability: {
        status: 'available',
      },
      metadata: {},
    });

    const saved = await court.save();

    this.eventEmitter.emit('court.created', {
      courtId: saved.courtId,
      venueId: saved.venue.venueId,
      name: saved.identity.name,
      type: saved.identity.type,
      createdBy: 'system',
    });

    return this.toResponseDTO(saved);
  }

  async findById(id: string): Promise<CourtResponseDTO> {
    const court = await this.courtModel.findById(id).exec();
    if (!court) {
      throw new NotFoundException(`Court with ID ${id} not found`);
    }
    return this.toResponseDTO(court);
  }

  async findByCourtId(courtId: string): Promise<CourtResponseDTO | null> {
    return this.courtModel.findOne({ courtId }).exec();
  }

  async findByVenue(venueId: string): Promise<CourtResponseDTO[]> {
    return this.courtModel
      .find({ 'venue.venueId': new Types.ObjectId(venueId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async search(filters: CourtSearchDTO): Promise<{ data: CourtResponseDTO[]; total: number; page: number; perPage: number; totalPages: number }> {
    const filter: any = {};

    if (filters.query) {
      filter.$text = { $search: filters.query };
    }
    if (filters.type) {
      filter['identity.type'] = filters.type;
    }
    if (filters.surface) {
      filter['surface.surfaceType'] = filters.surface;
    }
    if (filters.status) {
      filter['operationalStatus.status'] = filters.status;
    }
    if (filters.venueId) {
      filter['venue.venueId'] = new Types.ObjectId(filters.venueId);
    }
    if (filters.organizationId) {
      filter['organizationId'] = new Types.ObjectId(filters.organizationId);
    }
    if (filters.dateFrom || filters.dateTo) {
      filter.createdAt = {};
      if (filters.dateFrom) filter.createdAt.$gte = filters.dateFrom;
      if (filters.dateTo) filter.createdAt.$lte = filters.dateTo;
    }

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.courtModel
        .find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec(),
      this.courtModel.countDocuments(filter).exec(),
    );

    return {
      data: data.map(d => this.toResponseDTO(d)),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async update(id: string, dto: UpdateCourtDTO, updatedBy: string): Promise<CourtResponseDTO> {
    await this.courtValidator.validateUpdate(id, dto);

    const updated = await this.courtModel
      .findByIdAndUpdate(id, { ...dto, updatedAt: new Date() }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Court with ID ${id} not found`);
    }

    this.eventEmitter.emit('court.updated', {
      courtId: updated.courtId,
      changes: dto,
      updatedBy,
    });

    return this.toResponseDTO(updated);
  }

  async updateStatus(id: string, status: string): Promise<CourtResponseDTO> {
    const court = await this.courtModel.findById(id).exec();
    if (!court) {
      throw new NotFoundException(`Court with ID ${id} not found`);
    }

    // Validate status transition
    this.courtValidator.validateStatusTransition(court.operationalStatus.status, status);

    const updated = await this.courtModel.findByIdAndUpdate(
      id,
      {
        'operationalStatus.status': status,
        'operationalStatus.activatedAt': status === 'operational' ? new Date() : undefined,
        'operationalStatus.activatedBy': 'system',
      },
      { new: true },
    ).exec();

    this.eventEmitter.emit('court.status.changed', {
      courtId: court.courtId,
      from: court.operationalStatus.status,
      to: status,
    });

    return this.toResponseDTO(updated);
  }

  async archive(id: string, archivedBy: string, reason?: string): Promise<CourtResponseDTO> {
    const court = await this.courtModel.findById(id).exec();
    if (!court) {
      throw new NotFoundException(`Court with ID ${id} not found`);
    }

    if (court.archive.isArchived) {
      throw new ConflictException('Court is already archived');
    }

    if (court.operationalStatus.status === CourtStatus.OPERATIONAL || court.operationalStatus.status === CourtStatus.UNDER_MAINTENANCE) {
      throw new BadRequestException('Cannot archive court that is operational or under maintenance');
    }

    court.archive = {
      isArchived: true,
      archivedAt: new Date(),
      archivedBy: new Types.ObjectId(archivedBy),
      archiveReason: reason,
      snapshot: court.toObject(),
    };
    court.operationalStatus.status = CourtStatus.ARCHIVED;
    court.updatedAt = new Date();

    await court.save();

    this.eventEmitter.emit('court.archived', {
      courtId: court.courtId,
      archivedBy,
      reason,
    });

    return this.toResponseDTO(court);
  }

  async restore(id: string): Promise<CourtResponseDTO> {
    const court = await this.courtModel.findById(id).exec();
    if (!court) {
      throw new NotFoundException(`Court with ID ${id} not found`);
    }

    if (!court.archive.isArchived) {
      throw new ConflictException('Court is not archived');
    }

    court.archive = {
      isArchived: false,
      archivedAt: null,
      archivedBy: null,
      archiveReason: null,
      snapshot: null,
    };
    court.operationalStatus.status = CourtStatus.DRAFT;
    court.updatedAt = new Date();

    await court.save();

    this.eventEmitter.emit('court.restored', {
      courtId: court.courtId,
    });

    return this.toResponseDTO(court);
  }

  async getAvailableCourts(venueId?: string, dateFrom?: Date, dateTo?: Date): Promise<CourtResponseDTO[]> {
    const filter: any = {
      'operationalStatus.status': CourtStatus.OPERATIONAL,
      'availability.status': 'available',
    };

    if (venueId) {
      filter['venue.venueId'] = new Types.ObjectId(venueId);
    }

    let courts = await this.courtModel.find(filter).exec();

    // Filter by date if provided
    if (dateFrom || dateTo) {
      const fixtures = await this.fixtureRepository.findByDateRange(dateFrom, dateTo, venueId);
      const bookedCourtIds = new Set(fixtures.map(f => f.courtId?.toString()).filter(Boolean));
      courts = courts.filter(c => !bookedCourtIds.has(c.courtId));
    }

    return courts.map(c => this.toResponseDTO(c));
  }

  async getByVenue(venueId: string): Promise<CourtResponseDTO[]> {
    const courts = await this.courtModel
      .find({ 'venue.venueId': new Types.ObjectId(venueId) })
      .sort({ createdAt: -1 })
      .exec();
    return courts.map(c => this.toResponseDTO(c));
  }

  async getStatistics(courtId: string): Promise<any> {
    const court = await this.courtModel.findById(courtId).exec();
    if (!court) {
      throw new NotFoundException(`Court with ID ${courtId} not found`);
    }

    const fixtures = await this.fixtureModel.find({ courtId: court.courtId }).exec();
    const matches = await this.matchModel.find({ 'competition.competitionId': courtId }).exec();

    return {
      court: {
        courtId: court.courtId,
        name: court.identity.name,
        type: court.identity.type,
        status: court.operationalStatus.status,
        surface: court.surface.surfaceType,
        area: court.dimensions.length * court.dimensions.width,
      },
      fixtures: {
        total: fixtures.length,
        upcoming: fixtures.filter(f => f.status === 'scheduled' || f.status === 'confirmed').length,
        completed: fixtures.filter(f => f.status === 'completed').length,
        cancelled: fixtures.filter(f => f.status === 'cancelled').length,
      },
      matches: {
        total: matches.length,
        completed: matches.filter(m => m.status === 'completed').length,
        upcoming: matches.filter(m => m.status === 'scheduled').length,
      },
      utilization: {
        totalBookings: 0, // Would need booking service
        averageOccupancy: 0,
      },
    };
  }

  async getHealth(courtId: string): Promise<any> {
    const court = await this.courtModel.findById(courtId).exec();
    if (!court) {
      throw new NotFoundException(`Court with ID ${courtId} not found`);
    }

    const fixtures = await this.fixtureModel.find({ courtId: court.courtId }).exec();
    const upcomingFixtures = fixtures.filter(f => ['scheduled', 'confirmed'].includes(f.status));

    return {
      courtId: court.courtId,
      status: court.operationalStatus.status,
      isLive: court.isLive,
      setsPlayed: court.setsPlayed,
      currentSet: court.liveData.currentSet,
      score: {
        home: `${court.liveData.homeSetScore}-${court.liveData.homePointScore}`,
        away: `${court.liveData.awaySetScore}-${court.liveData.awayPointScore}`,
      },
      upcomingFixtures: upcomingFixtures.length,
      aiProcessing: court.aiMetadata?.config?.realTimeProcessing ? 'active' : 'inactive',
      videoSync: court.aiMetadata?.videoSync?.status || 'not_synced',
      lastMaintenance: court.operationalStatus.lastMaintenanceDate,
      nextMaintenance: court.operationalStatus.nextScheduledMaintenance,
    };
  }

  private toResponseDTO(court: CourtDocument): CourtResponseDTO {
    return {
      id: court._id.toString(),
      courtId: court.courtId,
      name: court.identity.name,
      shortName: court.identity.shortName,
      displayName: court.identity.displayName,
      type: court.identity.type,
      surfaceType: court.surface.surfaceType,
      status: court.operationalStatus.status,
      venue: {
        id: court.venue.venueId.toString(),
        name: court.venue.venueName,
        code: court.venue.venueCode,
      },
      dimensions: {
        length: court.dimensions.length,
        width: court.dimensions.width,
        height: court.dimensions.height,
        freeZoneWidth: court.dimensions.freeZoneWidth,
        freeZoneLength: court.dimensions.freeZoneLength,
        freeHeight: court.dimensions.freeHeight,
        indoorOutdoor: court.dimensions.indoorOutdoor,
        courtType: court.dimensions.courtType,
      },
      surface: {
        surfaceType: court.surface.surfaceType,
        surfaceMaterial: court.surface.surfaceMaterial,
        surfaceColor: court.surface.surfaceColor,
        installedDate: court.surface.installedDate,
        lastMaintenanceDate: court.surface.lastMaintenanceDate,
        shockAbsorption: court.surface.shockAbsorption,
        verticalDeformation: court.surface.verticalDeformation,
      },
      markings: {
        boundaryLines: court.markings.boundaryLines,
        attackLines: court.markings.attackLines,
        centerLine: court.markings.centerLine,
        serviceZones: court.markings.serviceZones,
        substitutionZones: court.markings.substitutionZones,
        liberoReplacementZone: court.markings.liberoReplacementZone,
        coachRestrictionLine: court.markings.coachRestrictionLine,
        lineColor: court.markings.lineColor,
        lineWidth: court.markings.lineWidth,
        lineMaterial: court.markings.lineMaterial,
      },
      safetyZones: court.safetyZones.map(s => ({
        type: s.type,
        width: s.width,
        length: s.length,
        surface: s.surface,
        isObstructed: s.isObstructed,
        obstructionDetails: s.obstructionDetails,
        isCompliant: s.isCompliant,
      })),
      net: {
        type: court.net.type,
        height: court.net.height,
        netMaterial: court.net.netMaterial,
        netColor: court.net.netColor,
        hasAntennae: court.net.hasAntennae,
        antennaHeight: court.net.antennaHeight,
        sideBandsColor: court.net.sideBandsColor,
        hasSideBands: court.net.hasSideBands,
        netSystem: court.net.netSystem,
        tensionSystem: court.net.tensionSystem,
        tensionForce: court.net.tensionForce,
      },
      equipment: {
        hasRefereeStand: court.equipment.hasRefereeStand,
        refereeStandType: court.equipment.refereeStandType,
        hasScoreboard: court.equipment.hasScoreboard,
        scoreboardType: court.equipment.scoreboardType,
        hasVideoReplay: court.equipment.hasVideoReplay,
        hasChallengeSystem: court.equipment.hasChallengeSystem,
        hasTeamBenches: court.equipment.hasTeamBenches,
        benchCapacity: court.equipment.benchCapacity,
        hasWarmupArea: court.equipment.hasWarmupArea,
        hasMedicalArea: court.equipment.hasMedicalArea,
        hasEquipmentStorage: court.equipment.hasEquipmentStorage,
        additionalEquipment: court.equipment.additionalEquipment,
      },
      cameraReferences: court.cameraReferences.map(cr => ({
        cameraId: cr.cameraId.toString(),
        cameraName: cr.cameraName,
        position: cr.position,
        rotation: cr.rotation,
        lensType: cr.lensType,
        focalLength: cr.focalLength,
        coverageZone: cr.coverageZone,
        calibrationProfile: cr.calibrationProfile,
        isActive: cr.isActive,
      })),
      aiCalibrationProfiles: court.aiCalibrationProfiles.map(p => ({
        profileId: p.profileId,
        name: p.name,
        enabledModules: p.enabledModules,
        confidenceThreshold: p.confidenceThreshold,
        realTimeProcessing: p.realTimeProcessing,
        customConfig: p.customConfig,
        calibratedAt: p.calibratedAt,
        calibratedBy: p.calibratedBy?.toString(),
        expiresAt: p.expiresAt,
      })),
      availability: {
        status: court.availability.status,
        availableFrom: court.availability.availableFrom,
        availableUntil: court.availability.availableUntil,
        bookedFixtures: court.availability.bookedFixtures.map(id => id.toString()),
        bookedMatches: court.availability.bookedMatches.map(id => id.toString()),
        recurringSchedule: court.availability.recurringSchedule,
      },
      operationalStatus: {
        status: court.operationalStatus.status,
        activatedAt: court.operationalStatus.activatedAt,
        lastMaintenanceDate: court.operationalStatus.lastMaintenanceDate,
        nextScheduledMaintenance: court.operationalStatus.nextScheduledMaintenance,
      },
      aiMetadata: court.aiMetadata,
      isActive: court.isActive,
      isCertified: court.isCertified,
      area: court.area,
      isAvailable: court.isAvailable,
      createdAt: court.createdAt,
      updatedAt: court.updatedAt,
    };
  }
}