import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StandingsController } from './controllers/standings.controller';
import { StandingsService } from './services/standings.service';
import { StandingsRepository } from './repositories/standings.repository';
import { StandingsValidator } from './validators/standings.validator';
import { Standings, StandingsSchema } from './schemas/standings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Standings.name, schema: StandingsSchema },
    ]),
  ],
  controllers: [StandingsController],
  providers: [
    StandingsService,
    StandingsRepository,
    StandingsValidator,
  ],
  exports: [
    StandingsService,
    StandingsRepository,
    StandingsValidator,
  ],
})
export class StandingsModule {}