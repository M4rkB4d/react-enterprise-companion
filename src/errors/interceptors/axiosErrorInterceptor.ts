import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { NetworkError, AuthenticationError } from '../custom-errors';
import { ErrorLoggingService } from '../services/ErrorLoggingService';
import { ErrorSeverity, ErrorCategory } from '../types';

interface ApiErrorResponse {
  message?: string;
  code?: string;
  errors?: Array<{ field?: string; code: string; message: string }>;
  requestId?: string;
}

interface RequestMetadata {
  startTime: number;
  requestId: string;
}

const requestMetadata = new WeakMap<InternalAxiosRequestConfig, RequestMetadata>();

export function setupAxiosErrorInterceptor(axiosInstance: AxiosInstance): void {
  const logger = ErrorLoggingService.getInstance();

  // Request interceptor - add metadata
  axiosInstance.interceptors.request.use(
    (config) => {
      requestMetadata.set(config, {
        startTime: Date.now(),
        requestId: crypto.randomUUID(),
      });
      return config;
    },
    (error: AxiosError) => {
      logger.logError({
        error: {
          code: 'REQUEST_SETUP_ERROR',
          message: error.message,
          timestamp: new Date(),
        },
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.NETWORK,
        stackTrace: error.stack,
      });
      return Promise.reject(error);
    },
  );

  // Response error interceptor
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => {
      const config = error.config;
      const metadata = config ? requestMetadata.get(config) : undefined;
      const duration = metadata ? Date.now() - metadata.startTime : undefined;

      // Handle network errors (no response)
      if (!error.response) {
        const networkError = new NetworkError(error.message || 'Network connection failed', 0, {
          endpoint: config?.url ?? 'unknown',
          method: config?.method?.toUpperCase() ?? 'UNKNOWN',
          requestId: metadata?.requestId,
          context: {
            code: error.code,
            duration,
          },
        });

        logger.logError({
          error: networkError.toJSON(),
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.NETWORK,
          stackTrace: error.stack,
          appContext: {
            action: 'api_request',
          },
        });

        return Promise.reject(networkError);
      }

      const { status, data } = error.response;
      const endpoint = config?.url ?? 'unknown';
      const method = config?.method?.toUpperCase() ?? 'UNKNOWN';

      // Handle authentication errors
      if (status === 401) {
        const authError = new AuthenticationError(data?.message ?? 'Authentication required', {
          isExpired: true,
          requiresReauth: true,
          context: { endpoint, method },
        });

        logger.logError({
          error: authError.toJSON(),
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.AUTHENTICATION,
        });

        window.dispatchEvent(new CustomEvent('auth:session-expired'));

        return Promise.reject(authError);
      }

      // Handle other HTTP errors
      const networkError = new NetworkError(
        data?.message ?? `Request failed with status ${status}`,
        status,
        {
          endpoint,
          method,
          requestId: data?.requestId ?? metadata?.requestId,
          details: data?.errors,
          context: {
            code: data?.code,
            duration,
          },
        },
      );

      logger.logError({
        error: networkError.toJSON(),
        severity: networkError.isServerError() ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
        category: ErrorCategory.NETWORK,
        stackTrace: error.stack,
        appContext: {
          action: 'api_request',
          route: window.location.pathname,
        },
      });

      return Promise.reject(networkError);
    },
  );
}
