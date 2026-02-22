import { useState, useEffect, useTransition, useDeferredValue } from 'react';

/**
 * Defer non-critical updates to avoid blocking user interactions
 */
export function useDeferredUpdate<T>(value: T): T {
  // React 19's useDeferredValue
  return useDeferredValue(value);
}

/**
 * Progressive rendering for large lists
 */
export function useProgressiveRendering<T>(
  items: T[],
  batchSize: number = 20,
  delay: number = 50,
): {
  visibleItems: T[];
  isComplete: boolean;
  progress: number;
} {
  const [visibleCount, setVisibleCount] = useState(batchSize);

  useEffect(() => {
    if (visibleCount >= items.length) return;

    const timer = setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + batchSize, items.length));
    }, delay);

    return () => clearTimeout(timer);
  }, [visibleCount, items.length, batchSize, delay]);

  // Reset when items change
  useEffect(() => {
    setVisibleCount(batchSize);
  }, [items, batchSize]);

  return {
    visibleItems: items.slice(0, visibleCount),
    isComplete: visibleCount >= items.length,
    progress: items.length > 0 ? visibleCount / items.length : 1,
  };
}

/**
 * Transition for heavy state updates
 */
export function useHeavyStateUpdate<T>(initialValue: T): [T, (value: T) => void, boolean] {
  const [state, setState] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  const setStateWithTransition = (value: T) => {
    startTransition(() => {
      setState(value);
    });
  };

  return [state, setStateWithTransition, isPending];
}

/**
 * Idle callback for non-critical work
 */
export function useIdleCallback(
  callback: () => void,
  deps: unknown[],
  options?: IdleRequestOptions,
): void {
  useEffect(() => {
    if (!window.requestIdleCallback) {
      // Fallback for Safari
      const timer = setTimeout(callback, 1);
      return () => clearTimeout(timer);
    }

    const handle = window.requestIdleCallback(callback, options);
    return () => window.cancelIdleCallback(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
