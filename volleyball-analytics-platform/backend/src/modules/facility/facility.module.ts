import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VenueFacilityController } from './controllers/facility.controller';
import { VenueFacilityService } from './services/facility.service';
import { VenueFacilityRepository } from './repositories/facility.repository';
import { VenueFacilityValidator } from './validators/facility.validator';
import { VenueFacility, VenueFacilitySchema } from './schemas/facility.schema';
import { VenueModule } from '../venue/venue.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'VenueFacility', schema: VenueFacilitySchema },
    ]),
    VenueModule,
  ],
  controllers: [VenueFacilityController],
  providers: [
    VenueFacilityService,
    VenueFacilityRepository,
    VenueFacilityValidator,
  ],
  exports: [
    VenueFacilityService,
    VenueFacilityRepository,
    VenueFacilityValidator,
  ],
})
export class FacilityModule {}