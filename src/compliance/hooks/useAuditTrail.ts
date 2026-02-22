// src/compliance/hooks/useAuditTrail.ts

/**
 * AUDIT TRAIL HOOK
 *
 * Provides a simple interface for logging audit events
 * from any component. Events are batched and sent to
 * the backend API.
 *
 * Usage:
 *   const { logEvent } = useAuditTrail();
 *   logEvent({
 *     action: 'account.viewed',
 *     resource: 'account:acct_123',
 *     metadata: { accountType: 'checking' },
 *   });
 *
 * Cross-ref: Doc 08 §4 for API service patterns
 * Cross-ref: Doc 11 §6 for logging best practices
 */

import { useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useCorrelationId } from '@/compliance/providers/AuditProvider';

/** Input to logEvent — the caller provides these fields */
interface LogEventInput {
  readonly action: string;
  readonly resource: string;
  readonly metadata?: Record<string, unknown>;
}

/** The full event sent to the backend */
interface AuditEventPayload {
  readonly id: string;
  readonly timestamp: string;
  readonly userId: string;
  readonly action: string;
  readonly resource: string;
  readonly metadata: Record<string, unknown>;
  readonly correlationId: string;
}

/** Batch size before flushing to the API */
const BATCH_SIZE = 10;
/** Maximum time (ms) before flushing regardless of batch size */
const FLUSH_INTERVAL = 5000;

export function useAuditTrail() {
  const correlationId = useCorrelationId();
  const batchRef = useRef<AuditEventPayload[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Flush the current batch to the backend API.
   */
  const flush = useCallback(async () => {
    if (batchRef.current.length === 0) return;

    const events = [...batchRef.current];
    batchRef.current = [];

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    try {
      await fetch('/api/v1/audit/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });
    } catch {
      // If the API call fails, re-add events to the batch
      // for retry on the next flush.
      batchRef.current.unshift(...events);
      console.warn('[Audit] Failed to flush events, will retry');
    }
  }, []);

  /**
   * Log a single audit event.
   * Events are batched for performance.
   */
  const logEvent = useCallback(
    (input: LogEventInput) => {
      const event: AuditEventPayload = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        userId: getCurrentUserId(),
        action: input.action,
        resource: input.resource,
        metadata: input.metadata ?? {},
        correlationId,
      };

      batchRef.current.push(event);

      // Flush if batch is full
      if (batchRef.current.length >= BATCH_SIZE) {
        flush();
        return;
      }

      // Set a timer to flush after FLUSH_INTERVAL
      if (!timerRef.current) {
        timerRef.current = setTimeout(flush, FLUSH_INTERVAL);
      }
    },
    [correlationId, flush],
  );

  return { logEvent, flush };
}

/**
 * Get the current user ID from the auth context.
 * In a real app, this would use the auth store.
 *
 * Cross-ref: Doc 09 §2 for auth context patterns
 */
function getCurrentUserId(): string {
  try {
    const authData = sessionStorage.getItem('auth_user_id');
    return authData ?? 'anonymous';
  } catch {
    return 'anonymous';
  }
}
