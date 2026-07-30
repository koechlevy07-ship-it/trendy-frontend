import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeasonController } from './controllers/season.controller';
import { SeasonService } from './services/season.service';
import { SeasonRepository } from './repositories/season.repository';
import { SeasonValidator } from './validators/season.validator';
import { Season, SeasonSchema } from './schemas/season.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Season.name, schema: SeasonSchema },
    ]),
  ],
  controllers: [SeasonController],
  providers: [
    SeasonService,
    SeasonRepository,
    SeasonValidator,
  ],
  exports: [
    SeasonService,
    SeasonRepository,
    SeasonValidator,
  ],
})
export class SeasonModule {}