import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CertificationController } from './controllers/certification.controller';
import { CertificationService } from './services/certification.service';
import { CertificationRepository } from './repositories/certification.repository';
import { CertificationValidator } from './validators/certification.validator';
import { VenueCertification, VenueCertificationSchema } from '../schemas/certification.schema';
import { VenueModule } from '../venue/venue.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'VenueCertification', schema: VenueCertificationSchema },
    ]),
    VenueModule,
  ],
  controllers: [CertificationController],
  providers: [
    CertificationService,
    CertificationRepository,
    CertificationValidator,
  ],
  exports: [
    CertificationService,
    CertificationRepository,
    CertificationValidator,
  ],
})
export class CertificationModule {}