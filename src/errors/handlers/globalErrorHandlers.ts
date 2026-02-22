import { ErrorLoggingService } from '../services/ErrorLoggingService';
import { ErrorSeverity, ErrorCategory } from '../types';

const logger = ErrorLoggingService.getInstance();

/**
 * Initialize global error handlers
 * Call this once at application startup
 */
export function initializeGlobalErrorHandlers(): void {
  // Handle uncaught JavaScript errors
  window.onerror = (
    message: string | Event,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error,
  ): boolean => {
    logger.logError({
      error: {
        code: 'UNCAUGHT_ERROR',
        message: typeof message === 'string' ? message : 'Unknown error',
        timestamp: new Date(),
        context: {
          source,
          lineno,
          colno,
        },
      },
      severity: ErrorSeverity.CRITICAL,
      category: ErrorCategory.SYSTEM,
      stackTrace: error?.stack,
      appContext: {
        action: 'window.onerror',
      },
    });

    // Return false to allow default error handling
    return false;
  };

  // Handle unhandled promise rejections
  window.onunhandledrejection = (event: PromiseRejectionEvent): void => {
    const error = event.reason;

    logger.logError({
      error: {
        code: 'UNHANDLED_REJECTION',
        message: error?.message ?? 'Unhandled promise rejection',
        timestamp: new Date(),
        context: {
          reason: String(error),
        },
      },
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.SYSTEM,
      stackTrace: error?.stack,
      appContext: {
        action: 'unhandledrejection',
      },
    });
  };

  // Handle resource loading errors
  window.addEventListener(
    'error',
    (event: ErrorEvent) => {
      const target = event.target as HTMLElement | null;

      // Check if this is a resource loading error
      if (target?.tagName) {
        const resourceType = target.tagName.toLowerCase();
        const resourceSrc =
          (target as HTMLImageElement).src ??
          (target as HTMLScriptElement).src ??
          (target as HTMLLinkElement).href;

        logger.logError({
          error: {
            code: 'RESOURCE_LOAD_ERROR',
            message: `Failed to load ${resourceType}`,
            timestamp: new Date(),
            context: {
              resourceType,
              resourceSrc,
            },
          },
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.NETWORK,
          appContext: {
            action: 'resource_load',
          },
        });
      }
    },
    true, // Capture phase to catch resource errors
  );
}

/**
 * Cleanup global error handlers
 * Call this on application unmount if needed
 */
export function cleanupGlobalErrorHandlers(): void {
  window.onerror = null;
  window.onunhandledrejection = null;
}
