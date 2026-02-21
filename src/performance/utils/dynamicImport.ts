type ImportFn<T> = () => Promise<{ default: T }>;

interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  backoff?: number;
}

/**
 * Dynamic import with retry logic
 */
export function importWithRetry<T>(
  importFn: ImportFn<T>,
  options: RetryOptions = {},
): Promise<{ default: T }> {
  const { maxRetries = 3, delay = 1000, backoff = 2 } = options;

  return new Promise((resolve, reject) => {
    let attempts = 0;

    const attemptImport = () => {
      importFn()
        .then(resolve)
        .catch((error) => {
          attempts++;

          if (attempts >= maxRetries) {
            reject(error);
            return;
          }

          // Exponential backoff
          const waitTime = delay * Math.pow(backoff, attempts - 1);
          setTimeout(attemptImport, waitTime);
        });
    };

    attemptImport();
  });
}

/**
 * Conditional dynamic import based on feature flags or conditions
 */
export async function conditionalImport<T>(
  condition: boolean | (() => boolean | Promise<boolean>),
  importFn: ImportFn<T>,
  fallbackFn?: ImportFn<T>,
): Promise<{ default: T } | null> {
  const shouldImport = typeof condition === 'function' ? await condition() : condition;

  if (shouldImport) {
    return importFn();
  }

  if (fallbackFn) {
    return fallbackFn();
  }

  return null;
}

/**
 * Preload module without rendering
 */
export function preloadModule(importFn: ImportFn<unknown>): void {
  // Use requestIdleCallback if available, otherwise setTimeout
  const schedule = window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 1));

  schedule(() => {
    importFn().catch(() => {
      // Silently fail preload
    });
  });
}

/**
 * Create a module preloader for multiple modules
 */
export function createModulePreloader(modules: Record<string, ImportFn<unknown>>) {
  const loaded = new Set<string>();

  return {
    preload(name: string): void {
      if (loaded.has(name) || !modules[name]) return;

      preloadModule(modules[name]);
      loaded.add(name);
    },

    preloadAll(): void {
      Object.keys(modules).forEach((name) => this.preload(name));
    },

    isLoaded(name: string): boolean {
      return loaded.has(name);
    },
  };
}
