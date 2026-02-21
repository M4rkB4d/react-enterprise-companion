import {
  useMemo,
  useCallback,
  useRef,
  useLayoutEffect,
  type DependencyList,
} from 'react';

/**
 * useMemo with deep comparison
 */
export function useMemoDeep<T>(factory: () => T, deps: DependencyList): T {
  const depsRef = useRef<DependencyList>(deps);
  const valueRef = useRef<T | undefined>(undefined);

  const hasChanged = !depsRef.current.every((dep, i) => {
    if (typeof dep === 'object' && dep !== null) {
      return JSON.stringify(dep) === JSON.stringify(deps[i]);
    }
    return dep === deps[i];
  });

  if (hasChanged || valueRef.current === undefined) {
    valueRef.current = factory();
    depsRef.current = deps;
  }

  return valueRef.current;
}

/**
 * Stable callback reference that always calls the latest version
 * of the callback but maintains referential equality.
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(callback: T): T {
  const callbackRef = useRef(callback);

  // Update ref in useLayoutEffect (safe for concurrent mode)
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  // Return stable function that calls current callback
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(((...args: unknown[]) => callbackRef.current(...args)) as T, []);
}

/**
 * Debounced callback
 */
export function useDebouncedCallback<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number,
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    ((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay],
  );
}

/**
 * Throttled callback
 */
export function useThrottledCallback<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number,
): T {
  const lastCallRef = useRef(0);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    ((...args) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callbackRef.current(...args);
      }
    }) as T,
    [delay],
  );
}

/**
 * Memoized selector pattern for derived state
 */
export function useSelector<TState, TResult>(
  state: TState,
  selector: (state: TState) => TResult,
  equalityFn: (a: TResult, b: TResult) => boolean = Object.is,
): TResult {
  const previousResultRef = useRef<TResult | undefined>(undefined);

  return useMemo(() => {
    const result = selector(state);

    if (previousResultRef.current !== undefined && equalityFn(previousResultRef.current, result)) {
      return previousResultRef.current;
    }

    previousResultRef.current = result;
    return result;
  }, [state, selector, equalityFn]);
}
