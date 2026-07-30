import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OfficialsController } from './controllers/officials.controller';
import { OfficialService } from './services/official.service';
import { OfficialRepository } from './repositories/official.repository';
import { OfficialValidator } from './validators/official.validator';
import { Official, OfficialSchema } from './schemas/official.schema';
import { OfficialAssignmentService } from './services/official-assignment.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Official.name, schema: OfficialSchema },
    ]),
  ],
  controllers: [OfficialsController],
  providers: [
    OfficialService,
    OfficialRepository,
    OfficialValidator,
    OfficialAssignmentService,
  ],
  exports: [
    OfficialService,
    OfficialRepository,
    OfficialValidator,
    OfficialAssignmentService,
  ],
})
export class OfficialsModule {}