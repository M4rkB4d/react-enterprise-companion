import { Component, type ReactNode, type ErrorInfo } from 'react';
import { ErrorLoggingService } from '../services/ErrorLoggingService';
import { ErrorSeverity, ErrorCategory, type ErrorFallbackProps } from '../types';

interface GlobalErrorBoundaryProps {
  children: ReactNode;
  fallback?: (props: ErrorFallbackProps) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  private logger = ErrorLoggingService.getInstance();

  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<GlobalErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    this.logger.logError({
      error: {
        code: 'REACT_ERROR_BOUNDARY',
        message: error.message,
        timestamp: new Date(),
        context: {
          componentStack: errorInfo.componentStack,
        },
      },
      severity: ErrorSeverity.CRITICAL,
      category: ErrorCategory.SYSTEM,
      stackTrace: error.stack,
      appContext: {
        component: 'GlobalErrorBoundary',
      },
    });

    this.props.onError?.(error, errorInfo);
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      if (fallback) {
        return fallback({
          error,
          resetErrorBoundary: this.resetErrorBoundary,
          componentStack: errorInfo?.componentStack ?? undefined,
        });
      }

      return <DefaultErrorFallback error={error} resetErrorBoundary={this.resetErrorBoundary} />;
    }

    return children;
  }
}

// eslint-disable-next-line react-refresh/only-export-components -- co-located fallback component
function DefaultErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg rounded-lg bg-white p-8 shadow-lg">
        <div className="flex items-center gap-3">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h1 className="text-xl font-semibold text-gray-900">Something went wrong</h1>
        </div>
        <p className="mt-4 text-gray-600">
          We apologize for the inconvenience. Please try again or contact support if the problem
          persists.
        </p>

        {isDevelopment && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-500">Technical details</summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-4 text-xs text-red-600">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={resetErrorBoundary}
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
