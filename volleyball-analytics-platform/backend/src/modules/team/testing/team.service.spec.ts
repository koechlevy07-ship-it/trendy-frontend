/**
 * Team Service Unit Tests - Chapter 11 Part 4
 * 
 * Tests for TeamService covering all team operations and business rules
 * Target coverage: ≥ 90%
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { TeamService } from '../services/team.service';
import { TeamRepository } from '../repositories/team.repository';
import { TeamValidator } from '../validators/team.validator';
import { AuditService } from '../services/audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateTeamDTO, UpdateTeamDTO } from '../dto/team.dto';
import { TeamCategory, TeamGender, TeamStatus, TeamSeasonRecord } from '../schemas/organization.model';

describe('TeamService', () => {
  let service: TeamService;
  let repository: jest.Mocked<TeamRepository>;
  let validator: jest.Mocked<TeamValidator>;
  let auditService: jest.Mocked<AuditService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockTeam = {
    id: 'team-123',
    teamId: 'TEAM-001',
    organizationId: 'org-123',
    teamCode: 'TC-001',
    teamName: 'Test Team',
    shortName: 'TT',
    displayName: 'Test Team',
    category: TeamCategory.SENIOR_MEN,
    gender: TeamGender.MEN,
    status: TeamStatus.ACTIVE,
    tenantId: 'tenant-123',
    activeRoster: [],
    coachingStaff: [],
    seasonHistory: [],
    aiMetadata: {},
  };

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      findByTeamId: jest.fn(),
      findByOrganization: jest.fn(),
      findByLeague: jest.fn(),
      findBySeason: jest.fn(),
      findRoster: jest.fn(),
      findOneOrFail: jest.fn(),
      save: jest.fn(),
      getTeamStatistics: jest.fn(),
      getByJerseyNumber: jest.fn(),
      getByPosition: jest.fn(),
      getStarters: jest.fn(),
    };

    const mockValidator = {
      validateCreateTeam: jest.fn(),
      validateUpdateTeam: jest.fn(),
      mapCreateDtoToEntity: jest.fn(),
      applyUpdateDto: jest.fn(),
    };

    const mockAuditService = {
      logTeamChange: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        { provide: TeamRepository, useValue: mockRepository },
        { provide: TeamValidator, useValue: mockValidator },
        { provide: AuditService, useValue: mockAuditService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);
    repository = module.get(TeamRepository);
    validator = module.get(TeamValidator);
    auditService = module.get(AuditService);
    eventEmitter = module.get(EventEmitter2);
  });

  describe('registerTeam', () => {
    const createDto: CreateTeamDTO = {
      organizationId: 'org-123',
      teamCode: 'TC-002',
      teamName: 'New Team',
      shortName: 'NT',
      displayName: 'New Team',
      category: TeamCategory.SENIOR_MEN,
      gender: TeamGender.MEN,
      tenantId: 'tenant-123',
      aiMetadata: {},
    };

    it('should register team successfully', async () => {
      repository.findByTeamId.mockResolvedValue(null);
      repository.findByOrganization.mockResolvedValue([]);
      repository.save.mockResolvedValue({ ...mockTeam, ...createDto });

      const result = await service.registerTeam(createDto, 'tenant-123', 'user-123');

      expect(result).toBeDefined();
      expect(result.teamName).toBe(createDto.teamName);
      expect(validator.validateCreateTeam).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalled();
      expect(auditService.logTeamChange).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('team.registered', expect.any(Object));
    });

    it('should throw ConflictException for duplicate team code', async () => {
      repository.findByTeamId.mockResolvedValue(mockTeam);

      await expect(service.registerTeam(createDto, 'tenant-123', 'user-123'))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('updateTeam', () => {
    const updateDto: UpdateTeamDTO = {
      teamName: 'Updated Team',
      displayName: 'Updated Team',
    };

    it('should update team successfully', async () => {
      repository.findOneOrFail.mockResolvedValue(mockTeam);
      validator.applyUpdateDto.mockImplementation((team, dto) => ({ ...team, ...dto }));
      repository.save.mockResolvedValue({ ...mockTeam, ...updateDto });

      const result = await service.updateTeam('team-123', updateDto, 'user-123');

      expect(result.teamName).toBe(updateDto.teamName);
      expect(validator.validateUpdateTeam).toHaveBeenCalled();
      expect(auditService.logTeamChange).toHaveBeenCalled();
    });
  });

  describe('activateTeam', () => {
    it('should activate suspended team', async () => {
      const suspendedTeam = { ...mockTeam, status: TeamStatus.SUSPENDED };
      repository.findOneOrFail.mockResolvedValue(suspendedTeam);
      repository.save.mockResolvedValue({ ...suspendedTeam, status: TeamStatus.ACTIVE });

      const result = await service.activateTeam('team-123', 'user-123');

      expect(result.status).toBe(TeamStatus.ACTIVE);
      expect(eventEmitter.emit).toHaveBeenCalledWith('team.activated', expect.any(Object));
    });

    it('should throw ConflictException for already active team', async () => {
      repository.findOneOrFail.mockResolvedValue(mockTeam);

      await expect(service.activateTeam('team-123', 'user-123'))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('suspendTeam', () => {
    it('should suspend active team', async () => {
      repository.findOneOrFail.mockResolvedValue(mockTeam);
      repository.save.mockResolvedValue({ ...mockTeam, status: TeamStatus.SUSPENDED });

      const result = await service.suspendTeam('team-123', 'user-123');

      expect(result.status).toBe(TeamStatus.SUSPENDED);
      expect(eventEmitter.emit).toHaveBeenCalledWith('team.suspended', expect.any(Object));
    });
  });

  describe('archiveTeam', () => {
    it('should archive active team', async () => {
      repository.findOneOrFail.mockResolvedValue(mockTeam);
      repository.save.mockResolvedValue({ 
        ...mockTeam, 
        status: TeamStatus.ARCHIVED, 
        isDeleted: true 
      });

      const result = await service.archiveTeam('team-123', 'user-123');

      expect(result.status).toBe(TeamStatus.ARCHIVED);
      expect(result.isDeleted).toBe(true);
      expect(eventEmitter.emit).toHaveBeenCalledWith('team.archived', expect.any(Object));
    });

    it('should throw ConflictException for already archived team', async () => {
      const archivedTeam = { ...mockTeam, status: TeamStatus.ARCHIVED };
      repository.findOneOrFail.mockResolvedValue(archivedTeam);

      await expect(service.archiveTeam('team-123', 'user-123'))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('restoreTeam', () => {
    it('should restore archived team', async () => {
      const archivedTeam = { ...mockTeam, status: TeamStatus.ARCHIVED, isDeleted: true };
      repository.findOneOrFail.mockResolvedValue(archivedTeam);
      repository.save.mockResolvedValue({ ...archivedTeam, status: TeamStatus.ACTIVE, isDeleted: false });

      const result = await service.restoreTeam('team-123', 'user-123');

      expect(result.status).toBe(TeamStatus.ACTIVE);
      expect(result.isDeleted).toBe(false);
      expect(eventEmitter.emit).toHaveBeenCalledWith('team.restored', expect.any(Object));
    });

    it('should throw ConflictException for non-archived team', async () => {
      repository.findOneOrFail.mockResolvedValue(mockTeam);

      await expect(service.restoreTeam('team-123', 'user-123'))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('addPlayerToRoster', () => {
    const playerData = {
      playerId: 'player-123',
      playerName: 'John Doe',
      jerseyNumber: 10,
      position: 'Setter',
      joinDate: new Date(),
      isActive: true,
      isCaptain: false,
    };

    it('should add player to roster', async () => {
      repository.findOneOrFail.mockResolvedValue(mockTeam);
      repository.save.mockResolvedValue({
        ...mockTeam,
        activeRoster: [...mockTeam.activeRoster, playerData],
      });

      const result = await service.addPlayerToRoster('team-123', playerData, 'user-123');

      expect(result.activeRoster).toContainEqual(playerData);
      expect(eventEmitter.emit).toHaveBeenCalledWith('team.roster_updated', expect.any(Object));
    });

    it('should throw ConflictException for duplicate jersey number', async () => {
      const teamWithPlayer = {
        ...mockTeam,
        activeRoster: [{ ...playerData, jerseyNumber: 10 }],
      };
      repository.findOneOrFail.mockResolvedValue(teamWithPlayer);

      await expect(service.addPlayerToRoster('team-123', playerData, 'user-123'))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('removePlayerFromRoster', () => {
    it('should remove player from roster', async () => {
      const teamWithPlayer = {
        ...mockTeam,
        activeRoster: [{ playerId: 'player-123', jerseyNumber: 10, position: 'Setter' }],
      };
      repository.findOneOrFail.mockResolvedValue(teamWithPlayer);
      repository.save.mockResolvedValue({ ...teamWithPlayer, activeRoster: [] });

      const result = await service.removePlayerFromRoster('team-123', 'player-123');

      expect(result.activeRoster).toHaveLength(0);
    });
  });

  describe('addCoachingStaff', () => {
    const staffData = {
      staffId: 'staff-123',
      staffName: 'Coach Smith',
      role: 'Head Coach',
      startDate: new Date(),
      isHeadCoach: true,
    };

    it('should add coaching staff', async () => {
      repository.findOneOrFail.mockResolvedValue(mockTeam);
      repository.save.mockResolvedValue({
        ...mockTeam,
        coachingStaff: [...mockTeam.coachingStaff, staffData],
      });

      const result = await service.addCoachingStaff('team-123', staffData);

      expect(result.coachingStaff).toContainEqual(staffData);
    });
  });

  describe('addSeasonRecord', () => {
    const seasonData: TeamSeasonRecord = {
      seasonId: 'season-123',
      seasonName: '2024 Season',
      leagueId: 'league-123',
      leagueName: 'National League',
      matchesPlayed: 20,
      wins: 15,
      losses: 5,
      isArchived: false,
    };

    it('should add season record', async () => {
      repository.findOneOrFail.mockResolvedValue(mockTeam);
      repository.save.mockResolvedValue({
        ...mockTeam,
        seasonHistory: [...mockTeam.seasonHistory, seasonData],
      });

      const result = await service.addSeasonRecord('team-123', seasonData);

      expect(result.seasonHistory).toContainEqual(seasonData);
    });
  });

  describe('updateBranding', () => {
    const brandingData = {
      primaryColor: '#FF0000',
      secondaryColor: '#0000FF',
      logoUrl: 'https://example.com/logo.png',
    };

    it('should update team branding', async () => {
      repository.findOneOrFail.mockResolvedValue(mockTeam);
      repository.save.mockResolvedValue({
        ...mockTeam,
        branding: brandingData,
      });

      const result = await service.updateBranding('team-123', brandingData);

      expect(result.branding).toEqual(brandingData);
    });
  });

  describe('updateAIMetadata', () => {
    const aiMetadataData = {
      teamEmbedding: [0.1, 0.2, 0.3],
      jerseyRecognition: {},
    };

    it('should update AI metadata', async () => {
      repository.findOneOrFail.mockResolvedValue(mockTeam);
      repository.save.mockResolvedValue({
        ...mockTeam,
        aiMetadata: aiMetadataData,
      });

      const result = await service.updateAIMetadata('team-123', aiMetadataData);

      expect(result.aiMetadata).toEqual(aiMetadataData);
    });
  });

  describe('getTeamStatistics', () => {
    it('should return team statistics', async () => {
      const stats = {
        totalPlayers: 14,
        activePlayers: 12,
        coachingStaff: 3,
        seasonRecords: 2,
        currentSeasonRecord: {
          matchesPlayed: 20,
          wins: 15,
          losses: 5,
          winPercentage: 75,
        },
      };
      repository.getTeamStatistics.mockResolvedValue(stats);

      const result = await service.getTeamStatistics('team-123');

      expect(result).toEqual(stats);
    });
  });

  describe('initializeSeason', () => {
    it('should initialize team for new season', async () => {
      repository.findOneOrFail.mockResolvedValue(mockTeam);
      repository.save.mockResolvedValue({
        ...mockTeam,
        currentSeasonId: 'season-123',
      });

      const result = await service.initializeSeason('team-123', 'season-123', 'user-123');

      expect(result.currentSeasonId).toBe('season-123');
    });
  });

  describe('closeSeason', () => {
    it('should close and archive season', async () => {
      const teamWithSeason = {
        ...mockTeam,
        currentSeasonId: 'season-123',
      };
      repository.findOneOrFail.mockResolvedValue(teamWithSeason);
      repository.save.mockResolvedValue({
        ...teamWithSeason,
        seasonHistory: [
          ...teamWithSeason.seasonHistory,
          { seasonId: 'season-123', isArchived: true },
        ],
        currentSeasonId: null,
      });

      const result = await service.closeSeason('team-123', 'season-123', {}, 'user-123');

      expect(result.currentSeasonId).toBeNull();
    });
  });
});