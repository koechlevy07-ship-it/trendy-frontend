/**
 * Competition Module - Chapter 12 Part 1
 * 
 * Module architecture for Competition & Match Management.
 * Defines the competition domain model and module boundaries.
 */

export { CompetitionModule } from './competition.module';
export { CompetitionService } from './services/competition.service';
export { CompetitionRepository } from './repositories/competition.repository';
export { CompetitionValidator } from './validators/competition.validator';
export { CompetitionController } from './controllers/competition.controller';
export { CompetitionEventService } from './events/competition.event.service';
export * from './schemas/competition.schema';
export * from './dto/competition.dto';