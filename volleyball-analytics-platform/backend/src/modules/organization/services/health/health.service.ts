/**
 * Health Service - Chapter 11 Part 4
 * 
 * Implements health checks for the Team & Organization Management Module.
 * Checks database connectivity, external dependencies, and internal state.
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization, OrganizationDocument } from '../schemas/organization.model';
import { Team, TeamDocument } from '../schemas/organization.model';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: HealthCheck[];
  version: string;
  uptime: number;
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  durationMs: number;
  details?: Record<string, any>;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();
  private readonly version = process.env.APP_VERSION || '1.0.0';

  constructor(
    @InjectModel(Organization.name)
    private readonly organizationModel: Model<OrganizationDocument>,
    @InjectModel(Team.name)
    private readonly teamModel: Model<TeamDocument>,
  ) {}

  /**
   * Comprehensive health check for /health endpoint
   */
  async getHealth(): Promise<HealthCheckResult> {
    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkMemory(),
      this.checkEventLoop(),
      this.checkCollections(),
    ]);

    const overallStatus = this.determineOverallStatus(checks);

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      version: this.version,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  /**
   * Liveness probe - only checks if process is alive
   */
  async getLiveness(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness probe - checks if ready to serve traffic
   */
  async getReadiness(): Promise<{
    status: 'ready' | 'not_ready';
    timestamp: string;
    checks: HealthCheck[];
  }> {
    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkCollections(),
    ]);

    const ready = checks.every(c => c.status === 'healthy');

    return {
      status: ready ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  private async checkDatabase(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      // Test database connection with a simple query
      await this.organizationModel.countDocuments().maxTimeMS(5000).exec();
      
      return {
        name: 'database',
        status: 'healthy',
        durationMs: Date.now() - start,
        message: 'Database connection successful',
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'unhealthy',
        durationMs: Date.now() - start,
        message: 'Database connection failed',
        details: { error: error.message },
      };
    }
  }

  private async checkMemory(): Promise<HealthCheck> {
    const start = Date.now();
    const memUsage = process.memoryUsage();
    const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let message = 'Memory usage normal';
    
    if (heapUsedPercent > 90) {
      status = 'unhealthy';
      message = 'Critical memory usage';
    } else if (heapUsedPercent > 75) {
      status = 'degraded';
      message = 'High memory usage';
    }

    return {
      name: 'memory',
      status,
      durationMs: Date.now() - start,
      message,
      details: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsedPercent: Math.round(heapUsedPercent),
        rss: Math.round(memUsage.rss / 1024 / 1024),
      },
    };
  }

  private async checkEventLoop(): Promise<HealthCheck> {
    const start = Date.now();
    
    // Measure event loop lag
    const lag = await this.measureEventLoopLag();
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let message = 'Event loop responsive';
    
    if (lag > 100) {
      status = 'unhealthy';
      message = 'Event loop severely blocked';
    } else if (lag > 50) {
      status = 'degraded';
      message = 'Event loop experiencing lag';
    }

    return {
      name: 'event_loop',
      status,
      durationMs: Date.now() - start,
      message,
      details: { lagMs: lag },
    };
  }

  private measureEventLoopLag(): Promise<number> {
    return new Promise(resolve => {
      const start = process.hrtime.bigint();
      setImmediate(() => {
        const end = process.hrtime.bigint();
        const lag = Number(end - start) / 1_000_000; // Convert to ms
        resolve(lag);
      });
    });
  }

  private async checkCollections(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      // Verify critical collections are accessible
      const [orgCount, teamCount] = await Promise.all([
        this.organizationModel.countDocuments().maxTimeMS(3000).exec(),
        this.teamModel.countDocuments().maxTimeMS(3000).exec(),
      ]);

      return {
        name: 'collections',
        status: 'healthy',
        durationMs: Date.now() - start,
        message: 'Collections accessible',
        details: { organizations: orgCount, teams: teamCount },
      };
    } catch (error) {
      return {
        name: 'collections',
        status: 'unhealthy',
        durationMs: Date.now() - start,
        message: 'Collection access failed',
        details: { error: error.message },
      };
    }
  }

  private determineOverallStatus(checks: HealthCheck[]): 'healthy' | 'degraded' | 'unhealthy' {
    if (checks.some(c => c.status === 'unhealthy')) {
      return 'unhealthy';
    }
    if (checks.some(c => c.status === 'degraded')) {
      return 'degraded';
    }
    return 'healthy';
  }
}