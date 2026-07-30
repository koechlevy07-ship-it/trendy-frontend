import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../shared/logger';

const logger = createLogger('HealthMiddleware');

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  duration?: number;
  details?: Record<string, any>;
}

export async function healthCheckMiddleware(
  req: any,
  res: any,
  next: () => void
): Promise<void> {
  const startTime = Date.now();
  
  const checks: HealthCheck[] = [
    await checkDatabase(),
    await checkRedis(),
    await checkExternalServices(),
  ];
  
  const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
  const degradedCount = checks.filter(c => c.status === 'degraded').length;
  
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  if (unhealthyCount > 0) {
    overallStatus = 'unhealthy';
  } else if (degradedCount > 0) {
    overallStatus = 'degraded';
  }
  
  const result: HealthCheckResult = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    checks,
  };
  
  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
  
  res.status(statusCode).json({
    success: overallStatus !== 'unhealthy',
    data: result,
    timestamp: new Date().toISOString(),
  });
}

async function checkDatabase(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const { default: mongoose } = await import('mongoose');
    
    if (mongoose.connection.readyState === 1) {
      return {
        name: 'database',
        status: 'healthy',
        message: 'Database connection is healthy',
        duration: Date.now() - startTime,
      };
    } else {
      return {
        name: 'database',
        status: 'unhealthy',
        message: 'Database connection is not ready',
        duration: Date.now() - startTime,
      };
    }
  } catch (error) {
    return {
      name: 'database',
      status: 'unhealthy',
      message: `Database check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      duration: Date.now() - startTime,
    };
  }
}

async function checkRedis(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    return {
      name: 'redis',
      status: 'healthy',
      message: 'Redis connection is healthy (mock)',
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: 'redis',
      status: 'degraded',
      message: `Redis check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      duration: Date.now() - startTime,
    };
  }
}

async function checkExternalServices(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  return {
    name: 'external-services',
    status: 'healthy',
    message: 'External services check passed (mock)',
    duration: Date.now() - startTime,
  };
}

export function createHealthEndpoints() {
  return {
    '/health': healthCheckMiddleware,
    '/health/live': (req: any, res: any) => {
      res.status(200).json({
        success: true,
        data: { status: 'alive', timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString(),
      });
    },
    '/health/ready': async (req: any, res: any) => {
      const checks = await Promise.all([
        checkDatabase(),
        checkRedis(),
      ]);
      
      const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
      
      if (unhealthyCount > 0) {
        return res.status(503).json({
          success: false,
          data: { status: 'not ready', checks },
          timestamp: new Date().toISOString(),
        });
      }
      
      res.status(200).json({
        success: true,
        data: { status: 'ready', checks },
        timestamp: new Date().toISOString(),
      });
    },
  };
}

export function metricsMiddleware(req: any, res: any, next: () => void): void {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.debug('Request metrics', {
      method: req.method,
      path: req.route?.path || req.path,
      statusCode: res.statusCode,
      duration,
      correlationId: req.correlationId,
    });
  });
  
  next();
}

const logger = createLogger('HealthMiddleware');