import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Court, CourtDocument, CourtType, CourtSurface, CourtOrientation, CourtStatus, NetType, SafetyZoneType } from '../schemas/court.schema';
import { CreateCourtDTO, UpdateCourtDTO, CourtSearchDTO } from '../dto/court.dto';
import { FixtureRepository } from '../../competition/repositories/fixture.repository';

@Injectable()
export class CourtValidator {
  constructor(
    @InjectModel('Court') private readonly courtModel: Model<any>,
    @InjectModel('Fixture') private readonly fixtureModel: Model<any>,
    private readonly fixtureRepository: FixtureRepository,
  ) {}

  async validateCreate(dto: CreateCourtDTO): Promise<void> {
    // Validate court ID uniqueness
    const existingById = await this.courtModel.findOne({ courtId: dto.identity.courtId }).exec();
    if (existingById) {
      throw new ConflictException(`Court with ID '${dto.identity.courtId}' already exists`);
    }

    // Validate court ID format
    if (!/^[a-zA-Z0-9_-]{1,50}$/.test(dto.identity.courtId)) {
      throw new BadRequestException('Court ID must contain only alphanumeric characters, hyphens, and underscores');
    }

    // Validate name
    if (dto.identity.name.length < 1 || dto.identity.name.length > 100) {
      throw new BadRequestException('Court name must be between 1 and 100 characters');
    }

    // Validate short name
    if (dto.identity.shortName.length < 1 || dto.identity.shortName.length > 10) {
      throw new BadRequestException('Short name must be between 1 and 10 characters');
    }

    // Validate display name
    if (dto.identity.displayName.length < 1 || dto.identity.displayName.length > 100) {
      throw new BadRequestException('Display name must be between 1 and 100 characters');
    }

    // Validate court type
    if (!Object.values(CourtType).includes(dto.identity.type)) {
      throw new BadRequestException(`Invalid court type: ${dto.identity.type}`);
    }

    // Validate court surface
    if (!Object.values(CourtSurface).includes(dto.surface.surfaceType)) {
      throw new BadRequestException(`Invalid court surface: ${dto.surface.surfaceType}`);
    }

    // Validate orientation
    if (!Object.values(CourtOrientation).includes(dto.dimensions.orientation)) {
      throw new BadRequestException(`Invalid court orientation: ${dto.dimensions.orientation}`);
    }

    // Validate dimensions
    if (dto.dimensions.length < 10 || dto.dimensions.length > 30) {
      throw new BadRequestException('Court length must be between 10 and 30 meters');
    }

    if (dto.dimensions.width < 5 || dto.dimensions.width > 20) {
      throw new BadRequestException('Court width must be between 5 and 20 meters');
    }

    if (dto.dimensions.height && (dto.dimensions.height < 2 || dto.dimensions.height > 20)) {
      throw new BadRequestException('Court height must be between 2 and 20 meters');
    }

    // Validate safety zones
    if (dto.safetyZones && dto.safetyZones.length > 0) {
      for (const zone of dto.safetyZones) {
        if (!Object.values(SafetyZoneType).includes(zone.type)) {
          throw new BadRequestException(`Invalid safety zone type: ${zone.type}`);
        }
        if (zone.width < 0 || zone.width > 10) {
          throw new BadRequestException('Safety zone width must be between 0 and 10 meters');
        }
        if (zone.length && (zone.length < 0 || zone.length > 10)) {
          throw new BadRequestException('Safety zone length must be between 0 and 10 meters');
        }
      }
    }

    // Validate net configuration
    if (!Object.values(NetType).includes(dto.net.type)) {
      throw new BadRequestException(`Invalid net type: ${dto.net.type}`);
    }

    if (dto.net.height < 2.0 || dto.net.height > 3.0) {
      throw new BadRequestException('Net height must be between 2.0 and 3.0 meters');
    }

    // Validate camera positions
    if (dto.cameraPositions && dto.cameraPositions.length > 0) {
      for (const cam of dto.cameraPositions) {
        if (!cam.position || cam.position.length !== 3) {
          throw new BadRequestException('Camera position must have exactly 3 coordinates [x, y, z]');
        }
        if (!cam.rotation || cam.rotation.length !== 3) {
          throw new BadRequestException('Camera rotation must have exactly 3 values [pitch, yaw, roll]');
        }
        if (cam.position.some(coord => isNaN(coord) || coord < -100 || coord > 100)) {
          throw new BadRequestException('Camera position coordinates must be between -100 and 100');
        }
      }
    }

    // Validate lighting
    if (dto.lighting) {
      if (dto.lighting.lux && (dto.lighting.lux < 100 || dto.lighting.lux > 5000)) {
        throw new BadRequestException('Lighting lux must be between 100 and 5000');
      }
    }
  }

