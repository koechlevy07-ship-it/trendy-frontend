import { Injectable, BadRequestException, ConflictException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Camera, ICamera, CameraMountType, CameraStatus, CameraManufacturer } from '../schemas/camera.schema';
import { Court, ICourt } from '../schemas/court.schema';
import { CoverageZone, ICoverageZone } from '../schemas/coverage-zone.schema';
import { CalibrationProfile, ICalibrationProfile } from '../schemas/calibration.schema';
import { createDomainEvent, eventPublisher } from '@shared/domain-events';

@Injectable()
export class CameraService {
  constructor(
    @InjectModel(Camera.name) private cameraModel: Model<ICamera>,
    @InjectModel(Court.name) private courtModel: Model<ICourt>,
    @InjectModel(CoverageZone.name) private coverageZoneModel: Model<ICoverageZone>,
    @InjectModel(CalibrationProfile.name) private calibrationModel: Model<ICalibrationProfile>,
  ) {}

  async createCamera(dto: CreateCameraDto, userId: string): Promise<ICamera> {
    const court = await this.courtModel.findById(dto.courtId);
    if (!court) throw new NotFoundException('Court not found');

    await this.validateCameraPositioning(dto.courtId, dto.position);

    const existingSerial = await this.cameraModel.findOne({ serialNumber: dto.serialNumber });
    if (existingSerial) throw new ConflictException('Camera with this serial number already exists');
    const existingCameraId = await this.cameraModel.findOne({ cameraId: dto.cameraId.toUpperCase() });
    if (existingCameraId) throw new ConflictException('Camera ID already exists');

    const camera = new this.cameraModel({ ...dto, courtId: new Types.ObjectId(dto.courtId), cameraId: dto.cameraId.toUpperCase(), createdBy: new Types.ObjectId(userId) });
    const savedCamera = await camera.save();

    if (dto.assignedCoverageZones?.length) { await this.coverageZoneModel.updateMany({ _id: { $in: dto.assignedCoverageZones.map(id => new Types.ObjectId(id)) } }, { $addToSet: { assignedCameras: savedCamera._id } }).exec(); }

    await this.publishEvent('CameraRegistered', savedCamera._id.toString(), 'Camera', { cameraId: savedCamera.cameraId, courtId: savedCamera.courtId.toString(), manufacturer: savedCamera.manufacturer, model: savedCamera.model, serialNumber: savedCamera.serialNumber, mountType: savedCamera.mountType, status: savedCamera.status }, { userId });
    return savedCamera;
  }

