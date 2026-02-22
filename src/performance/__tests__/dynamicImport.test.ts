import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { importWithRetry, conditionalImport } from '../utils/dynamicImport';

describe('dynamicImport', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('importWithRetry', () => {
    it('resolves on first successful import', async () => {
      const importFn = vi.fn().mockResolvedValue({ default: 'module' });
      const result = await importWithRetry(importFn);
      expect(result).toEqual({ default: 'module' });
      expect(importFn).toHaveBeenCalledTimes(1);
    });

    it('retries on failure and eventually succeeds', async () => {
      const importFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({ default: 'module' });

      const promise = importWithRetry(importFn, { delay: 100, backoff: 2 });

      // First call fails, schedules retry after 100ms (delay * 2^0)
      await vi.advanceTimersByTimeAsync(100);

      const result = await promise;
      expect(result).toEqual({ default: 'module' });
      expect(importFn).toHaveBeenCalledTimes(2);
    });

    it('rejects after maxRetries is exceeded', async () => {
      const importFn = vi.fn(() => {
        return Promise.reject(new Error('Persistent failure'));
      });

      const promise = importWithRetry(importFn, {
        maxRetries: 2,
        delay: 100,
        backoff: 2,
      });

      // Attach the rejection handler immediately to prevent unhandled rejection
      const resultPromise = promise.catch((e: Error) => e);

      // First attempt fails immediately, schedules retry after 100ms
      await vi.advanceTimersByTimeAsync(100);
      // Second attempt fails, maxRetries (2) reached, rejects the promise

      const error = await resultPromise;
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Persistent failure');
      expect(importFn).toHaveBeenCalledTimes(2);
    });

    it('applies exponential backoff between retries', async () => {
      const importFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue({ default: 'ok' });

      const promise = importWithRetry(importFn, {
        maxRetries: 4,
        delay: 100,
        backoff: 2,
      });

      // First retry waits 100ms (100 * 2^0)
      await vi.advanceTimersByTimeAsync(100);
      expect(importFn).toHaveBeenCalledTimes(2);

      // Second retry waits 200ms (100 * 2^1)
      await vi.advanceTimersByTimeAsync(200);
      expect(importFn).toHaveBeenCalledTimes(3);

      const result = await promise;
      expect(result).toEqual({ default: 'ok' });
    });
  });

  describe('conditionalImport', () => {
    it('imports when condition is true', async () => {
      const importFn = vi.fn().mockResolvedValue({ default: 'module' });
      const result = await conditionalImport(true, importFn);
      expect(result).toEqual({ default: 'module' });
      expect(importFn).toHaveBeenCalledTimes(1);
    });

    it('returns null when condition is false and no fallback', async () => {
      const importFn = vi.fn().mockResolvedValue({ default: 'module' });
      const result = await conditionalImport(false, importFn);
      expect(result).toBeNull();
      expect(importFn).not.toHaveBeenCalled();
    });

    it('calls fallback when condition is false and fallback is provided', async () => {
      const importFn = vi.fn().mockResolvedValue({ default: 'primary' });
      const fallbackFn = vi.fn().mockResolvedValue({ default: 'fallback' });
      const result = await conditionalImport(false, importFn, fallbackFn);
      expect(result).toEqual({ default: 'fallback' });
      expect(importFn).not.toHaveBeenCalled();
      expect(fallbackFn).toHaveBeenCalledTimes(1);
    });

    it('supports a function condition that returns true', async () => {
      const importFn = vi.fn().mockResolvedValue({ default: 'module' });
      const result = await conditionalImport(() => true, importFn);
      expect(result).toEqual({ default: 'module' });
    });

    it('supports an async function condition', async () => {
      const importFn = vi.fn().mockResolvedValue({ default: 'module' });
      const result = await conditionalImport(() => Promise.resolve(true), importFn);
      expect(result).toEqual({ default: 'module' });
    });
  });
});
