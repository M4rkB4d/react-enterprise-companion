import { Component, type ReactNode, type ErrorInfo } from 'react';
import { ErrorLoggingService } from '../services/ErrorLoggingService';
import { ErrorSeverity, ErrorCategory } from '../types';

interface FeatureErrorBoundaryProps {
  children: ReactNode;
  featureName: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface FeatureErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

const MAX_RETRY_ATTEMPTS = 3;

export class FeatureErrorBoundary extends Component<
  FeatureErrorBoundaryProps,
  FeatureErrorBoundaryState
> {
  private logger = ErrorLoggingService.getInstance();

  constructor(props: FeatureErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<FeatureErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { featureName, onError } = this.props;
    const { retryCount } = this.state;

    this.logger.logError({
      error: {
        code: 'FEATURE_ERROR',
        message: error.message,
        timestamp: new Date(),
        context: {
          featureName,
          retryCount,
          componentStack: errorInfo.componentStack,
        },
      },
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.SYSTEM,
      stackTrace: error.stack,
      appContext: {
        component: `FeatureErrorBoundary:${featureName}`,
      },
    });

    onError?.(error, errorInfo);
  }

  resetErrorBoundary = (): void => {
    const { onReset } = this.props;
    const { retryCount } = this.state;

    if (retryCount < MAX_RETRY_ATTEMPTS) {
      this.setState((prev) => ({
        hasError: false,
        error: null,
        retryCount: prev.retryCount + 1,
      }));
      onReset?.();
    }
  };

  render(): ReactNode {
    const { hasError, error, retryCount } = this.state;
    const { children, featureName, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <FeatureErrorFallback
          featureName={featureName}
          error={error}
          retryCount={retryCount}
          maxRetries={MAX_RETRY_ATTEMPTS}
          onRetry={this.resetErrorBoundary}
        />
      );
    }

    return children;
  }
}

interface FeatureErrorFallbackProps {
  featureName: string;
  error: Error | null;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
}

function FeatureErrorFallback({
  featureName,
  error,
  retryCount,
  maxRetries,
  onRetry,
}: FeatureErrorFallbackProps): ReactNode {
  const canRetry = retryCount < maxRetries;
  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">{featureName} unavailable</h3>
          <p className="mt-1 text-sm text-red-700">
            This feature encountered an error and cannot be displayed.
          </p>

          {isDevelopment && error && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-red-600">Technical details</summary>
              <pre className="mt-1 overflow-auto rounded bg-red-100 p-2 text-xs text-red-500">
                {error.message}
              </pre>
            </details>
          )}

          {canRetry ? (
            <button
              onClick={onRetry}
              className="mt-3 text-sm font-medium text-red-600 hover:text-red-500"
            >
              Try again ({maxRetries - retryCount} attempts remaining)
            </button>
          ) : (
            <p className="mt-3 text-sm text-red-600">
              Maximum retry attempts reached. Please refresh the page.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
