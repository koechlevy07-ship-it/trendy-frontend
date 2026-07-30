/**
 * Organization Validator - Chapter 11 Part 3
 * 
 * Validation framework for organization operations including duplicate checks,
 * hierarchy validation, and business rule enforcement.
 */

import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organization } from '../entities/organization.entity';
import { CreateOrganizationDTO, UpdateOrganizationDTO } from '../dto/organization.dto';
import { OrganizationType } from '../schemas/organization.model';

@Injectable()
export class OrganizationValidator {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  // ============================================================================
  // VALIDATION FOR CREATION
  // ============================================================================

  async validateCreateOrganization(createDto: CreateOrganizationDTO): Promise<void> {
    // Validate required fields
    this.validateRequiredFields(createDto);

    // Validate organization type
    if (!Object.values(OrganizationType).includes(createDto.organizationType)) {
      throw new BadRequestException(`Invalid organization type: ${createDto.organizationType}`);
    }

    // Validate country format (2-letter ISO code)
    if (createDto.country.length !== 2 || !/^[A-Z]{2}$/i.test(createDto.country)) {
      throw new BadRequestException('Country must be a 2-letter ISO code (e.g., US, GB)');
    }

    // Validate organization name format
    if (!createDto.organizationName.trim()) {
      throw new BadRequestException('Organization name cannot be empty');
    }

    // Validate short name format
    if (!createDto.shortName || createDto.shortName.length > 20) {
      throw new BadRequestException('Short name must be 20 characters or less');
    }

    // Validate display name
    if (!createDto.displayName.trim()) {
      throw new BadRequestException('Display name cannot be empty');
    }

    // Validate email format if provided
    if (createDto.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createDto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Validate phone format if provided
    if (createDto.phone && !/^[+\d\s\-\(\)]{1,50}$/.test(createDto.phone)) {
      throw new BadRequestException('Invalid phone format');
    }

    // Validate website format if provided
    if (createDto.website && !/^https?:\/\/.+/.test(createDto.website)) {
      throw new BadRequestException('Invalid website URL format');
    }

    // Validate organization type constraints
    this.validateOrganizationTypeConstraints(createDto);

    // Validate parent organization if provided
    if (createDto.parentOrganizationId) {
      await this.validateParentOrganization(createDto.parentOrganizationId);
    }

    // Validate hierarchy integrity
    await this.validateHierarchyIntegrityForCreate(
      createDto.parentOrganizationId,
      createDto.organizationName,
    );
  }

  async validateUpdateOrganization(
    updateDto: UpdateOrganizationDTO,
    existingOrganization: Organization,
  ): Promise<void> {
    // If name is being updated, validate uniqueness
    if (updateDto.organizationName) {
      if (!updateDto.organizationName.trim()) {
        throw new BadRequestException('Organization name cannot be empty');
      }
      await this.validateUniqueOrganization(
        updateDto.organizationName,
        existingOrganization.shortName,
        existingOrganization.id,
      );
    }

    // If short name is being updated, validate uniqueness and format
    if (updateDto.shortName) {
      if (updateDto.shortName.length > 20) {
        throw new BadRequestException('Short name must be 20 characters or less');
      }
      await this.validateUniqueOrganization(
        existingOrganization.organizationName,
        updateDto.shortName,
        existingOrganization.id,
      );
    }

    // If display name is being updated, validate format
    if (updateDto.displayName && !updateDto.displayName.trim()) {
      throw new BadRequestException('Display name cannot be empty');
    }

    // If country is being updated, validate format
    if (updateDto.country && (updateDto.country.length !== 2 || !/^[A-Z]{2}$/i.test(updateDto.country))) {
      throw new BadRequestException('Country must be a 2-letter ISO code');
    }

    // If parent organization is being updated, validate
    if ('parentOrganizationId' in updateDto) {
      if (updateDto.parentOrganizationId === existingOrganization.id) {
        throw new BadRequestException('An organization cannot be its own parent');
      }
      if (updateDto.parentOrganizationId) {
        await this.validateParentOrganization(updateDto.parentOrganizationId);
      }
      await this.validateHierarchyIntegrityForUpdate(
        updateDto.parentOrganizationId || null,
        updateDto.organizationName || existingOrganization.organizationName,
        existingOrganization.id,
      );
    }

    // Validate organization type constraints if type is being updated
    if ('organizationType' in updateDto) {
      this.validateOrganizationTypeConstraints({
        ...updateDto,
        parentOrganizationId: updateDto.parentOrganizationId ?? ''
      });
    }
  }

  async validateVerificationDto(
    verifyDto: any,
    organization: Organization,
  ): Promise<void> {
    // Validate verification status
    const validStatuses = ['pending', 'verified', 'rejected', 'expired'];
    if (!validStatuses.includes(verifyDto.verificationStatus)) {
      throw new BadRequestException(`Invalid verification status: ${verifyDto.verificationStatus}`);
    }

    // Business rule: Can only verify organizations that are pending verification
    if (organization.status !== 'pending_verification') {
      throw new ConflictException('Organization registration is not pending verification');
    }

    // Business rule: Only federations or leagues can approve/reject
    const approvingTypes = ['federation', 'league'];
    if (!approvingTypes.includes(organization.type)) {
      throw new BadRequestException('Only federations and leagues can approve/reject registrations');
    }

    // Validate verification document formats if provided
    if (verifyDto.verificationDocuments?.length) {
      for (const doc of verifyDto.verificationDocuments) {
        if (!doc.match(/^\w+\.pdf$/)) {
          throw new BadRequestException('Invalid verification document format');
        }
      }
    }
  }

  async validateSearchQuery(query: any): Promise<void> {
    // Validate query pagination parameters
    if (query.page && query.page < 1) {
      throw new BadRequestException('Page must be greater than or equal to 1');
    }

    if (query.perPage && (query.perPage < 1 || query.perPage > 100)) {
      throw new BadRequestException('Per page must be between 1 and 100');
    }

    // Validate sort parameters
    if (query.sortBy && !['createdAt', 'updatedAt', 'organizationName', 'status', 'type'].includes(query.sortBy)) {
      throw new BadRequestException('Invalid sort field');
    }

    if (query.sortOrder && !['asc', 'desc'].includes(query.sortOrder)) {
      throw new BadRequestException('Sort order must be "asc" or "desc"');
    }
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  private validateRequiredFields(createDto: CreateOrganizationDTO): void {
    if (!createDto.organizationName || !createDto.organizationName.trim()) {
      throw new BadRequestException('Organization name is required');
    }
    if (!createDto.shortName || !createDto.shortName.trim()) {
      throw new BadRequestException('Short name is required');
    }
    if (!createDto.displayName || !createDto.displayName.trim()) {
      throw new BadRequestException('Display name is required');
    }
    if (!createDto.organizationType) {
      throw new BadRequestException('Organization type is required');
    }
    if (!createDto.country || !createDto.country.trim()) {
      throw new BadRequestException('Country is required');
    }
    if (!createDto.city || !createDto.city.trim()) {
      throw new BadRequestException('City is required');
    }
    if (!createDto.physicalAddress || !createDto.physicalAddress.trim()) {
      throw new BadRequestException('Physical address is required');
    }
    if (!createDto.registration || !createDto.registration.registrationNumber) {
      throw new BadRequestException('Registration number is required');
    }
  }

  private validateOrganizationTypeConstraints(createDto: CreateOrganizationDTO): void {
    const nationalTypes = ['national_team', 'national_federation'];
    const federationTypes = ['federation', 'regional_federation'];

    if (nationalTypes.includes(createDto.organizationType)) {
      throw new BadRequestException('National organizations must be registered directly with the governing body');
    }

    if (federationTypes.includes(createDto.organizationType) && !createDto.governingBodyId) {
      throw new BadRequestException('Federations must have a governing body ID');
    }

    if (createDto.organizationType === 'club' && !createDto.parentOrganizationId) {
      throw new BadRequestException('Clubs must belong to a league or federation');
    }
  }

  private async validateParentOrganization(parentId: string): Promise<void> {
    const parent = await this.organizationRepository.findOne(parentId);
    if (!parent) {
      throw new BadRequestException('Parent organization does not exist');
    }
    if (parent.status !== 'active') {
      throw new BadRequestException('Parent organization must be active');
    }
    if (['national_team', 'national_federation'].includes(parent.type)) {
      throw new BadRequestException('National organizations cannot have child organizations');
    }
  }

  private async validateUniqueOrganization(
    name: string,
    shortName: string,
    excludeId?: string,
  ): Promise<void> {
    const existingByName = await this.organizationRepository
      .createQueryBuilder('organization')
      .where('organization.organizationName = :name', { name })
      .andWhere('organization.id != :excludeId', { excludeId: excludeId || null })
      .getOne();

    if (existingByName) {
      throw new ConflictException(`Organization name '${name}' is already in use`);
    }

    const existingByCode = await this.organizationRepository
      .createQueryBuilder('organization')
      .where('organization.shortName = :shortName', { shortName })
      .andWhere('organization.id != :excludeId', { excludeId: excludeId || null })
      .getOne();

    if (existingByCode) {
      throw new ConflictException(`Organization code '${shortName}' is already in use`);
    }
  }

  private async validateHierarchyIntegrityForCreate(
    parentId: string | null,
    organizationName: string,
  ): Promise<void> {
    if (!parentId) {
      return;
    }

    const parent = await this.organizationRepository.findOne(parentId);
    if (!parent) {
      throw new BadRequestException('Parent organization does not exist');
    }

    // Check for potential circular dependencies
    const allOrganizations = await this.organizationRepository.find();
    const checkForCycles = (currentId: string, parentId: string, visited: Set<string>): boolean => {
      if (currentId === parentId) {
        return true;
      }
      if (visited.has(currentId)) {
        return false;
      }
      visited.add(currentId);

      const currentOrg = allOrganizations.find(o => o.id === currentId);
      if (!currentOrg || !currentOrg.parentOrganizationId) {
        return false;
      }

      return checkForCycles(currentOrg.parentOrganizationId, parentId, visited);
    };

    // Get the existing organization ID during validation
    const existingOrgId = allOrganizations.find(o => o.organizationName === organizationName)?.id;
    if (existingOrgId) {
      if (checkForCycles(existingOrgId, parentId, new Set())) {
        throw new BadRequestException('Hierarchy would create a circular dependency');
      }
    }
  }

  private async validateHierarchyIntegrityForUpdate(
    parentId: string | null,
    organizationName: string,
    excludeId: string,
  ): Promise<void> {
    if (parentId === excludeId) {
      throw new BadRequestException('An organization cannot be its own parent');
    }

    if (!parentId) {
      return;
    }

    const parent = await this.organizationRepository.findOne(parentId);
    if (!parent) {
      throw new BadRequestException('Parent organization does not exist');
    }

    // Check for potential circular dependencies
    const allOrganizations = await this.organizationRepository.find();
    const checkForCycles = (currentId: string, parentId: string, visited: Set<string>): boolean => {
      if (currentId === parentId) {
        return true;
      }
      if (visited.has(currentId)) {
        return false;
      }
      visited.add(currentId);

      const currentOrg = allOrganizations.find(o => o.id === currentId);
      if (!currentOrg || !currentOrg.parentOrganizationId) {
        return false;
      }

      return checkForCycles(currentOrg.parentOrganizationId, parentId, visited);
    };

    if (checkForCycles(excludeId, parentId, new Set())) {
      throw new BadRequestException('Hierarchy would create a circular dependency');
    }
  }

  // ============================================================================
  // MAPPING FUNCTIONS
  // ============================================================================

  mapCreateDtoToEntity(createDto: CreateOrganizationDTO, entity: Organization): Organization {
    entity.organizationName = createDto.organizationName.trim();
    entity.shortName = createDto.shortName.trim();
    entity.displayName = createDto.displayName.trim();
    entity.type = createDto.organizationType as any;
    entity.website = createDto.website;
    entity.phone = createDto.phone;
    entity.email = createDto.email;
    entity.primaryContactPerson = createDto.primaryContactPerson;
    entity.primaryContactPhone = createDto.primaryContactPhone;
    entity.supportEmail = createDto.supportEmail;
    entity.country = createDto.country.trim();
    entity.stateProvince = createDto.stateProvince?.trim();
    entity.city = createDto.city.trim();
    entity.postalCode = createDto.postalCode?.trim();
    entity.physicalAddress = createDto.physicalAddress.trim();
    entity.organizationAdmin = createDto.organizationAdmin?.trim();
    entity.logo = createDto.logo;
    entity.primaryColor = createDto.primaryColor;
    entity.secondaryColor = createDto.secondaryColor;
    entity.accentColor = createDto.accentColor;
    entity.governingBodyId = createDto.governingBodyId?.trim();
    entity.governingBodyName = createDto.governingBodyName?.trim();
    entity.affiliationDate = createDto.affiliationDate;
    entity.governanceTier = createDto.governanceTier || 0;
    entity.dataRegion = createDto.dataRegion || 'global';

    // Map nested objects
    if (createDto.address) {
      entity.address = Object.assign({}, createDto.address);
    }
    if (createDto.contact) {
      entity.contact = Object.assign({}, createDto.contact);
    }
    if (createDto.registration) {
      entity.registration = Object.assign({}, createDto.registration);
    }
    if (createDto.branding) {
      entity.branding = Object.assign({}, createDto.branding);
    }
    if (createDto.aiMetadata) {
      entity.aiMetadata = Object.assign({}, createDto.aiMetadata);
    }

    // Set parent organization if provided
    if (createDto.parentOrganizationId) {
      entity.parentOrganizationId = createDto.parentOrganizationId;
    }

    return entity;
  }

  applyUpdateDto(entity: Organization, updateDto: UpdateOrganizationDTO): Organization {
    if (updateDto.organizationName) {
      entity.organizationName = updateDto.organizationName.trim();
    }
    if (updateDto.shortName) {
      entity.shortName = updateDto.shortName.trim();
    }
    if (updateDto.displayName) {
      entity.displayName = updateDto.displayName.trim();
    }
    if (updateDto.organizationType) {
      entity.type = updateDto.organizationType as any;
    }
    if (updateDto.website !== undefined) {
      entity.website = updateDto.website;
    }
    if (updateDto.phone !== undefined) {
      entity.phone = updateDto.phone;
    }
    if (updateDto.email !== undefined) {
      entity.email = updateDto.email;
    }
    if (updateDto.primaryContactPerson !== undefined) {
      entity.primaryContactPerson = updateDto.primaryContactPerson;
    }
    if (updateDto.primaryContactPhone !== undefined) {
      entity.primaryContactPhone = updateDto.primaryContactPhone;
    }
    if (updateDto.supportEmail !== undefined) {
      entity.supportEmail = updateDto.supportEmail;
    }
    if (updateDto.country !== undefined) {
      entity.country = updateDto.country?.trim() || '';
    }
    if (updateDto.stateProvince !== undefined) {
      entity.stateProvince = updateDto.stateProvince?.trim();
    }
    if (updateDto.city !== undefined) {
      entity.city = updateDto.city?.trim() || '';
    }
    if (updateDto.postalCode !== undefined) {
      entity.postalCode = updateDto.postalCode?.trim();
    }
    if (updateDto.physicalAddress !== undefined) {
      entity.physicalAddress = updateDto.physicalAddress?.trim();
    }
    if (updateDto.organizationAdmin !== undefined) {
      entity.organizationAdmin = updateDto.organizationAdmin?.trim();
    }
    if (updateDto.logo !== undefined) {
      entity.logo = updateDto.logo;
    }
    if (updateDto.primaryColor !== undefined) {
      entity.primaryColor = updateDto.primaryColor;
    }
    if (updateDto.secondaryColor !== undefined) {
      entity.secondaryColor = updateDto.secondaryColor;
    }
    if (updateDto.accentColor !== undefined) {
      entity.accentColor = updateDto.accentColor;
    }
    if (updateDto.governingBodyId !== undefined) {
      entity.governingBodyId = updateDto.governingBodyId?.trim();
    }
    if (updateDto.governingBodyName !== undefined) {
      entity.governingBodyName = updateDto.governingBodyName?.trim();
    }
    if (updateDto.affiliationDate !== undefined) {
      entity.affiliationDate = updateDto.affiliationDate;
    }
    if (updateDto.governanceTier !== undefined) {
      entity.governanceTier = updateDto.governanceTier || 0;
    }
    if (updateDto.dataRegion !== undefined) {
      entity.dataRegion = updateDto.dataRegion || 'global';
    }

    // Map nested objects if provided
    if (updateDto.address) {
      entity.address = Object.assign(entity.address || {}, updateDto.address);
    }
    if (updateDto.contact) {
      entity.contact = Object.assign(entity.contact || {}, updateDto.contact);
    }
    if (updateDto.registration) {
      entity.registration = Object.assign(entity.registration || {}, updateDto.registration);
    }
    if (updateDto.branding) {
      entity.branding = Object.assign(entity.branding || {}, updateDto.branding);
    }
    if (updateDto.aiMetadata) {
      entity.aiMetadata = Object.assign(entity.aiMetadata || {}, updateDto.aiMetadata);
    }

    // Update parent organization if provided
    if ('parentOrganizationId' in updateDto) {
      entity.parentOrganizationId = updateDto.parentOrganizationId || null;
    }

    return entity;
  }

  buildSearchFilter(searchQuery: any): any {
    const filter: any = {};

    if (searchQuery.query) {
      filter.organizationName = { $regex: searchQuery.query, $options: 'i' };
    }

    if (searchQuery.type) {
      filter.type = searchQuery.type;
    }

    if (searchQuery.status) {
      filter.status = searchQuery.status;
    }

    if (searchQuery.tenantId) {
      filter.tenantId = searchQuery.tenantId;
    }

    if (searchQuery.parentOrganizationId) {
      filter.parentOrganizationId = searchQuery.parentOrganizationId;
    }

    return filter;
  }
}