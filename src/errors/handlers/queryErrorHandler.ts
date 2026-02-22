import {
  QueryClient,
  QueryCache,
  MutationCache,
  type QueryClientConfig,
} from '@tanstack/react-query';
import { NetworkError, AuthenticationError } from '../custom-errors';
import { ErrorLoggingService } from '../services/ErrorLoggingService';
import { errorNotificationService } from '../notifications/ErrorNotificationService';
import { ErrorSeverity, ErrorCategory } from '../types';

const logger = ErrorLoggingService.getInstance();

/**
 * Global error handler for TanStack Query
 */
function handleQueryError(error: unknown): void {
  if (error instanceof AuthenticationError) {
    errorNotificationService.notify(error.toJSON(), {
      title: 'Session Expired',
      duration: 0, // Persist until dismissed
      action: {
        label: 'Sign In',
        onClick: () => {
          window.location.href = '/login';
        },
      },
    });
    return;
  }

  if (error instanceof NetworkError) {
    // Don't show notifications for client errors (user mistakes)
    if (error.isClientError() && !error.isAuthError()) {
      return;
    }

    errorNotificationService.notify(error.toJSON(), {
      title: error.isServerError() ? 'Server Error' : 'Request Failed',
    });
    return;
  }

  // Unknown errors
  const appError = {
    code: 'QUERY_ERROR',
    message: error instanceof Error ? error.message : 'An error occurred',
    timestamp: new Date(),
  };

  logger.logError({
    error: appError,
    severity: ErrorSeverity.MEDIUM,
    category: ErrorCategory.UNKNOWN,
    stackTrace: error instanceof Error ? error.stack : undefined,
  });

  errorNotificationService.notify(appError, {
    title: 'Error',
  });
}

/**
 * Create QueryClient with error handling configuration
 */
export function createQueryClientWithErrorHandling(): QueryClient {
  const config: QueryClientConfig = {
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          // Don't retry auth errors
          if (error instanceof AuthenticationError) {
            return false;
          }

          // Don't retry client errors
          if (error instanceof NetworkError && error.isClientError()) {
            return false;
          }

          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
      },
      mutations: {
        retry: false, // Don't retry mutations by default
      },
    },
  };

  return new QueryClient({
    ...config,
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Only show notifications for queries that have already loaded data
        if (query.state.data !== undefined) {
          handleQueryError(error);
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        handleQueryError(error);
      },
    }),
  });
}