  async validateUpdate(courtId: string, dto: UpdateCourtDTO): Promise<void> {
    const court = await this.courtModel.findById(courtId).exec();
    if (!court) {
      throw new NotFoundException(`Court with ID ${courtId} not found`);
    }

    // Cannot modify archived courts
    if (court.archive?.isArchived) {
      throw new BadRequestException('Cannot update archived court');
    }

    // If identity is being updated, check uniqueness
    if (dto.identity?.courtId && dto.identity.courtId !== court.identity.courtId) {
      const existing = await this.courtModel.findOne({ courtId: dto.identity.courtId }).exec();
      if (existing) {
        throw new ConflictException(`Court with ID '${dto.identity.courtId}' already exists`);
      }
    }

    // If name is being updated, check for duplicates
    if (dto.identity?.name && dto.identity.name !== court.identity.name) {
      const existing = await this.courtModel.findOne({
        'identity.name': dto.identity.name,
        'venue.venueId': court.venue.venueId,
        _id: { $ne: court._id },
      }).exec();
      if (existing) {
        throw new ConflictException(`Court with name '${dto.identity.name}' already exists in this venue`);
      }
    }

    // Validate status transition
    if (dto.operationalStatus?.status && dto.operationalStatus.status !== court.operationalStatus.status) {
      this.validateStatusTransition(court.operationalStatus.status, dto.operationalStatus.status);
    }

    // Validate dimensions if being updated
    if (dto.dimensions) {
      if (dto.dimensions.length && (dto.dimensions.length < 10 || dto.dimensions.length > 30)) {
        throw new BadRequestException('Court length must be between 10 and 30 meters');
      }
      if (dto.dimensions.width && (dto.dimensions.width < 5 || dto.dimensions.width > 20)) {
        throw new BadRequestException('Court width must be between 5 and 20 meters');
      }
    }

    // Validate surface if being updated
    if (dto.surface && !Object.values(['wood', 'synthetic', 'tara', 'sand', 'grass', 'clay', 'concrete', 'asphalt', 'acrylic', 'polyurethane', 'rubber']).includes(dto.surface.surfaceType)) {
      throw new BadRequestException(`Invalid court surface: ${dto.surface.surfaceType}`);
    }
  }

  async validateStatusTransition(courtId: string, newStatus: string): Promise<void> {
    const court = await this.courtModel.findById(courtId).exec();
    if (!court) {
      throw new NotFoundException(`Court with ID ${courtId} not found`);
    }

    this.validateStatusTransition(court.operationalStatus.status, newStatus);
  }

  private validateStatusTransition(from: string, to: string): void {
    const validTransitions: Record<string, string[]> = {
      [CourtStatus.DRAFT]: [CourtStatus.UNDER_CONSTRUCTION, CourtStatus.ARCHIVED],
      [CourtStatus.UNDER_CONSTRUCTION]: [CourtStatus.PENDING_CERTIFICATION, CourtStatus.ARCHIVED],
      [CourtStatus.PENDING_CERTIFICATION]: [CourtStatus.CERTIFIED, CourtStatus.UNDER_CONSTRUCTION, CourtStatus.ARCHIVED],
      [CourtStatus.CERTIFIED]: [CourtStatus.OPERATIONAL, CourtStatus.UNDER_MAINTENANCE, CourtStatus.ARCHIVED],
      [CourtStatus.OPERATIONAL]: [CourtStatus.UNDER_MAINTENANCE, CourtStatus.DECOMMISSIONED, CourtStatus.ARCHIVED],
      [CourtStatus.UNDER_MAINTENANCE]: [CourtStatus.OPERATIONAL, CourtStatus.DECOMMISSIONED, CourtStatus.ARCHIVED],
      [CourtStatus.DECOMMISSIONED]: [CourtStatus.ARCHIVED],
      [CourtStatus.ARCHIVED]: [],
    };

    const validTargets = validTransitions[from] || [];
    if (!validTransitions[from]?.includes(to)) {
      throw new BadRequestException(`Invalid status transition from ${from} to ${to}`);
    }
  }

  async validateFixtureCreation(dto: CreateCourtDTO): Promise<void> {
    // Check if venue exists and is operational
    // This would call venue service
  }

