import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

type PrefetchFn = () => Promise<unknown>;

interface PrefetchConfig {
  routes: Record<string, PrefetchFn>;
  delay?: number;
}

/**
 * Prefetch route chunks based on user navigation patterns
 */
export function usePrefetch(config: PrefetchConfig) {
  const { routes, delay = 2000 } = config;
  const location = useLocation();
  const prefetchedRef = useRef<Set<string>>(new Set());

  const prefetch = useCallback(
    (path: string) => {
      if (prefetchedRef.current.has(path)) return;

      const prefetchFn = routes[path];
      if (prefetchFn) {
        prefetchFn()
          .then(() => {
            prefetchedRef.current.add(path);
          })
          .catch(() => {
            // Silently fail prefetch
          });
      }
    },
    [routes],
  );

  // Prefetch likely next routes after current page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentPath = location.pathname;

      // Define likely navigation paths
      const navigationMap: Record<string, string[]> = {
        '/': ['/accounts', '/transfers'],
        '/accounts': ['/accounts/:id', '/transfers'],
        '/transfers': ['/accounts', '/reports'],
        '/admin': ['/admin/users', '/admin/audit'],
      };

      const likelyPaths = navigationMap[currentPath] || [];
      likelyPaths.forEach(prefetch);
    }, delay);

    return () => clearTimeout(timer);
  }, [location.pathname, prefetch, delay]);

  return { prefetch };
}

/**
 * Prefetch on hover/focus
 */
export function usePrefetchOnInteraction(prefetchFn: PrefetchFn) {
  const prefetchedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInteraction = useCallback(() => {
    if (prefetchedRef.current) return;

    // Small delay to avoid prefetching on accidental hovers
    timerRef.current = setTimeout(() => {
      prefetchFn()
        .then(() => {
          prefetchedRef.current = true;
        })
        .catch(() => {});
    }, 100);
  }, [prefetchFn]);

  const cancelPrefetch = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  return {
    onMouseEnter: handleInteraction,
    onFocus: handleInteraction,
    onMouseLeave: cancelPrefetch,
    onBlur: cancelPrefetch,
  };
}
