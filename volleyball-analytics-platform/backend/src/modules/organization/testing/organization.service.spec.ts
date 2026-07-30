/**
 * Organization Service Unit Tests - Chapter 11 Part 4
 * 
 * Tests for OrganizationService covering all business rules
 * Target coverage: ≥ 90%
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { OrganizationRepository } from '../repositories/organization.repository';
import { OrganizationValidator } from '../validators/organization.validator';
import { AuditService } from '../services/audit/audit.service';
import { PermissionService } from '../../shared/services/permission.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateOrganizationDTO, UpdateOrganizationDTO } from '../dto/organization.dto';
import { OrganizationType, OrganizationStatus, VerificationStatus } from '../schemas/organization.model';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let repository: jest.Mocked<OrganizationRepository>;
  let validator: jest.Mocked<OrganizationValidator>;
  let auditService: jest.Mocked<AuditService>;
  let permissionService: jest.Mocked<PermissionService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockOrganization = {
    id: 'org-123',
    organizationId: 'ORG-001',
    organizationName: 'Test Federation',
    shortName: 'TF',
    displayName: 'Test Federation',
    type: OrganizationType.FEDERATION,
    status: OrganizationStatus.ACTIVE,
    tenantId: 'tenant-123',
    registration: {
      registrationNumber: 'REG-123',
      registrationDate: new Date(),
      registrationAuthority: 'Test Authority',
      verificationStatus: VerificationStatus.VERIFIED,
    },
    country: 'US',
    city: 'Test City',
    physicalAddress: '123 Test St',
  };

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      findByOrganizationId: jest.fn(),
      findByCode: jest.fn(),
      findByRegistrationNumber: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      getStatistics: jest.fn(),
      findByHierarchy: jest.fn(),
    };

    const mockValidator = {
      validateCreateOrganization: jest.fn(),
      validateUpdateOrganization: jest.fn(),
      validateVerificationDto: jest.fn(),
      mapCreateDtoToEntity: jest.fn(),
      applyUpdateDto: jest.fn(),
      buildSearchFilter: jest.fn(),
    };

    const mockAuditService = {
      logOrganizationChange: jest.fn(),
    };

    const mockPermissionService = {
      checkPermission: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        { provide: OrganizationRepository, useValue: mockRepository },
        { provide: OrganizationValidator, useValue: mockValidator },
        { provide: AuditService, useValue: mockAuditService },
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
    repository = module.get(OrganizationRepository);
    validator = module.get(OrganizationValidator);
    auditService = module.get(AuditService);
    permissionService = module.get(PermissionService);
    eventEmitter = module.get(EventEmitter2);
  });

  describe('registerOrganization', () => {
    const createDto: CreateOrganizationDTO = {
      organizationName: 'New Federation',
      shortName: 'NF',
      displayName: 'New Federation',
      organizationType: OrganizationType.FEDERATION,
      country: 'US',
      city: 'New York',
      physicalAddress: '123 Main St',
      registration: {
        registrationNumber: 'REG-456',
        registrationDate: new Date(),
        registrationAuthority: 'Test Authority',
      },
      tenantId: 'tenant-123',
    };

    it('should register organization successfully', async () => {
      repository.findByOrganizationId.mockResolvedValue(null);
      repository.findByCode.mockResolvedValue(null);
      repository.findByRegistrationNumber.mockResolvedValue(null);
      repository.save.mockResolvedValue({ ...mockOrganization, ...createDto });

      const result = await service.registerOrganization(createDto, 'tenant-123', 'user-123');

      expect(result).toBeDefined();
      expect(result.organizationName).toBe(createDto.organizationName);
      expect(validator.validateCreateOrganization).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalled();
      expect(auditService.logOrganizationChange).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('organization.registered', expect.any(Object));
    });

    it('should throw ConflictException for duplicate organization name', async () => {
      repository.findByOrganizationId.mockResolvedValue(mockOrganization);

      await expect(service.registerOrganization(createDto, 'tenant-123', 'user-123'))
        .rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for duplicate registration number', async () => {
      repository.findByRegistrationNumber.mockResolvedValue(mockOrganization);

      await expect(service.registerOrganization(createDto, 'tenant-123', 'user-123'))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('updateOrganization', () => {
    const updateDto: UpdateOrganizationDTO = {
      organizationName: 'Updated Federation',
      displayName: 'Updated Federation',
    };

    it('should update organization successfully', async () => {
      repository.findOneOrFail.mockResolvedValue(mockOrganization);
      repository.findByOrganizationId.mockResolvedValue(null);
      validator.applyUpdateDto.mockImplementation((org, dto) => ({ ...org, ...dto }));
      repository.save.mockResolvedValue({ ...mockOrganization, ...updateDto });

      const result = await service.updateOrganization('org-123', updateDto, 'user-123');

      expect(result.organizationName).toBe(updateDto.organizationName);
      expect(validator.validateUpdateOrganization).toHaveBeenCalled();
      expect(auditService.logOrganizationChange).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent organization', async () => {
      repository.findOneOrFail.mockRejectedValue(new NotFoundException());

      await expect(service.updateOrganization('non-existent', updateDto, 'user-123'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('archiveOrganization', () => {
    it('should archive organization successfully', async () => {
      const activeOrg = { ...mockOrganization, status: OrganizationStatus.ACTIVE };
      repository.findOneOrFail.mockResolvedValue(activeOrg);
      repository.save.mockResolvedValue({ ...activeOrg, status: OrganizationStatus.ARCHIVED, isDeleted: true });

      const result = await service.archiveOrganization('org-123', 'user-123');

      expect(result.status).toBe(OrganizationStatus.ARCHIVED);
      expect(result.isDeleted).toBe(true);
      expect(auditService.logOrganizationChange).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('organization.archived', expect.any(Object));
    });

    it('should throw ConflictException for already archived organization', async () => {
      const archivedOrg = { ...mockOrganization, status: OrganizationStatus.ARCHIVED };
      repository.findOneOrFail.mockResolvedValue(archivedOrg);

      await expect(service.archiveOrganization('org-123', 'user-123'))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('verifyOrganization', () => {
    const verifyDto = {
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedBy: 'admin-123',
      verifiedAt: new Date(),
    };

    it('should verify organization successfully', async () => {
      const pendingOrg = { ...mockOrganization, status: OrganizationStatus.PENDING_VERIFICATION };
      repository.findOneOrFail.mockResolvedValue(pendingOrg);
      repository.save.mockResolvedValue({ ...pendingOrg, status: OrganizationStatus.ACTIVE });

      const result = await service.verifyOrganization('org-123', verifyDto, 'admin-123');

      expect(result.status).toBe(OrganizationStatus.ACTIVE);
      expect(validator.validateVerificationDto).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('organization.verified', expect.any(Object));
    });

    it('should throw ConflictException for non-pending organization', async () => {
      const activeOrg = { ...mockOrganization, status: OrganizationStatus.ACTIVE };
      repository.findOneOrFail.mockResolvedValue(activeOrg);

      await expect(service.verifyOrganization('org-123', verifyDto, 'admin-123'))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('searchOrganizations', () => {
    it('should return filtered organizations', async () => {
      const searchQuery = { tenantId: 'tenant-123', page: 1, perPage: 20 };
      const orgs = [mockOrganization];
      repository.find.mockResolvedValue(orgs);

      const result = await service.searchOrganizations(searchQuery);

      expect(result).toEqual(orgs);
      expect(validator.buildSearchFilter).toHaveBeenCalledWith(searchQuery);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('getOrganizationStatistics', () => {
    it('should return organization statistics', async () => {
      const stats = {
        totalOrganizations: 100,
        byType: { federation: 10, league: 20, club: 70 },
        byStatus: { active: 80, pending_verification: 15, archived: 5 },
        totalTeams: 500,
        totalFacilities: 200,
      };
      repository.getStatistics.mockResolvedValue(stats);

      const result = await service.getOrganizationStatistics('tenant-123');

      expect(result).toEqual(stats);
      expect(repository.getStatistics).toHaveBeenCalledWith('tenant-123');
    });
  });
});