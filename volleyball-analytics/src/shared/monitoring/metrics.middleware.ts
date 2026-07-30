import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../shared/logger';

const logger = createLogger('MetricsMiddleware');

interface RequestMetrics {
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
  correlationId: string;
  userId?: string;
}

const metricsStore: Map<string, RequestMetrics[]> = new Map();
const MAX_METRICS_PER_ENDPOINT = 1000;

export function metricsMiddleware(
  req: any,
  res: any,
  next: () => void
): void {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    const metric: RequestMetrics = {
      method: req.method,
      path: req.route?.path || req.path,
      statusCode: res.statusCode,
      duration: Date.now() - startTime,
      timestamp: new Date(),
      correlationId: req.correlationId || 'unknown',
      userId: req.user?.userId,
    };
    
    storeMetric(req.route?.path || req.path, metric);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Request metric', {
        method: req.method,
        path: req.route?.path || req.path,
        statusCode: res.statusCode,
        duration: `${Date.now() - req.startTime}ms`,
        correlationId: req.correlationId,
      });
    }
  });
  
  next();
}

function storeMetric(path: string, metric: any): void {
  const existing = metricsStore.get(path) || [];
  existing.push(metric);
  
  if (existing.length > 1000) {
    existing.shift();
  }
  
  metricsStore.set(path, existing);
}

export function getMetrics(): Record<string, any> {
  const summary: Record<string, any> = {};
  
  for (const [path, metrics] of metricsStore.entries()) {
    const total = metrics.length;
    const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / total;
    const errors = metrics.filter(m => m.statusCode >= 400).length;
    const successRate = ((total - errors) / total * 100).toFixed(2);
    
    summary[path] = {
      totalRequests: total,
      averageDuration: Math.round(avgDuration),
      errorCount: errors,
      successRate: `${successRate}%`,
      lastRequest: metrics[metrics.length - 1]?.timestamp,
    };
  }
  
  return summary;
}

export function getMetricsMiddleware() {
  return metricsMiddleware;
}

export function clearMetrics(): void {
  metricsStore.clear();
}

export function getMetricsForPath(path: string): RequestMetrics[] {
  return metricsStore.get(path) || [];
}