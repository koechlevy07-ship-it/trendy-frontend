import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CalibrationProfile, ICalibrationProfile, CalibrationStatus, CalibrationMethod } from '../schemas/calibration.schema';
import { CameraRepository } from '../repositories/camera.repository';
import { ApiResponseBuilder } from '@shared/api-response';
import { createDomainEvent, eventPublisher } from '@shared/domain-events';

@Injectable()
export class CalibrationService {
  constructor(
    @InjectModel(CalibrationProfile.name) private readonly calibrationModel: Model<ICalibrationProfile>,
    private readonly cameraRepository: CameraRepository,
  ) {}

  async createCalibration(createCalibrationDto: CreateCalibrationProfileDto, userId: string): Promise<ICalibrationProfile> {
    const camera = await this.cameraRepository.findByIdOrThrow(createCalibrationDto.cameraInstallationId);

    const existingActive = await this.calibrationRepository.findActiveByCamera(createCalibrationDto.cameraInstallationId);
    if (existingActive) throw new ConflictException('Active calibration already exists for this camera. Archive it first.');

    const latestVersion = await this.calibrationRepository.findLatestByCamera(createCalibrationDto.cameraInstallationId);
    const version = (latestVersion?.version || 0) + 1;

    const calibration = new this.calibrationModel({ ...createCalibrationDto, cameraInstallationId: new Types.ObjectId(createCalibrationDto.cameraInstallationId), version, createdBy: new Types.ObjectId(userId) });
    const savedCalibration = await calibration.save();

    await this.publishEvent('CalibrationCreated', savedCalibration._id.toString(), 'CalibrationProfile', { calibrationId: savedCalibration._id.toString(), cameraInstallationId: savedCalibration.cameraInstallationId.toString(), profileName: savedCalibration.profileName, version: savedCalibration.version, method: savedCalibration.method, status: savedCalibration.status }, { userId });
    return savedCalibration;
  }

