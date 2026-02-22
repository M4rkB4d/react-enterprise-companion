import type { ErrorLogPayload, ErrorSeverity } from '../types';

interface LogEntry extends ErrorLogPayload {
  id: string;
  environment: string;
  version: string;
}

interface LoggingConfig {
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  sampleRate: number;
  bufferSize: number;
  flushInterval: number;
}

export class ErrorLoggingService {
  private static instance: ErrorLoggingService;
  private config: LoggingConfig;
  private buffer: LogEntry[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.config = {
      enableConsole: import.meta.env.DEV,
      enableRemote: import.meta.env.PROD,
      remoteEndpoint: import.meta.env.VITE_ERROR_LOGGING_ENDPOINT,
      sampleRate: 1.0, // Log 100% of errors
      bufferSize: 10,
      flushInterval: 5000,
    };

    if (this.config.enableRemote) {
      this.startFlushTimer();
    }
  }

  static getInstance(): ErrorLoggingService {
    if (!ErrorLoggingService.instance) {
      ErrorLoggingService.instance = new ErrorLoggingService();
    }
    return ErrorLoggingService.instance;
  }

  configure(config: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.config.enableRemote && !this.flushTimer) {
      this.startFlushTimer();
    } else if (!this.config.enableRemote && this.flushTimer) {
      this.stopFlushTimer();
    }
  }

  logError(payload: ErrorLogPayload): void {
    // Apply sampling
    if (Math.random() > this.config.sampleRate) {
      return;
    }

    const entry: LogEntry = {
      ...payload,
      id: crypto.randomUUID(),
      environment: import.meta.env.MODE,
      version: import.meta.env.VITE_APP_VERSION ?? '1.0.0',
    };

    // Console logging for development
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Buffer for remote logging
    if (this.config.enableRemote) {
      this.addToBuffer(entry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const { error, severity, category, stackTrace } = entry;

    const styles = this.getConsoleStyles(severity);

    console.groupCollapsed(`%c[${severity.toUpperCase()}] ${category}: ${error.code}`, styles);
    console.log('Message:', error.message);
    console.log('Timestamp:', error.timestamp);
    console.log('Context:', error.context);
    if (entry.appContext) {
      console.log('App Context:', entry.appContext);
    }
    if (entry.userContext) {
      console.log('User Context:', entry.userContext);
    }
    if (stackTrace) {
      console.log('Stack Trace:', stackTrace);
    }
    console.groupEnd();
  }

  private getConsoleStyles(severity: ErrorSeverity): string {
    const styles: Record<string, string> = {
      low: 'color: #6B7280; font-weight: bold;',
      medium: 'color: #F59E0B; font-weight: bold;',
      high: 'color: #EF4444; font-weight: bold;',
      critical: 'color: #DC2626; font-weight: bold; background: #FEE2E2; padding: 2px 6px;',
    };
    return styles[severity] ?? styles.medium;
  }

  private addToBuffer(entry: LogEntry): void {
    this.buffer.push(entry);

    if (this.buffer.length >= this.config.bufferSize) {
      this.flush();
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);

    this.flushOnUnload();
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0 || !this.config.remoteEndpoint) {
      return;
    }

    const entries = [...this.buffer];
    this.buffer = [];

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errors: entries }),
        keepalive: true,
      });
    } catch (error) {
      // Re-add entries to buffer on failure
      this.buffer = [...entries, ...this.buffer].slice(0, this.config.bufferSize * 2);

      if (this.config.enableConsole) {
        console.error('Failed to flush error logs:', error);
      }
    }
  }

  flushOnUnload(): void {
    window.addEventListener('beforeunload', () => {
      if (this.buffer.length > 0 && this.config.remoteEndpoint) {
        navigator.sendBeacon(this.config.remoteEndpoint, JSON.stringify({ errors: this.buffer }));
      }
    });
  }
}
