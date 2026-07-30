/**
 * Shared Module - Chapter 12 Part 1
 * 
 * Shared utilities, guards, pipes, and common providers
 */

import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { LoggingService } from './services/logging.service';
import { ValidationService } from './services/validation.service';
import { PermissionService } from './services/permission.service';
import { TenantService } from './services/tenant.service';
import { CorrelationIdService } from './services/correlation-id.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('THROTTLE_TTL') || 60000,
        limit: configService.get<number>('THROTTLE_LIMIT') || 100,
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('CACHE_TTL') || 300000,
        max: configService.get<number>('CACHE_MAX') || 1000,
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  providers: [
    LoggingService,
    ValidationService,
    PermissionService,
    TenantService,
    CorrelationIdService,
  ],
  exports: [
    LoggingService,
    ValidationService,
    PermissionService,
    TenantService,
    CorrelationIdService,
    JwtModule,
    EventEmitterModule,
    ThrottlerModule,
    CacheModule,
  ],
})
export class SharedModule {}