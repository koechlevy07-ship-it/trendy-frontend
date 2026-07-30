/**
 * Match Module - Chapter 12 Part 1
 * 
 * NestJS module for Match Management
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchController } from './controllers/match.controller';
import { MatchService } from './services/match.service';
import { MatchRepository } from './repositories/match.repository';
import { MatchValidator } from './validators/match.validator';
import { MatchEventService } from './events/match.event.service';
import { Match, MatchSchema } from './schemas/match.schema';
import { Fixture, FixtureSchema } from './schemas/fixture.schema';
import { MatchOfficials, MatchOfficialsSchema } from './schemas/match-officials.schema';
import { MatchStatistics, MatchStatisticsSchema } from './schemas/match-statistics.schema';
import { 
  MatchEvent, MatchEventSchema,
  MatchTimeline, MatchTimelineSchema,
  MatchSetResult, MatchSetResultSchema,
  MatchLineup, MatchLineupSchema,
  MatchSubstitution, MatchSubstitutionSchema,
  MatchTimeout, MatchTimeoutSchema,
  MatchChallenge, MatchChallengeSchema,
  MatchSanction, MatchSanctionSchema,
  MatchIncident, MatchIncidentSchema,
} from './schemas/match-events.schema';
import { CompetitionModule } from '../competition/competition.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Match.name, schema: MatchSchema },
      { name: Fixture.name, schema: FixtureSchema },
      { name: MatchOfficials.name, schema: MatchOfficialsSchema },
      { name: MatchStatistics.name, schema: MatchStatisticsSchema },
      { name: MatchEvent.name, schema: MatchEventSchema },
      { name: MatchTimeline.name, schema: MatchTimelineSchema },
      { name: MatchSetResult.name, schema: MatchSetResultSchema },
      { name: MatchLineup.name, schema: MatchLineupSchema },
      { name: MatchSubstitution.name, schema: MatchSubstitutionSchema },
      { name: MatchTimeout.name, schema: MatchTimeoutSchema },
      { name: MatchChallenge.name, schema: MatchChallengeSchema },
      { name: MatchSanction.name, schema: MatchSanctionSchema },
      { name: MatchIncident.name, schema: MatchIncidentSchema },
    ]),
    CompetitionModule,
  ],
  controllers: [MatchController],
  providers: [
    MatchService,
    MatchRepository,
    MatchValidator,
    MatchEventService,
  ],
  exports: [
    MatchService,
    MatchRepository,
    MatchValidator,
    MatchEventService,
  ],
})
export class MatchModule {}