import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CameraService } from '../services/camera.service';
import { CreateCameraDto, UpdateCameraDto, ActivateCameraDto, CalibrateCameraDto, CameraSearchDto } from '../dtos/camera.dto';
import { ApiResponseBuilder } from '@shared/api-response';

@ApiTags('Cameras')
@ApiBearerAuth()
@Controller('cameras')
export class CameraController {
  constructor(private readonly cameraService: CameraService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new camera' })
  @ApiResponse({ status: 201, description: 'Camera registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Camera ID or serial number already exists' })
  async createCamera(@Body() createCameraDto: CreateCameraDto) {
    const camera = await this.cameraService.createCamera(createCameraDto, 'system');
    return ApiResponseBuilder.success(camera, 'Camera registered successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List cameras with search and pagination' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'courtId', required: false, type: String })
  @ApiQuery({ name: 'manufacturer', required: false, type: String })
  @ApiQuery({ name: 'mountType', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async getCameras(@Query() searchDto: CameraSearchDto) {
    const result = await this.cameraService.getCameras(searchDto);
    return ApiResponseBuilder.paginated(result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }, 'Cameras retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get camera by ID' })
  @ApiParam({ name: 'id', description: 'Camera ID' })
  @ApiResponse({ status: 200, description: 'Camera found' })
  @ApiResponse({ status: 404, description: 'Camera not found' })
  async getCameraById(@Param('id') id: string) {
    const camera = await this.cameraService.getCameraById(id);
    return ApiResponseBuilder.success(camera, 'Camera retrieved successfully');
  }

  @Get('court/:courtId')
  @ApiOperation({ summary: 'Get cameras by court' })
  @ApiParam({ name: 'courtId', description: 'Court ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getCamerasByCourt(
    @Param('courtId') courtId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20
  ) {
    const result = await this.cameraService.getCamerasByCourt(courtId, page, limit);
    return ApiResponseBuilder.paginated(result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }, 'Cameras retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update camera' })
  @ApiParam({ name: 'id', description: 'Camera ID' })
  @ApiResponse({ status: 200, description: 'Camera updated successfully' })
  @ApiResponse({ status: 404, description: 'Camera not found' })
  async updateCamera(@Param('id') id: string, @Body() updateCameraDto: UpdateCameraDto) {
    const camera = await this.cameraService.updateCamera(id, updateCameraDto, 'system');
    return ApiResponseBuilder.success(camera, 'Camera updated successfully');
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate camera' })
  @ApiParam({ name: 'id', description: 'Camera ID' })
  @ApiResponse({ status: 200, description: 'Camera activated successfully' })
  @ApiResponse({ status: 400, description: 'Camera already active' })
  @ApiResponse({ status: 404, description: 'Camera not found' })
  async activateCamera(@Param('id') id: string) {
    const camera = await this.cameraService.activateCamera(id);
    return ApiResponseBuilder.success(camera, 'Camera activated successfully');
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate camera' })
  @ApiParam({ name: 'id', description: 'Camera ID' })
  @ApiResponse({ status: 200, description: 'Camera deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Camera not found' })
  async deactivateCamera(@Param('id') id: string) {
    const camera = await this.cameraService.deactivateCamera(id);
    return ApiResponseBuilder.success(camera, 'Camera deactivated successfully');
  }

  @Patch(':id/calibrate')
  @ApiOperation({ summary: 'Assign calibration profile to camera' })
  @ApiParam({ name: 'id', description: 'Camera ID' })
  @ApiResponse({ status: 200, description: 'Calibration profile assigned successfully' })
  @ApiResponse({ status: 400, description: 'Calibration profile not active' })
  @ApiResponse({ status: 404, description: 'Camera or calibration profile not found' })
  async calibrateCamera(@Param('id') id: string, @Body() calibrateDto: CalibrateCameraDto) {
    const camera = await this.cameraService.assignCalibrationProfile(id, calibrateDto.calibrationProfileId, 'system');
    return ApiResponseBuilder.success(camera, 'Calibration profile assigned successfully');
  }

  @Post(':id/coverage-zones/:zoneId')
  @ApiOperation({ summary: 'Assign coverage zone to camera' })
  @ApiParam({ name: 'id', description: 'Camera ID' })
  @ApiParam({ name: 'zoneId', description: 'Coverage zone ID' })
  @ApiResponse({ status: 200, description: 'Coverage zone assigned successfully' })
  @ApiResponse({ status: 404, description: 'Camera or coverage zone not found' })
  async assignCoverageZone(@Param('id') id: string, @Param('zoneId') zoneId: string) {
    const camera = await this.cameraService.assignCoverageZone(id, zoneId);
    return ApiResponseBuilder.success(camera, 'Coverage zone assigned successfully');
  }

  @Delete(':id/coverage-zones/:zoneId')
  @ApiOperation({ summary: 'Remove coverage zone from camera' })
  @ApiParam({ name: 'id', description: 'Camera ID' })
  @ApiParam({ name: 'zoneId', description: 'Coverage zone ID' })
  @ApiResponse({ status: 200, description: 'Coverage zone removed successfully' })
  @ApiResponse({ status: 404, description: 'Camera not found' })
  async removeCoverageZone(@Param('id') id: string, @Param('zoneId') zoneId: string) {
    const camera = await this.cameraService.removeCoverageZone(id, zoneId);
    return ApiResponseBuilder.success(camera, 'Coverage zone removed successfully');
  }

  @Patch(':id/heartbeat')
  @ApiOperation({ summary: 'Update camera heartbeat' })
  @ApiParam({ name: 'id', description: 'Camera ID' })
  @ApiResponse({ status: 200, description: 'Heartbeat updated successfully' })
  @ApiResponse({ status: 404, description: 'Camera not found' })
  async updateHeartbeat(@Param('id') id: string) {
    const camera = await this.cameraService.updateHeartbeat(id);
    return ApiResponseBuilder.success(camera, 'Heartbeat updated successfully');
  }

  @Get('court/:courtId/stats')
  @ApiOperation({ summary: 'Get camera statistics for court' })
  @ApiParam({ name: 'courtId', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Camera statistics retrieved successfully' })
  async getCameraStats(@Param('courtId') courtId: string) {
    const stats = await this.cameraService.getCameraStats(courtId);
    return ApiResponseBuilder.success(stats, 'Camera statistics retrieved successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Decommission camera' })
  @ApiParam({ name: 'id', description: 'Camera ID' })
  @ApiResponse({ status: 200, description: 'Camera decommissioned successfully' })
  @ApiResponse({ status: 404, description: 'Camera not found' })
  async decommissionCamera(@Param('id') id: string) {
    const camera = await this.cameraService.decommissionCamera(id);
    return ApiResponseBuilder.success(camera, 'Camera decommissioned successfully');
  }
}