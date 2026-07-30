import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FixtureController } from './controllers/fixture.controller';
import { FixtureService } from './services/fixture.service';
import { FixtureRepository } from './repositories/fixture.repository';
import { FixtureValidator } from './validators/fixture.validator';
import { Fixture, FixtureSchema } from './schemas/fixture.schema';
import { CourtModule } from '../court/court.module';
import { VenueModule } from '../venue/venue.module';
import { CompetitionModule } from '../competition/competition.module';
import { SeasonModule } from '../season/season.module';
import { OfficialModule } from '../officials/officials.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Fixture.name, schema: FixtureSchema },
    ]),
    CourtModule,
    VenueModule,
    CompetitionModule,
    SeasonModule,
    OfficialModule,
  ],
  controllers: [FixtureController],
  providers: [
    FixtureService,
    FixtureRepository,
    FixtureValidator,
  ],
  exports: [
    FixtureService,
    FixtureRepository,
    FixtureValidator,
  ],
})
export class FixtureModule {}