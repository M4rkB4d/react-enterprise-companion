import { useState, useCallback } from 'react';
import { ErrorLoggingService } from '../services/ErrorLoggingService';
import { ErrorSeverity, ErrorCategory } from '../types';

interface AsyncErrorState {
  error: Error | null;
  isError: boolean;
}

interface UseAsyncErrorBoundaryReturn {
  error: Error | null;
  isError: boolean;
  handleError: (error: Error) => void;
  clearError: () => void;
  wrapAsync: <T>(promise: Promise<T>) => Promise<T>;
}

export function useAsyncErrorBoundary(componentName?: string): UseAsyncErrorBoundaryReturn {
  const [state, setState] = useState<AsyncErrorState>({
    error: null,
    isError: false,
  });

  const logger = ErrorLoggingService.getInstance();

  const handleError = useCallback(
    (error: Error) => {
      logger.logError({
        error: {
          code: 'ASYNC_ERROR',
          message: error.message,
          timestamp: new Date(),
          context: { componentName },
        },
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SYSTEM,
        stackTrace: error.stack,
        appContext: {
          component: componentName,
        },
      });

      setState({ error, isError: true });
    },
    [componentName, logger],
  );

  const clearError = useCallback(() => {
    setState({ error: null, isError: false });
  }, []);

  const wrapAsync = useCallback(
    async <T,>(promise: Promise<T>): Promise<T> => {
      try {
        return await promise;
      } catch (error) {
        handleError(error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    },
    [handleError],
  );

  return {
    error: state.error,
    isError: state.isError,
    handleError,
    clearError,
    wrapAsync,
  };
}
