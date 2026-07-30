import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tournament, TournamentSchema } from './schemas/tournament.schema';
import { MatchSchedule, MatchScheduleSchema } from './schemas/match-schedule.schema';
import { Calendar, CalendarSchema } from './schemas/calendar.schema';
import { ConstraintSet, ConstraintSetSchema } from './schemas/constraint-set.schema';
import { TournamentRepository } from './repositories/tournament.repository';
import { MatchScheduleRepository } from './repositories/match-schedule.repository';
import { CalendarRepository } from './repositories/calendar.repository';
import { ConstraintSetRepository } from './repositories/constraint-set.repository';
import { TournamentService } from './services/tournament.service';
import { MatchScheduleService } from './services/match-schedule.service';
import { CalendarService } from './services/calendar.service';
import { ConstraintService } from './services/constraint.service';
import { OptimizationService } from './services/optimization.service';
import { AllocationService } from './services/allocation.service';
import { TournamentController } from './controllers/tournament.controller';
import { MatchScheduleController } from './controllers/match-schedule.controller';
import { CalendarController } from './controllers/calendar.controller';
import { ConstraintController } from './controllers/constraint.controller';
import { SchedulingMiddleware } from './middlewares/scheduling.middleware';
import { ValidationMiddleware } from './middlewares/validation.middleware';
import { BusinessValidator } from './validators/business.validator';
import { DTOValidator } from './validators/dto.validator';
import { EventPublisher } from '../shared/events/event.publisher';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Tournament', schema: TournamentSchema },
      { name: 'MatchSchedule', schema: MatchScheduleSchema },
      { name: 'Calendar', schema: CalendarSchema },
      { name: 'ConstraintSet', schema: ConstraintSetSchema }
    ])
  ],
  controllers: [
    TournamentController,
    MatchScheduleController,
    CalendarController,
    ConstraintController
  ],
  providers: [
    TournamentRepository,
    MatchScheduleRepository,
    CalendarRepository,
    ConstraintSetRepository,
    TournamentService,
    MatchScheduleService,
    CalendarService,
    ConstraintService,
    OptimizationService,
    AllocationService,
    SchedulingMiddleware,
    ValidationMiddleware,
    BusinessValidator,
    DTOValidator,
    EventPublisher
  ],
  exports: [
    TournamentService,
    MatchScheduleService,
    CalendarService,
    ConstraintService,
    OptimizationService,
    AllocationService,
    TournamentRepository,
    MatchScheduleRepository,
    CalendarRepository,
    ConstraintSetRepository
  ]
})
export class SchedulingModule {}