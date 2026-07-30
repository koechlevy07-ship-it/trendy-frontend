import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CameraController } from './controllers/camera.controller';
import { CameraService } from './services/camera.service';
import { CameraRepository } from './repositories/camera.repository';
import { CameraValidator } from './validators/camera.validator';
import { CalibrationController } from './controllers/calibration.controller';
import { CalibrationService } from './services/calibration.service';
import { CalibrationRepository } from './repositories/calibration.repository';
import { CalibrationValidator } from './validators/calibration.validator';
import { Camera, CameraSchema } from './schemas/camera.schema';
import { CameraCalibration, CameraCalibrationSchema } from './schemas/camera.schema';
import { CameraCoverageZone, CameraCoverageZoneSchema } from './schemas/camera-coverage-zone.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Camera.name, schema: CameraSchema },
      { name: CameraCalibration.name, schema: CameraCalibrationSchema },
      { name: CameraCoverageZone.name, schema: CameraCoverageZoneSchema },
    ]),
  ],
  controllers: [CameraController, CalibrationController],
  providers: [
    CameraService,
    CameraRepository,
    CameraValidator,
    CalibrationService,
    CalibrationRepository,
    CalibrationValidator,
  ],
  exports: [
    CameraService,
    CameraRepository,
    CameraValidator,
    CalibrationService,
    CalibrationRepository,
    CalibrationValidator,
  ],
})
export class CameraModule {}