import { useState, useEffect, useRef, useCallback } from 'react';

interface UseExpensiveComputationOptions<T> {
  compute: () => T;
  deps: unknown[];
  debounceMs?: number;
  cacheKey?: string;
}

// Simple LRU cache for expensive computations
const computationCache = new Map<string, { value: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useExpensiveComputation<T>({
  compute,
  deps,
  debounceMs = 0,
  cacheKey,
}: UseExpensiveComputationOptions<T>): {
  result: T | undefined;
  isComputing: boolean;
  recompute: () => void;
} {
  const [result, setResult] = useState<T | undefined>(() => {
    // Check cache on initial render
    if (cacheKey) {
      const cached = computationCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.value as T;
      }
    }
    return undefined;
  });
  const [isComputing, setIsComputing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const computeRef = useRef(compute);
  computeRef.current = compute;

  const runComputation = useCallback(() => {
    setIsComputing(true);

    // Use requestIdleCallback for non-critical computations
    const run = () => {
      try {
        const value = computeRef.current();
        setResult(value);

        // Cache result
        if (cacheKey) {
          computationCache.set(cacheKey, { value, timestamp: Date.now() });
        }
      } finally {
        setIsComputing(false);
      }
    };

    if (window.requestIdleCallback) {
      window.requestIdleCallback(run, { timeout: 1000 });
    } else {
      setTimeout(run, 0);
    }
  }, [cacheKey]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (debounceMs > 0) {
      timeoutRef.current = setTimeout(runComputation, debounceMs);
    } else {
      runComputation();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { result, isComputing, recompute: runComputation };
}

/**
 * Web Worker for truly expensive computations
 */
export function useWorkerComputation<TInput, TOutput>(
  workerFn: (input: TInput) => TOutput,
): {
  compute: (input: TInput) => Promise<TOutput>;
  isComputing: boolean;
  terminate: () => void;
} {
  const [isComputing, setIsComputing] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  const compute = useCallback(
    (input: TInput): Promise<TOutput> => {
      return new Promise((resolve, reject) => {
        setIsComputing(true);

        // Create inline worker
        const blob = new Blob(
          [
            `
            self.onmessage = function(e) {
              const fn = ${workerFn.toString()};
              const result = fn(e.data);
              self.postMessage(result);
            }
          `,
          ],
          { type: 'application/javascript' },
        );

        const worker = new Worker(URL.createObjectURL(blob));
        workerRef.current = worker;

        worker.onmessage = (e) => {
          setIsComputing(false);
          resolve(e.data);
          worker.terminate();
        };

        worker.onerror = (error) => {
          setIsComputing(false);
          reject(error);
          worker.terminate();
        };

        worker.postMessage(input);
      });
    },
    [workerFn],
  );

  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setIsComputing(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      terminate();
    };
  }, [terminate]);

  return { compute, isComputing, terminate };
}
