import { lazy, Suspense, type ComponentType, type ReactNode, useState, useEffect } from 'react';

interface LazyComponentOptions {
  fallback?: ReactNode;
  delay?: number;
  timeout?: number;
  onError?: (error: Error) => void;
}

/**
 * Enhanced lazy loading with delay, timeout, and error handling
 */
export function lazyWithOptions<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyComponentOptions = {},
): ComponentType<P> {
  const { fallback = null, delay = 200, timeout = 10000, onError } = options;

  const LazyComponent = lazy(() => {
    return Promise.all([
      importFn(),
      // Minimum delay to prevent flash
      new Promise((resolve) => setTimeout(resolve, delay)),
    ])
      .then(([module]) => module)
      .catch((error) => {
        onError?.(error);
        throw error;
      });
  });

  return function LazyWrapper(props: P) {
    const [isTimedOut, setIsTimedOut] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setIsTimedOut(true), timeout);
      return () => clearTimeout(timer);
    }, []);

    if (isTimedOut) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <p className="text-gray-600">Loading is taking longer than expected...</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-blue-600 hover:text-blue-500"
          >
            Refresh page
          </button>
        </div>
      );
    }

    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
