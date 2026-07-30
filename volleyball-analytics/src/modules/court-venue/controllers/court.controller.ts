import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CourtService } from '../services/court.service';
import { CreateCourtDto, UpdateCourtDto, ActivateCourtDto, SetMaintenanceDto, AssignCameraDto, CourtSearchDto } from '../dtos/court.dto';
import { ApiResponseBuilder } from '@shared/api-response';

@ApiTags('Courts')
@ApiBearerAuth()
@Controller('courts')
export class CourtController {
  constructor(private readonly courtService: CourtService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new court' })
  @ApiResponse({ status: 201, description: 'Court registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Court code already exists in venue' })
  async createCourt(@Body() createCourtDto: CreateCourtDto) {
    const court = await this.courtService.createCourt(createCourtDto);
    return ApiResponseBuilder.success(court, 'Court registered successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List courts with search and pagination' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'venueId', required: false, type: String })
  @ApiQuery({ name: 'courtType', required: false, type: String })
  @ApiQuery({ name: 'surfaceType', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'maintenanceStatus', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async getCourts(@Query() searchDto: CourtSearchDto) {
    const result = await this.courtService.getCourts(searchDto);
    return ApiResponseBuilder.paginated(result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }, 'Courts retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get court by ID' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Court found' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async getCourtById(@Param('id') id: string) {
    const court = await this.courtService.getCourtById(id);
    return ApiResponseBuilder.success(court, 'Court retrieved successfully');
  }

  @Get('venue/:venueId')
  @ApiOperation({ summary: 'Get courts by venue' })
  @ApiParam({ name: 'venueId', description: 'Venue ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getCourtsByVenue(@Param('venueId') venueId: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.courtService.getCourtsByVenue(venueId, page, limit);
    return ApiResponseBuilder.paginated(result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }, 'Courts retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Court updated successfully' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async updateCourt(@Param('id') id: string, @Body() updateCourtDto: UpdateCourtDto) {
    const court = await this.courtService.updateCourt(id, updateCourtDto);
    return ApiResponseBuilder.success(court, 'Court updated successfully');
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Court activated successfully' })
  @ApiResponse({ status: 400, description: 'Court already active or under maintenance' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async activateCourt(@Param('id') id: string, @Body() activateDto: ActivateCourtDto) {
    const court = await this.courtService.activateCourt(id, activateDto.activatedBy);
    return ApiResponseBuilder.success(court, 'Court activated successfully');
  }

  @Patch(':id/maintenance')
  @ApiOperation({ summary: 'Set court maintenance mode' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Maintenance mode updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot set maintenance on active court' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async setMaintenance(@Param('id') id: string, @Body() maintenanceDto: SetMaintenanceDto) {
    const court = await this.courtService.setMaintenance(id, maintenanceDto);
    return ApiResponseBuilder.success(court, maintenanceDto.isUnderMaintenance ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
  }

  @Post(':id/cameras')
  @ApiOperation({ summary: 'Assign camera to court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Camera assigned successfully' })
  @ApiResponse({ status: 404, description: 'Court or camera not found' })
  @ApiResponse({ status: 400, description: 'Camera already assigned to another court' })
  async assignCamera(@Param('id') id: string, @Body() assignDto: AssignCameraDto) {
    const court = await this.courtService.assignCamera(id, assignDto.cameraId);
    return ApiResponseBuilder.success(court, 'Camera assigned to court successfully');
  }

  @Delete(':id/cameras/:cameraId')
  @ApiOperation({ summary: 'Remove camera from court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiParam({ name: 'cameraId', description: 'Camera ID' })
  @ApiResponse({ status: 200, description: 'Camera removed successfully' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async removeCamera(@Param('id') id: string, @Param('cameraId') cameraId: string) {
    const court = await this.courtService.removeCamera(id, cameraId);
    return ApiResponseBuilder.success(court, 'Camera removed from court successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Court archived successfully' })
  @ApiResponse({ status: 400, description: 'Cannot archive active court' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async archiveCourt(@Param('id') id: string) {
    await this.courtService.archiveCourt(id, 'system');
    return ApiResponseBuilder.success(null, 'Court archived successfully');
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore archived court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Court restored successfully' })
  @ApiResponse({ status: 400, description: 'Court is not archived' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async restoreCourt(@Param('id') id: string) {
    const court = await this.courtService.restoreCourt(id, 'system');
    return ApiResponseBuilder.success(court, 'Court restored successfully');
  }

  @Get('stats/:venueId')
  @ApiOperation({ summary: 'Get court statistics for venue' })
  @ApiParam({ name: 'venueId', description: 'Venue ID' })
async getCourtStats(@Param('venueId') venueId: string) {
    const stats = await this.courtService.getCourtStats(venueId);
    return ApiResponseBuilder.success(stats, 'Court statistics retrieved successfully');
  }
}