  async validateLineupSubmission(
    matchId: string,
    teamId: string,
    setNumber: number,
    lineup: any[]
  ): Promise<void> {
    // Validate exactly 6 starters
    const starters = lineup.filter(p => p.isStarting);
    if (starters.length !== 6) {
      throw new BadRequestException('Exactly 6 starting players required');
    }

    // Max 1 libero
    const liberoCount = lineup.filter(p => p.isLibero).length;
    if (liberoCount > 1) {
      throw new BadRequestException('Maximum 1 libero allowed per team');
    }

    // Exactly 1 captain
    const captainCount = lineup.filter(p => p.isCaptain).length;
    if (captainCount !== 1) {
      throw new BadRequestException('Exactly 1 captain required');
    }

    // Unique jersey numbers
    const jerseyNumbers = lineup.map(p => p.jerseyNumber);
    if (new Set(jerseyNumbers).size !== jerseyNumbers.length) {
      throw new BadRequestException('Jersey numbers must be unique');
    }

    // Validate jersey number range
    for (const num of jerseyNumbers) {
      if (num < 1 || num > 99) {
        throw new BadRequestException('Jersey numbers must be between 1 and 99');
      }
    }

    // Validate captain is in starters
    if (lineup.captainId) {
      const captain = lineup.find(p => p.playerId === lineup.captainId);
      if (!captain || !captain.isStarting) {
        throw new BadRequestException('Captain must be a starting player');
      }
    }

    // Validate libero is not captain
    const libero = lineup.find(p => p.isLibero);
    if (libero && libero.isCaptain) {
      throw new BadRequestException('Libero cannot be captain');
    }
  }

  async validateSubstitution(matchId: string, substitution: any): Promise<void> {
    // Check match is in progress
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    if (match.status !== 'in_progress') {
      throw new BadRequestException('Substitutions only allowed during live match');
    }

    // Check team has remaining substitutions (max 6 per set)
    // This would check against existing substitutions for this team/set
  }

  async validateTimeout(matchId: string, timeout: any): Promise<void> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    if (match.status !== 'in_progress') {
      throw new BadRequestException('Timeouts only allowed during live match');
    }

    // Check remaining timeouts (max 2 per set per team)
  }

  async validateChallenge(matchId: string, challenge: any): Promise<void> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    if (match.status !== 'in_progress') {
      throw new BadRequestException('Challenges only allowed during live match');
    }

    // Check team has challenges remaining (max 2 per set)
    const teamChallenges = await this.challengeModel.countDocuments({
      matchId: new Types.ObjectId(matchId),
      teamId: new Types.ObjectId(challenge.teamId),
      setNumber: challenge.setNumber,
      result: { $in: [ChallengeResult.PENDING, ChallengeResult.UPHELD] },
    }).exec();

    if (teamChallenges >= 2) {
      throw new BadRequestException('Team has reached maximum of 2 challenges per set');
    }
  }

  async validateSanction(matchId: string, sanction: any): Promise<void> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    if (match.status !== 'in_progress') {
      throw new BadRequestException('Sanctions only allowed during live match');
    }

    if (!Object.values(['yellow_card', 'red_card', 'warning', 'penalty']).includes(sanction.type)) {
      throw new BadRequestException(`Invalid sanction type: ${sanction.type}`);
    }

    if (!Object.values(['unsporting_conduct', 'delay', 'dissent', 'violent_conduct', 'technical_violation']).includes(sanction.reason)) {
      throw new BadRequestException(`Invalid sanction reason: ${sanction.reason}`);
    }
  }

  private validateOfficialsAssignments(dto: CreateCourtDTO): void {
    const mandatoryRoles = [
      'firstReferee',
      'secondReferee',
      'scorer',
      'lineJudge_1',
      'lineJudge_2',
    ];

    for (const role of mandatoryRoles) {
      if (!dto[role]) {
        throw new BadRequestException(`Mandatory official role ${role} is required`);
      }
    }

    // Check for duplicate officials
    const assignedOfficials = [
      dto.firstReferee.officialId,
      dto.secondReferee?.officialId,
      dto.scorer?.officialId,
      dto.assistantScorer?.officialId,
      ...dto.lineJudges.map(lj => lj.officialId),
    ].filter(Boolean);

    const uniqueOfficials = new Set(assignedOfficials);
    if (uniqueOfficials.size !== assignedOfficials.length) {
      throw new BadRequestException('An official cannot be assigned to multiple roles');
    }
  }
}