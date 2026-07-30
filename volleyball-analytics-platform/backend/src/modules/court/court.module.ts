import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourtController } from './controllers/court.controller';
import { CourtService } from './services/court.service';
import { CourtRepository } from './repositories/court.repository';
import { CourtValidator } from './validators/court.validator';
import { CourtEventService } from './events/court.event.service';
import { MatchModule } from '../match/match.module';
import { VenueModule } from '../venue/venue.module';
import { Court, CourtSchema } from './schemas/court.schema';
import { Fixture, FixtureSchema } from '../match/schemas/fixture.schema';
import { Match, MatchSchema } from '../match/schemas/match.schema';
import { CourtConfiguration, CourtConfigurationSchema } from './schemas/court-configuration.schema';
import { CourtLayout, CourtLayoutSchema } from './schemas/court-layout.schema';
import { CourtLighting, CourtLightingSchema } from '../schemas/court-lighting.schema';
import { Match, MatchSchema } from '../match/schemas/match.schema';
import { Fixture, FixtureSchema } from '../match/schemas/fixture.schema';
import { CourtConfiguration, CourtConfigurationSchema } from './schemas/court-configuration.schema';
import { CourtLayout, CourtLayoutSchema } from './schemas/court-layout.schema';
import { CourtLighting, CourtLightingSchema } from '../schemas/court-lighting.schema';
import { Match, MatchSchema } from '../match/schemas/match.schema';
import { Fixture, FixtureSchema } from '../match/schemas/fixture.schema';
import { CourtConfiguration, CourtConfigurationSchema } from './schemas/court-configuration.schema';
import { CourtLayout, CourtLayoutSchema } from './schemas/court-layout.schema';
import { CourtLighting, CourtLightingSchema } from '../schemas/court-lighting.schema';
import { Court, CourtSchema } from './schemas/court.schema';
import { Fixture, FixtureSchema } from '../match/schemas/fixture.schema';
import { Match, MatchSchema } from '../match/schemas/match.schema';
import { CourtConfiguration, CourtConfigurationSchema } from './schemas/court-configuration.schema';
import { CourtLayout, CourtLayoutSchema } from './schemas/court-layout.schema';
import { CourtLighting, CourtLightingSchema } from '../schemas/court-lighting.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Court.name, schema: CourtSchema },
      { name: Fixture.name, schema: FixtureSchema },
      { name: Match.name, schema: MatchSchema },
      { name: CourtConfiguration.name, schema: CourtConfigurationSchema },
      { name: CourtLayout.name, schema: CourtLayoutSchema },
      { name: CourtLighting.name, schema: CourtLightingSchema },
    ]),
    MatchModule,
    VenueModule,
  ],
  controllers: [CourtController],
  providers: [
    CourtService,
    CourtRepository,
    CourtValidator,
    CourtEventService,
  ],
  exports: [
    CourtService,
    CourtRepository,
    CourtValidator,
    CourtEventService,
  ],
})
export class CourtModule {}