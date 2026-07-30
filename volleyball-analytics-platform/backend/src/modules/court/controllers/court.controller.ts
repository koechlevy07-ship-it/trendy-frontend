/**
 * Court Controller - Chapter 13 Part 1
 * 
 * REST API endpoints for Court management
 */

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
import { CourtService } from '../services/court.service';
import { CourtValidator } from '../validators/court.validator';
import {
  CreateCourtDTO,
  UpdateCourtDTO,
  CourtSearchDTO,
  CourtResponseDTO,
  CourtSummaryDTO,
  CourtStatusUpdateDTO,
} from '../dto/court.dto';

@ApiTags('Courts')
@Controller('api/v1/courts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CourtController {
  constructor(
    private readonly courtService: CourtService,
    private readonly courtValidator: CourtValidator,
  ) {}

  @Post()
  @Permissions('court:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new court' })
  @ApiResponse({ status: 201, description: 'Court created successfully', type: CourtResponseDTO })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Court already exists' })
  async create(@Body() dto: CreateCourtDTO): Promise<CourtResponseDTO> {
    await this.courtValidator.validateCreate(dto);
    return this.courtService.create(dto);
  }

  @Get()
  @Permissions('court:read')
  @ApiOperation({ summary: 'List courts with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Courts retrieved successfully' })
  async findAll(@Query() searchDto: CourtSearchDTO) {
    return this.courtService.search(searchDto);
  }

  @Get('available')
  @Permissions('court:read')
  @ApiOperation({ summary: 'Get available courts' })
  @ApiQuery({ name: 'venueId', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiResponse({ status: 200, description: 'Available courts retrieved successfully' })
  async getAvailableCourts(
    @Query('venueId') venueId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.courtService.getAvailableCourts(venueId, dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined);
  }

  @Get(':id')
  @Permissions('court:read')
  @ApiOperation({ summary: 'Get court by ID' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Court found', type: CourtResponseDTO })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async findById(@Param('id') id: string): Promise<CourtResponseDTO> {
    return this.courtService.findById(id);
  }

  @Get('court-id/:courtId')
  @Permissions('court:read')
  @ApiOperation({ summary: 'Get court by court ID' })
  @ApiParam({ name: 'courtId', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Court found', type: CourtResponseDTO })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async findByCourtId(@Param('courtId') courtId: string): Promise<CourtResponseDTO> {
    return this.courtService.findByCourtId(courtId);
  }

  @Put(':id')
  @Permissions('court:update')
  @ApiOperation({ summary: 'Update court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Court updated successfully', type: CourtResponseDTO })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourtDTO,
  ): Promise<CourtResponseDTO> {
    return this.courtService.update(id, dto);
  }

  @Patch(':id/status')
  @Permissions('court:update')
  @ApiOperation({ summary: 'Update court status' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Status updated successfully', type: CourtResponseDTO })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: CourtStatusUpdateDTO,
  ): Promise<CourtResponseDTO> {
    return this.courtService.updateStatus(id, dto.status);
  }

  @Patch(':id/activate')
  @Permissions('court:activate')
  @ApiOperation({ summary: 'Activate court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Court activated successfully', type: CourtResponseDTO })
  @ApiResponse({ status: 400, description: 'Court not ready for activation' })
  async activate(@Param('id') id: string): Promise<CourtResponseDTO> {
    return this.courtService.activate(id);
  }

  @Patch(':id/deactivate')
  @Permissions('court:deactivate')
  @ApiOperation({ summary: 'Deactivate court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Court deactivated successfully', type: CourtResponseDTO })
  @ApiResponse({ status: 400, description: 'Court not active' })
  async deactivate(@Param('id') id: string): Promise<CourtResponseDTO> {
    return this.courtService.deactivate(id);
  }

  @Patch(':id/archive')
  @Permissions('court:archive')
  @ApiOperation({ summary: 'Archive court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Court archived successfully', type: CourtResponseDTO })
  @ApiResponse({ status: 400, description: 'Court already archived' })
  async archive(@Param('id') id: string): Promise<CourtResponseDTO> {
    return this.courtService.archive(id);
  }

  @Patch(':id/restore')
  @Permissions('court:restore')
  @ApiOperation({ summary: 'Restore archived court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Court restored successfully', type: CourtResponseDTO })
  @ApiResponse({ status: 400, description: 'Court not archived' })
  async restore(@Param('id') id: string): Promise<CourtResponseDTO> {
    return this.courtService.restore(id);
  }

  @Patch(':id/calibrate')
  @Permissions('court:calibrate')
  @ApiOperation({ summary: 'Update court AI calibration profile' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Calibration profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async updateCalibration(
    @Param('id') id: string,
    @Body() dto: { profileId: string; enabledModules?: string[]; confidenceThreshold?: number },
  ): Promise<CourtResponseDTO> {
    return this.courtService.updateCalibration(id, dto);
  }

  @Post(':id/cameras')
  @Permissions('court:manageCameras')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add camera reference to court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 201, description: 'Camera reference added successfully' })
  async addCamera(
    @Param('id') id: string,
    @Body() dto: {
      cameraId: string;
      cameraName: string;
      position: number[];
      rotation: number[];
      lensType?: string;
      focalLength?: number;
      coverageZone?: string;
      calibrationProfile?: string;
    },
  ) {
    return this.courtService.addCameraReference(id, dto);
  }

  @Delete(':id/cameras/:cameraRefId')
  @Permissions('court:manageCameras')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove camera reference from court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiParam({ name: 'cameraRefId', description: 'Camera Reference ID' })
  @ApiResponse({ status: 204, description: 'Camera reference removed successfully' })
  async removeCamera(@Param('id') id: string, @Param('cameraRefId') cameraRefId: string) {
    return this.courtService.removeCameraReference(id, cameraRefId);
  }

  @Post(':id/calibration-profiles')
  @Permissions('court:calibrate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add AI calibration profile to court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 201, description: 'Calibration profile added successfully' })
  async addCalibrationProfile(
    @Param('id') id: string,
    @Body() dto: {
      profileId: string;
      name: string;
      description?: string;
      enabledModules?: string[];
      confidenceThreshold?: number;
      realTimeProcessing?: boolean;
      customConfig?: Record<string, any>;
    },
  ) {
    return this.courtService.addCalibrationProfile(id, dto);
  }

  @Delete(':id/calibration-profiles/:profileId')
  @Permissions('court:calibrate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove AI calibration profile from court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiParam({ name: 'profileId', description: 'Calibration Profile ID' })
  @ApiResponse({ status: 204, description: 'Calibration profile removed successfully' })
  async removeCalibrationProfile(@Param('id') id: string, @Param('profileId') profileId: string) {
    return this.courtService.removeCalibrationProfile(id, profileId);
  }

  @Patch(':id/availability')
  @Permissions('court:manageAvailability')
  @ApiOperation({ summary: 'Update court availability' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Availability updated successfully' })
  async updateAvailability(
    @Param('id') id: string,
    @Body() dto: {
      status?: 'available' | 'booked' | 'maintenance' | 'blocked' | 'reserved';
      availableFrom?: Date;
      availableUntil?: Date;
      recurringSchedule?: Record<string, any>;
    },
  ) {
    return this.courtService.updateAvailability(id, dto);
  }

  @Get(':id/availability')
  @Permissions('court:read')
  @ApiOperation({ summary: 'Get court availability' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiResponse({ status: 200, description: 'Availability retrieved successfully' })
  async getAvailability(
    @Param('id') id: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.courtService.getAvailability(id, dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined);
  }

  @Get(':id/statistics')
  @Permissions('court:read')
  @ApiOperation({ summary: 'Get court statistics' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics(@Param('id') id: string) {
    return this.courtService.getStatistics(id);
  }

  @Get(':id/health')
  @Permissions('court:read')
  @ApiOperation({ summary: 'Get court health/status' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Health status retrieved successfully' })
  async getHealth(@Param('id') id: string) {
    return this.courtService.getHealth(id);
  }

  @Delete(':id')
  @Permissions('court:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive court (soft delete)' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 204, description: 'Court archived successfully' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  @ApiResponse({ status: 409, description: 'Court already archived or live' })
  async archive(@Param('id') id: string): Promise<void> {
    return this.courtService.archive(id);
  }

  @Post(':id/restore')
  @Permissions('court:restore')
  @ApiOperation({ summary: 'Restore archived court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Court restored successfully', type: CourtResponseDTO })
  @ApiResponse({ status: 400, description: 'Court not archived' })
  async restore(@Param('id') id: string): Promise<CourtResponseDTO> {
    return this.courtService.restore(id);
  }
}