  async getCalibrations(searchDto: CalibrationProfileSearchDto): Promise<any> {
    const filter: any = {};
    if (searchDto.cameraInstallationId) filter.cameraInstallationId = new Types.ObjectId(searchDto.cameraInstallationId);
    if (searchDto.status) filter.status = searchDto.status;
    if (searchDto.method) filter.method = searchDto.method;
    const page = searchDto.page || 1; const limit = Math.min(searchDto.limit || 20, 100); const skip = (page - 1) * limit;
    const sort: any = { [searchDto.sortBy || 'createdAt']: searchDto.sortOrder === 'asc' ? 1 : -1 };
    const [data, total] = await Promise.all([ this.calibrationModel.find(filter).sort(sort).skip(skip).limit(limit).exec(), this.calibrationModel.countDocuments(filter).exec() ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getCalibrationById(id: string): Promise<ICalibrationProfile> { return this.calibrationRepository.findByIdOrThrow(id); }
  async getActiveCalibration(cameraInstallationId: string): Promise<ICalibrationProfile | null> { return this.calibrationRepository.findActiveByCamera(cameraInstallationId); }

  async updateCalibration(id: string, updateDto: UpdateCalibrationProfileDto, userId: string): Promise<ICalibrationProfile> {
    const calibration = await this.calibrationRepository.findByIdOrThrow(id);
    if (calibration.status === CalibrationStatus.ACTIVE) throw new BadRequestException('Cannot update active calibration. Archive it first.');
    const updatedCalibration = await this.calibrationRepository.update(id, { ...updateDto, updatedBy: new Types.ObjectId(userId) });
    await this.publishEvent('CalibrationUpdated', updatedCalibration._id.toString(), 'CalibrationProfile', { calibrationId: updatedCalibration._id.toString(), changes: updateDto }, { userId });
    return updatedCalibration;
  }

  async activateCalibration(id: string, activateDto: ActivateCalibrationDto): Promise<ICalibrationProfile> {
    const calibration = await this.calibrationRepository.findByIdOrThrow(id);
    if (calibration.status === CalibrationStatus.ACTIVE) throw new BadRequestException('Calibration is already active');
    if (calibration.status === CalibrationStatus.ARCHIVED) throw new BadRequestException('Cannot activate archived calibration. Create a new version instead.');
    if (calibration.metrics.reprojectionError > 1.0) throw new BadRequestException('Calibration accuracy does not meet activation requirements');

    await this.calibrationModel.updateMany({ cameraInstallationId: calibration.cameraInstallationId, status: CalibrationStatus.ACTIVE }, { status: CalibrationStatus.ARCHIVED });
    const activatedCalibration = await this.calibrationRepository.activateProfile(id, new Types.ObjectId(activateDto.activatedBy));

    await this.publishEvent('CalibrationActivated', activatedCalibration._id.toString(), 'CalibrationProfile', { calibrationId: activatedCalibration._id.toString(), cameraInstallationId: activatedCalibration.cameraInstallationId.toString(), version: activatedCalibration.version, activatedBy: activateDto.activatedBy }, { userId: activateDto.activatedBy });
    return activatedCalibration;
  }

  async validateCalibration(id: string, validateDto: ValidateCalibrationDto, userId: string): Promise<ICalibrationProfile> {
    const calibration = await this.calibrationRepository.findByIdOrThrow(id);
    if (calibration.status !== CalibrationStatus.PENDING_VALIDATION) throw new BadRequestException('Calibration is not pending validation');
    const validatedCalibration = await this.calibrationRepository.setValidationResult(id, validateDto.passed, validateDto.details, new Types.ObjectId(userId));

    if (validateDto.passed) { validatedCalibration.status = CalibrationStatus.ACTIVE; validatedCalibration.activatedAt = new Date(); validatedCalibration.activatedBy = new Types.ObjectId(userId); await validatedCalibration.save(); await this.publishEvent('CalibrationValidated', validatedCalibration._id.toString(), 'CalibrationProfile', { calibrationId: validatedCalibration._id.toString(), passed: validateDto.passed, validatedBy: userId }, { userId }); }
    else { validatedCalibration.status = CalibrationStatus.FAILED; await validatedCalibration.save(); await this.publishEvent('CalibrationValidationFailed', validatedCalibration._id.toString(), 'CalibrationProfile', { calibrationId: validatedCalibration._id.toString(), details: validateDto.details, validatedBy: userId }, { userId }); }
    return validatedCalibration;
  }

  async archiveCalibration(id: string, userId: string): Promise<ICalibrationProfile> {
    const calibration = await this.calibrationRepository.findByIdOrThrow(id);
    if (calibration.status === CalibrationStatus.ACTIVE) throw new BadRequestException('Cannot archive active calibration. Deactivate it first.');
    const archivedCalibration = await this.calibrationRepository.archiveProfile(id, new Types.ObjectId(userId));
    await this.publishEvent('CalibrationArchived', archivedCalibration._id.toString(), 'CalibrationProfile', { calibrationId: archivedCalibration._id.toString(), cameraInstallationId: archivedCalibration.cameraInstallationId.toString(), archivedBy: userId }, { userId });
    return archivedCalibration;
  }

  async updateMetrics(id: string, metrics: Partial<ICalibrationProfile['metrics']>): Promise<ICalibrationProfile> { return this.calibrationRepository.updateMetrics(id, metrics); }
  async updateAIProfile(id: string, aiMetadata: Partial<ICalibrationProfile['aiMetadata']>): Promise<ICalibrationProfile> { return this.calibrationRepository.updateAIProfile(id, aiMetadata); }
  async getCalibrationStats(): Promise<any> { return this.calibrationRepository.getCalibrationStats(); }
  async findNeedingRecalibration(maxError: number = 1.0): Promise<ICalibrationProfile[]> { return this.calibrationRepository.findNeedingRecalibration(maxError); }

  private async publishEvent(eventType: string, aggregateId: string, aggregateType: string, payload: any, metadata: any): Promise<void> { const event = createDomainEvent(eventType, aggregateId, aggregateType, payload, metadata); await eventPublisher.publish(event); }
}

export interface CreateCalibrationProfileDto { cameraInstallationId: string; profileName: string; method: CalibrationMethod; intrinsicParameters: any; extrinsicParameters: any; referencePoints: any[]; homographyMatrix: any; metrics: any; aiMetadata?: Record<string, unknown>; notes?: string; createdBy: string; }
export interface UpdateCalibrationProfileDto { profileName?: string; status?: CalibrationStatus; intrinsicParameters?: any; extrinsicParameters?: any; referencePoints?: any[]; homographyMatrix?: any; metrics?: any; aiMetadata?: Record<string, unknown>; notes?: string; }
export class CalibrationProfileSearchDto { @IsMongoId() @IsOptional() cameraInstallationId?: string; @IsEnum(CalibrationStatus) @IsOptional() status?: CalibrationStatus; @IsEnum(CalibrationMethod) @IsOptional() method?: CalibrationMethod; @IsNumber() @IsOptional() @Min(1) page?: number = 1; @IsNumber() @IsOptional() @Min(1) @Max(100) limit?: number = 20; @IsString() @IsOptional() sortBy?: string = 'createdAt'; @IsString() @IsOptional() sortOrder?: 'asc' | 'desc' = 'desc'; }
export class ActivateCalibrationDto { @IsMongoId() @IsNotEmpty() activatedBy!: string; }
export class ValidateCalibrationDto { @IsBoolean() @IsNotEmpty() passed!: boolean; @IsObject() @IsNotEmpty() details!: Record<string, unknown>; @IsMongoId() @IsNotEmpty() validatedBy!: string; }
export class CalibrationProfileResponseDto { id!: string; cameraInstallationId!: string; profileName!: string; version!: number; method!: CalibrationMethod; status!: CalibrationStatus; intrinsicParameters!: any; extrinsicParameters!: any; referencePoints!: any[]; homographyMatrix!: any; metrics!: any; validationResults?: { passed: boolean; details: Record<string, unknown>; validatedAt: Date; validatedBy: string; }; aiMetadata!: Record<string, unknown>; notes?: string; createdBy!: string; activatedAt?: Date; activatedBy?: string; archivedAt?: Date; archivedBy?: string; createdAt!: Date; updatedAt!: Date; }
export class CalibrationProfilePaginatedResponseDto { data!: CalibrationProfileResponseDto[]; total!: number; page!: number; limit!: number; totalPages!: number; }