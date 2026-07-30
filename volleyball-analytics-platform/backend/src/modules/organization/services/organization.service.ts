/**
 * Organization Service - Chapter 11 Part 3
 * 
 * Service layer for organization management implementing business rules, validation,
 * and coordinating with repositories. Encapsulates all organizational operations
 * including registration, updates, verification, and lifecycle management.
 */

import { Injectable, Inject, forwardRef, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  Organization,
  OrganizationType,
  OrganizationStatus,
  OrganizationRegistration,
  OrganizationAddress,
  OrganizationContact,
  OrganizationBranding,
  AIMetadata,
} from '../entities/organization.entity';

import {
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  PatchOrganizationVerifyDTO,
  OrganizationSearchQuery,
} from '../dto/organization.dto';

import { OrganizationRepository } from '../repositories/organization.repository';
import { AuditRepository } from '../repositories/supporting.repositories';
import { OrganizationValidator } from '../validators/organization.validator';

import { PermissionService } from '../../shared/services/permission.service';
import { AuditService } from '../../shared/services/audit.service';

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum OrganizationOperation {
  CREATE = 'organization:create',
  UPDATE = 'organization:update',
  VERIFY = 'organization:verify',
  APPROVE = 'organization:approve',
  REJECT = 'organization:reject',
  ARCHIVE = 'organization:archive',
  RESTORE = 'organization:restore',
}

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly auditRepository: AuditRepository,
    private readonly organizationValidator: OrganizationValidator,
    private readonly permissionService: PermissionService,
    private readonly auditService: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ============================================================================
  // REGISTRATION SERVICE RESPONSIBILITIES
  // ============================================================================

  async registerOrganization(
    createDto: CreateOrganizationDTO,
    tenantId: string,
    createdBy: string,
  ): Promise<Organization> {
    // Business Rule: Duplicate organization prevention
    await this.validateUniqueOrganization(
      createDto.organizationName,
      createDto.shortName,
    );

    // Business Rule: Parent validation
    if (createDto.parentOrganizationId) {
      await this.validateParentOrganization(createDto.parentOrganizationId);
    }

    // Business Rule: Hierarchy validation (no circular dependencies)
    await this.validateHierarchyIntegrity(
      createDto.parentOrganizationId,
      createDto.organizationName,
    );

    // Transform DTO to entity
    const organization = new Organization();
    this.organizationValidator.mapCreateDtoToEntity(createDto, organization);
    organization.tenantId = tenantId;
    organization.createdBy = createdBy;
    organization.updatedBy = createdBy;
    organization.registration.verificationStatus = VerificationStatus.PENDING;

    // Create entity with repository
    const savedOrganization = await this.organizationRepository.save(organization);

    // Create audit log
    await this.auditService.logOrganizationChange(
      OrganizationOperation.CREATE,
      savedOrganization.id,
      createdBy,
      { organization: savedOrganization, registration: createDto },
    );

    // Publish domain event
    this.eventEmitter.emit('organization.registered', {
      organizationId: savedOrganization.organizationId,
      name: savedOrganization.organizationName,
      type: savedOrganization.organizationType,
      tenantId,
      createdBy,
    });

    return savedOrganization;
  }

  async updateOrganization(
    id: string,
    updateDto: UpdateOrganizationDTO,
    updatedBy: string,
  ): Promise<Organization> {
    const organization = await this.findOneOrFail(id);

    // Business Rule: Duplicate validation
    if (updateDto.organizationName) {
      await this.validateUniqueOrganization(
        updateDto.organizationName,
        organization.shortName,
        organization.id,
      );
    }

    // Business Rule: Hierarchy validation
    if (updateDto.parentOrganizationId || (updateDto.parentOrganizationId === null && organization.parentOrganizationId)) {
      await this.validateHierarchyIntegrity(
        updateDto.parentOrganizationId || null,
        updateDto.organizationName || organization.organizationName,
        organization.id,
      );
    }

    // Business Rule: Avatar validation (cannot register with existing parent)
    if (updateDto.parentOrganizationId && updateDto.parentOrganizationId === organization.id) {
      throw new BadRequestException('An organization cannot be its own parent');
    }

    // Apply updates
    this.organizationValidator.applyUpdateDto(organization, updateDto);
    organization.updatedBy = updatedBy;

    const updatedOrganization = await this.organizationRepository.save(organization);

    // Create audit log
    await this.auditService.logOrganizationChange(
      OrganizationOperation.UPDATE,
      id,
      updatedBy,
      { 
        before: { ...organization }, 
        after: { ...updatedOrganization } 
      },
    );

    // Publish domain event
    this.eventEmitter.emit('organization.updated', {
      organizationId: organization.organizationId,
      changes: updateDto,
      updatedBy,
    });

    return updatedOrganization;
  }

  async archiveOrganization(
    id: string,
    archivedBy: string,
    reason?: string,
  ): Promise<Organization> {
    const organization = await this.findOneOrFail(id);

    // Business Rule: Cannot archive already archived organizations
    if (organization.status === OrganizationStatus.ARCHIVED) {
      throw new ConflictException('Organization is already archived');
    }

    // Business Rule: Type-specific archiving constraints
    if ([OrganizationType.NATIONAL_TEAM, OrganizationType.NATIONAL_FEDERATION].includes(organization.type as OrganizationType)) {
      throw new BadRequestException('National organizations require special approval for archival');
    }

    // Set archival timestamp and status
    organization.status = OrganizationStatus.ARCHIVED;
    organization.isDeleted = true;
    organization.deletedAt = new Date();
    organization.deletedBy = archivedBy;
    organization.updatedBy = archivedBy;

    const archivedOrganization = await this.organizationRepository.save(organization);

    // Create audit log
    await this.auditService.logOrganizationChange(
      OrganizationOperation.ARCHIVE,
      id,
      archivedBy,
      { 
        organization: archivedOrganization, 
        reason,
        before: { ...organization } 
      },
    );

    // Publish domain event
    this.eventEmitter.emit('organization.archived', {
      organizationId: organization.organizationId,
      archivedBy,
      reason,
    });

    return archivedOrganization;
  }

  async restoreOrganization(
    id: string,
    restoredBy: string,
  ): Promise<Organization> {
    const organization = await this.findOneOrFail(id);

    // Business Rule: Only archived organizations can be restored
    if (organization.status !== OrganizationStatus.ARCHIVED) {
      throw new ConflictException('Only archived organizations can be restored');
    }

    // Set restore status
    organization.status = OrganizationStatus.ACTIVE;
    organization.isDeleted = false;
    organization.deletedAt = null;
    organization.deletedBy = null;
    organization.updatedBy = restoredBy;

    const restoredOrganization = await this.organizationRepository.save(organization);

    // Create audit log
    await this.auditService.logOrganizationChange(
      OrganizationOperation.RESTORE,
      id,
      restoredBy,
      { 
        organization: restoredOrganization, 
        before: { ...organization } 
      },
    );

    // Publish domain event
    this.eventEmitter.emit('organization.restored', {
      organizationId: organization.organizationId,
      restoredBy,
    });

    return restoredOrganization;
  }

  async verifyOrganization(
    id: string,
    verifyDto: PatchOrganizationVerifyDTO,
    verifiedBy: string,
  ): Promise<Organization> {
    const organization = await this.findOneOrFail(id);

    // Business Rule: Can only verify organizations that are verified
    if (organization.status !== OrganizationStatus.PENDING_VERIFICATION) {
      throw new ConflictException('Organization registration is not pending verification');
    }

    // Validate verification status enum
    if (!Object.values(VerificationStatus).includes(verifyDto.verificationStatus as VerificationStatus)) {
      throw new BadRequestException(`Invalid verification status: ${verifyDto.verificationStatus}`);
    }

    // Update registration verification status
    organization.registration.verificationStatus = verifyDto.verificationStatus as VerificationStatus;
    organization.registration.verifiedBy = verifyDto.verifiedBy;
    organization.registration.verifiedAt = verifyDto.verifiedAt;

    // Change organization status based on verification result
    if (verifyDto.verificationStatus === VerificationStatus.VERIFIED) {
      organization.status = OrganizationStatus.ACTIVE;
    } else {
      organization.status = OrganizationStatus.SUSPENDED;
    }

    organization.updatedBy = verifiedBy;

    const verifiedOrganization = await this.organizationRepository.save(organization);

    // Create audit log
    await this.auditService.logOrganizationChange(
      OrganizationOperation.VERIFY,
      id,
      verifiedBy,
      { 
        organization: verifiedOrganization, 
        verification: verifyDto, 
        before: { ...organization } 
      },
    );

    // Publish domain event
    this.eventEmitter.emit('organization.verified', {
      organizationId: organization.organizationId,
      verificationStatus: verifyDto.verificationStatus,
      verifiedBy,
      verificationDocuments: verifyDto.verificationDocuments,
    });

    return verifiedOrganization;
  }

  async approveOrganization(
    id: string,
    approvedBy: string,
  ): Promise<Organization> {
    const organization = await this.findOneOrFail(id);

    // Business Rule: Only federations or leagues can approve registrations
    if (![OrganizationType.FEDERATION, OrganizationType.LEAGUE].includes(organization.type as OrganizationType)) {
      throw new BadRequestException('Only federations and leagues can approve organization registrations');
    }

    // Check if organization is pending verification
    if (organization.status !== OrganizationStatus.PENDING_VERIFICATION) {
      throw new ConflictException('Organization registration is not pending verification');
    }

    // Approve registration
    organization.status = OrganizationStatus.ACTIVE;
    organization.updatedBy = approvedBy;

    const approvedOrganization = await this.organizationRepository.save(organization);

    // Create audit log
    await this.auditService.logOrganizationChange(
      OrganizationOperation.APPROVE,
      id,
      approvedBy,
      { 
        organization: approvedOrganization, 
        before: { ...organization } 
      },
    );

    // Publish domain event
    this.eventEmitter.emit('organization.approved', {
      organizationId: organization.organizationId,
      approvedBy,
      registrationAuthority: organization.registration.registrationAuthority,
    });

    return approvedOrganization;
  }

  async rejectOrganization(
    id: string,
    rejectedBy: string,
    rejectionReason: string,
  ): Promise<Organization> {
    const organization = await this.findOneOrFail(id);

    // Business Rule: Only federations or leagues can reject registrations
    if (![OrganizationType.FEDERATION, OrganizationType.LEAGUE].includes(organization.type as OrganizationType)) {
      throw new BadRequestException('Only federations and leagues can reject organization registrations');
    }

    // Check if organization is pending verification
    if (organization.status !== OrganizationStatus.PENDING_VERIFICATION) {
      throw new ConflictException('Organization registration is not pending verification');
    }

    // Reject registration
    organization.status = OrganizationStatus.SUSPENDED;
    organization.updatedBy = rejectedBy;

    const rejectedOrganization = await this.organizationRepository.save(organization);

    // Create audit log
    await this.auditService.logOrganizationChange(
      OrganizationOperation.REJECT,
      id,
      rejectedBy,
      { 
        organization: rejectedOrganization, 
        rejectionReason,
        before: { ...organization } 
      },
    );

    // Publish domain event
    this.eventEmitter.emit('organization.rejected', {
      organizationId: organization.organizationId,
      rejectedBy,
      rejectionReason,
    });

    return rejectedOrganization;
  }

  // ============================================================================
  // QUERY SERVICE RESPONSIBILITIES
  // ============================================================================

  async searchOrganizations(searchQuery: OrganizationSearchQuery): Promise<Organization[]> {
    const filter = this.organizationValidator.buildSearchFilter(searchQuery);
    return this.organizationRepository.find(filter);
  }

  async getAllOrganizations(
    tenantId?: string,
  ): Promise<Organization[]> {
    return this.organizationRepository.findAll(tenantId);
  }

  async findOneOrFail(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne(id);
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return organization;
  }

  async getByOrganizationId(organizationId: string): Promise<Organization | null> {
    return this.organizationRepository.findByOrganizationId(organizationId);
  }

  async getByCode(code: string): Promise<Organization | null> {
    return this.organizationRepository.findByCode(code);
  }

  async getByRegistrationNumber(regNumber: string): Promise<Organization | null> {
    return this.organizationRepository.findByRegistrationNumber(regNumber);
  }

  async findByName(name: string, tenantId: string): Promise<Organization[]> {
    return this.organizationRepository.findByName(name, tenantId);
  }

  // ============================================================================
  // BUSINESS RULE VALIDATION
  // ============================================================================

  private async validateUniqueOrganization(
    name: string,
    shortName: string,
    existingId?: string,
  ): Promise<void> {
    const existingByName = await this.organizationRepository.findByName(name, 'global');
    if (existingByName && existingId && existingByName.id === existingId) {
      return; // Same organization, no conflict
    }
    if (existingByName && existingByName.id !== existingId) {
      throw new ConflictException(`Organization name '${name}' is already in use`);
    }

    const existingByCode = await this.organizationRepository.findByCode(shortName);
    if (existingByCode && existingByCode.id !== existingId) {
      throw new ConflictException(`Organization code '${shortName}' is already in use`);
    }
  }

  private async validateParentOrganization(parentId: string): Promise<void> {
    const parent = await this.findOneOrFail(parentId);
    if (parent.status !== OrganizationStatus.ACTIVE) {
      throw new BadRequestException(`Parent organization must be active to have child organizations`);
    }
    if ([OrganizationType.NATIONAL_TEAM, OrganizationType.NATIONAL_FEDERATION].includes(parent.type as OrganizationType)) {
      throw new BadRequestException('National organizations cannot have child organizations');
    }
  }

  private async validateHierarchyIntegrity(
    parentOrganizationId: string | null,
    organizationName: string,
    existingId?: string,
  ): Promise<void> {
    if (parentOrganizationId === existingId) {
      throw new BadRequestException('An organization cannot be its own parent');
    }

    if (!parentOrganizationId) {
      return; // No parent, no validation needed
    }

    const parent = await this.organizationRepository.findOne(parentOrganizationId);
    if (!parent) {
      throw new BadRequestException('Parent organization does not exist');
    }

    // Check for potential circular dependencies
    const organizations = await this.organizationRepository.findAll('global');
    const checkForCycles = (currentId: string, parentId: string, visited: Set<string>): boolean => {
      if (currentId === parentId) {
        return true; // Cycle detected
      }
      if (visited.has(currentId)) {
        return false; // Already visited this branch
      }
      visited.add(currentId);

      const currentOrg = organizations.find(o => o.id === currentId);
      if (!currentOrg || !currentOrg.parentOrganizationId) {
        return false; // Reached root
      }

      return checkForCycles(currentOrg.parentOrganizationId, parentId, visited);
    };

    if (checkForCycles(existingId || '', parentOrganizationId, new Set())) {
      throw new BadRequestException('Hierarchy would create a circular dependency');
    }
  }

  async getOrganizationStatistics(tenantId: string): Promise<any> {
    return this.organizationRepository.getStatistics(tenantId);
  }

  async getHierarchyTree(
    rootId: string,
    maxDepth: number = 5,
  ): Promise<any> {
    return this.organizationRepository.findByHierarchy(rootId, maxDepth);
  }

  async validateMembershipEligibility(
    organizationId: string,
    leagueId: string,
    season: string,
  ): Promise<boolean> {
    const organization = await this.findOneOrFail(organizationId);
    const hasActiveMembership = await this.organizationRepository.hasActiveMembership(
      organizationId,
      leagueId,
      season,
    );
    if (hasActiveMembership) {
      throw new ConflictException(`Organization already has active membership in ${leagueId} for ${season}`);
    }
    return true;
  }
}