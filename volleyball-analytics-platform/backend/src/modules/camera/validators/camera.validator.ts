import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Camera, CameraDocument, CameraType, CameraStatus, CameraResolution, StreamProtocol } from '../schemas/camera.schema';
import { CameraCalibration, CameraCalibrationDocument } from '../schemas/camera.schema';

@Injectable()
export class CameraValidator {
  constructor(
    @InjectModel('Camera') private readonly cameraModel: Model<CameraDocument>,
    @InjectModel('CameraCalibration') private readonly calibrationModel: Model<CameraCalibrationDocument>,
  ) {}

  async validateCreateCamera(dto: any): Promise<void> {
    // Validate camera ID uniqueness
    const existingById = await this.cameraModel.findOne({ cameraId: dto.cameraId }).exec();
    if (existingById) {
      throw new ConflictException(`Camera with ID '${dto.cameraId}' already exists`);
    }

    // Validate camera ID format
    if (!/^[a-zA-Z0-9_-]{1,50}$/.test(dto.cameraId)) {
      throw new BadRequestException('Camera ID must contain only alphanumeric characters, hyphens, and underscores');
    }

    // Validate name
    if (!dto.name || dto.name.trim().length === 0) {
      throw new BadRequestException('Camera name is required');
    }
    if (dto.name.length > 100) {
      throw new BadRequestException('Camera name must be 100 characters or less');
    }

    // Validate camera type
    if (!Object.values(CameraType).includes(dto.type)) {
      throw new BadRequestException(`Invalid camera type: ${dto.type}`);
    }

    // Validate status
    if (dto.status && !Object.values(CameraStatus).includes(dto.status)) {
      throw new BadRequestException(`Invalid camera status: ${dto.status}`);
    }

    // Validate resolution
    if (!Object.values(CameraResolution).includes(dto.maxResolution)) {
      throw new BadRequestException(`Invalid camera resolution: ${dto.maxResolution}`);
    }

    // Validate lens
    if (!dto.lens || !dto.lens.focalLength) {
      throw new BadRequestException('Camera lens and focal length are required');
    }
    if (dto.lens.focalLength < 1 || dto.lens.focalLength > 500) {
      throw new BadRequestException('Focal length must be between 1 and 500mm');
    }
    if (dto.lens.maxAperture < 0.5 || dto.lens.maxAperture > 5) {
      throw new BadRequestException('Max aperture must be between f/0.5 and f/5');
    }

    // Validate position
    if (!dto.position || dto.position.length !== 3) {
      throw new BadRequestException('Camera position must have exactly 3 coordinates [x, y, z]');
    }
    if (dto.position.some(coord => isNaN(coord) || coord < -1000 || coord > 1000)) {
      throw new BadRequestException('Camera position coordinates must be between -1000 and 1000');
    }

    // Validate rotation
    if (!dto.rotation || dto.rotation.length !== 3) {
      throw new BadRequestException('Camera rotation must have exactly 3 values [pitch, yaw, roll]');
    }
    if (dto.rotation.some(r => isNaN(r) || r < -180 || r > 180)) {
      throw new BadRequestException('Rotation values must be between -180 and 180 degrees');
    }

    // Validate streams
    if (dto.streams && dto.streams.length > 0) {
      for (const stream of dto.streams) {
        if (!stream.streamId || !stream.name || !stream.url || !stream.protocol) {
          throw new BadRequestException('Stream must have streamId, name, url, and protocol');
        }
        if (!Object.values(StreamProtocol).includes(stream.protocol)) {
          throw new BadRequestException(`Invalid stream protocol: ${stream.protocol}`);
        }
        if (stream.fps < 1 || stream.fps > 120) {
          throw new BadRequestException('Stream FPS must be between 1 and 120');
        }
        if (stream.bitrate < 100 || stream.bitrate > 50000) {
          throw new BadRequestException('Stream bitrate must be between 100 and 50000 kbps');
        }
      }
    }

    // Validate calibrations
    if (dto.calibrations && dto.calibrations.length > 0) {
      for (const cal of dto.calibrations) {
        if (!cal.profileId || !cal.profileName) {
          throw new BadRequestException('Calibration must have profileId and profileName');
        }
        if (cal.confidenceThreshold && (cal.confidenceThreshold < 0 || cal.confidenceThreshold > 1)) {
          throw new BadRequestException('Confidence threshold must be between 0 and 1');
        }
      }
    }
  }

