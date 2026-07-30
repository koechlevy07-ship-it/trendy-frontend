import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Venue } from '../modules/court-venue/schemas/venue.schema';
import { Court } from '../modules/court-venue/schemas/court.schema';
import { Camera } from '../modules/court-venue/schemas/camera.schema';
import { CalibrationProfile } from '../modules/court-venue/schemas/calibration.schema';
import { Facility } from '../modules/court-venue/schemas/facility.schema';
import { Equipment } from '../modules/court-venue/schemas/equipment.schema';
import { Sensor } from '../modules/court-venue/schemas/sensor.schema';
import { ApiResponseBuilder } from '../../shared/api-response';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectModel(Venue.name) private venueModel: Model<Venue>,
    @InjectModel(Court.name) private courtModel: Model<Court>,
    @InjectModel(Camera.name) private cameraModel: Model<Camera>,
    @InjectModel(CalibrationProfile.name) private calibrationModel: Model<any>,
    @InjectModel(Facility.name) private facilityModel: Model<Facility>,
    @InjectModel(Equipment.name) private equipmentModel: Model<any>,
    @InjectModel(Sensor.name) private sensorModel: Model<any>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  async livenessProbe() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service not ready' })
  async readinessProbe() {
    try {
      await Promise.all([
        this.venueModel.countDocuments({ status: 'active' }).limit(1).exec(),
        this.courtModel.countDocuments({ status: 'active' }).limit(1).exec(),
      ]);
      
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'connected',
          venues: 'accessible',
          courts: 'accessible',
        },
      };
    } catch (error) {
      return {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('metrics')
  @ApiOperation({ summary: 'System metrics' })
  @ApiResponse({ status: 200, description: 'System metrics retrieved' })
  async getMetrics() {
    try {
      const [
        totalVenues,
        activeVenues,
        totalCourts,
        activeCourts,
        totalCameras,
        activeCameras,
        activeCalibrations,
        totalFacilities,
        totalEquipment,
        activeSensors,
      ] = await Promise.all([
        this.venueModel.countDocuments().exec(),
        this.venueModel.countDocuments({ status: 'active' }).exec(),
        this.courtModel.countDocuments().exec(),
        this.courtModel.countDocuments({ status: 'active' }).exec(),
        this.cameraModel.countDocuments().exec(),
        this.cameraModel.countDocuments({ status: 'active' }).exec(),
        this.calibrationModel.countDocuments({ status: 'active' }).exec(),
        this.facilityModel.countDocuments().exec(),
        this.equipmentModel.countDocuments().exec(),
        this.sensorModel.countDocuments({ status: 'active' }).exec(),
      ]);
      
      return {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        metrics: {
          venues: { total: totalVenues, active: activeVenues },
          courts: { total: totalCourts, active: activeCourts },
          cameras: { total: totalCameras, active: activeCameras },
          calibrations: { active: activeCalibrations },
          facilities: { total: totalFacilities },
          equipment: { total: totalEquipment },
          sensors: { active: activeSensors },
        },
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
        },
      };
    } catch (error) {
      return {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Failed to retrieve metrics',
      };
    }
  }
}