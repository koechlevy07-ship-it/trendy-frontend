import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FacilityService } from '../services/facility.service';
import { CreateFacilityDto, UpdateFacilityDto } from '../dtos/facility.dto';
import { FacilityStatus } from '../schemas/facility.schema';
import { ApiResponseBuilder } from '@shared/api-response';

@ApiTags('Facilities')
@ApiBearerAuth()
@Controller('facilities')
export class FacilityController {
  constructor(private readonly facilityService: FacilityService) {}

  @Post()
  @ApiOperation({ summary: 'Create facility' })
  @ApiResponse({ status: 201, description: 'Facility created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Facility code already exists in venue' })
  async createFacility(@Body() createFacilityDto: CreateFacilityDto) {
    const facility = await this.facilityService.createFacility(createFacilityDto);
    return ApiResponseBuilder.success(facility, 'Facility created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List facilities with search and pagination' })
  @ApiQuery({ name: 'venueId', required: false, type: String })
  @ApiQuery({ name: 'facilityType', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFacilities(
    @Query('venueId') venueId?: string,
    @Query('facilityType') facilityType?: string,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20
  ) {
    const result = await this.facilityService.getFacilitiesByVenue(venueId, page, limit);
    return ApiResponseBuilder.paginated(result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }, 'Facilities retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get facility by ID' })
  @ApiParam({ name: 'id', description: 'Facility ID' })
  @ApiResponse({ status: 200, description: 'Facility found' })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  async getFacilityById(@Param('id') id: string) {
    const facility = await this.facilityService.getFacilityById(id);
    return ApiResponseBuilder.success(facility, 'Facility retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update facility' })
  @ApiParam({ name: 'id', description: 'Facility ID' })
  @ApiResponse({ status: 200, description: 'Facility updated successfully' })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  async updateFacility(@Param('id') id: string, @Body() updateFacilityDto: UpdateFacilityDto) {
    const facility = await this.facilityService.updateFacility(id, updateFacilityDto);
    return ApiResponseBuilder.success(facility, 'Facility updated successfully');
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update facility status' })
  @ApiParam({ name: 'id', description: 'Facility ID' })
  @ApiResponse({ status: 200, description: 'Facility status updated successfully' })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  async updateFacilityStatus(@Param('id') id: string, @Body('status') status: string) {
    const facility = await this.facilityService.updateStatus(id, status as any);
    return ApiResponseBuilder.success(facility, 'Facility status updated successfully');
  }

  @Post(':id/equipment/:equipmentId')
  @ApiOperation({ summary: 'Assign equipment to facility' })
  @ApiParam({ name: 'id', description: 'Facility ID' })
  @ApiParam({ name: 'equipmentId', description: 'Equipment ID' })
  @ApiResponse({ status: 200, description: 'Equipment assigned successfully' })
  @ApiResponse({ status: 404, description: 'Facility or equipment not found' })
  async assignEquipment(@Param('id') id: string, @Param('equipmentId') equipmentId: string) {
    const facility = await this.facilityService.assignEquipment(id, equipmentId);
    return ApiResponseBuilder.success(facility, 'Equipment assigned successfully');
  }

  @Delete(':id/equipment/:equipmentId')
  @ApiOperation({ summary: 'Remove equipment from facility' })
  @ApiParam({ name: 'id', description: 'Facility ID' })
  @ApiParam({ name: 'equipmentId', description: 'Equipment ID' })
  @ApiResponse({ status: 200, description: 'Equipment removed successfully' })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  async removeEquipment(@Param('id') id: string, @Param('equipmentId') equipmentId: string) {
    const facility = await this.facilityService.removeEquipment(id, equipmentId);
    return ApiResponseBuilder.success(facility, 'Equipment removed successfully');
  }

  @Post(':id/utilization')
  @ApiOperation({ summary: 'Update facility utilization' })
  @ApiParam({ name: 'id', description: 'Facility ID' })
  @ApiResponse({ status: 200, description: 'Utilization updated successfully' })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  async updateUtilization(@Param('id') id: string, @Body('hoursUsed') hoursUsed: number) {
    const facility = await this.facilityService.updateUtilization(id, hoursUsed);
    return ApiResponseBuilder.success(facility, 'Utilization updated successfully');
  }

  @Post(':id/maintenance-schedule')
  @ApiOperation({ summary: 'Update maintenance schedule' })
  @ApiParam({ name: 'id', description: 'Facility ID' })
  @ApiResponse({ status: 200, description: 'Maintenance schedule updated successfully' })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  async updateMaintenanceSchedule(
    @Param('id') id: string,
    @Body('lastMaintenance') lastMaintenance: Date,
    @Body('nextMaintenance') nextMaintenance: Date
  ) {
    const facility = await this.facilityService.updateMaintenanceSchedule(id, lastMaintenance, nextMaintenance);
    return ApiResponseBuilder.success(facility, 'Maintenance schedule updated successfully');
  }

  @Get('stats/:venueId')
  @ApiOperation({ summary: 'Get facility statistics for venue' })
  @ApiParam({ name: 'venueId', description: 'Venue ID' })
  @ApiResponse({ status: 200, description: 'Facility statistics retrieved successfully' })
  async getFacilityStats(@Param('venueId') venueId: string) {
    const stats = await this.facilityService.getFacilityStats(venueId);
    return ApiResponseBuilder.success(stats, 'Facility statistics retrieved successfully');
  }

  @Patch(':id/decommission')
  @ApiOperation({ summary: 'Decommission facility' })
  @ApiParam({ name: 'id', description: 'Facility ID' })
  @ApiResponse({ status: 200, description: 'Facility decommissioned successfully' })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  async decommissionFacility(@Param('id') id: string, @Body('reason') reason: string) {
    const facility = await this.facilityService.decommissionFacility(id, reason);
    return ApiResponseBuilder.success(facility, 'Facility decommissioned successfully');
  }
}