import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CameraCoverageZoneController } from './controllers/camera-coverage-zone.controller';
import { CameraCoverageZoneService } from './services/camera-coverage-zone.service';
import { CameraCoverageZoneRepository } from './repositories/camera-coverage-zone.repository';
import { CameraCoverageZoneValidator } from './validators/camera-coverage-zone.validator';
import { CameraCoverageZone, CameraCoverageZoneSchema } from './schemas/camera-coverage-zone.schema';
import { CameraModule } from './camera.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'CameraCoverageZone', schema: CameraCoverageZoneSchema },
    ]),
  ],
  controllers: [],
  providers: [
    CameraCoverageZoneService,
    CameraCoverageZoneRepository,
    CameraCoverageZoneValidator,
  ],
  exports: [
    CameraCoverageZoneService,
    CameraCoverageZoneRepository,
    CameraCoverageZoneValidator,
  ],
})
export class CameraCoverageZoneModule {}