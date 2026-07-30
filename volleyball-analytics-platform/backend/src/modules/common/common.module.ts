/**
 * Common Module - Chapter 12 Part 1
 * 
 * Common utilities, interfaces, and base classes
 */

import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseEntity, BaseEntitySchema } from './schemas/base-entity.schema';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';
import { CustomLoggerService } from './services/custom-logger.service';
import { ExceptionHandler } from './filters/exception.filter';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BaseEntity.name, schema: BaseEntitySchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  providers: [
    CustomLoggerService,
    ExceptionHandler,
  ],
  exports: [
    CustomLoggerService,
    ExceptionHandler,
    MongooseModule,
  ],
})
export class CommonModule {}