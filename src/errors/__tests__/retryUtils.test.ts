import { describe, it, expect, vi } from 'vitest';
import { isRetryableError, calculateRetryDelay, withRetry } from '../utils/retryUtils';
import { NetworkError } from '../custom-errors';

describe('isRetryableError', () => {
  it('should return true for NetworkError with retryable status codes', () => {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];

    for (const status of retryableStatuses) {
      const error = new NetworkError(`Error ${status}`, status, {
        endpoint: '/api/test',
        method: 'GET',
      });
      expect(isRetryableError(error)).toBe(true);
    }
  });

  it('should return true for NetworkError with status code 0 (no response)', () => {
    const error = new NetworkError('Network unavailable', 0, {
      endpoint: '/api/test',
      method: 'GET',
    });
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return false for NetworkError with non-retryable status codes', () => {
    const nonRetryable = [400, 401, 403, 404, 422];

    for (const status of nonRetryable) {
      const error = new NetworkError(`Error ${status}`, status, {
        endpoint: '/api/test',
        method: 'GET',
      });
      expect(isRetryableError(error)).toBe(false);
    }
  });

  it('should use custom retryableStatuses from config', () => {
    const error = new NetworkError('Not Found', 404, {
      endpoint: '/api/test',
      method: 'GET',
    });

    expect(isRetryableError(error)).toBe(false);
    expect(isRetryableError(error, { retryableStatuses: [404] })).toBe(true);
  });

  it('should return true for generic Error with "network" in message', () => {
    const error = new Error('A network error occurred');
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return false for generic Error without "network" in message', () => {
    const error = new Error('Something else went wrong');
    expect(isRetryableError(error)).toBe(false);
  });

  it('should return false for non-Error values', () => {
    expect(isRetryableError('string error')).toBe(false);
    expect(isRetryableError(null)).toBe(false);
    expect(isRetryableError(undefined)).toBe(false);
    expect(isRetryableError(42)).toBe(false);
  });
});

describe('calculateRetryDelay', () => {
  it('should return a delay based on exponential backoff for attempt 1', () => {
    // With default config: baseDelay=1000, backoffFactor=2
    // attempt 1: 1000 * 2^0 = 1000 + jitter (0 to 300)
    const delay = calculateRetryDelay(1);
    expect(delay).toBeGreaterThanOrEqual(1000);
    expect(delay).toBeLessThanOrEqual(1300);
  });

  it('should increase delay exponentially for subsequent attempts', () => {
    // attempt 2: 1000 * 2^1 = 2000, jitter up to 600 => max 2600
    const delay2 = calculateRetryDelay(2);
    expect(delay2).toBeGreaterThanOrEqual(2000);
    expect(delay2).toBeLessThanOrEqual(2600);

    // attempt 3: 1000 * 2^2 = 4000, jitter up to 1200 => max 5200
    const delay3 = calculateRetryDelay(3);
    expect(delay3).toBeGreaterThanOrEqual(4000);
    expect(delay3).toBeLessThanOrEqual(5200);
  });

  it('should not exceed maxDelay', () => {
    const delay = calculateRetryDelay(20, { maxDelay: 5000 });
    expect(delay).toBeLessThanOrEqual(5000);
  });

  it('should respect custom baseDelay and backoffFactor', () => {
    const delay = calculateRetryDelay(1, { baseDelay: 500, backoffFactor: 3 });
    // 500 * 3^0 = 500 + jitter (0 to 150) => 500..650
    expect(delay).toBeGreaterThanOrEqual(500);
    expect(delay).toBeLessThanOrEqual(650);
  });
});

describe('withRetry', () => {
  it('should return the result if the function succeeds on the first try', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await withRetry(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on retryable errors and succeed on a later attempt', async () => {
    const retryableError = new NetworkError('Server Error', 500, {
      endpoint: '/api/test',
      method: 'GET',
    });
    const fn = vi.fn().mockRejectedValueOnce(retryableError).mockResolvedValueOnce('recovered');

    const result = await withRetry(fn, { maxAttempts: 3, baseDelay: 1 });
    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should throw immediately on non-retryable errors without retrying', async () => {
    const nonRetryableError = new NetworkError('Not Found', 404, {
      endpoint: '/api/test',
      method: 'GET',
    });
    const fn = vi.fn().mockRejectedValue(nonRetryableError);

    await expect(withRetry(fn, { maxAttempts: 3, baseDelay: 1 })).rejects.toThrow('Not Found');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should throw after exhausting all retry attempts', async () => {
    const retryableError = new NetworkError('Service Unavailable', 503, {
      endpoint: '/api/test',
      method: 'GET',
    });
    const fn = vi.fn().mockRejectedValue(retryableError);

    await expect(withRetry(fn, { maxAttempts: 3, baseDelay: 1 })).rejects.toThrow(
      'Service Unavailable',
    );
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should convert non-Error thrown values into Error instances', async () => {
    const fn = vi.fn().mockRejectedValue('string error');

    await expect(withRetry(fn, { maxAttempts: 1, baseDelay: 1 })).rejects.toThrow('string error');
  });
});
