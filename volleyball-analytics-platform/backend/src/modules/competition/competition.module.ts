import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VenueController } from './controllers/venue.controller';
import { VenueService } from './services/venue.service';
import { VenueRepository } from './repositories/venue.repository';
import { VenueValidator } from './validators/venue.validator';
import { FixtureController } from './controllers/fixture.controller';
import { FixtureService } from './services/fixture.service';
import { FixtureRepository } from './repositories/fixture.repository';
import { FixtureValidator } from './validators/fixture.validator';
import { CompetitionController } from './controllers/competition.controller';
import { CompetitionService } from './services/competition.service';
import { CompetitionRepository } from './repositories/competition.repository';
import { CompetitionValidator } from './validators/competition.validator';
import { SeasonController } from './controllers/season.controller';
import { SeasonService } from './services/season.service';
import { SeasonRepository } from './repositories/season.repository';
import { SeasonValidator } from './validators/season.validator';
import { Venue, VenueSchema } from './schemas/venue.schema';
import { Fixture, FixtureSchema } from './schemas/fixture.schema';
import { Competition, CompetitionSchema } from './schemas/competition.schema';
import { CompetitionPhase, CompetitionPhaseSchema } from './schemas/competition-phase.schema';
import { CompetitionGroup, CompetitionGroupSchema } from './schemas/competition-group.schema';
import { Season, SeasonSchema } from '../season/schemas/season.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Venue.name, schema: VenueSchema },
      { name: Fixture.name, schema: FixtureSchema },
      { name: Competition.name, schema: CompetitionSchema },
      { name: CompetitionPhase.name, schema: CompetitionPhaseSchema },
      { name: CompetitionGroup.name, schema: CompetitionGroupSchema },
      { name: Season.name, schema: SeasonSchema },
    ]),
  ],
  controllers: [VenueController, FixtureController, CompetitionController, SeasonController],
  providers: [
    VenueService,
    VenueRepository,
    VenueValidator,
    FixtureService,
    FixtureRepository,
    FixtureValidator,
    CompetitionService,
    CompetitionRepository,
    CompetitionValidator,
    SeasonService,
    SeasonRepository,
    SeasonValidator,
  ],
  exports: [
    VenueService,
    VenueRepository,
    VenueValidator,
    FixtureService,
    FixtureRepository,
    FixtureValidator,
    CompetitionService,
    CompetitionRepository,
    CompetitionValidator,
    SeasonService,
    SeasonRepository,
    SeasonValidator,
  ],
})
export class CompetitionModule {}