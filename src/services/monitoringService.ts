/**
 * @file src/services/monitoringService.ts
 * Operational telemetry, audit logging, and production error monitoring for MarketNest.
 * Strips sensitive credentials, assigns correlation IDs, and tracks runtime health.
 */

export type SeverityLevel = 'info' | 'warning' | 'error' | 'critical';

export interface TelemetryEvent {
  id: string;
  category: 'payment' | 'auth' | 'order' | 'inventory' | 'security' | 'system' | 'ui';
  message: string;
  level: SeverityLevel;
  timestamp: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}

// In-memory ring buffer for recent operational telemetry (max 200 events)
const recentEvents: TelemetryEvent[] = [];
const MAX_BUFFER = 200;

function sanitizeMetadata(data?: Record<string, any>): Record<string, any> | undefined {
  if (!data) return undefined;
  const sanitized: Record<string, any> = {};
  const sensitiveKeys = ['password', 'secret', 'token', 'cvv', 'key', 'rawbody', 'authorization'];

  for (const [k, v] of Object.entries(data)) {
    if (sensitiveKeys.some((s) => k.toLowerCase().includes(s))) {
      sanitized[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      sanitized[k] = sanitizeMetadata(v);
    } else {
      sanitized[k] = v;
    }
  }
  return sanitized;
}

export const monitoringService = {
  /**
   * Log an operational telemetry event
   */
  log(
    category: TelemetryEvent['category'],
    message: string,
    level: SeverityLevel = 'info',
    metadata?: Record<string, any>,
    correlationId?: string
  ): TelemetryEvent {
    const event: TelemetryEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      category,
      message,
      level,
      timestamp: new Date().toISOString(),
      correlationId: correlationId || `corr_${Math.random().toString(36).substring(2, 9)}`,
      metadata: sanitizeMetadata(metadata)
    };

    recentEvents.unshift(event);
    if (recentEvents.length > MAX_BUFFER) {
      recentEvents.pop();
    }

    // In non-production, log to console
    if (level === 'error' || level === 'critical') {
      console.error(`[MarketNest Monitor ${level.toUpperCase()}] [${category}]: ${message}`, event.metadata || '');
    } else if (level === 'warning') {
      console.warn(`[MarketNest Monitor WARN] [${category}]: ${message}`, event.metadata || '');
    }

    return event;
  },

  /**
   * Report an unhandled client UI exception
   */
  reportError(error: Error, componentStack?: string): TelemetryEvent {
    return this.log('ui', error.message || 'Unhandled UI Exception', 'error', {
      name: error.name,
      stack: error.stack?.slice(0, 300),
      componentStack: componentStack?.slice(0, 300)
    });
  },

  /**
   * Get recent operational events for admin diagnostics
   */
  getRecentEvents(category?: TelemetryEvent['category'], minLevel?: SeverityLevel): TelemetryEvent[] {
    return recentEvents.filter((e) => {
      if (category && e.category !== category) return false;
      if (minLevel && minLevel === 'error' && e.level !== 'error' && e.level !== 'critical') return false;
      return true;
    });
  },

  /**
   * Health status rollup
   */
  getHealthRollup(): {
    status: 'healthy' | 'degraded' | 'critical';
    totalEvents: number;
    errorCount: number;
    uptimeSeconds: number;
  } {
    const errorCount = recentEvents.filter((e) => e.level === 'error' || e.level === 'critical').length;
    return {
      status: errorCount > 10 ? 'degraded' : 'healthy',
      totalEvents: recentEvents.length,
      errorCount,
      uptimeSeconds: Math.floor(performance.now() / 1000)
    };
  }
};
