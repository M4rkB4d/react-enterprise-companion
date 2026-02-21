// src/features/payments/utils/auditLog.ts — Doc 13 §14.3
import { apiClient } from '@/api/client';

type AuditAction =
  | 'payment:initiated'
  | 'payment:confirmed'
  | 'payment:failed'
  | 'payee:added'
  | 'payee:removed'
  | 'scheduled:created'
  | 'scheduled:cancelled';

interface AuditEntry {
  action: AuditAction;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

/** Log a payment-related audit event. Never throws — audit failures are silent. */
export async function logAuditEvent(entry: AuditEntry): Promise<void> {
  try {
    await apiClient.post('/audit/log', {
      ...entry,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Audit logging should never break the user flow
    console.error('[Audit] Failed to log event:', entry.action);
  }
}
