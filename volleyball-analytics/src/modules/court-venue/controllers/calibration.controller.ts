import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CalibrationService } from '../services/calibration.service';
import { CreateCalibrationProfileDto, UpdateCalibrationProfileDto, ActivateCalibrationDto, ValidateCalibrationDto, CalibrationProfileSearchDto } from '../dtos/calibration.dto';
import { ApiResponseBuilder } from '@shared/api-response';

@ApiTags('Calibrations')
@ApiBearerAuth()
@Controller('calibrations')
export class CalibrationController {
  constructor(private readonly calibrationService: CalibrationService) {}

  @Post()
  @ApiOperation({ summary: 'Create calibration profile' })
  @ApiResponse({ status: 201, description: 'Calibration profile created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Active calibration already exists for camera' })
  async createCalibration(@Body() createCalibrationDto: CreateCalibrationProfileDto) {
    const calibration = await this.calibrationService.createCalibration(createCalibrationDto, 'system');
    return ApiResponseBuilder.success(calibration, 'Calibration profile created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List calibration profiles with search and pagination' })
  @ApiQuery({ name: 'cameraInstallationId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'method', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async getCalibrations(@Query() searchDto: CalibrationProfileSearchDto) {
    const result = await this.calibrationService.getCalibrations(searchDto);
    return ApiResponseBuilder.paginated(result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }, 'Calibration profiles retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get calibration profile by ID' })
  @ApiParam({ name: 'id', description: 'Calibration profile ID' })
  @ApiResponse({ status: 200, description: 'Calibration profile found' })
  @ApiResponse({ status: 404, description: 'Calibration profile not found' })
  async getCalibrationById(@Param('id') id: string) {
    const calibration = await this.calibrationService.getCalibrationById(id);
    return ApiResponseBuilder.success(calibration, 'Calibration profile retrieved successfully');
  }

  @Get('camera/:cameraInstallationId/active')
  @ApiOperation({ summary: 'Get active calibration for camera' })
  @ApiParam({ name: 'cameraInstallationId', description: 'Camera installation ID' })
  @ApiResponse({ status: 200, description: 'Active calibration profile found' })
  @ApiResponse({ status: 404, description: 'No active calibration found' })
  async getActiveCalibration(@Param('cameraInstallationId') cameraInstallationId: string) {
    const calibration = await this.calibrationService.getActiveCalibration(cameraInstallationId);
    return ApiResponseBuilder.success(calibration, 'Active calibration profile retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update calibration profile' })
  @ApiParam({ name: 'id', description: 'Calibration profile ID' })
  @ApiResponse({ status: 200, description: 'Calibration profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update active calibration' })
  @ApiResponse({ status: 404, description: 'Calibration profile not found' })
  async updateCalibration(@Param('id') id: string, @Body() updateDto: UpdateCalibrationProfileDto) {
    const calibration = await this.calibrationService.updateCalibration(id, updateDto, 'system');
    return ApiResponseBuilder.success(calibration, 'Calibration profile updated successfully');
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate calibration profile' })
  @ApiParam({ name: 'id', description: 'Calibration profile ID' })
  @ApiResponse({ status: 200, description: 'Calibration profile activated successfully' })
  @ApiResponse({ status: 400, description: 'Already active or accuracy requirements not met' })
  @ApiResponse({ status: 404, description: 'Calibration profile not found' })
  async activateCalibration(@Param('id') id: string, @Body() activateDto: ActivateCalibrationDto) {
    const calibration = await this.calibrationService.activateCalibration(id, activateDto);
    return ApiResponseBuilder.success(calibration, 'Calibration profile activated successfully');
  }

  @Post(':id/validate')
  @ApiOperation({ summary: 'Validate calibration profile' })
  @ApiParam({ name: 'id', description: 'Calibration profile ID' })
  @ApiResponse({ status: 200, description: 'Calibration validated successfully' })
  @ApiResponse({ status: 400, description: 'Not pending validation' })
  @ApiResponse({ status: 404, description: 'Calibration profile not found' })
  async validateCalibration(@Param('id') id: string, @Body() validateDto: ValidateCalibrationDto) {
    const calibration = await this.calibrationService.validateCalibration(id, validateDto, 'system');
    return ApiResponseBuilder.success(calibration, 'Calibration profile validated successfully');
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive calibration profile' })
  @ApiParam({ name: 'id', description: 'Calibration profile ID' })
  @ApiResponse({ status: 200, description: 'Calibration profile archived successfully' })
  @ApiResponse({ status: 404, description: 'Calibration profile not found' })
  async archiveCalibration(@Param('id') id: string) {
    const calibration = await this.calibrationService.archiveCalibration(id, 'system');
    return ApiResponseBuilder.success(calibration, 'Calibration profile archived successfully');
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get calibration statistics' })
  @ApiResponse({ status: 200, description: 'Calibration statistics retrieved successfully' })
  async getCalibrationStats() {
    const stats = await this.calibrationService.getCalibrationStats();
    return ApiResponseBuilder.success(stats, 'Calibration statistics retrieved successfully');
  }
}