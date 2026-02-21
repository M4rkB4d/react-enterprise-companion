import { NetworkError } from '../custom-errors';

interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableStatuses: number[];
}

const defaultConfig: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown, config: Partial<RetryConfig> = {}): boolean {
  const { retryableStatuses } = { ...defaultConfig, ...config };

  if (error instanceof NetworkError) {
    // Network errors without response are retryable
    if (error.statusCode === 0) {
      return true;
    }
    return retryableStatuses.includes(error.statusCode);
  }

  // Retry generic errors
  return error instanceof Error && error.message.includes('network');
}

/**
 * Calculate delay for retry attempt
 */
export function calculateRetryDelay(
  attemptNumber: number,
  config: Partial<RetryConfig> = {},
): number {
  const { baseDelay, maxDelay, backoffFactor } = { ...defaultConfig, ...config };

  // Exponential backoff with jitter
  const exponentialDelay = baseDelay * Math.pow(backoffFactor, attemptNumber - 1);
  const jitter = Math.random() * 0.3 * exponentialDelay;

  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Execute function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const { maxAttempts } = { ...defaultConfig, ...config };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts || !isRetryableError(error, config)) {
        throw lastError;
      }

      const delay = calculateRetryDelay(attempt, config);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError ?? new Error('Retry failed');
}

/**
 * Create a retryable fetch wrapper
 */
export function createRetryableFetch(config: Partial<RetryConfig> = {}) {
  return async function retryableFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    return withRetry(async () => {
      const response = await fetch(input, init);

      if (
        !response.ok &&
        isRetryableError(
          new NetworkError('', response.status, {
            endpoint: String(input),
            method: init?.method ?? 'GET',
          }),
          config,
        )
      ) {
        throw new NetworkError(`HTTP ${response.status}`, response.status, {
          endpoint: String(input),
          method: init?.method ?? 'GET',
        });
      }

      return response;
    }, config);
  };
}