  async getCameras(searchDto: CameraSearchDto): Promise<any> {
    const filter: any = {};
    if (searchDto.search) filter.$or = [{ cameraId: { $regex: searchDto.search, $options: 'i' } }, { name: { $regex: searchDto.search, $options: 'i' } }, { serialNumber: { $regex: searchDto.search, $options: 'i' } }];
    if (searchDto.courtId) filter.courtId = new Types.ObjectId(searchDto.courtId);
    if (searchDto.manufacturer) filter.manufacturer = searchDto.manufacturer;
    if (searchDto.mountType) filter.mountType = searchDto.mountType;
    if (searchDto.status) filter.status = searchDto.status;
    const page = searchDto.page || 1; const limit = Math.min(searchDto.limit || 20, 100); const skip = (page - 1) * limit;
    const sort: any = { [searchDto.sortBy || 'createdAt']: searchDto.sortOrder === 'asc' ? 1 : -1 };
    const [data, total] = await Promise.all([ this.cameraModel.find(filter).sort(sort).skip(skip).limit(limit).exec(), this.cameraModel.countDocuments(filter).exec() ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getCameraById(id: string): Promise<ICamera> { return this.cameraModel.findById(id).populate('courtId').populate('calibrationProfileId').populate('assignedCoverageZones').exec(); }
  async getCameraByCameraId(cameraId: string): Promise<ICamera> { const camera = await this.cameraModel.findOne({ cameraId: cameraId.toUpperCase() }).exec(); if (!camera) throw new NotFoundException('Camera not found'); return camera; }
  async getCamerasByCourt(courtId: string): Promise<ICamera[]> { return this.cameraModel.find({ courtId: new Types.ObjectId(courtId) }).sort({ createdAt: -1 }).exec(); }

  async updateCamera(id: string, updateCameraDto: UpdateCameraDto, userId: string): Promise<ICamera> {
    const camera = await this.cameraModel.findById(id);
    if (!camera) throw new NotFoundException('Camera not found');
    if (updateCameraDto.position) await this.validateCameraPositioning(camera.courtId.toString(), updateCameraDto.position, id);
    const updatedCamera = await this.cameraModel.findByIdAndUpdate(id, { ...updateCameraDto, updatedBy: new Types.ObjectId(userId) }, { new: true, runValidators: true }).exec();
    await this.publishEvent('CameraUpdated', updatedCamera._id.toString(), 'Camera', { cameraId: updatedCamera.cameraId, changes: updateCameraDto }, { userId });
    return updatedCamera;
  }

  async activateCamera(id: string): Promise<ICamera> {
    const camera = await this.cameraModel.findById(id);
    if (!camera) throw new NotFoundException('Camera not found');
    if (camera.status === CameraStatus.ACTIVE) throw new BadRequestException('Camera is already active');
    if (!camera.calibrationProfileId) throw new BadRequestException('Camera must have a calibration profile before activation');
    const calibration = await this.calibrationModel.findById(camera.calibrationProfileId);
    if (calibration?.status !== 'active') throw new BadRequestException('Calibration profile must be active before camera activation');
    const updatedCamera = await this.cameraModel.findByIdAndUpdate(id, { status: CameraStatus.ACTIVE, activatedAt: new Date() }, { new: true }).exec();
    await this.publishEvent('CameraActivated', updatedCamera._id.toString(), 'Camera', { cameraId: updatedCamera.cameraId, courtId: updatedCamera.courtId.toString(), activatedAt: updatedCamera.activatedAt }, {});
    return updatedCamera;
  }

  async deactivateCamera(id: string, userId: string): Promise<ICamera> {
    const camera = await this.cameraModel.findById(id); if (!camera) throw new NotFoundException('Camera not found');
    if (camera.status !== CameraStatus.ACTIVE) throw new BadRequestException('Camera is not active');
    const updatedCamera = await this.cameraModel.findByIdAndUpdate(id, { status: CameraStatus.INACTIVE }, { new: true }).exec();
    await this.publishEvent('CameraDeactivated', updatedCamera._id.toString(), 'Camera', { cameraId: updatedCamera.cameraId, courtId: updatedCamera.courtId.toString() }, { userId });
    return updatedCamera;
  }

  async assignCalibrationProfile(id: string, calibrationProfileId: string, userId: string): Promise<ICamera> {
    const camera = await this.cameraModel.findById(id); if (!camera) throw new NotFoundException('Camera not found');
    const calibration = await this.calibrationModel.findById(calibrationProfileId); if (!calibration) throw new NotFoundException('Calibration profile not found');
    if (calibration.status !== 'active') throw new BadRequestException('Only active calibration profiles can be assigned');
    if (calibration.cameraInstallationId.toString() !== camera._id.toString()) throw new BadRequestException('Calibration profile does not match this camera');
    const updatedCamera = await this.cameraModel.findByIdAndUpdate(id, { calibrationProfileId: new Types.ObjectId(calibrationProfileId), status: CameraStatus.CALIBRATED, calibratedAt: new Date() }, { new: true }).exec();
    await this.publishEvent('CameraCalibrated', updatedCamera._id.toString(), 'Camera', { cameraId: updatedCamera.cameraId, calibrationProfileId }, { userId });
    return updatedCamera;
  }

  async assignCoverageZone(cameraId: string, zoneId: string): Promise<ICamera> { return this.cameraModel.findByIdAndUpdate(cameraId, { $addToSet: { assignedCoverageZones: new Types.ObjectId(zoneId) } }, { new: true }).exec(); }
  async removeCoverageZone(cameraId: string, zoneId: string): Promise<ICamera> { return this.cameraModel.findByIdAndUpdate(cameraId, { $pull: { assignedCoverageZones: new Types.ObjectId(zoneId) } }, { new: true }).exec(); }

  async updatePosition(id: string, position: ICamera['position'], userId: string): Promise<ICamera> {
    await this.validateCameraPositioning((await this.cameraModel.findById(id))!.courtId.toString(), position, id);
    const updatedCamera = await this.cameraModel.findByIdAndUpdate(id, { position, status: CameraStatus.CALIBRATING }, { new: true }).exec();
    await this.publishEvent('CameraRepositioned', updatedCamera._id.toString(), 'Camera', { cameraId: updatedCamera.cameraId, oldPosition: (await this.cameraModel.findById(id))!.position, newPosition: position }, { userId });
    return updatedCamera;
  }

  async updateStreamConfig(id: string, streamConfig: ICamera['streamConfig']): Promise<ICamera> { return this.cameraModel.findByIdAndUpdate(id, { streamConfig }, { new: true }).exec(); }
  async recordHeartbeat(id: string): Promise<ICamera> { return this.cameraModel.findByIdAndUpdate(id, { lastHeartbeat: new Date(), status: CameraStatus.CONNECTED }, { new: true }).exec(); }
  async recordError(id: string, error: string): Promise<ICamera> { return this.cameraModel.findByIdAndUpdate(id, { $inc: { 'healthMetrics.errorCount': 1 }, errorMessage: error, status: CameraStatus.ERROR }, { new: true }).exec(); }

  async getCameraStats(courtId: string): Promise<any> { return this.cameraModel.getCameraStats(courtId); }

  async decommissionCamera(id: string, userId: string): Promise<ICamera> {
    const camera = await this.cameraModel.findById(id); if (!camera) throw new NotFoundException('Camera not found');
    if (camera.status === CameraStatus.DECOMMISSIONED) throw new BadRequestException('Camera is already decommissioned');
    const updatedCamera = await this.cameraModel.findByIdAndUpdate(id, { status: CameraStatus.DECOMMISSIONED, decommissionedAt: new Date() }, { new: true }).exec();
    await this.coverageZoneModel.updateMany({ assignedCameras: camera._id }, { $pull: { assignedCameras: camera._id } }).exec();
    await this.publishEvent('CameraDecommissioned', updatedCamera._id.toString(), 'Camera', { cameraId: updatedCamera.cameraId, courtId: updatedCamera.courtId.toString() }, { userId });
    return updatedCamera;
  }

  private async validateCameraPositioning(courtId: string, position: any, excludeCameraId?: string): Promise<void> {
    const existingCameras = await this.cameraModel.find({ courtId: new Types.ObjectId(courtId) });
    for (const camera of existingCameras) { if (excludeCameraId && camera._id.toString() === excludeCameraId) continue; const distance = Math.sqrt(Math.pow(camera.position.x - position.x, 2) + Math.pow(camera.position.y - position.y, 2) + Math.pow(camera.position.z - position.z, 2)); if (distance < 0.5) throw new UnprocessableEntityException({ success: false, message: `Camera position conflicts with existing camera ${camera.cameraId}`, errors: [{ field: 'position', message: `Camera must be at least 0.5m away from other cameras`, code: 'CAMERA_POSITION_CONFLICT' }], timestamp: new Date().toISOString() }); }
  }

  private async publishEvent(eventType: string, aggregateId: string, aggregateType: string, payload: any, metadata: any): Promise<void> { const event = createDomainEvent(eventType, aggregateId, aggregateType, payload, metadata); await eventPublisher.publish(event); }
}

export interface CreateCameraDto { courtId: string; cameraId: string; name: string; manufacturer: CameraManufacturer; model: string; serialNumber: string; firmwareVersion?: string; mountType: CameraMountType; position: { x: number; y: number; z: number; roll: number; pitch: number; yaw: number; }; fieldOfView: { horizontal: number; vertical: number; }; resolution: { width: number; height: number; }; frameRate: number; bitrate?: number; codec?: string; streamConfig: { protocol: 'rtsp'|'rtmp'|'http'|'https'|'websocket'|'srt'|'ndi'; url: string; username?: string; password?: string; streamPath?: string; backupUrl?: string; transport?: 'tcp'|'udp'|'multicast'; }; specs: { sensorType: string; sensorSize: string; focalLength: number; aperture: string; isoRange: string; shutterSpeedRange: string; whiteBalance: string[]; focusMode: string[]; }; assignedCoverageZones?: string[]; calibrationProfileId?: string; metadata?: Record<string, unknown>; createdBy: string; }
export interface UpdateCameraDto { name?: string; position?: { x: number; y: number; z: number; roll: number; pitch: number; yaw: number; }; fieldOfView?: { horizontal: number; vertical: number; }; frameRate?: number; streamConfig?: { protocol: 'rtsp'|'rtmp'|'http'|'https'|'websocket'|'srt'|'ndi'; url: string; username?: string; password?: string; streamPath?: string; backupUrl?: string; transport?: 'tcp'|'udp'|'multicast'; }; status?: CameraStatus; calibrationProfileId?: string; assignedCoverageZones?: string[]; metadata?: Record<string, unknown>; }
export class CameraSearchDto { @IsString() @IsOptional() search?: string; @IsMongoId() @IsOptional() courtId?: string; @IsEnum(CameraManufacturer) @IsOptional() manufacturer?: CameraManufacturer; @IsEnum(CameraMountType) @IsOptional() mountType?: CameraMountType; @IsEnum(CameraStatus) @IsOptional() status?: CameraStatus; @IsNumber() @IsOptional() @Min(1) page?: number = 1; @IsNumber() @IsOptional() @Min(1) @Max(100) limit?: number = 20; @IsString() @IsOptional() sortBy?: string = 'createdAt'; @IsString() @IsOptional() sortOrder?: 'asc' | 'desc' = 'desc'; }
export class ActivateCameraDto { @IsMongoId() @IsNotEmpty() cameraId!: string; }
export class CalibrateCameraDto { @IsMongoId() @IsNotEmpty() cameraId!: string; @IsMongoId() @IsNotEmpty() calibrationProfileId!: string; }
export class CameraResponseDto { id!: string; cameraId!: string; courtId!: string; name!: string; manufacturer!: CameraManufacturer; model!: string; serialNumber!: string; firmwareVersion?: string; mountType!: CameraMountType; position!: CreateCameraPositionDto; fieldOfView!: CreateCameraFOVDto; resolution!: CreateCameraResolutionDto; frameRate!: number; bitrate?: number; codec?: string; streamConfig!: CreateCameraStreamConfigDto; specs!: CreateCameraSpecsDto; status!: CameraStatus; assignedCoverageZones!: string[]; calibrationProfileId?: string; metadata!: Record<string, unknown>; lastHeartbeat?: Date; errorMessage?: string; connectedAt?: Date; activatedAt?: Date; calibratedAt?: Date; decommissionedAt?: Date; createdAt!: Date; updatedAt!: Date; }
export class CameraPaginatedResponseDto { data!: CameraResponseDto[]; total!: number; page!: number; limit!: number; totalPages!: number; }