  async validateUpdate(id: string, dto: any): Promise<void> {
    const camera = await this.cameraModel.findById(id).exec();
    if (!camera) {
      throw new NotFoundException(`Camera with ID ${id} not found`);
    }

    // If cameraId is being changed, check for duplicates
    if (dto.cameraId && dto.cameraId !== camera.cameraId) {
      const existing = await this.cameraModel.findOne({ cameraId: dto.cameraId }).exec();
      if (existing) {
        throw new ConflictException(`Camera with ID '${dto.cameraId}' already exists`);
      }
    }

    // Validate status transition if status is being updated
    if (dto.status && dto.status !== camera.status) {
      this.validateStatusTransition(camera.status, dto.status);
    }
  }

  async validateCalibration(cameraId: string, dto: any): Promise<void> {
    const camera = await this.cameraModel.findById(cameraId).exec();
    if (!camera) {
      throw new NotFoundException(`Camera with ID ${cameraId} not found`);
    }

    if (!Object.values(CalibrationMethod).includes(dto.method)) {
      throw new BadRequestException(`Invalid calibration method: ${dto.method}`);
    }

    if (dto.confidenceThreshold !== undefined && (dto.confidenceThreshold < 0 || dto.confidenceThreshold > 1)) {
      throw new BadRequestException('Confidence threshold must be between 0 and 1');
    }

    if (dto.calibratedAt && new Date(dto.calibratedAt) > new Date()) {
      throw new BadRequestException('Calibration date cannot be in the future');
    }
  }

  async validateStream(cameraId: string, dto: any): Promise<void> {
    const camera = await this.cameraModel.findById(cameraId).exec();
    if (!camera) {
      throw new NotFoundException(`Camera with ID ${cameraId} not found`);
    }

    if (!dto.streamId || !dto.name || !dto.url || !dto.protocol) {
      throw new BadRequestException('Stream must have streamId, name, url, and protocol');
    }

    if (!Object.values(StreamProtocol).includes(dto.protocol)) {
      throw new BadRequestException(`Invalid stream protocol: ${dto.protocol}`);
    }

    if (dto.fps < 1 || dto.fps > 120) {
      throw new BadRequestException('Stream FPS must be between 1 and 120');
    }

    if (dto.bitrate < 100 || dto.bitrate > 50000) {
      throw new BadRequestException('Stream bitrate must be between 100 and 50000 kbps');
    }
  }

  private validateStatusTransition(from: CameraStatus, to: CameraStatus): void {
    const validTransitions: Record<CameraStatus, CameraStatus[]> = {
      [CameraStatus.ACTIVE]: [CameraStatus.INACTIVE, CameraStatus.MAINTENANCE, CameraStatus.OFFLINE, CameraStatus.DECOMMISSIONED],
      [CameraStatus.INACTIVE]: [CameraStatus.ACTIVE, CameraStatus.MAINTENANCE, CameraStatus.DECOMMISSIONED],
      [CameraStatus.MAINTENANCE]: [CameraStatus.ACTIVE, CameraStatus.OFFLINE, CameraStatus.DECOMMISSIONED],
      [CameraStatus.OFFLINE]: [CameraStatus.ACTIVE, CameraStatus.MAINTENANCE, CameraStatus.DECOMMISSIONED],
      [CameraStatus.DECOMMISSIONED]: [],
    }

    const validTargets = validTransitions[from] || [];
    if (!validTargets.includes(to)) {
      throw new BadRequestException(`Invalid camera status transition from ${from} to ${to}`);
    }
  }
}