import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EquipmentController } from './controllers/equipment.controller';
import { EquipmentService } from './services/equipment.service';
import { EquipmentRepository } from './repositories/equipment.repository';
import { EquipmentValidator } from './validators/equipment.validator';
import { Equipment, EquipmentSchema } from '../schemas/equipment.schema';
import { FacilityModule } from '../facility/facility.module';
import { CourtModule } from '../court/court.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Equipment.name, schema: EquipmentSchema },
    ]),
    FacilityModule,
    CourtModule,
  ],
  controllers: [EquipmentController],
  providers: [
    EquipmentService,
    EquipmentRepository,
    EquipmentValidator,
  ],
  exports: [
    EquipmentService,
    EquipmentRepository,
    EquipmentValidator,
  ],
})
export class EquipmentModule {}