export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogContext {
  requestId?: string;
  userId?: string;
  organizationId?: string;
  action?: string;
  metaAdId?: string;
  [key: string]: unknown;
}

export class Logger {
  private static formatLog(level: LogLevel, message: string, context?: LogContext) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...context,
    });
  }

  public static info(message: string, context?: LogContext) {
    console.log(this.formatLog('info', message, context));
  }

  public static warn(message: string, context?: LogContext) {
    console.warn(this.formatLog('warn', message, context));
  }

  public static error(message: string, context?: LogContext) {
    console.error(this.formatLog('error', message, context));
  }

  public static debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatLog('debug', message, context));
    }
  }
}
