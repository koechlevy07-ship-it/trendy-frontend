/**
 * Organization Controller - Chapter 11 Part 3
 * 
 * REST API controller for organization operations exposing all organization endpoints
 * according to Chapter 11 Part 3 specification.
 */

import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

import { CreateOrganizationDTO, UpdateOrganizationDTO, PatchOrganizationVerifyDTO, OrganizationSearchQuery } from '../dto/organization.dto';
import { OrganizationService } from '../services/organization.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../../shared/types/request';

@ApiTags('organizations')
@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  // ============================================================================
  // ORGANIZATION REGISTRATION SERVICE RESPONSIBILITIES
  // ============================================================================

  @Post()
  @ApiOperation({ summary: 'Register organization', description: 'Create a new organization' })
  @ApiBody({ type: CreateOrganizationDTO })
  @ApiResponse({ status: 201, description: 'Organization registered successfully' })
  async create(
    @Body() createDto: CreateOrganizationDTO,
    @Request() req: RequestWithUser,
  ) {
    return this.organizationService.registerOrganization(createDto, req.user.tenantId, req.user.id);
  }

  // ============================================================================
  // ORGANIZATION QUERY SERVICE RESPONSIBILITIES
  // ============================================================================

  @Get()
  @ApiOperation({ summary: 'List organizations', description: 'Get all organizations with pagination' })
  @ApiResponse({ status: 200, description: 'Organizations retrieved successfully' })
  async findAll(
    @Query('tenantId') tenantId: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.organizationService.getAllOrganizations(tenantId, page, perPage);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID', description: 'Retrieve a specific organization' })
  @ApiResponse({ status: 200, description: 'Organization retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async findOne(@Param('id') id: string) {
    return this.organizationService.findOneOrFail(id);
  }

  @Get(':organizationId/code/:code')
  @ApiOperation({ summary: 'Get organization by code', description: 'Retrieve organization by short code' })
  @ApiResponse({ status: 200, description: 'Organization retrieved successfully' })
  async findByCode(@Param('organizationId') organizationId: string, @Param('code') code: string) {
    return this.organizationService.getByCode(code);
  }

  @Get(':organizationId/registration/:registrationNumber')
  @ApiOperation({ summary: 'Get organization by registration', description: 'Retrieve organization by registration number' })
  @ApiResponse({ status: 200, description: 'Organization retrieved successfully' })
  async findByRegistrationNumber(@Param('organizationId') organizationId: string, @Param('registrationNumber') regNumber: string) {
    return this.organizationService.getByRegistrationNumber(regNumber);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search organizations', description: 'Search organizations with filters' })
  @ApiResponse({ status: 200, description: 'Organizations found' })
  async search(@Query() searchQuery: OrganizationSearchQuery) {
    return this.organizationService.searchOrganizations(searchQuery);
  }

  @Get(':id/hierarchy')
  @ApiOperation({ summary: 'Get organization hierarchy', description: 'Retrieve organization hierarchy tree' })
  @ApiResponse({ status: 200, description: 'Hierarchy retrieved successfully' })
  async getHierarchy(@Param('id') id: string) {
    return this.organizationService.getHierarchyTree(id);
  }

  // ============================================================================
  // ORGANIZATION OPERATIONS SERVICE RESPONSIBILITIES
  // ============================================================================

  @Put(':id')
  @ApiOperation({ summary: 'Update organization', description: 'Update organization profile' })
  @ApiBody({ type: UpdateOrganizationDTO })
  @ApiResponse({ status: 200, description: 'Organization updated successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrganizationDTO,
    @Request() req: RequestWithUser,
  ) {
    return this.organizationService.updateOrganization(id, updateDto, req.user.id);
  }

  @Patch(':id/verify')
  @ApiOperation({ summary: 'Verify organization', description: 'Verify organization registration' })
  @ApiBody({ type: PatchOrganizationVerifyDTO })
  @ApiResponse({ status: 200, description: 'Organization verified successfully' })
  async verify(
    @Param('id') id: string,
    @Body() verifyDto: PatchOrganizationVerifyDTO,
    @Request() req: RequestWithUser,
  ) {
    return this.organizationService.verifyOrganization(id, verifyDto, req.user.id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve organization', description: 'Approve organization registration' })
  @ApiResponse({ status: 200, description: 'Organization approved successfully' })
  async approve(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ) {
    return this.organizationService.approveOrganization(id, req.user.id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject organization', description: 'Reject organization registration' })
  @ApiBody({ schema: { type: 'object', properties: { rejectionReason: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Organization rejected successfully' })
  async reject(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: RequestWithUser,
  ) {
    return this.organizationService.rejectOrganization(id, req.user.id, body.rejectionReason);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive organization', description: 'Archive organization' })
  @ApiResponse({ status: 200, description: 'Organization archived successfully' })
  async archive(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ) {
    return this.organizationService.archiveOrganization(id, req.user.id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore organization', description: 'Restore archived organization' })
  @ApiResponse({ status: 200, description: 'Organization restored successfully' })
  async restore(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ) {
    return this.organizationService.restoreOrganization(id, req.user.id);
  }

  // ============================================================================
  // ORGANIZATION SPECIFIC OPERATIONS
  // ============================================================================

  @Post(':id/administrators')
  @ApiOperation({ summary: 'Assign administrator', description: 'Assign administrator to organization' })
  @ApiResponse({ status: 200, description: 'Administrator assigned successfully' })
  async assignAdministrator(
    @Param('id') id: string,
    @Body() adminData: any,
    @Request() req: RequestWithUser,
  ) {
    return this.organizationService.assignAdministrator(id, adminData, req.user.id);
  }

  @Post(':id/documents')
  @ApiOperation({ summary: 'Upload document', description: 'Upload organization document' })
  @ApiResponse({ status: 200, description: 'Document uploaded successfully' })
  async uploadDocument(
    @Param('id') id: string,
    @Body() documentData: any,
    @Request() req: RequestWithUser,
  ) {
    return this.organizationService.uploadDocument(id, documentData, req.user.id);
  }

  @Post(':id/licenses')
  @ApiOperation({ summary: 'Manage license', description: 'Manage organization license' })
  @ApiResponse({ status: 200, description: 'License managed successfully' })
  async manageLicense(
    @Param('id') id: string,
    @Body() licenseData: any,
    @Request() req: RequestWithUser,
  ) {
    return this.organizationService.manageLicense(id, licenseData, req.user.id);
  }

  @Patch(':id/branding')
  @ApiOperation({ summary: 'Update branding', description: 'Update organization branding' })
  @ApiResponse({ status: 200, description: 'Organization branding updated successfully' })
  async updateBranding(
    @Param('id') id: string,
    @Body() brandingData: any,
    @Request() req: RequestWithUser,
  ) {
    return this.organizationService.updateBranding(id, brandingData, req.user.id);
  }

  @Post(':id/facilities/:facilityId')
  @ApiOperation({ summary: 'Link facility', description: 'Link facility to organization' })
  @ApiResponse({ status: 200, description: 'Facility linked successfully' })
  async linkFacility(
    @Param('id') id: string,
    @Param('facilityId') facilityId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.organizationService.linkFacility(id, facilityId, req.user.id);
  }

  @Patch(':id/ai-metadata')
  @ApiOperation({ summary: 'Update AI metadata', description: 'Update organization AI metadata' })
  @ApiResponse({ status: 200, description: 'Organization AI metadata updated successfully' })
  async updateAIMetadata(
    @Param('id') id: string,
    @Body() aiMetadataData: any,
    @Request() req: RequestWithUser,
  ) {
    return this.organizationService.updateAIMetadata(id, aiMetadataData, req.user.id);
  }

  // ============================================================================
  // ORGANIZATION STATISTICS AND OPERATIONS
  // ============================================================================

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get organization statistics', description: 'Get comprehensive organization statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStatistics(@Param('id') id: string) {
    return this.organizationService.getOrganizationStatistics(id);
  }

  @Get(':id/health')
  @ApiOperation({ summary: 'Get organization health', description: 'Get organization health status' })
  @ApiResponse({ status: 200, description: 'Organization health retrieved' })
  async getHealth(@Param('id') id: string) {
    return this.organizationService.getOrganizationHealth(id);
  }

  @Get(':id/compliance')
  @ApiOperation({ summary: 'Get compliance status', description: 'Get organization compliance status' })
  @ApiResponse({ status: 200, description: 'Compliance status retrieved' })
  async getCompliance(@Param('id') id: string) {
    return this.organizationService.getComplianceStatus(id);
  }

  @Post(':id/validate-memberships')
  @ApiOperation({ summary: 'Validate memberships', description: 'Validate membership eligibility' })
  @ApiResponse({ status: 200, description: 'Membership eligibility validated' })
  async validateMemberships(
    @Param('id') id: string,
    @Body() membershipData: any,
    @Request() req: RequestWithUser,
  ) {
    return this.organizationService.validateMembershipEligibility(id, membershipData);
  }

  @Get(':id/audit-logs')
  @ApiOperation({ summary: 'Get audit logs', description: 'Retrieve organization audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved' })
  async getAuditLogs(@Param('id') id: string) {
    return this.organizationService.getAuditLogs(id);
  }

  @Get(':id/teams')
  @ApiOperation({ summary: 'Get organization teams', description: 'Retrieve all teams for organization' })
  @ApiResponse({ status: 200, description: 'Teams retrieved successfully' })
  async getOrganizationTeams(@Param('id') id: string) {
    return this.organizationService.getOrganizationTeams(id);
  }

  @Get(':id/facilities')
  @ApiOperation({ summary: 'Get organization facilities', description: 'Retrieve all facilities for organization' })
  @ApiResponse({ status: 200, description: 'Facilities retrieved successfully' })
  async getOrganizationFacilities(@Param('id') id: string) {
    return this.organizationService.getOrganizationFacilities(id);
  }
}