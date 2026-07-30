import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { VenueService } from '../services/venue.service';
import { VenueValidator } from '../validators/venue.validator';
import {
  CreateVenueDTO,
  UpdateVenueDTO,
  VenueSearchDTO,
  VenueResponseDTO,
  VenueSummaryDTO,
} from '../dto/venue.dto';

@ApiTags('Venues')
@Controller('api/v1/venues')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class VenueController {
  constructor(
    private readonly venueService: VenueService,
    private readonly venueValidator: VenueValidator,
  ) {}

  @Post()
  @Permissions('venue:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new venue' })
  @ApiResponse({ status: 201, description: 'Venue created successfully', type: VenueResponseDTO })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Venue already exists' })
  async create(@Body() dto: CreateVenueDTO): Promise<VenueResponseDTO> {
    await this.venueValidator.validateCreate(dto);
    return this.venueService.create(dto);
  }

  @Get()
  @Permissions('venue:read')
  @ApiOperation({ summary: 'List venues with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Venues retrieved successfully' })
  async findAll(@Query() searchDto: VenueSearchDTO) {
    return this.venueService.search(searchDto);
  }

  @Get('active')
  @Permissions('venue:read')
  @ApiOperation({ summary: 'Get active venues' })
  @ApiResponse({ status: 200, description: 'Active venues retrieved successfully' })
  async getActive() {
    return this.venueService.findActive();
  }

  @Get('upcoming')
  @Permissions('venue:read')
  @ApiOperation({ summary: 'Get upcoming venues' })
  @ApiResponse({ status: 200, description: 'Upcoming venues retrieved successfully' })
  async getUpcoming() {
    return this.venueService.findUpcoming();
  }

  @Get('completed')
  @Permissions('venue:read')
  @ApiOperation({ summary: 'Get completed venues' })
  @ApiResponse({ status: 200, description: 'Completed venues retrieved successfully' })
  async getCompleted() {
    return this.venueService.findCompleted();
  }

  @Get(':id')
  @Permissions('venue:read')
  @ApiOperation({ summary: 'Get venue by ID' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({ status: 200, description: 'Venue found', type: VenueResponseDTO })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  async findById(@Param('id') id: string): Promise<VenueResponseDTO> {
    return this.venueService.findById(id);
  }

  @Put(':id')
  @Permissions('venue:update')
  @ApiOperation({ summary: 'Update venue' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({ status: 200, description: 'Venue updated successfully', type: VenueResponseDTO })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVenueDTO,
  ): Promise<VenueResponseDTO> {
    return this.venueService.update(id, dto);
  }

  @Patch(':id/verify')
  @Permissions('venue:verify')
  @ApiOperation({ summary: 'Verify venue registration' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({ status: 200, description: 'Venue verified successfully' })
  async verify(@Param('id') id: string): Promise<VenueResponseDTO> {
    return this.venueService.verify(id);
  }

  @Patch(':id/approve')
  @Permissions('venue:approve')
  @ApiOperation({ summary: 'Approve venue registration' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({ status: 200, description: 'Venue approved successfully' })
  async approve(@Param('id') id: string): Promise<VenueResponseDTO> {
    return this.venueService.approve(id);
  }

  @Patch(':id/reject')
  @Permissions('venue:reject')
  @ApiOperation({ summary: 'Reject venue registration' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({ status: 200, description: 'Venue rejected successfully' })
  async reject(
    @Param('id') id: string,
    @Body() dto: { rejectionReason: string },
  ): Promise<VenueResponseDTO> {
    return this.venueService.reject(id, dto.rejectionReason);
  }

  @Delete(':id')
  @Permissions('venue:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive venue (soft delete)' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({ status: 204, description: 'Venue archived successfully' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  @ApiResponse({ status: 409, description: 'Venue already archived' })
  async archive(@Param('id') id: string): Promise<void> {
    await this.venueService.archive(id);
  }

  @Post(':id/restore')
  @Permissions('venue:restore')
  @ApiOperation({ summary: 'Restore archived venue' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({ status: 200, description: 'Venue restored successfully', type: VenueResponseDTO })
  @ApiResponse({ status: 400, description: 'Venue not archived' })
  async restore(@Param('id') id: string): Promise<VenueResponseDTO> {
    return this.venueService.restore(id);
  }

  @Post(':id/teams')
  @Permissions('venue:manageTeams')
  @ApiOperation({ summary: 'Register team to venue' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({ status: 200, description: 'Team registered successfully' })
  async assignTeam(
    @Param('id') id: string,
    @Body() dto: { teamId: string },
  ): Promise<VenueResponseDTO> {
    return this.venueService.assignTeam(id, dto.teamId);
  }

  @Delete(':id/teams/:teamId')
  @Permissions('venue:manageTeams')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unregister team from venue' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  @ApiResponse({ status: 204, description: 'Team unregistered successfully' })
  async removeTeam(
    @Param('id') id: string,
    @Param('teamId') teamId: string,
  ): Promise<void> {
    await this.venueService.unassignTeam(id, teamId);
  }

  @Post(':id/facilities')
  @Permissions('venue:manageFacilities')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add facility to venue' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({ status: 201, description: 'Facility added successfully' })
  async addFacility(
    @Param('id') id: string,
    @Body() dto: { facilityId: string },
  ): Promise<VenueResponseDTO> {
    return this.venueService.addFacility(id, dto.facilityId);
  }

  @Delete(':id/facilities/:facilityId')
  @Permissions('venue:manageFacilities')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove facility from venue' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiParam({ name: 'facilityId', description: 'Facility ID' })
  @ApiResponse({ status: 204, description: 'Facility removed successfully' })
  async removeFacility(
    @Param('id') id: string,
    @Param('facilityId') facilityId: string,
  ): Promise<void> {
    await this.venueService.removeFacility(id, facilityId);
  }

  @Post(':id/documents')
  @Permissions('venue:manageDocuments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload venue document' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  async uploadDocument(
    @Param('id') id: string,
    @Body() dto: { documentId: string },
  ): Promise<VenueResponseDTO> {
    return this.venueService.addDocument(id, dto.documentId);
  }

  @Delete(':id/documents/:documentId')
  @Permissions('venue:manageDocuments')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove venue document' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiParam({ name: 'documentId', description: 'Document ID' })
  @ApiResponse({ status: 204, description: 'Document removed successfully' })
  async removeDocument(
    @Param('id') id: string,
    @Param('documentId') documentId: string,
  ): Promise<void> {
    await this.venueService.removeDocument(id, documentId);
  }

  @Get(':id/statistics')
  @Permissions('venue:read')
  @ApiOperation({ summary: 'Get venue statistics' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics(@Param('id') id: string) {
    return this.venueService.getStatistics(id);
  }

  @Get(':id/hierarchy')
  @Permissions('venue:read')
  @ApiOperation({ summary: 'Get venue hierarchy tree' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({ status: 200, description: 'Hierarchy retrieved successfully' })
  async getHierarchy(@Param('id') id: string) {
    return this.venueService.getHierarchy(id);
  }
}