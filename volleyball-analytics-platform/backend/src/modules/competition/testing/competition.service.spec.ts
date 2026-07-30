/**
 * Unit Tests - Competition Service
 * 
 * Tests for CompetitionService covering all business rules
 * Target coverage: ≥ 90%
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CompetitionService } from '../services/competition.service';
import { CompetitionRepository } from '../repositories/competition.repository';
import { CompetitionValidator } from '../validators/competition.validator';
import { CompetitionEventService } from '../events/competition.event.service';
import { CreateCompetitionDTO, UpdateCompetitionDTO, CompetitionSearchDTO } from '../dto/competition.dto';
import { Competition, CompetitionDocument, CompetitionStatus, CompetitionFormat } from '../schemas/competition.schema';
import { Fixture, FixtureDocument, FixtureStatus } from '../schemas/fixture.schema';
import { CompetitionPhase, CompetitionPhaseDocument } from '../schemas/competition-phase.schema';
import { CompetitionGroup, CompetitionGroupDocument } from '../schemas/competition-group.schema';
import { SeasonService } from '../../season/services/season.service';

describe('CompetitionService', () => {
  let service: CompetitionService;
  let repository: jest.Mocked<CompetitionRepository>;
  let validator: jest.Mocked<CompetitionValidator>;
  let eventService: jest.Mocked<CompetitionEventService>;
  let seasonService: jest.Mocked<SeasonService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockCompetition = {
    _id: new Types.ObjectId(),
    competitionId: 'comp_123',
    name: 'Test Championship',
    shortName: 'TC',
    description: 'Test Championship Description',
    type: CompetitionType.LEAGUE,
    format: CompetitionFormat.ROUND_ROBIN,
    status: CompetitionStatus.DRAFT,
    seasonId: new Types.ObjectId(),
    organizerId: new Types.ObjectId(),
    rules: {
      scoringSystem: ScoringSystem.BEST_OF_5,
      pointsPerSet: 25,
      decidingSetPoints: 15,
      minPointsDifference: 2,
      maxSets: 5,
      liberoAllowed: true,
      technicalTimeouts: 2,
      teamTimeoutsPerSet: 2,
      timeoutDuration: 30,
      intervalDuration: 60,
    },
    schedule: {
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-06-15'),
      registrationOpenDate: new Date('2025-11-01'),
      registrationCloseDate: new Date('2025-12-15'),
      schedulePublishedDate: new Date('2026-01-01'),
      matchDays: ['saturday', 'sunday'],
      excludedDates: [],
      timeSlotConstraints: {
        earliestStart: '09:00',
        latestEnd: '22:00',
        minRestHours: 24,
      },
    },
    participantIds: [],
    maxParticipants: 12,
    ranking: [],
    prizes: [],
    phaseIds: [],
    groupIds: [],
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  const mockSeason = {
    _id: new Types.ObjectId(),
    seasonId: 'season_2026',
    name: '2026 Season',
    code: 'S26',
    year: 2026,
    status: 'active',
    schedule: {
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
    },
  } as any;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByCompetitionId: jest.fn(),
      findByNameAndSeason: jest.fn(),
      findByCode: jest.fn(),
      findBySeason: jest.fn(),
      findByOrganizer: jest.fn(),
      search: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
      restore: jest.fn(),
      addParticipant: jest.fn(),
      removeParticipant: jest.fn(),
      getStatistics: jest.fn(),
      getHierarchy: jest.fn(),
    };

    const mockValidator = {
      validateCreate: jest.fn(),
      validateUpdate: jest.fn(),
      validateVerification: jest.fn(),
      validateApproval: jest.fn(),
      validateRejection: jest.fn(),
      validateArchive: jest.fn(),
      validateRestore: jest.fn(),
      validateFixtureCreation: jest.fn(),
      validateStatusTransition: jest.fn(),
    };

    const mockEventService = {
      emitCreated: jest.fn(),
      emitVerified: jest.fn(),
      emitApproved: jest.fn(),
      emitRejected: jest.fn(),
      emitArchived: jest.fn(),
      emitRestored: jest.fn(),
      emitTeamRegistered: jest.fn(),
      emitTeamUnregistered: jest.fn(),
      emitFixturesGenerated: jest.fn(),
    };

    const mockSeasonService = {
      findById: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
      emitAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompetitionService,
        { provide: CompetitionRepository, useValue: mockRepository },
        { provide: CompetitionValidator, useValue: mockValidator },
        { provide: CompetitionEventService, useValue: mockEventService },
        { provide: SeasonService, useValue: mockSeasonService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<CompetitionService>(CompetitionService);
    repository = module.get(CompetitionRepository);
    validator = module.get(CompetitionValidator);
    eventService = module.get(CompetitionEventService);
    seasonService = module.get(SeasonService);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateCompetitionDTO = {
      name: 'New Championship',
      shortName: 'NC',
      displayName: 'New Championship',
      type: CompetitionType.LEAGUE,
      format: CompetitionFormat.ROUND_ROBIN,
      seasonId: 'season_123',
      organizerId: 'org_123',
      rules: {
        scoringSystem: ScoringSystem.BEST_OF_5,
        pointsPerSet: 25,
        decidingSetPoints: 15,
        minPointsDifference: 2,
        maxSets: 5,
      },
      schedule: {
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-06-30'),
        registrationOpenDate: new Date('2025-11-01'),
        registrationCloseDate: new Date('2025-12-31'),
        registrationAuthority: 'Volleyball Federation',
      },
      address: {
        country: 'US',
        stateProvince: 'CA',
        city: 'Los Angeles',
        postalCode: '90001',
        physicalAddress: '123 Volleyball Ave',
      },
      contact: {
        email: 'info@championship.com',
        phone: '+1-555-1234',
        website: 'https://championship.com',
        primaryContactPerson: 'John Doe',
        primaryContactPhone: '+1-555-5678',
        supportEmail: 'support@championship.com',
      },
      governance: {
        governingBodyId: 'gov_123',
        governingBodyName: 'Volleyball Federation',
      },
      branding: {
        primaryColor: '#FF0000',
        secondaryColor: '#0000FF',
      },
      tenantId: 'tenant_123',
    };

    it('should create competition successfully', async () => {
      validator.validateCreate.mockResolvedValue(undefined);
      seasonService.findById.mockResolvedValue(mockSeason);
      repository.findByNameAndSeason.mockResolvedValue(null);
      repository.save.mockResolvedValue({ ...mockCompetition, ...createDto, competitionId: 'comp_123' });

      const result = await service.create(createDto, 'tenant_123', 'user_123');

      expect(result).toBeDefined();
      expect(result.name).toBe(createDto.name);
      expect(validator.validateCreate).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalled();
      expect(eventService.emitCreated).toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate competition name in same season', async () => {
      validator.validateCreate.mockResolvedValue(undefined);
      seasonService.findById.mockResolvedValue(mockSeason);
      repository.findByNameAndSeason.mockResolvedValue(mockCompetition);

      await expect(service.create(createDto, 'tenant_123', 'user_123'))
        .rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for duplicate registration number', async () => {
      const dtoWithReg = { ...createDto, registrationNumber: 'REG-123' };
      validator.validateCreate.mockResolvedValue(undefined);
      seasonService.findById.mockResolvedValue(mockSeason);
      repository.findByRegistrationNumber.mockResolvedValue(mockCompetition);

      await expect(service.create(dtoWithReg, 'tenant_123', 'user_123'))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateCompetitionDTO = {
      name: 'Updated Championship',
      shortName: 'UC',
      displayName: 'Updated Championship',
    };

    it('should update competition successfully', async () => {
      validator.validateUpdate.mockResolvedValue(undefined);
      repository.findById.mockResolvedValue(mockCompetition);
      repository.findByNameAndSeason.mockResolvedValue(null);
      validator.applyUpdateDto.mockImplementation((comp, dto) => ({ ...comp, ...dto }));
      repository.save.mockResolvedValue({ ...mockCompetition, ...updateDto });

      const result = await service.update('comp_123', updateDto, 'user_123');

      expect(result).toBeDefined();
      expect(result.name).toBe(updateDto.name);
      expect(validator.validateUpdate).toHaveBeenCalledWith('comp_123', updateDto);
      expect(eventService.emitUpdated).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent competition', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('non_existent', updateDto, 'user_123'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for duplicate name', async () => {
      const existingComp = { ...mockCompetition, _id: new Types.ObjectId() };
      repository.findById.mockResolvedValue(mockCompetition);
      repository.findByNameAndSeason.mockResolvedValue(existingComp);

      await expect(service.update('comp_123', updateDto, 'user_123'))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('archive', () => {
    it('should archive competition successfully', async () => {
      const activeComp = { ...mockCompetition, status: CompetitionStatus.ACTIVE };
      repository.findById.mockResolvedValue(activeComp);
      repository.archive.mockResolvedValue(true);

      await service.archive('comp_123', 'user_123');

      expect(repository.archive).toHaveBeenCalledWith('comp_123', 'user_123');
      expect(eventService.emitArchived).toHaveBeenCalled();
    });

    it('should throw ConflictException for already archived competition', async () => {
      const archivedComp = { ...mockCompetition, status: CompetitionStatus.ARCHIVED };
      repository.findById.mockResolvedValue(archivedComp);

      await expect(service.archive('comp_123', 'user_123'))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('restore', () => {
    it('should restore archived competition', async () => {
      const archivedComp = { ...mockCompetition, status: CompetitionStatus.ARCHIVED };
      repository.findById.mockResolvedValue(archivedComp);
      repository.restore.mockResolvedValue({ ...mockCompetition, status: CompetitionStatus.ACTIVE });

      const result = await service.restore('comp_123', 'user_123');

      expect(result.status).toBe(CompetitionStatus.ACTIVE);
      expect(eventService.emitRestored).toHaveBeenCalled();
    });
  });

  describe('verify', () => {
    it('should verify competition successfully', async () => {
      const pendingComp = { ...mockCompetition, status: CompetitionStatus.PENDING_VERIFICATION };
      repository.findById.mockResolvedValue(pendingComp);
      repository.save.mockResolvedValue({ ...pendingComp, status: CompetitionStatus.ACTIVE });

      const result = await service.verify('comp_123', {
        verifiedBy: 'user_123',
        verificationStatus: VerificationStatus.VERIFIED,
        verifiedAt: new Date(),
      }, 'user_123');

      expect(result.status).toBe(CompetitionStatus.ACTIVE);
      expect(eventService.emitVerified).toHaveBeenCalled();
    });

    it('should throw ConflictException for non-pending competition', async () => {
      const activeComp = { ...mockCompetition, status: CompetitionStatus.ACTIVE };
      repository.findById.mockResolvedValue(activeComp);

      await expect(service.verify('comp_123', { verifiedBy: 'user_123', verifiedAt: new Date() }, 'user_123'))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('approve', () => {
    it('should approve competition successfully', async () => {
      const pendingComp = { ...mockCompetition, status: CompetitionStatus.REGISTERING };
      repository.findById.mockResolvedValue(pendingComp);
      repository.save.mockResolvedValue({ ...pendingComp, status: CompetitionStatus.SCHEDULED });

      const result = await service.approve('comp_123', 'user_123');

      expect(result.status).toBe(CompetitionStatus.SCHEDULED);
      expect(eventService.emitApproved).toHaveBeenCalled();
    });

    it('should throw BadRequestException for non-federation/league type', async () => {
      const clubComp = { ...mockCompetition, type: CompetitionType.CLUB };
      repository.findById.mockResolvedValue(clubComp);

      await expect(service.approve('comp_123', 'user_123'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('reject', () => {
    it('should reject competition successfully', async () => {
      const pendingComp = { ...mockCompetition, status: CompetitionStatus.REGISTERING };
      repository.findById.mockResolvedValue(pendingComp);
      repository.save.mockResolvedValue({ ...pendingComp, status: CompetitionStatus.CANCELLED });

      const result = await service.reject('comp_123', 'user_123', 'Incomplete documentation');

      expect(result.status).toBe(CompetitionStatus.CANCELLED);
      expect(eventService.emitRejected).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should return filtered and paginated results', async () => {
      const searchFilters = {
        query: 'championship',
        type: CompetitionType.LEAGUE,
        status: CompetitionStatus.ACTIVE,
        tenantId: 'tenant_123',
        page: 1,
        perPage: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
      };

      const mockResults = [mockCompetition];
      repository.search.mockResolvedValue({
        data: mockResults,
        total: 1,
        page: 1,
        perPage: 20,
        totalPages: 1,
      });

      const result = await service.search(searchFilters);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(repository.search).toHaveBeenCalled();
    });
  });

  describe('getHierarchy', () => {
    it('should return hierarchy tree', async () => {
      const mockComp = { ...mockCompetition, _id: new Types.ObjectId('comp_123') };
      repository.findById.mockResolvedValue(mockComp);
      // Mock phase, group, fixture, and team lookups
      jest.spyOn(service as any, 'getPhasesForCompetition').mockResolvedValue([]);
      jest.spyOn(service as any, 'getGroupsForCompetition').mockResolvedValue([]);
      jest.spyOn(service as any, 'getFixturesForCompetition').mockResolvedValue([]);

      const result = await service.getHierarchy('comp_123');

      expect(result).toBeDefined();
      expect(result.competition).toBeDefined();
    });
  });

  describe('getStatistics', () => {
    it('should return competition statistics', async () => {
      const stats = {
        totalOrganizations: 10,
        byType: { federation: 1, league: 5, club: 4 },
        byStatus: { active: 8, pending: 2 },
        totalTeams: 50,
        totalFacilities: 15,
        totalMembers: 500,
      };
      repository.getStatistics.mockResolvedValue(stats);

      const result = await service.getStatistics('tenant_123');

      expect(result.totalOrganizations).toBe(10);
      expect(result.byType.federation).toBe(1);
    });
  });
});