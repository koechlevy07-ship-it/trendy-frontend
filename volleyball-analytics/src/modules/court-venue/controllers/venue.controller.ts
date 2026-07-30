import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { VenueService } from '../services/venue.service';
import { CreateVenueDto, UpdateVenueDto, ActivateVenueDto, SuspendVenueDto, VenueSearchDto } from '../dtos/venue.dto';
import { ApiResponseBuilder } from '@shared/api-response';

@ApiTags('Venues')
@ApiBearerAuth()
@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new venue' })
  @ApiResponse({ status: 201, description: 'Venue registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Venue code or name already exists' })
  async createVenue(@Body() createVenueDto: CreateVenueDto) {
    const venue = await this.venueService.createVenue(createVenueDto, 'system');
    return ApiResponseBuilder.success(venue, 'Venue registered successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List venues with search and pagination' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'venueType', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'organizationId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'latitude', required: false, type: Number })
  @ApiQuery({ name: 'longitude', required: false, type: Number })
  @ApiQuery({ name: 'maxDistanceKm', required: false, type: Number })
  async getVenues(@Query() searchDto: VenueSearchDto) {
    const result = await this.venueService.getVenues(searchDto);
    return ApiResponseBuilder.paginated(result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }, 'Venues retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get venue by ID' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({ status: 200, description: 'Venue found' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  async getVenueById(@Param('id') id: string) {
    const venue = await this.venueService.getVenueById(id);
    return ApiResponseBuilder.success(venue, 'Venue retrieved successfully');
  }

  @Get('code/:venueCode')
  @ApiOperation({ summary: 'Get venue by venue code' })
  @ApiParam({ name: 'venueCode', description: 'Venue code' })
  @ApiResponse({ status: 200, description: 'Venue found' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  async getVenueByCode(@Param('venueCode') venueCode: string) {
    const venue = await this.venueService.getVenueByCode(venueCode);
    return ApiResponseBuilder.success(venue, 'Venue retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update venue' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({ status: 200, description: 'Venue updated successfully' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  @ApiResponse({ status: 409, description: 'Venue name already exists' })
  async updateVenue(@Param('id') id: string, @Body() updateVenueDto: UpdateVenueDto) {
    const venue = await this.venueService.updateVenue(id, updateVenueDto, 'system');
    return ApiResponseBuilder.success(venue, 'Venue updated successfully');
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate venue' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({ status: 200, description: 'Venue activated successfully' })
  @ApiResponse({ status: 400, description: 'Venue already active or certification required' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  async activateVenue(@Param('id') id: string, @Body() activateDto: ActivateVenueDto) {
    const venue = await this.venueService.activateVenue(id, activateDto);
    return ApiResponseBuilder.success(venue, 'Venue activated successfully');
  }

  @Patch(':id/suspend')
  @ApiOperation({ summary: 'Suspend venue' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({ status: 200, description: 'Venue suspended successfully' })
  @ApiResponse({ status: 400, description: 'Venue already suspended or archived' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  async suspendVenue(@Param('id') id: string, @Body() suspendDto: SuspendVenueDto) {
    const venue = await this.venueService.suspendVenue(id, suspendDto);
    return ApiResponseBuilder.success(venue, 'Venue suspended successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive venue' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({ status: 200, description: 'Venue archived successfully' })
  @ApiResponse({ status: 400, description: 'Venue already archived or active' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  async archiveVenue(@Param('id') id: string) {
    await this.venueService.archiveVenue(id, 'system');
    return ApiResponseBuilder.success(null, 'Venue archived successfully');
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore archived venue' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({ status: 200, description: 'Venue restored successfully' })
  @ApiResponse({ status: 400, description: 'Venue is not archived' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  async restoreVenue(@Param('id') id: string) {
    const venue = await this.venueService.restoreVenue(id, 'system');
    return ApiResponseBuilder.success(venue, 'Venue restored successfully');
  }

  @Get('organization/:organizationId')
  @ApiOperation({ summary: 'Get venues by organization' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getVenuesByOrganization(@Param('organizationId') organizationId: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.venueService.getVenuesByOrganization(organizationId, page, limit);
    return ApiResponseBuilder.paginated(result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }, 'Venues retrieved successfully');
  }

  @Get('stats/:organizationId')
  @ApiOperation({ summary: 'Get venue statistics for organization' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  async getVenueStats(@Param('organizationId') organizationId: string) {
    const stats = await this.venueService.getVenueStats(organizationId);
    return ApiResponseBuilder.success(stats, 'Venue statistics retrieved successfully');
  }
}